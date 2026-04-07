const mysql = require('mysql2/promise');
require('dotenv').config();

const connectionOptions = {
  socketPath: '/tmp/mysql.sock', // Path rahasia standar Mac/Homebrew
  user: process.env.DB_USER || 'root',
  database: process.env.DB_NAME || 'otomotif_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  allowPublicKeyRetrieval: true
};

if (process.env.DB_PASSWORD) {
  connectionOptions.password = process.env.DB_PASSWORD;
}

const pool = mysql.createPool(connectionOptions);

module.exports = pool;
