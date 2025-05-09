// filepath: d:\project\backend\src\database\db.js
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'; // Importar fileURLToPath

// Obter __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Aponta direto para o .env na raiz do backend
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

import mysql from 'mysql2/promise'

// ...existing code...
console.log('🔧 DB Config:', {
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD ? '****' : '(empty)',
  database: process.env.DB_NAME,
  port:     process.env.DB_PORT 
});

const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT) || 3306, // Adicionar porta padrão se DB_PORT não estiver definido
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL conectado com sucesso!')
    conn.release()
  })
  .catch(err => {
    console.error('❌ Falha ao conectar ao MySQL:', err.message)
    // Adicionar mais detalhes do erro pode ser útil
    if (err.code) {
      console.error('   Código do erro MySQL:', err.code);
    }
    if (err.sqlMessage) {
      console.error('   Mensagem SQL:', err.sqlMessage);
    }
    if (err.sqlState) {
      console.error('   Estado SQL:', err.sqlState);
    }
  })

export const query = async (sql, params) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('❌ Erro ao executar query:', error.message);
    // Re-lançar o erro ou tratar de forma específica
    throw error;
  }
}