import { query } from '../database/db.js';

// Get all seeds
export const getAllSeeds = async () => {
  const rows = await query(`
    SELECT 
      id, 
      name,
      type,
      package_100 as package100,
      package_200 as package200,
      package_500 as package500,
      min_quantity as minQuantity,
      created_at as createdAt, 
      updated_at as updatedAt 
    FROM seeds
    ORDER BY name
  `);
  return rows;
};

// Get seed by ID
export const getSeedById = async (id) => {
  const rows = await query(`
    SELECT 
      id, 
      name,
      type,
      package_100 as package100,
      package_200 as package200,
      package_500 as package500,
      min_quantity as minQuantity,
      created_at as createdAt, 
      updated_at as updatedAt 
    FROM seeds
    WHERE id = ?
  `, [id]);
  return rows[0];
};

// Create a new seed
export const createSeed = async (seedData) => {
  const { name, type, package100, package200, package500, minQuantity } = seedData;
  
  const result = await query(
    'INSERT INTO seeds (name, type, package_100, package_200, package_500, min_quantity) VALUES (?, ?, ?, ?, ?, ?)',
    [name, type, package100, package200, package500, minQuantity]
  );
  
  if (result.affectedRows === 1) {
    return await getSeedById(result.insertId);
  }
  
  return null;
};

// Update a seed
export const updateSeed = async (id, seedData) => {
  const { name, type, package100, package200, package500, minQuantity } = seedData;
  
  await query(
    'UPDATE seeds SET name = ?, type = ?, package_100 = ?, package_200 = ?, package_500 = ?, min_quantity = ? WHERE id = ?',
    [name, type, package100, package200, package500, minQuantity, id]
  );
  
  return await getSeedById(id);
};

// Delete a seed
export const deleteSeed = async (id) => {
  const result = await query('DELETE FROM seeds WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

// Get seeds by type
export const getSeedsByType = async (type) => {
  const rows = await query(`
    SELECT 
      id, 
      name,
      type,
      package_100 as package100,
      package_200 as package200,
      package_500 as package500,
      min_quantity as minQuantity,
      created_at as createdAt, 
      updated_at as updatedAt 
    FROM seeds
    WHERE type = ?
    ORDER BY name
  `, [type]);
  return rows;
};

// Get seeds with low stock
export const getLowStockSeeds = async () => {
  const rows = await query(`
    SELECT 
      id, 
      name,
      type,
      package_100 as package100,
      package_200 as package200,
      package_500 as package500,
      min_quantity as minQuantity,
      created_at as createdAt, 
      updated_at as updatedAt 
    FROM seeds
    WHERE (package_100 + package_200 + package_500) < min_quantity
    ORDER BY name
  `);
  return rows;
};

// Get seed movement history
export const getSeedMovements = async (seedId) => {
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
    WHERE sm.seed_id = ?
    ORDER BY sm.created_at DESC
  `, [seedId]);
  return rows;
};

// Adjust seed package quantities
export const adjustSeedPackages = async (id, adjustment, userId) => {
  const { package100, package200, package500, type, description } = adjustment;
  
  // Get current seed
  const seed = await getSeedById(id);
  if (!seed) return null;
  
  // Calculate new quantities
  const newPackage100 = type === 'add' ? seed.package100 + package100 : Math.max(0, seed.package100 - package100);
  const newPackage200 = type === 'add' ? seed.package200 + package200 : Math.max(0, seed.package200 - package200);
  const newPackage500 = type === 'add' ? seed.package500 + package500 : Math.max(0, seed.package500 - package500);
  
  // Update seed quantities
  await query(
    'UPDATE seeds SET package_100 = ?, package_200 = ?, package_500 = ? WHERE id = ?',
    [newPackage100, newPackage200, newPackage500, id]
  );
  
  // Log the movement
  await query(
    'INSERT INTO stock_movements (seed_id, quantity, type, description, created_by) VALUES (?, ?, ?, ?, ?)',
    [id, package100 + package200 + package500, type, description || null, userId]
  );
  
  return await getSeedById(id);
};