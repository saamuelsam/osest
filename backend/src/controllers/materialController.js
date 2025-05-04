import asyncHandler from 'express-async-handler';
import * as materialModel from '../models/materialModel.js';

// @desc    Get all materials
// @route   GET /api/materials
// @access  Private
export const getMaterials = asyncHandler(async (req, res) => {
  const materials = await materialModel.getAllMaterials();
  res.json(materials);
});

// @desc    Get material by ID
// @route   GET /api/materials/:id
// @access  Private
export const getMaterialById = asyncHandler(async (req, res) => {
  const material = await materialModel.getMaterialById(req.params.id);
  
  if (material) {
    res.json(material);
  } else {
    res.status(404);
    throw new Error('Material not found');
  }
});

// @desc    Create a new material
// @route   POST /api/materials
// @access  Private
export const createMaterial = asyncHandler(async (req, res) => {
  const { name, quantity, minQuantity } = req.body;
  
  if (!name) {
    res.status(400);
    throw new Error('Please provide a name');
  }
  
  const material = await materialModel.createMaterial({
    name,
    quantity: quantity || 0,
    minQuantity: minQuantity || 0,
  });
  
  if (material) {
    res.status(201).json(material);
  } else {
    res.status(400);
    throw new Error('Invalid material data');
  }
});

// @desc    Update a material
// @route   PUT /api/materials/:id
// @access  Private
export const updateMaterial = asyncHandler(async (req, res) => {
  const { name, quantity, minQuantity } = req.body;
  const materialId = req.params.id;
  
  const material = await materialModel.getMaterialById(materialId);
  
  if (!material) {
    res.status(404);
    throw new Error('Material not found');
  }
  
  const updatedMaterial = await materialModel.updateMaterial(materialId, {
    name: name || material.name,
    quantity: quantity !== undefined ? quantity : material.quantity,
    minQuantity: minQuantity !== undefined ? minQuantity : material.minQuantity,
  });
  
  res.json(updatedMaterial);
});

// @desc    Delete a material
// @route   DELETE /api/materials/:id
// @access  Private
export const deleteMaterial = asyncHandler(async (req, res) => {
  const materialId = req.params.id;
  
  const material = await materialModel.getMaterialById(materialId);
  
  if (!material) {
    res.status(404);
    throw new Error('Material not found');
  }
  
  const deleted = await materialModel.deleteMaterial(materialId);
  
  if (deleted) {
    res.json({ message: 'Material removed' });
  } else {
    res.status(400);
    throw new Error('Could not delete material');
  }
});

// @desc    Add material quantity
// @route   POST /api/materials/:id/add
// @access  Private
export const addMaterialQuantity = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const materialId = req.params.id;
  
  if (!quantity || quantity <= 0) {
    res.status(400);
    throw new Error('Please provide a valid quantity');
  }
  
  const material = await materialModel.getMaterialById(materialId);
  
  if (!material) {
    res.status(404);
    throw new Error('Material not found');
  }
  
  const updatedMaterial = await materialModel.adjustMaterialQuantity(
    materialId,
    quantity,
    req.user.id
  );
  
  res.json(updatedMaterial);
});

// @desc    Use material
// @route   POST /api/materials/:id/use
// @access  Private
export const useMaterial = asyncHandler(async (req, res) => {
  const { quantity, description } = req.body;
  const materialId = req.params.id;
  
  if (!quantity || quantity <= 0) {
    res.status(400);
    throw new Error('Please provide a valid quantity');
  }
  
  const material = await materialModel.getMaterialById(materialId);
  
  if (!material) {
    res.status(404);
    throw new Error('Material not found');
  }
  
  if (material.quantity < quantity) {
    res.status(400);
    throw new Error('Insufficient quantity available');
  }
  
  const updatedMaterial = await materialModel.useMaterial(
    materialId,
    quantity,
    description,
    req.user.id
  );
  
  res.json(updatedMaterial);
});

// @desc    Get materials with low stock
// @route   GET /api/materials/lowstock
// @access  Private
export const getLowStockMaterials = asyncHandler(async (req, res) => {
  const materials = await materialModel.getLowStockMaterials();
  res.json(materials);
});

// @desc    Get material movement history
// @route   GET /api/materials/:id/movements
// @access  Private
export const getMaterialMovements = asyncHandler(async (req, res) => {
  const materialId = req.params.id;
  
  const material = await materialModel.getMaterialById(materialId);
  
  if (!material) {
    res.status(404);
    throw new Error('Material not found');
  }
  
  const movements = await materialModel.getMaterialMovements(materialId);
  res.json(movements);
});