import asyncHandler from 'express-async-handler';
import * as seedModel from '../models/sendModel.js';

// @desc    Get all seeds
// @route   GET /api/seeds
// @access  Private
export const getSeeds = asyncHandler(async (req, res) => {
  const seeds = await seedModel.getAllSeeds();
  res.json(seeds);
});

// @desc    Get seed by ID
// @route   GET /api/seeds/:id
// @access  Private
export const getSeedById = asyncHandler(async (req, res) => {
  const seed = await seedModel.getSeedById(req.params.id);
  
  if (seed) {
    res.json(seed);
  } else {
    res.status(404);
    throw new Error('Seed not found');
  }
});

// @desc    Create a new seed
// @route   POST /api/seeds
// @access  Private
export const createSeed = asyncHandler(async (req, res) => {
  const {
    name,
    type,
    package100,
    package_100,
    package200,
    package_200,
    package500,
    package_500,
    minQuantity,
    min_quantity,
  } = req.body;
  
  if (!name || !type) {
    res.status(400);
    throw new Error('Please provide name and type');
  }
  
  const seed = await seedModel.createSeed({
    name,
    type,
    package100: package100 ?? package_100 ?? 0,
    package200: package200 ?? package_200 ?? 0,
    package500: package500 ?? package_500 ?? 0,
    minQuantity: minQuantity ?? min_quantity ?? 0,
  });
  
  if (seed) {
    res.status(201).json(seed);
  } else {
    res.status(400);
    throw new Error('Invalid seed data');
  }
});

// @desc    Update a seed
// @route   PUT /api/seeds/:id
// @access  Private
export const updateSeed = asyncHandler(async (req, res) => {
  const {
    name,
    type,
    package100,
    package_100,
    package200,
    package_200,
    package500,
    package_500,
    minQuantity,
    min_quantity,
  } = req.body;
  const seedId = req.params.id;
  
  const seed = await seedModel.getSeedById(seedId);
  
  if (!seed) {
    res.status(404);
    throw new Error('Seed not found');
  }
  
  const updatedSeed = await seedModel.updateSeed(seedId, {
    name: name || seed.name,
    type: type || seed.type,
    package100: package100 ?? package_100 ?? seed.package100,
    package200: package200 ?? package_200 ?? seed.package200,
    package500: package500 ?? package_500 ?? seed.package500,
    minQuantity: minQuantity ?? min_quantity ?? seed.minQuantity,
  });
  
  res.json(updatedSeed);
});

// @desc    Delete a seed
// @route   DELETE /api/seeds/:id
// @access  Private
export const deleteSeed = asyncHandler(async (req, res) => {
  const seedId = req.params.id;
  
  const seed = await seedModel.getSeedById(seedId);
  
  if (!seed) {
    res.status(404);
    throw new Error('Seed not found');
  }
  
  const deleted = await seedModel.deleteSeed(seedId);
  
  if (deleted) {
    res.json({ message: 'Seed removed' });
  } else {
    res.status(400);
    throw new Error('Could not delete seed');
  }
});

// @desc    Adjust seed package quantities
// @route   POST /api/seeds/:id/adjust
// @access  Private
export const adjustSeedPackages = asyncHandler(async (req, res) => {
  const { package100, package200, package500, type, description } = req.body;
  const seedId = req.params.id;
  
  if (!type || (package100 === 0 && package200 === 0 && package500 === 0)) {
    res.status(400);
    throw new Error('Please provide type and at least one package quantity');
  }
  
  if (type !== 'add' && type !== 'remove') {
    res.status(400);
    throw new Error('Type must be either add or remove');
  }
  
  const seed = await seedModel.getSeedById(seedId);
  
  if (!seed) {
    res.status(404);
    throw new Error('Seed not found');
  }
  
  // Check if there's enough quantity for removal
  if (type === 'remove') {
    if (package100 > seed.package100 || package200 > seed.package200 || package500 > seed.package500) {
      res.status(400);
      throw new Error('Insufficient quantity available');
    }
  }
  
  const updatedSeed = await seedModel.adjustSeedPackages(
    seedId,
    { package100, package200, package500, type, description },
    req.user.id
  );
  
  res.json(updatedSeed);
});

// @desc    Get seeds by type
// @route   GET /api/seeds/type/:type
// @access  Private
export const getSeedsByType = asyncHandler(async (req, res) => {
  const type = req.params.type;
  const seeds = await seedModel.getSeedsByType(type);
  res.json(seeds);
});

// @desc    Get seeds with low stock
// @route   GET /api/seeds/lowstock
// @access  Private
export const getLowStockSeeds = asyncHandler(async (req, res) => {
  const seeds = await seedModel.getLowStockSeeds();
  res.json(seeds);
});

// @desc    Get seed movement history
// @route   GET /api/seeds/:id/movements
// @access  Private
export const getSeedMovements = asyncHandler(async (req, res) => {
  const seedId = req.params.id;
  
  const seed = await seedModel.getSeedById(seedId);
  
  if (!seed) {
    res.status(404);
    throw new Error('Seed not found');
  }
  
  const movements = await seedModel.getSeedMovements(seedId);
  res.json(movements);
});
