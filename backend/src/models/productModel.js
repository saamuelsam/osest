import { query } from '../database/db.js';

// Get all products
export const getAllProducts = async () => {
  const rows = await query(`
    SELECT 
      id, 
      name, 
      category, 
      quantity, 
      min_quantity as minQuantity,
      boxes,
      weight_kg,
      created_at as createdAt, 
      updated_at as updatedAt 
    FROM products
    ORDER BY name
  `);
  return rows;
};

// Get product by ID
export const getProductById = async (id) => {
  const rows = await query(`
    SELECT 
      id, 
      name, 
      category, 
      quantity, 
      min_quantity as minQuantity,
      boxes,
      weight_kg,
      created_at as createdAt, 
      updated_at as updatedAt 
    FROM products
    WHERE id = ?
  `, [id]);
  return rows[0];
};

// Create a new product
export const createProduct = async (productData) => {
  const {
    name,
    category,
    quantity,
    minQuantity,
    boxes,
    weightKg        // <- camelCase
  } = productData;

  const result = await query(
    `INSERT INTO products
     (name, category, quantity, min_quantity, boxes, weight_kg)
     VALUES (?,?,?,?,?,?)`,
    [
      name,
      category,
      quantity,
      minQuantity,
      boxes ?? 0,
      weightKg ?? 0          // nunca undefined
    ]
  );

  return result.affectedRows === 1
    ? getProductById(result.insertId)
    : null;
};

export const updateProduct = async (id, productData) => {
  const {
    name,
    category,
    quantity,
    minQuantity,
    boxes,
    weightKg       // <- camelCase
  } = productData;

  await query(
    `UPDATE products
     SET name = ?, category = ?, quantity = ?, min_quantity = ?,
         boxes = ?, weight_kg = ?
     WHERE id = ?`,
    [
      name,
      category,
      quantity,
      minQuantity,
      boxes   ?? 0,
      weightKg?? 0,
      id
    ]
  );

  return getProductById(id);
};


// Delete a product
export const deleteProduct = async (id) => {
  const result = await query('DELETE FROM products WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

// Adjust product quantity
export const adjustProductQuantity = async (id, adjustment, userId) => {
  const { quantity, type, description } = adjustment;
  
  // Get current product
  const product = await getProductById(id);
  if (!product) return null;
  
  // Calculate new quantity
  let newQuantity;
  if (type === 'add') {
    newQuantity = product.quantity + quantity;
  } else {
    newQuantity = Math.max(0, product.quantity - quantity);
  }
  
  // Update product quantity
  await query(
    'UPDATE products SET quantity = ? WHERE id = ?',
    [newQuantity, id]
  );
  
  // Log the movement
  await query(
    'INSERT INTO stock_movements (product_id, quantity, type, description, created_by) VALUES (?, ?, ?, ?, ?)',
    [id, quantity, type, description || null, userId]
  );
  
  return await getProductById(id);
};

// Get products by category
export const getProductsByCategory = async (category) => {
  const rows = await query(`
    SELECT 
      id, 
      name, 
      category, 
      quantity, 
      min_quantity as minQuantity,
      boxes, 
      weight_kg,
      created_at as createdAt, 
      updated_at as updatedAt 
    FROM products
    WHERE category = ?
    ORDER BY name
  `, [category]);
  return rows;
};

// Get products below minimum quantity
export const getLowStockProducts = async () => {
  const rows = await query(`
    SELECT 
      id, 
      name, 
      category, 
      quantity, 
      min_quantity as minQuantity,
      boxes, 
      weight_kg,
      created_at as createdAt, 
      updated_at as updatedAt 
    FROM products
    WHERE quantity < min_quantity
    ORDER BY name
  `);
  return rows;
};

// Get product movement history
export const getProductMovements = async (productId) => {
  const rows = await query(`
    SELECT 
      sm.id,
      sm.quantity,
      sm.type,
      sm.description,
      sm.created_at as createdAt,
      u.name as createdBy
    FROM stock_movements sm
    JOIN users u ON sm.created_by = u.id
    WHERE sm.product_id = ?
    ORDER BY sm.created_at DESC
  `, [productId]);
  return rows;
};