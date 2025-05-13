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
  Text,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Stack,
} from '@chakra-ui/react';
import { Edit, Trash2, Plus, Search, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { Product } from '../types';
import ProductModal from '../components/modals/ProductModal';
import StockAdjustmentModal from '../components/modals/StockAdjustmentModal';

// Helper function to normalize a product object from an API response
// Ensures all fields conform to the Product interface, especially types
const normalizeApiProductToProductType = (apiProductData: any): Product => {
  return {
    // Spread unknown fields first, then explicitly type known ones
    ...apiProductData, 
    id: String(apiProductData.id ?? ''),
    name: String(apiProductData.name ?? ''),
    category: String(apiProductData.category ?? ''),
    quantity: Number(apiProductData.quantity ?? 0),
    minQuantity: Number(apiProductData.minQuantity ?? 0),
    boxes: Number(apiProductData.boxes ?? 0),
    // Handles if API returns weightKg (camelCase) or weight_kg (snake_case)
    // and ensures the result is a number.
    weightKg: Number(apiProductData.weightKg ?? apiProductData.weight_kg ?? 0),
    createdAt: String(apiProductData.createdAt ?? new Date().toISOString()),
    updatedAt: String(apiProductData.updatedAt ?? new Date().toISOString()),
  };
};

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productForStockAdjustment, setProductForStockAdjustment] = useState<Product | null>(null);

  const {
    isOpen: isProductModalOpen,
    onOpen: onProductModalOpen,
    onClose: onProductModalClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteDialogOpen,
    onOpen: onDeleteDialogOpen,
    onClose: onDeleteDialogClose,
  } = useDisclosure();
  const {
    isOpen: isStockAdjustmentOpen,
    onOpen: onStockAdjustmentOpen,
    onClose: onStockAdjustmentClose,
  } = useDisclosure();

  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, categoryFilter, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get<any[]>('/products'); // Expect an array of raw product data
      const normalizedProducts = response.data.map(normalizeApiProductToProductType);
      setProducts(normalizedProducts);
      const uniqueCategories = Array.from(
        new Set(normalizedProducts.map((p) => p.category).filter(Boolean)) // Filter out undefined/null categories
      );
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      toast({
        title: 'Erro ao buscar produtos',
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
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (categoryFilter) {
      result = result.filter((p) => p.category === categoryFilter);
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
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      toast({
        title: 'Produto excluído',
        description: 'O produto foi removido com sucesso.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o produto.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onDeleteDialogClose();
      setProductToDelete(null);
    }
  };

  const handleStockAdjustment = (product: Product) => {
    setProductForStockAdjustment(product);
    onStockAdjustmentOpen();
  };

  // Callback for when a product is saved (created or updated) via ProductModal
  // Expects raw data from the API response
  const handleProductSaved = (savedProductFromApi: any) => {
    const normalizedSavedProduct = normalizeApiProductToProductType(savedProductFromApi);
    setProducts((prevProducts) =>
      prevProducts.some((p) => p.id === normalizedSavedProduct.id)
        ? prevProducts.map((p) => (p.id === normalizedSavedProduct.id ? normalizedSavedProduct : p))
        : [...prevProducts, normalizedSavedProduct]
    );
    onProductModalClose();
  };

  // Callback for when stock is adjusted via StockAdjustmentModal
  // Expects raw data from the API response
  const handleStockAdjusted = (updatedProductFromApi: any) => {
    const normalizedAdjustedProduct = normalizeApiProductToProductType(updatedProductFromApi);
    setProducts((prevProducts) =>
      prevProducts.map((p) => (p.id === normalizedAdjustedProduct.id ? normalizedAdjustedProduct : p))
    );
    onStockAdjustmentClose();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
  };

  return (
    <Box p={{ base: 4, md: 6 }}>
      <Flex
        direction={{ base: 'column', sm: 'row' }}
        justify="space-between"
        align={{ base: 'flex-start', sm: 'center' }}
        mb={6}
        gap={4}
      >
        <Heading size={{ base: 'md', md: 'lg' }}>Gerenciar Produtos</Heading>
        <Button
          leftIcon={<Plus size={18} />}
          colorScheme="green"
          bg="brand.primary"
          onClick={handleAddProduct}
          _hover={{ opacity: 0.9 }}
          w={{ base: 'full', sm: 'auto' }}
        >
          Novo Produto
        </Button>
      </Flex>

      <Box bg="white" p={{ base: 3, md: 4 }} rounded="md" shadow="sm" mb={6}>
        <Flex direction={{ base: 'column', lg: 'row' }} gap={4} align="center">
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            focusBorderColor="brand.primary"
            size="md"
          />
          <Select
            placeholder="Filtrar por categoria"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            focusBorderColor="brand.primary"
            size="md"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
          <Button
            leftIcon={<RefreshCw size={16} />}
            onClick={resetFilters}
            variant="outline"
            size="md"
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
        <TableContainer bg="white" rounded="md" shadow="sm" overflowX="auto">
          <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th display={{ base: 'none', md: 'table-cell' }}>Categoria</Th>
                <Th isNumeric>Qtd.</Th>
                <Th isNumeric display={{ base: 'none', sm: 'table-cell' }}>Mín.</Th>
                <Th isNumeric>Caixas</Th>
                <Th isNumeric>Peso (kg)</Th>
                <Th>Status</Th> {}
                <Th>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredProducts.map((product) => (
                <Tr key={product.id}>
                  <Td>{product.name}</Td>
                  <Td display={{ base: 'none', md: 'table-cell' }}>{product.category}</Td>
                  <Td isNumeric>{product.quantity}</Td>
                  <Td isNumeric display={{ base: 'none', sm: 'table-cell' }}>{product.minQuantity}</Td>
                  <Td isNumeric>{product.boxes ?? 0}</Td>{/* Assuming product.weightKg is now reliably a number */}
                  <Td isNumeric>{(product.weightKg ?? 0).toFixed(2)}</Td>
                   <Td>
                      {product.quantity < product.minQuantity ? (
                        <Badge fontSize={{base: '2xs', md: 'xs'}} colorScheme="red">Comprar</Badge>
                      ) : (
                        <Badge fontSize={{base: '2xs', md: 'xs'}} colorScheme="green">Em estoque</Badge>
                      )}
                    </Td>
                  <Td> 
                    <Stack direction={{ base: 'column', lg: 'row' }} spacing={{base: 1, lg: 2}}>
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
                    </Stack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      {/* ProductModal now passes raw API data to onSave */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={onProductModalClose}
        product={selectedProduct}
        onSave={handleProductSaved} 
        categories={categories}
      />

      {/* StockAdjustmentModal now passes raw API data to onAdjust */}
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