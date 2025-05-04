import { query } from '../database/db.js';

// Get all materials
export const getAllMaterials = async () => {
  const rows = await query(`
    SELECT 
      id, 
      name, 
      quantity, 
      min_quantity as minQuantity,
      created_at as createdAt, 
      updated_at as updatedAt 
    FROM materials
    ORDER BY name
  `);
  return rows;
};

// Get material by ID
export const getMaterialById = async (id) => {
  const rows = await query(`
    SELECT 
      id, 
      name, 
      quantity, 
      min_quantity as minQuantity,
      created_at as createdAt, 
      updated_at as updatedAt 
    FROM materials
    WHERE id = ?
  `, [id]);
  return rows[0];
};

// Create a new material
export const createMaterial = async (materialData) => {
  const { name, quantity, minQuantity } = materialData;
  
  const result = await query(
    'INSERT INTO materials (name, quantity, min_quantity) VALUES (?, ?, ?)',
    [name, quantity, minQuantity]
  );
  
  if (result.affectedRows === 1) {
    return await getMaterialById(result.insertId);
  }
  
  return null;
};

// Update a material
export const updateMaterial = async (id, materialData) => {
  const { name, quantity, minQuantity } = materialData;
  
  await query(
    'UPDATE materials SET name = ?, quantity = ?, min_quantity = ? WHERE id = ?',
    [name, quantity, minQuantity, id]
  );
  
  return await getMaterialById(id);
};

// Delete a material
export const deleteMaterial = async (id) => {
  const result = await query('DELETE FROM materials WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

// Adjust material quantity (mostly for adding new inventory)
export const adjustMaterialQuantity = async (id, quantity, userId) => {
  // Get current material
  const material = await getMaterialById(id);
  if (!material) return null;
  
  // Update material quantity
  const newQuantity = material.quantity + quantity;
  await query(
    'UPDATE materials SET quantity = ? WHERE id = ?',
    [newQuantity, id]
  );
  
  // Log the movement
  await query(
    'INSERT INTO stock_movements (material_id, quantity, type, description, created_by) VALUES (?, ?, ?, ?, ?)',
    [id, quantity, 'add', 'Entrada de estoque', userId]
  );
  
  return await getMaterialById(id);
};

// Record material usage
export const useMaterial = async (id, quantity, description, userId) => {
  // Get current material
  const material = await getMaterialById(id);
  if (!material) return null;
  
  // Check if there's enough quantity
  if (material.quantity < quantity) {
    throw new Error('Quantidade insuficiente');
  }
  
  // Update material quantity
  const newQuantity = material.quantity - quantity;
  await query(
    'UPDATE materials SET quantity = ? WHERE id = ?',
    [newQuantity, id]
  );
  
  // Log the movement
  await query(
    'INSERT INTO stock_movements (material_id, quantity, type, description, created_by) VALUES (?, ?, ?, ?, ?)',
    [id, quantity, 'remove', description || 'Uso interno', userId]
  );
  
  return await getMaterialById(id);
};

// Get materials below minimum quantity
export const getLowStockMaterials = async () => {
  const rows = await query(`
    SELECT 
      id, 
      name, 
      quantity, 
      min_quantity as minQuantity,
      created_at as createdAt, 
      updated_at as updatedAt 
    FROM materials
    WHERE quantity < min_quantity
    ORDER BY name
  `);
  return rows;
};

// Get material movement history
export const getMaterialMovements = async (materialId) => {
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
    WHERE sm.material_id = ?
    ORDER BY sm.created_at DESC
  `, [materialId]);
  return rows;
};