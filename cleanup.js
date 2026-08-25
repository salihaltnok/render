const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const db = require("./database");

const deleteOldFiles = (dirPath, maxAgeMs) => {
  fs.readdir(dirPath, (err, files) => {
    if (err) return;

    files.forEach((file) => {
      const filePath = path.join(dirPath, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;

        if (Date.now() - stats.mtimeMs > maxAgeMs) {
          fs.unlink(filePath, () => {});
        }
      });
    });
  });
};

const startCleanupJob = () => {
  cron.schedule("*/15 * * * *", async () => {
    const oneHourMs = 60 * 60 * 1000;
    const uploadsDir = path.join(__dirname, "uploads");
    const convertedDir = path.join(__dirname, "converted");

    deleteOldFiles(uploadsDir, oneHourMs);
    deleteOldFiles(convertedDir, oneHourMs);

    try {
      await db.query(
        "DELETE FROM videos WHERE created_at < (NOW() - INTERVAL 1 HOUR)",
      );
    } catch (error) {}
  });
};

module.exports = startCleanupJob;
