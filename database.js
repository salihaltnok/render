const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
const initDatabase = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS videos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      originalname VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  pool.query(createTableQuery, (err) => {
    if (err) {
      console.error("Tablo oluşturulamadı:", err);
    } else {
      console.log("MySQL 'videos' tablosu hazır.");
    }
  });
};

initDatabase();

module.exports = pool.promise();
