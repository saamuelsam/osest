import asyncHandler from 'express-async-handler';
import * as productModel from '../models/productModel.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Private
export const getProducts = asyncHandler(async (req, res) => {
  const products = await productModel.getAllProducts();
  res.json(products);
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private
export const getProductById = asyncHandler(async (req, res) => {
  const product = await productModel.getProductById(req.params.id);
  
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Private
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    category,
    quantity      = 0,
    minQuantity   = 0,
    boxes         = 0,        // NOVO
    weightKg      = 0         // NOVO
  } = req.body;

  if (!name || !category) {
    res.status(400);
    throw new Error('Please provide name and category');
  }

  const product = await productModel.createProduct({
    name,
    category,
    quantity:     Number(quantity),
    minQuantity:  Number(minQuantity),
    boxes:        Number(boxes),
    weightKg:     Number(weightKg)
  });

  if (product) {
    res.status(201).json(product);
  } else {
    res.status(400);
    throw new Error('Invalid product data');
  }
});

// ---------- UPDATE ----------
export const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    category,
    quantity,
    minQuantity,
    boxes,
    weightKg                    
  } = req.body;

  const productId = req.params.id;
  const product   = await productModel.getProductById(productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const updatedProduct = await productModel.updateProduct(productId, {
    name:        name        ?? product.name,
    category:    category    ?? product.category,
    quantity:    quantity    ?? product.quantity,
    minQuantity: minQuantity ?? product.minQuantity,
    boxes:       boxes       ?? product.boxes,      
    weightKg:    weightKg    ?? product.weightKg    
  });

  res.json(updatedProduct);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  
  const product = await productModel.getProductById(productId);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  const deleted = await productModel.deleteProduct(productId);
  
  if (deleted) {
    res.json({ message: 'Product removed' });
  } else {
    res.status(400);
    throw new Error('Could not delete product');
  }
});

// @desc    Adjust product quantity
// @route   POST /api/products/:id/adjust
// @access  Private
export const adjustProductQuantity = asyncHandler(async (req, res) => {
  const { quantity, type, description } = req.body;
  const productId = req.params.id;
  
  if (!quantity || !type) {
    res.status(400);
    throw new Error('Please provide quantity and type');
  }
  
  if (type !== 'add' && type !== 'remove') {
    res.status(400);
    throw new Error('Type must be either add or remove');
  }
  
  if (quantity <= 0) {
    res.status(400);
    throw new Error('Quantity must be greater than 0');
  }
  
  const product = await productModel.getProductById(productId);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  const updatedProduct = await productModel.adjustProductQuantity(
    productId,
    { quantity, type, description },
    req.user.id
  );
  
  res.json(updatedProduct);
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Private
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const category = req.params.category;
  const products = await productModel.getProductsByCategory(category);
  res.json(products);
});

// @desc    Get products with low stock
// @route   GET /api/products/lowstock
// @access  Private
export const getLowStockProducts = asyncHandler(async (req, res) => {
  const products = await productModel.getLowStockProducts();
  res.json(products);
});

// @desc    Get product movement history
// @route   GET /api/products/:id/movements
// @access  Private
export const getProductMovements = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  
  const product = await productModel.getProductById(productId);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  const movements = await productModel.getProductMovements(productId);
  res.json(movements);
});