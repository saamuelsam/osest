import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Heading,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Center,
  useDisclosure,
  Badge,
  IconButton,
  Input,
  Select,
  HStack,
  Text,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { Edit, Trash2, Plus, Search, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { Product } from '../types';
import ProductModal from '../components/modals/ProductModal';
import StockAdjustmentModal from '../components/modals/StockAdjustmentModal';

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productForStockAdjustment, setProductForStockAdjustment] = useState<Product | null>(null);
  
  const { isOpen: isProductModalOpen, onOpen: onProductModalOpen, onClose: onProductModalClose } = useDisclosure();
  const { isOpen: isDeleteDialogOpen, onOpen: onDeleteDialogOpen, onClose: onDeleteDialogClose } = useDisclosure();
  const { isOpen: isStockAdjustmentOpen, onOpen: onStockAdjustmentOpen, onClose: onStockAdjustmentClose } = useDisclosure();
  
  const toast = useToast();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, categoryFilter, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data);
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(response.data.map((product: Product) => product.category))
      );
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os produtos.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let result = [...products];
    
    if (searchTerm) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter) {
      result = result.filter(product => product.category === categoryFilter);
    }
    
    setFilteredProducts(result);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    onProductModalOpen();
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    onProductModalOpen();
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    onDeleteDialogOpen();
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    
    try {
      await api.delete(`/products/${productToDelete.id}`);
      setProducts(products.filter(p => p.id !== productToDelete.id));
      toast({
        title: 'Produto excluído',
        description: 'O produto foi removido com sucesso.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o produto.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onDeleteDialogClose();
    }
  };

  const handleStockAdjustment = (product: Product) => {
    setProductForStockAdjustment(product);
    onStockAdjustmentOpen();
  };

  const handleProductSaved = (savedProduct: Product) => {
    if (selectedProduct) {
      // Update existing product
      setProducts(products.map(p => p.id === savedProduct.id ? savedProduct : p));
    } else {
      // Add new product
      setProducts([...products, savedProduct]);
    }
    onProductModalClose();
  };

  const handleStockAdjusted = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    onStockAdjustmentClose();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Gerenciar Produtos</Heading>
        <Button 
          leftIcon={<Plus size={18} />} 
          colorScheme="green" 
          bg="brand.primary"
          onClick={handleAddProduct}
          _hover={{ bg: 'brand.primary', opacity: 0.9 }}
        >
          Novo Produto
        </Button>
      </Flex>
      
      <Box bg="white" p={4} rounded="md" shadow="sm" mb={6}>
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          gap={4} 
          align={{ base: 'stretch', md: 'center' }}
        >
          <Box flex="1">
            <Flex>
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                focusBorderColor="brand.primary"
              />
              <IconButton
                aria-label="Buscar"
                icon={<Search size={18} />}
                ml={2}
                colorScheme="green"
                variant="outline"
              />
            </Flex>
          </Box>
          
          <Box w={{ base: '100%', md: '200px' }}>
            <Select
              placeholder="Filtrar por categoria"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              focusBorderColor="brand.primary"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </Box>
          
          <Button
            leftIcon={<RefreshCw size={16} />}
            onClick={resetFilters}
            variant="ghost"
            size="sm"
          >
            Limpar filtros
          </Button>
        </Flex>
      </Box>
      
      {loading ? (
        <Center h="200px">
          <Spinner size="xl" color="brand.primary" />
        </Center>
      ) : (
        <>
          {filteredProducts.length === 0 ? (
            <Box textAlign="center" py={10} bg="white" rounded="md" shadow="sm">
              <Text>Nenhum produto encontrado.</Text>
            </Box>
          ) : (
            <TableContainer bg="white" rounded="md" shadow="sm">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Nome</Th>
                    <Th>Categoria</Th>
                    <Th isNumeric>Quantidade</Th>
                    <Th isNumeric>Mínimo</Th>
                    <Th>Status</Th>
                    <Th>Ações</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredProducts.map((product) => (
                    <Tr key={product.id}>
                      <Td fontWeight="medium">{product.name}</Td>
                      <Td>{product.category}</Td>
                      <Td isNumeric>{product.quantity}</Td>
                      <Td isNumeric>{product.minQuantity}</Td>
                      <Td>
                        {product.quantity < product.minQuantity ? (
                          <Badge colorScheme="red">Baixo estoque</Badge>
                        ) : (
                          <Badge colorScheme="green">Normal</Badge>
                        )}
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Ajustar estoque"
                            icon={<RefreshCw size={16} />}
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleStockAdjustment(product)}
                          />
                          <IconButton
                            aria-label="Editar produto"
                            icon={<Edit size={16} />}
                            size="sm"
                            colorScheme="green"
                            onClick={() => handleEditProduct(product)}
                          />
                          <IconButton
                            aria-label="Excluir produto"
                            icon={<Trash2 size={16} />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeleteClick(product)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
      
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={onProductModalClose}
        product={selectedProduct}
        onSave={handleProductSaved}
        categories={categories}
      />
      
      <StockAdjustmentModal
        isOpen={isStockAdjustmentOpen}
        onClose={onStockAdjustmentClose}
        product={productForStockAdjustment}
        onAdjust={handleStockAdjusted}
      />
      
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteDialogClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Excluir produto
            </AlertDialogHeader>

            <AlertDialogBody>
              Tem certeza que deseja excluir o produto "{productToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteDialogClose}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default ProductsPage;