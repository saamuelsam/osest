import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const createDatabase = async () => {
  try {
    // Create connection without specifying database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
    });

    const dbName = process.env.DB_NAME || 'organicos_fatima';

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`Database ${dbName} created or already exists`);

    // Use the database
    await connection.query(`USE ${dbName}`);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        role ENUM('admin', 'estoque') NOT NULL DEFAULT 'estoque',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created or already exists');

    // Create products table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        quantity INT NOT NULL DEFAULT 0,
        min_quantity INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Products table created or already exists');

    // Create materials table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS materials (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(100) NOT NULL,
        quantity INT NOT NULL DEFAULT 0,
        min_quantity INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Materials table created or already exists');

    // Create stock_movements table for tracking inventory changes
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
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);
    console.log('Stock movements table created or already exists');

    // Check if admin user exists
    const [rows] = await connection.query(
      'SELECT * FROM users WHERE email = ? AND role = ?',
      ['admin@organicosdefatima.com', 'admin']
    );

    // Create default admin user if it doesn't exist
    if (rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin', 'admin@organicosdefatima.com', hashedPassword, 'admin']
      );
      console.log('Default admin user created');
    } else {
      console.log('Admin user already exists');
    }

    // Create sample products if table is empty
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
      console.log('Sample products created');
    }

    // Create sample materials if table is empty
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
      console.log('Sample materials created');
    }

    console.log('Database setup completed!');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Error setting up the database:', error);
    process.exit(1);
  }
};

createDatabase();