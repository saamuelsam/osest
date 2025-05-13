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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useBreakpointValue,
  SimpleGrid,
} from '@chakra-ui/react';
import { Edit, Trash2, Plus, RefreshCw, MoreVertical } from 'lucide-react';
import api from '../services/api';
import { Product } from '../types';
import ProductModal from '../components/modals/ProductModal';
import StockAdjustmentModal from '../components/modals/StockAdjustmentModal';

// Normaliza produto da API para o tipo Product
const normalizeApiProductToProductType = (apiData: any): Product => ({
  ...apiData,
  id: String(apiData.id ?? ''),
  name: String(apiData.name ?? ''),
  category: String(apiData.category ?? ''),
  quantity: Number(apiData.quantity ?? 0),
  minQuantity: Number(apiData.minQuantity ?? 0),
  boxes: Number(apiData.boxes ?? 0),
  weightKg: Number(apiData.weightKg ?? apiData.weight_kg ?? 0),
  createdAt: String(apiData.createdAt ?? new Date().toISOString()),
  updatedAt: String(apiData.updatedAt ?? new Date().toISOString()),
});

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selProd, setSelProd] = useState<Product | null>(null);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [adjProd, setAdjProd] = useState<Product | null>(null);

  const isMobile = useBreakpointValue({ base: true, md: false });

  const pModal = useDisclosure();
  const dModal = useDisclosure();
  const sModal = useDisclosure();
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { fetchProducts(); }, []);
  useEffect(() => { applyFilter(); }, [search, categoryFilter, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get<any[]>('/products');
      const norm = res.data.map(normalizeApiProductToProductType);
      setProducts(norm);
      setCategories(Array.from(new Set(norm.map(p => p.category).filter(Boolean))));
    } catch (e) {
      toast({ title: 'Erro ao buscar produtos', status: 'error', duration: 5000, isClosable: true });
    } finally { setLoading(false); }
  };

  const applyFilter = () => {
    let out = [...products];
    if (search) out = out.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (categoryFilter) out = out.filter(p => p.category === categoryFilter);
    setFiltered(out);
  };

  const onAdd = () => { setSelProd(null); pModal.onOpen(); };
  const onEdit = (p: Product) => { setSelProd(p); pModal.onOpen(); };
  const onDeleteClick = (p: Product) => { setToDelete(p); dModal.onOpen(); };
  const onDelete = async () => {
    if (!toDelete) return;
    try {
      await api.delete(`/products/${toDelete.id}`);
      setProducts(prev => prev.filter(x => x.id !== toDelete.id));
      toast({ title: 'Produto excluído', status: 'success', duration: 5000, isClosable: true });
    } catch {
      toast({ title: 'Erro ao excluir', status: 'error', duration: 5000, isClosable: true });
    } finally { dModal.onClose(); setToDelete(null); }
  };
  const onAdjust = (p: Product) => { setAdjProd(p); sModal.onOpen(); };

  const onSaved = (data: any) => {
    const prod = normalizeApiProductToProductType(data);
    setProducts(prev => prev.some(x => x.id === prod.id)
      ? prev.map(x => x.id === prod.id ? prod : x)
      : [...prev, prod]
    );
    pModal.onClose();
  };

  const onAdjusted = (data: any) => {
    const prod = normalizeApiProductToProductType(data);
    setProducts(prev => prev.map(x => x.id === prod.id ? prod : x));
    sModal.onClose();
  };

  const reset = () => { setSearch(''); setCategoryFilter(''); };

  if (loading) return (<Center h="200px"><Spinner size="xl" color="brand.primary"/></Center>);

  return (
    <Box p={{ base: 3, md: 6 }}>
      <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align="center" mb={6} gap={4}>
        <Heading size="lg" whiteSpace="nowrap">Gerenciar Produtos</Heading>
        <Button leftIcon={<Plus/>} colorScheme="green" onClick={onAdd} w={{ base: 'full', sm: 'auto' }}>Novo Produto</Button>
      </Flex>

      <Flex direction={{ base: 'column', md: 'row' }} gap={4} mb={6}>
        <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} flexGrow={1}/>
        <Select placeholder="Categoria" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} w={{ base: 'full', md: '200px' }}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Button leftIcon={<RefreshCw/>} onClick={reset} w={{ base: 'full', md: 'auto' }}>Limpar</Button>
      </Flex>

      {isMobile ? (
        <Stack spacing={4}>
          {filtered.map(p => (
            <Box key={p.id} p={4} bg="white" shadow="sm" rounded="md">
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontWeight="bold">{p.name}</Text>
                <Menu>
                  <MenuButton as={IconButton} icon={<MoreVertical/>} size="sm" variant="ghost" />
                  <MenuList>
                    <MenuItem icon={<RefreshCw/>} onClick={() => onAdjust(p)}>Ajustar</MenuItem>
                    <MenuItem icon={<Edit/>} onClick={() => onEdit(p)}>Editar</MenuItem>
                    <MenuItem icon={<Trash2/>} onClick={() => onDeleteClick(p)} color="red.500">Excluir</MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
              <Text><strong>Categoria:</strong> {p.category}</Text>
              <Text><strong>Qtd:</strong> {p.quantity} | <strong>Mín:</strong> {p.minQuantity}</Text>
              <Text><strong>Caixas:</strong> {p.boxes} | <strong>Peso:</strong> {p.weightKg.toFixed(2)} kg</Text>
              <Badge mt={2} colorScheme={p.quantity < p.minQuantity ? 'red' : 'green'}>
                {p.quantity < p.minQuantity ? 'Comprar' : 'Em estoque'}
              </Badge>
            </Box>
          ))}
        </Stack>
      ) : (
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th>Categoria</Th>
                <Th isNumeric>Qtd.</Th>
                <Th isNumeric>Mín.</Th>
                <Th isNumeric>Caixas</Th>
                <Th isNumeric>Peso (kg)</Th>
                <Th>Status</Th>
                <Th>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map(p => (
                <Tr key={p.id}>
                  <Td>{p.name}</Td>
                  <Td>{p.category}</Td>
                  <Td isNumeric>{p.quantity}</Td>
                  <Td isNumeric>{p.minQuantity}</Td>
                  <Td isNumeric>{p.boxes}</Td>
                  <Td isNumeric>{p.weightKg.toFixed(2)}</Td>
                  <Td><Badge colorScheme={p.quantity < p.minQuantity ? 'red' : 'green'}>{p.quantity < p.minQuantity ? 'Comprar' : 'Em estoque'}</Badge></Td>
                  <Td>
                    <Menu>
                      <MenuButton as={IconButton} icon={<MoreVertical/>} size="sm" variant="ghost" />
                      <MenuList>
                        <MenuItem icon={<RefreshCw/>} onClick={() => onAdjust(p)}>Ajustar</MenuItem>
                        <MenuItem icon={<Edit/>} onClick={() => onEdit(p)}>Editar</MenuItem>
                        <MenuItem icon={<Trash2/>} onClick={() => onDeleteClick(p)} color="red.500">Excluir</MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      <ProductModal isOpen={pModal.isOpen} onClose={pModal.onClose} product={selProd} onSave={onSaved} categories={categories} />
      <StockAdjustmentModal isOpen={sModal.isOpen} onClose={sModal.onClose} product={adjProd} onAdjust={onAdjusted} />

      <AlertDialog isOpen={dModal.isOpen} leastDestructiveRef={cancelRef} onClose={dModal.onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Excluir produto</AlertDialogHeader>
            <AlertDialogBody>Tem certeza que deseja excluir "{toDelete?.name}"?</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={dModal.onClose}>Cancelar</Button>
              <Button colorScheme="red" onClick={onDelete} ml={3}>Excluir</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default ProductsPage;
