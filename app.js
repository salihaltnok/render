const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const path = require("path");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const helmet = require("helmet");
const db = require("./database");
const converters = require("./converters");
const startCleanupJob = require("./cleanup");
const logger = require("./logger");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;

app.use(helmet()); // Güvenlik katmanı

const conversionQueue = [];
let isProcessing = false;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) cb(null, true);
    else cb(new Error("Gecersiz dosya turu"), false);
  },
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB Limiti
});

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {
  socket.emit("connected", socket.id);
});

const processNextInQueue = async () => {
  if (isProcessing || conversionQueue.length === 0) return;

  isProcessing = true;
  const task = conversionQueue.shift();

  await db.query("UPDATE videos SET status = ? WHERE id = ?", [
    "processing",
    task.id,
  ]);
  io.to(task.socketId).emit("status", { status: "processing", progress: 0 });

  const converterFunction = converters[task.format];

  if (!converterFunction) {
    logger.error(
      `Geçersiz format istendi: ${task.format} - Görev ID: ${task.id}`,
    );
    await db.query("UPDATE videos SET status = ? WHERE id = ?", [
      "error",
      task.id,
    ]);
    io.to(task.socketId).emit("status", { status: "error" });
    isProcessing = false;
    return processNextInQueue();
  }

  let command = ffmpeg(task.inputPath)
    .on("progress", (progress) => {
      const percent = Math.round(progress.percent || 0);
      io.to(task.socketId).emit("status", {
        status: "processing",
        progress: percent,
      });
    })
    .on("end", async () => {
      await db.query(
        "UPDATE videos SET converted_name = ?, status = ? WHERE id = ?",
        [task.outputFilename, "completed", task.id],
      );
      logger.info(`Dönüştürme başarılı - Görev ID: ${task.id}`);
      io.to(task.socketId).emit("status", { status: "completed", id: task.id });

      // Orijinal dosyayı anında temizle
      fs.unlink(task.inputPath, (err) => {
        if (err) logger.error(`Orijinal dosya silinemedi: ${err.message}`);
      });

      isProcessing = false;
      processNextInQueue();
    })
    .on("error", async (err) => {
      logger.error(
        `FFmpeg İşlem Hatası (Görev ID: ${task.id}): ${err.message}`,
      );
      await db.query("UPDATE videos SET status = ? WHERE id = ?", [
        "error",
        task.id,
      ]);
      io.to(task.socketId).emit("status", { status: "error" });

      // Orijinal dosyayı anında temizle (Hata durumunda)
      fs.unlink(task.inputPath, (err) => {
        if (err) logger.error(`Orijinal dosya silinemedi: ${err.message}`);
      });

      isProcessing = false;
      processNextInQueue();
    });

  if (task.resolution && task.resolution !== "original") {
    command.size(task.resolution);
  }

  converterFunction(command, task.outputPath);
};

app.post("/upload", upload.single("video"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Dosya yuklenmedi" });

  const { format, resolution, socketId } = req.body;
  const originalName = req.file.originalname;
  const outputFilename = `${Date.now()}-converted.${format}`;

  try {
    const [result] = await db.query(
      "INSERT INTO videos (original_name, status) VALUES (?, ?)",
      [originalName, "pending"],
    );

    conversionQueue.push({
      id: result.insertId,
      inputPath: req.file.path,
      format,
      resolution,
      outputFilename,
      outputPath: path.join(__dirname, "converted", outputFilename),
      socketId,
    });

    logger.info(`Yeni dosya kuyruğa eklendi. Görev ID: ${result.insertId}`);
    io.to(socketId).emit("status", { status: "pending" });
    processNextInQueue();
    res.json({ message: "Kuyruga eklendi" });
  } catch (error) {
    logger.error(`Upload veritabanı hatası: ${error.message}`);
    res.status(500).json({ error: "Veritabani hatasi" });
  }
});

app.get("/download/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM videos WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0 || rows[0].status !== "completed") {
      logger.error(`İndirme başarısız. Bulunamayan ID: ${req.params.id}`);
      return res.status(404).send("Dosya bulunamadi.");
    }
    logger.info(`Dosya indirildi - Görev ID: ${req.params.id}`);
    res.download(path.join(__dirname, "converted", rows[0].converted_name));
  } catch (error) {
    logger.error(`İndirme sunucu hatası: ${error.message}`);
    res.status(500).send("Sunucu hatasi");
  }
});

// Multer (Büyük Dosya) ve Genel Hata Yakalayıcı Middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: "Dosya boyutu 100 MB sınırını aşıyor." });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

startCleanupJob();

server.listen(port, () => {
  logger.info(`Sunucu http://localhost:${port} adresinde calisiyor`);
});
