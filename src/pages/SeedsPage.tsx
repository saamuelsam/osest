import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Button, Heading, Flex, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  Spinner, Center, useDisclosure, Badge, IconButton, Input, Text, useToast,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
  Stack, Menu, MenuButton, MenuList, MenuItem, useBreakpointValue, Select
} from '@chakra-ui/react';
import { Edit, Trash2, Plus, RefreshCw, MoreVertical } from 'lucide-react';
import api from '../services/api';
import { Seed } from '../types';
import SeedModal from '../components/modals/SeedModal';

const normalizeApiSeedToSeedType = (apiSeedData: any): Seed => ({
  ...apiSeedData,
  id: String(apiSeedData.id ?? ''),
  name: String(apiSeedData.name ?? ''),
  type: String(apiSeedData.type ?? ''),
  package100: Number(apiSeedData.package_100 ?? apiSeedData.package100 ?? 0),
  package200: Number(apiSeedData.package_200 ?? apiSeedData.package200 ?? 0),
  package500: Number(apiSeedData.package_500 ?? apiSeedData.package500 ?? 0),
  minQuantity: Number(apiSeedData.min_quantity ?? apiSeedData.minQuantity ?? 0),
  createdAt: String(apiSeedData.createdAt ?? new Date().toISOString()),
  updatedAt: String(apiSeedData.updatedAt ?? new Date().toISOString()),
});

const SeedsPage: React.FC = () => {
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [filtered, setFiltered] = useState<Seed[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [seedTypes, setSeedTypes] = useState<string[]>([]);
  const [selSeed, setSelSeed] = useState<Seed | null>(null);
  const [toDelete, setToDelete] = useState<Seed | null>(null);

  const isMobile = useBreakpointValue({ base: true, md: false });

  const sModal = useDisclosure();
  const dModal = useDisclosure();
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { fetchSeeds(); }, []);
  useEffect(() => { applyFilter(); }, [search, typeFilter, seeds]);

  const fetchSeeds = async () => {
    try {
      setLoading(true);
      const response = await api.get<any[]>('/seeds');
      const norm = response.data.map(normalizeApiSeedToSeedType);
      setSeeds(norm);

      // Coleta tipos únicos para o filtro
      setSeedTypes(Array.from(new Set(norm.map(s => s.type).filter(Boolean))));
    } catch (err) {
      toast({ title: 'Erro ao carregar sementes', status: 'error', duration: 5000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let out = seeds;
    if (search) out = out.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
    if (typeFilter) out = out.filter(s => s.type === typeFilter);
    setFiltered(out);
  };

  const onAdd = () => { setSelSeed(null); sModal.onOpen(); };
  const onEdit = (s: Seed) => { setSelSeed(s); sModal.onOpen(); };
  const onDeleteClick = (s: Seed) => { setToDelete(s); dModal.onOpen(); };
  const onDelete = async () => {
    if (!toDelete) return;
    try {
      await api.delete(`/seeds/${toDelete.id}`);
      setSeeds(prev => prev.filter(x => x.id !== toDelete.id));
      toast({ title: 'Semente excluída', status: 'success', duration: 5000, isClosable: true });
    } catch {
      toast({ title: 'Erro ao excluir', status: 'error', duration: 5000, isClosable: true });
    } finally {
      dModal.onClose();
      setToDelete(null);
    }
  };

  const onSaved = (data: any) => {
    const s = normalizeApiSeedToSeedType(data);
    setSeeds(prev => prev.some(x => x.id === s.id)
      ? prev.map(x => x.id === s.id ? s : x)
      : [...prev, s]
    );
    sModal.onClose();
  };

  // Função auxiliar para calcular total de pacotes
  const getTotalPackages = (s: Seed) => (s.package100 || 0) + (s.package200 || 0) + (s.package500 || 0);

  if (loading) return (<Center h="200px"><Spinner size="xl" color="brand.primary"/></Center>);

  return (
    <Box p={{ base: 3, md: 6 }}>
      <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" mb={6} gap={4}>
        <Heading size="lg">Sementes</Heading>
        <Button leftIcon={<Plus />} colorScheme="green" onClick={onAdd} w={{ base: 'full', sm: 'auto' }}>Nova Semente</Button>
      </Flex>

      <Flex direction={{ base: 'column', md: 'row' }} gap={4} mb={6}>
        <Input placeholder="Buscar sementes..." value={search} onChange={e => setSearch(e.target.value)} flexGrow={1} />
        <Select placeholder="Filtrar por tipo" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} w={{ base: 'full', md: '200px' }}>
          {seedTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </Select>
        <Button leftIcon={<RefreshCw />} onClick={() => { setSearch(''); setTypeFilter(''); }} w={{ base: 'full', md: 'auto' }}>Limpar</Button>
      </Flex>

      {isMobile ? (
        <Stack spacing={4}>
          {filtered.map(s => {
            const totalPkgs = getTotalPackages(s);
            const needsRestock = totalPkgs < s.minQuantity;
            return (
              <Box key={s.id} p={4} bg="white" shadow="sm" rounded="md">
                <Flex justify="space-between" mb={2}>
                  <Text fontWeight="bold">{s.name}</Text>
                  <Menu>
                    <MenuButton as={IconButton} icon={<MoreVertical />} size="sm" variant="ghost" />
                    <MenuList>
                      <MenuItem icon={<Edit />} onClick={() => onEdit(s)}>Editar</MenuItem>
                      <MenuItem icon={<Trash2 />} onClick={() => onDeleteClick(s)} color="red.500">Excluir</MenuItem>
                    </MenuList>
                  </Menu>
                </Flex>
                <Text><strong>Tipo:</strong> {s.type}</Text>
                <Text><strong>Pcts. 100:</strong> {s.package100} | <strong>200:</strong> {s.package200} | <strong>500:</strong> {s.package500}</Text>
                <Text><strong>Total:</strong> {totalPkgs} | <strong>Mín.:</strong> {s.minQuantity}</Text>
                <Badge mt={2} colorScheme={needsRestock ? 'red' : 'green'}>
                  {needsRestock ? 'Comprar' : 'Em estoque'}
                </Badge>
              </Box>
            );
          })}
        </Stack>
      ) : (
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th>Tipo</Th>
                <Th isNumeric>Pct. 100</Th>
                <Th isNumeric>Pct. 200</Th>
                <Th isNumeric>Pct. 500</Th>
                <Th isNumeric>Total Pcts.</Th>
                <Th isNumeric>Mín. Pcts.</Th>
                <Th>Status</Th>
                <Th>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map(s => {
                const totalPkgs = getTotalPackages(s);
                const needsRestock = totalPkgs < s.minQuantity;
                return (
                  <Tr key={s.id}>
                    <Td>{s.name}</Td>
                    <Td>{s.type}</Td>
                    <Td isNumeric>{s.package100}</Td>
                    <Td isNumeric>{s.package200}</Td>
                    <Td isNumeric>{s.package500}</Td>
                    <Td isNumeric fontWeight="bold">{totalPkgs}</Td>
                    <Td isNumeric>{s.minQuantity}</Td>
                    <Td>
                      <Badge colorScheme={needsRestock ? 'red' : 'green'}>
                        {needsRestock ? 'Comprar' : 'Em estoque'}
                      </Badge>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton as={IconButton} icon={<MoreVertical />} size="sm" variant="ghost" />
                        <MenuList>
                          <MenuItem icon={<Edit />} onClick={() => onEdit(s)}>Editar</MenuItem>
                          <MenuItem icon={<Trash2 />} onClick={() => onDeleteClick(s)} color="red.500">Excluir</MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      <SeedModal isOpen={sModal.isOpen} onClose={sModal.onClose} seed={selSeed} onSave={onSaved} />

      <AlertDialog isOpen={dModal.isOpen} leastDestructiveRef={cancelRef} onClose={dModal.onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Excluir semente</AlertDialogHeader>
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

export default SeedsPage;
