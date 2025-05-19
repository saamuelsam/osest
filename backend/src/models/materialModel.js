import { query } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

// Get all materials
export const getAllMaterials = async () => {
  const rows = await query(`
    SELECT 
      id, 
      name, 
      quantity, 
      min_quantity as minQuantity,
      boxes,
      weight_kg as weightKg,
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
      boxes,
      weight_kg as weightKg,
      created_at as createdAt, 
      updated_at as updatedAt 
    FROM materials
    WHERE id = ?
  `, [id]);
  return rows[0];
};

// Create a new material
export const createMaterial = async (materialData) => {
  const { name, quantity, minQuantity, boxes, weightKg } = materialData;
  const id = uuidv4(); // Gere o UUID aqui

  const params = [
    id, // Inclua o ID gerado nos parâmetros
    name,
    quantity,
    minQuantity,
    boxes === undefined ? null : boxes,
    weightKg === undefined ? null : weightKg
  ];

  // Adicione a coluna 'id' à sua instrução INSERT
  const result = await query(
    'INSERT INTO materials (id, name, quantity, min_quantity, boxes, weight_kg) VALUES (?, ?, ?, ?, ?, ?)',
    params
  );
  
  if (result.affectedRows === 1) {
    // Use o 'id' que você gerou para buscar o material recém-criado
    return await getMaterialById(id); 
  }
  
  // Se a inserção falhar por algum motivo (affectedRows não é 1)
  console.error('Falha ao inserir material no banco de dados. Result:', result);
  return null;
};

// Update a material
export const updateMaterial = async (id, materialData) => {
  const { name, quantity, minQuantity, boxes, weightKg } = materialData;

  const params = [
    name,
    quantity,
    minQuantity,
    boxes === undefined ? null : boxes,
    weightKg === undefined ? null : weightKg,
    id
  ];
  
  await query(
    'UPDATE materials SET name = ?, quantity = ?, min_quantity = ?, boxes = ?, weight_kg = ? WHERE id = ?',
    params
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
  const material = await getMaterialById(id);
  if (!material) return null;
  
  const newQuantity = material.quantity + quantity;
  await query(
    'UPDATE materials SET quantity = ? WHERE id = ?',
    [newQuantity, id]
  );
  
  await query(
    'INSERT INTO stock_movements (material_id, quantity, type, description, created_by) VALUES (?, ?, ?, ?, ?)',
    [id, quantity, 'add', 'Entrada de estoque', userId]
  );
  
  return await getMaterialById(id);
};

// Record material usage
export const useMaterial = async (id, quantity, description, userId) => {
  const material = await getMaterialById(id);
  if (!material) return null;
  
  if (material.quantity < quantity) {
    throw new Error('Quantidade insuficiente');
  }
  
  const newQuantity = material.quantity - quantity;
  await query(
    'UPDATE materials SET quantity = ? WHERE id = ?',
    [newQuantity, id]
  );
  
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
      boxes,
      weight_kg as weightKg,
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