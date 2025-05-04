import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create a pool of connections
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'organicos_fatima',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Execute a query
export const query = async (sql, params) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

export default pool;