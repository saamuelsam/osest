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
} from '@chakra-ui/react';
import { Edit, Trash2, Plus, RefreshCw, MoreVertical } from 'lucide-react';
import api from '../services/api';
import { Material } from '../types';
import MaterialModal from '../components/modals/MaterialModal';
import MaterialUsageModal from '../components/modals/MaterialUsageModal';

// Normaliza dados da API para o tipo Material
const normalizeApiMaterialToMaterialType = (apiMaterialData: any): Material => ({
  ...apiMaterialData,
  id: String(apiMaterialData.id ?? ''),
  name: String(apiMaterialData.name ?? ''),
  quantity: Number(apiMaterialData.quantity ?? 0),
  minQuantity: Number(apiMaterialData.minQuantity ?? 0),
  boxes: Number(apiMaterialData.boxes ?? 0),
  weightKg: Number(apiMaterialData.weightKg ?? apiMaterialData.weight_kg ?? 0),
  createdAt: String(apiMaterialData.createdAt ?? new Date().toISOString()),
  updatedAt: String(apiMaterialData.updatedAt ?? new Date().toISOString()),
});

const MaterialsPage: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filtered, setFiltered] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selMat, setSelMat] = useState<Material | null>(null);
  const [toDelete, setToDelete] = useState<Material | null>(null);
  const [forUsage, setForUsage] = useState<Material | null>(null);

  const isMobile = useBreakpointValue({ base: true, md: false });

  const mModal = useDisclosure();
  const dModal = useDisclosure();
  const uModal = useDisclosure();
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { fetchMaterials(); }, []);
  useEffect(() => { applyFilter(); }, [search, materials]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await api.get<any[]>('/materials');
      const norm = response.data.map(normalizeApiMaterialToMaterialType);
      setMaterials(norm);
    } catch (error) {
      toast({ title: 'Erro ao carregar materiais', status: 'error', duration: 5000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let out = materials;
    if (search) {
      out = out.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
    }
    setFiltered(out);
  };

  const onAdd = () => { setSelMat(null); mModal.onOpen(); };
  const onEdit = (m: Material) => { setSelMat(m); mModal.onOpen(); };
  const onDeleteClick = (m: Material) => { setToDelete(m); dModal.onOpen(); };
  const onDelete = async () => {
    if (!toDelete) return;
    try {
      await api.delete(`/materials/${toDelete.id}`);
      setMaterials(prev => prev.filter(x => x.id !== toDelete.id));
      toast({ title: 'Material excluído', status: 'success', duration: 5000, isClosable: true });
    } catch {
      toast({ title: 'Erro ao excluir', status: 'error', duration: 5000, isClosable: true });
    } finally {
      dModal.onClose();
      setToDelete(null);
    }
  };
  const onUsage = (m: Material) => { setForUsage(m); uModal.onOpen(); };

  const onSaved = (data: any) => {
    const mat = normalizeApiMaterialToMaterialType(data);
    setMaterials(prev => prev.some(x => x.id === mat.id)
      ? prev.map(x => x.id === mat.id ? mat : x)
      : [...prev, mat]
    );
    mModal.onClose();
  };

  const onUsed = (data: any) => {
    const mat = normalizeApiMaterialToMaterialType(data);
    setMaterials(prev => prev.map(x => x.id === mat.id ? mat : x));
    uModal.onClose();
  };

  if (loading) return (<Center h="200px"><Spinner size="xl" color="brand.accent"/></Center>);

  return (
    <Box p={{ base: 3, md: 6 }}>
      <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" mb={6} gap={4}>
        <Heading size="lg">Materiais Internos</Heading>
        <Button leftIcon={<Plus/>} colorScheme="yellow" onClick={onAdd} w={{ base: 'full', sm: 'auto' }}>Novo Material</Button>
      </Flex>

      <Flex direction={{ base: 'column', md: 'row' }} gap={4} mb={6}>
        <Input placeholder="Buscar materiais..." value={search} onChange={e => setSearch(e.target.value)} flexGrow={1}/>
        <Button leftIcon={<RefreshCw/>} onClick={() => setSearch('')} w={{ base: 'full', md: 'auto' }}>Limpar</Button>
      </Flex>

      {isMobile ? (
        <Stack spacing={4}>
          {filtered.map(m => (
            <Box key={m.id} p={4} bg="white" shadow="sm" rounded="md">
              <Flex justify="space-between" mb={2}>
                <Text fontWeight="bold">{m.name}</Text>
                <Menu>
                  <MenuButton as={IconButton} icon={<MoreVertical/>} size="sm" variant="ghost" />
                  <MenuList>
                    <MenuItem icon={<RefreshCw/>} onClick={() => onUsage(m)}>Registrar Uso</MenuItem>
                    <MenuItem icon={<Edit/>} onClick={() => onEdit(m)}>Editar</MenuItem>
                    <MenuItem icon={<Trash2/>} onClick={() => onDeleteClick(m)} color="red.500">Excluir</MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
              <Text><strong>Qtd:</strong> {m.quantity} | <strong>Mín:</strong> {m.minQuantity}</Text>
              <Text><strong>Caixas:</strong> {m.boxes} | <strong>Peso:</strong> {m.weightKg.toFixed(2)} kg</Text>
              <Badge mt={2} colorScheme={m.quantity < m.minQuantity ? 'red' : 'green'}>
                {m.quantity < m.minQuantity ? 'Comprar' : 'Em estoque'}
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
                <Th isNumeric>Qtd.</Th>
                <Th isNumeric>Mín.</Th>
                <Th isNumeric>Caixas</Th>
                <Th isNumeric>Peso (kg)</Th>
                <Th>Status</Th>
                <Th>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map(m => (
                <Tr key={m.id}>
                  <Td>{m.name}</Td>
                  <Td isNumeric>{m.quantity}</Td>
                  <Td isNumeric>{m.minQuantity}</Td>
                  <Td isNumeric>{m.boxes}</Td>
                  <Td isNumeric>{m.weightKg.toFixed(2)}</Td>
                  <Td><Badge colorScheme={m.quantity < m.minQuantity ? 'red' : 'green'}>{m.quantity < m.minQuantity ? 'Comprar' : 'Em estoque'}</Badge></Td>
                  <Td>
                    <Menu>
                      <MenuButton as={IconButton} icon={<MoreVertical/>} size="sm" variant="ghost" />
                      <MenuList>
                        <MenuItem icon={<RefreshCw/>} onClick={() => onUsage(m)}>Registrar Uso</MenuItem>
                        <MenuItem icon={<Edit/>} onClick={() => onEdit(m)}>Editar</MenuItem>
                        <MenuItem icon={<Trash2/>} onClick={() => onDeleteClick(m)} color="red.500">Excluir</MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      <MaterialModal isOpen={mModal.isOpen} onClose={mModal.onClose} material={selMat} onSave={onSaved} />
      <MaterialUsageModal isOpen={uModal.isOpen} onClose={uModal.onClose} material={forUsage} onUse={onUsed} />

      <AlertDialog isOpen={dModal.isOpen} leastDestructiveRef={cancelRef} onClose={dModal.onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Excluir material</AlertDialogHeader>
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

export default MaterialsPage;
