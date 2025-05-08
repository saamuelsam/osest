console.log("<<<<< EXECUTANDO SETUP.JS ATUALIZADO - " + new Date().toISOString() + " >>>>>");

// filepath: d:\project\backend\src\database\setup.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import path from 'path';

// --- Carregamento das Variáveis de Ambiente ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env'); // Caminho para .env na raiz de 'backend'
const dotenvResult = dotenv.config({ path: envPath });

if (dotenvResult.error) {
  console.error("ERRO ao carregar o arquivo .env:", dotenvResult.error);
  console.log("Caminho tentado para .env:", envPath);
  console.log("Verifique se o arquivo .env existe em 'd:\\project\\backend\\.env' e está acessível.");
  process.exit(1);
}

// --- Log para Verificar as Variáveis Lidas ---
console.log('--- Setup Script: Variáveis de Ambiente Lidas ---');
console.log('Caminho do .env usado:', envPath);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '**** (definida)' : '(vazia ou não definida)');
console.log('DB_NAME:', process.env.DB_NAME);
console.log('PORT (do .env, para referência):', process.env.PORT);
console.log('-------------------------------------------------');

let globalSetupError = null;

const createDatabase = async () => {
    let connection;
    try {
      // ... (validação e conexão como antes) ...
      console.log(`Tentando conectar ao MySQL/MariaDB como usuário: '${process.env.DB_USER}' no host: '${process.env.DB_HOST || 'localhost'}'`);
      connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || '',
      });
      console.log('Conexão inicial com MySQL/MariaDB estabelecida (sem selecionar banco).');
  
      const dbName = process.env.DB_NAME || 'myapp';
  
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
      console.log(`Banco de dados '${dbName}' criado ou já existente.`);
  
      await connection.query(`USE \`${dbName}\``);
      console.log(`Usando banco de dados '${dbName}'.`);
  
      // --- Criação das tabelas ---
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL UNIQUE,
          password VARCHAR(100) NOT NULL,
          role ENUM('admin', 'estoque') NOT NULL DEFAULT 'estoque',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB; 
      `); // REMOVIDO O COMENTÁRIO DAQUI
      console.log('Tabela "users" criada ou já existente.');
  
      await connection.query(`
        CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
          name VARCHAR(100) NOT NULL,
          category VARCHAR(50) NOT NULL,
          quantity INT NOT NULL DEFAULT 0,
          min_quantity INT NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
      `); // REMOVIDO O COMENTÁRIO DAQUI
      console.log('Tabela "products" criada ou já existente.');
  
      await connection.query(`
        CREATE TABLE IF NOT EXISTS materials (
          id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
          name VARCHAR(100) NOT NULL,
          quantity INT NOT NULL DEFAULT 0,
          min_quantity INT NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
      `); // REMOVIDO O COMENTÁRIO DAQUI
      console.log('Tabela "materials" criada ou já existente.');
  
      await connection.query(`
        CREATE TABLE IF NOT EXISTS stock_movements (
          id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
          product_id VARCHAR(36),
          material_id VARCHAR(36),
          quantity INT NOT NULL,
          type ENUM('add', 'remove') NOT NULL,
          description TEXT,
          created_by VARCHAR(36) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
          FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE SET NULL,
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
      `); // REMOVIDO O COMENTÁRIO DAQUI
      console.log('Tabela "stock_movements" criada ou já existente.');
  
      // ... (resto do código: criação do usuário admin, dados de exemplo) ...
      // --- Criação do usuário admin ---
      const [rows] = await connection.query(
        'SELECT * FROM users WHERE email = ? AND role = ?',
        ['admin@organicosdefatima.com', 'admin']
      );
  
      if (rows.length === 0) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await connection.query(
          'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
          ['Admin', 'admin@organicosdefatima.com', hashedPassword, 'admin']
        );
        console.log('Usuário admin padrão criado (email: admin@organicosdefatima.com, pass: admin123).');
      } else {
        console.log('Usuário admin padrão já existe.');
      }
  
      // --- Dados de Exemplo ---
      const [productRows] = await connection.query('SELECT * FROM products LIMIT 1');
      if (productRows.length === 0) {
        await connection.query(`
          INSERT INTO products (name, category, quantity, min_quantity) VALUES
          ('Cenoura Orgânica', 'Vegetais', 100, 20),
          ('Alface Crespa', 'Vegetais', 50, 10),
          ('Tomate Cereja', 'Vegetais', 80, 15),
          ('Banana Prata', 'Frutas', 120, 30),
          ('Maçã Gala', 'Frutas', 90, 25)
        `);
        console.log('Produtos de exemplo criados.');
      }
  
      const [materialRows] = await connection.query('SELECT * FROM materials LIMIT 1');
      if (materialRows.length === 0) {
        await connection.query(`
          INSERT INTO materials (name, quantity, min_quantity) VALUES
          ('Caixas de Papelão', 200, 50),
          ('Embalagens Plásticas', 300, 100),
          ('Álcool 70%', 20, 5),
          ('Isopor', 50, 10),
          ('Canetas', 30, 10),
          ('Papel Higiênico', 24, 6)
        `);
        console.log('Materiais de exemplo criados.');
      }
  
  
      console.log('Configuração do banco de dados concluída com sucesso!');
    } catch (error) {
      console.error('Erro durante a configuração do banco de dados:', error.message);
      if (error.sqlMessage) {
        console.error('SQL Message:', error.sqlMessage);
      }
      if (error.code) {
        console.error('Error Code:', error.code);
      }
      globalSetupError = error;
    } finally {
      if (connection) {
        await connection.end();
        console.log('Conexão com MySQL/MariaDB fechada.');
      }
    }
  };
  
  // ... (função main e chamada main() como antes) ...
  const main = async () => {
    try {
      await createDatabase();
    } catch (e) {
      if (!globalSetupError) globalSetupError = e;
      console.error("Erro inesperado na execução principal do script de setup:", e.message);
    } finally {
      process.exit(globalSetupError ? 1 : 0);
    }
  }
  
  main();