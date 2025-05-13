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
  // Extract new fields: boxes and weightKg (camelCase from frontend)
  const { name, quantity, minQuantity, boxes, weightKg } = req.body;
  
  if (!name) {
    res.status(400);
    // throw new Error('Please provide a name'); // Original
    throw new Error('O nome do material é obrigatório.'); // Melhor mensagem
  }
  
  // Basic validation for new fields (optional, but good practice)
  if (boxes !== undefined && (typeof boxes !== 'number' || boxes < 0)) {
    res.status(400);
    throw new Error('O número de caixas deve ser um valor positivo.');
  }
  if (weightKg !== undefined && (typeof weightKg !== 'number' || weightKg < 0)) {
    res.status(400);
    throw new Error('O peso (kg) deve ser um valor positivo.');
  }

  const materialData = {
    name,
    quantity: quantity === undefined ? 0 : Number(quantity),
    minQuantity: minQuantity === undefined ? 0 : Number(minQuantity),
    boxes: boxes === undefined ? 0 : Number(boxes),          // Pass boxes
    weightKg: weightKg === undefined ? 0 : Number(weightKg),  // Pass weightKg (camelCase)
  };
  
  const material = await materialModel.createMaterial(materialData);
  
  if (material) {
    res.status(201).json(material);
  } else {
    res.status(400);
    throw new Error('Dados inválidos para o material.'); // Mensagem genérica se o model falhar
  }
});

// @desc    Update a material
// @route   PUT /api/materials/:id
// @access  Private
export const updateMaterial = asyncHandler(async (req, res) => {
  // Extract new fields: boxes and weightKg (camelCase from frontend)
  const { name, quantity, minQuantity, boxes, weightKg } = req.body;
  const materialId = req.params.id;
  
  const existingMaterial = await materialModel.getMaterialById(materialId);
  
  if (!existingMaterial) {
    res.status(404);
    throw new Error('Material não encontrado.');
  }

  // Basic validation for new fields (optional, but good practice)
  if (boxes !== undefined && (typeof boxes !== 'number' || boxes < 0)) {
    res.status(400);
    throw new Error('O número de caixas deve ser um valor positivo.');
  }
  if (weightKg !== undefined && (typeof weightKg !== 'number' || weightKg < 0)) {
    res.status(400);
    throw new Error('O peso (kg) deve ser um valor positivo.');
  }
  
  const materialDataToUpdate = {
    name: name || existingMaterial.name,
    quantity: quantity !== undefined ? Number(quantity) : existingMaterial.quantity,
    minQuantity: minQuantity !== undefined ? Number(minQuantity) : existingMaterial.minQuantity,
    // Use o valor do body se fornecido, senão mantenha o existente (ou defina como 0/null se apropriado)
    boxes: boxes !== undefined ? Number(boxes) : existingMaterial.boxes,
    weightKg: weightKg !== undefined ? Number(weightKg) : existingMaterial.weightKg, // Pass weightKg (camelCase)
  };

  const updatedMaterial = await materialModel.updateMaterial(materialId, materialDataToUpdate);
  
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
    throw new Error('Material não encontrado.');
  }
  
  const deleted = await materialModel.deleteMaterial(materialId);
  
  if (deleted) {
    res.json({ message: 'Material removido com sucesso.' });
  } else {
    res.status(400);
    throw new Error('Não foi possível excluir o material.');
  }
});

// @desc    Add material quantity
// @route   POST /api/materials/:id/add
// @access  Private
export const addMaterialQuantity = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const materialId = req.params.id;
  
  if (quantity === undefined || Number(quantity) <= 0) {
    res.status(400);
    throw new Error('Forneça uma quantidade válida para adicionar.');
  }
  
  const material = await materialModel.getMaterialById(materialId);
  
  if (!material) {
    res.status(404);
    throw new Error('Material não encontrado.');
  }
  
  const updatedMaterial = await materialModel.adjustMaterialQuantity(
    materialId,
    Number(quantity), // Garante que é um número
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
  
  if (quantity === undefined || Number(quantity) <= 0) {
    res.status(400);
    throw new Error('Forneça uma quantidade válida para uso.');
  }
  
  const material = await materialModel.getMaterialById(materialId);
  
  if (!material) {
    res.status(404);
    throw new Error('Material não encontrado.');
  }
  
  // A verificação de quantidade suficiente já é feita no model, mas pode ser feita aqui também
  if (material.quantity < Number(quantity)) {
    res.status(400);
    throw new Error('Quantidade insuficiente em estoque.');
  }
  
  const updatedMaterial = await materialModel.useMaterial(
    materialId,
    Number(quantity), // Garante que é um número
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
    throw new Error('Material não encontrado.');
  }
  
  const movements = await materialModel.getMaterialMovements(materialId);
  res.json(movements);
});