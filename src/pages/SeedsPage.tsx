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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { Edit, Trash2, Plus, RefreshCw, MoreVertical } from 'lucide-react';
import api from '../services/api';
import { Seed } from '../types';
import SeedModal from '../components/modals/SeedModal';
// Se você criar um modal de ajuste de estoque para sementes:
// import SeedStockAdjustmentModal from '../components/modals/SeedStockAdjustmentModal';

// Normaliza dados da API para o tipo Seed
const normalizeApiSeedToSeedType = (apiSeedData: any): Seed => {
  return {
    ...apiSeedData,
    id: String(apiSeedData.id ?? ''),
    name: String(apiSeedData.name ?? ''),
    type: String(apiSeedData.type ?? ''),
    package100: Number(apiSeedData.package_100 ?? apiSeedData.package100 ?? 0),
    package200: Number(apiSeedData.package_200 ?? apiSeedData.package200 ?? 0),
    package500: Number(apiSeedData.package_500 ?? apiSeedData.package500 ?? 0),
    minQuantity: Number(apiSeedData.min_quantity ?? apiSeedData.minQuantity ?? 0), // <-- Troca aqui!
    createdAt: String(apiSeedData.createdAt ?? new Date().toISOString()),
    updatedAt: String(apiSeedData.updatedAt ?? new Date().toISOString()),
  };
};

const SeedsPage: React.FC = () => {
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [filteredSeeds, setFilteredSeeds] = useState<Seed[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [seedTypes, setSeedTypes] = useState<string[]>([]); // Para popular o filtro de tipo
  const [selectedSeed, setSelectedSeed] = useState<Seed | null>(null);
  const [seedToDelete, setSeedToDelete] = useState<Seed | null>(null);
  // const [seedForStockAdjustment, setSeedForStockAdjustment] = useState<Seed | null>(null);

  const {
    isOpen: isSeedModalOpen,
    onOpen: onSeedModalOpen,
    onClose: onSeedModalClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteDialogOpen,
    onOpen: onDeleteDialogOpen,
    onClose: onDeleteDialogClose,
  } = useDisclosure();
  // const {
  //   isOpen: isStockAdjustmentOpen,
  //   onOpen: onStockAdjustmentOpen,
  //   onClose: onStockAdjustmentClose,
  // } = useDisclosure();

  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetchSeeds();
  }, []);

  useEffect(() => {
    filterSeeds();
  }, [searchTerm, typeFilter, seeds]);

  const fetchSeeds = async () => {
    try {
      setLoading(true);
      const response = await api.get<any[]>('/seeds');
      const normalizedSeeds = response.data.map(normalizeApiSeedToSeedType);
      setSeeds(normalizedSeeds);
      const uniqueTypes = Array.from(
        new Set(normalizedSeeds.map((s) => s.type).filter(Boolean))
      );
      setSeedTypes(uniqueTypes);
    } catch (err) {
      console.error('Failed to fetch seeds:', err);
      toast({
        title: 'Erro ao buscar sementes',
        description: 'Não foi possível carregar as sementes.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const filterSeeds = () => {
    let result = [...seeds];
    if (searchTerm) {
      result = result.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (typeFilter) {
      result = result.filter((s) => s.type === typeFilter);
    }
    setFilteredSeeds(result);
  };

  const handleAddSeed = () => {
    setSelectedSeed(null);
    onSeedModalOpen();
  };

  const handleEditSeed = (seed: Seed) => {
    setSelectedSeed(seed);
    onSeedModalOpen();
  };

  const handleDeleteClick = (seed: Seed) => {
    setSeedToDelete(seed);
    onDeleteDialogOpen();
  };

  const handleDelete = async () => {
    if (!seedToDelete) return;
    try {
      await api.delete(`/seeds/${seedToDelete.id}`);
      setSeeds((prev) => prev.filter((s) => s.id !== seedToDelete.id));
      toast({
        title: 'Semente excluída',
        description: 'A semente foi removida com sucesso.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir a semente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onDeleteDialogClose();
      setSeedToDelete(null);
    }
  };

  // const handleStockAdjustment = (seed: Seed) => {
  //   setSeedForStockAdjustment(seed);
  //   onStockAdjustmentOpen();
  // };

  const handleSeedSaved = (savedSeedFromApi: any) => {
    const normalizedSavedSeed = normalizeApiSeedToSeedType(savedSeedFromApi);
    setSeeds((prevSeeds) =>
      prevSeeds.some((s) => s.id === normalizedSavedSeed.id)
        ? prevSeeds.map((s) => (s.id === normalizedSavedSeed.id ? normalizedSavedSeed : s))
        : [...prevSeeds, normalizedSavedSeed]
    );
    onSeedModalClose();
  };

  // const handleStockAdjusted = (updatedSeedFromApi: any) => {
  //   const normalizedAdjustedSeed = normalizeApiSeedToSeedType(updatedSeedFromApi);
  //   setSeeds((prevSeeds) =>
  //     prevSeeds.map((s) => (s.id === normalizedAdjustedSeed.id ? normalizedAdjustedSeed : s))
  //   );
  //   onStockAdjustmentClose();
  // };

  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
  };

  const getTotalPackages = (seed: Seed) => {
     return (seed.package100 || 0) + (seed.package200 || 0) + (seed.package500 || 0);
  }

  return (
    <Box p={{ base: 2, sm: 4, md: 6 }}>
      <Flex
        direction={{ base: 'column', sm: 'row' }}
        justify="space-between"
        align={{ base: 'flex-start', sm: 'center' }}
        mb={{ base: 4, md: 6 }}
        gap={{ base: 2, sm: 4 }} 
      >
        <Heading size={{ base: 'sm', md: 'lg' }} whiteSpace="nowrap">Gerenciar Sementes</Heading>
        <Button
          leftIcon={<Plus size={16} />}
          colorScheme="green"
          bg="brand.primary"
          onClick={handleAddSeed}
          _hover={{ opacity: 0.9 }}
          w={{ base: 'full', sm: 'auto' }} 
          fontSize={{ base: 'xs', sm: 'sm', md: 'md' }} 
          size={{ base: 'sm', md: 'md' }}
        >
          Nova Semente
        </Button>
      </Flex>

      <Box bg="white" p={{ base: 2, md: 4 }} rounded="md" shadow="sm" mb={{ base: 4, md: 6 }}>
        <Flex direction={{ base: 'column', md: 'row' }} gap={{ base: 2, md: 4 }} align="center">
          <Input
            placeholder="Buscar sementes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            focusBorderColor="brand.primary"
            size={{ base: 'sm', md: 'md' }}
            flexGrow={1} 
          />
          <Select
            placeholder="Filtrar por tipo"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            focusBorderColor="brand.primary"
            size={{ base: 'sm', md: 'md' }}
            minW={{ base: 'full', md: '200px' }} 
            flexGrow={{base: 0, md: 1}} 
          >
            {seedTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
          <Button
            leftIcon={<RefreshCw size={14} />}
            onClick={resetFilters}
            variant="outline"
            size={{ base: 'sm', md: 'md' }}
            fontSize={{ base: 'xs', sm: 'sm' }} 
            minW="auto" 
            px={{ base: 2, md: 4 }} 
            flexShrink={0} 
            w={{ base: 'full', md: 'auto' }} 
          >
            Limpar filtros
          </Button>
        </Flex>
      </Box>

      {loading ? (
        <Center h="150px">
          <Spinner size="lg" color="brand.primary" />
        </Center>
      ) : (
        <TableContainer bg="white" rounded="md" shadow="sm" overflowX="auto">
          <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
            <Thead>
              <Tr>
                <Th fontSize={{ base: 'xs', md: 'sm' }} px={{ base: 2, md: 4 }}>Nome</Th>
                <Th fontSize={{ base: 'xs', md: 'sm' }} px={{ base: 2, md: 4 }}>Tipo</Th>
                <Th fontSize={{ base: 'xs', md: 'sm' }} px={{ base: 2, md: 4 }} isNumeric>Pct. 100</Th>
                <Th fontSize={{ base: 'xs', md: 'sm' }} px={{ base: 2, md: 4 }} isNumeric>Pct. 200</Th>
                <Th fontSize={{ base: 'xs', md: 'sm' }} px={{ base: 2, md: 4 }} isNumeric>Pct. 500</Th>
                <Th fontSize={{ base: 'xs', md: 'sm' }} px={{ base: 2, md: 4 }} isNumeric>Total Pcts.</Th>
                <Th fontSize={{ base: 'xs', md: 'sm' }} px={{ base: 2, md: 4 }} isNumeric>Mín. Pcts.</Th>
                <Th fontSize={{ base: 'xs', md: 'sm' }} px={{ base: 2, md: 4 }}>Status</Th>
                <Th fontSize={{ base: 'xs', md: 'sm' }} px={{ base: 2, md: 4 }}>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredSeeds.map((seed) => {
                const totalPkgs = getTotalPackages(seed);
                const needsRestock = totalPkgs < seed.minQuantity;
                return (
                  <Tr key={seed.id}>
                    <Td fontSize={{ base: 'xs', md: 'sm' }} px={{ base: 2, md: 4 }}>
                      <Text noOfLines={1} title={seed.name}>
                        {seed.name}
                      </Text>
                    </Td>
                    <Td fontSize={{ base: 'xs', md: 'sm' }} px={{ base: 2, md: 4 }}>{seed.type}</Td>
                    {/* Corrigido para usar camelCase */}
                    <Td fontSize={{ base: 'xs', md: 'sm' }} px={{ base: 2, md: 4 }} isNumeric>{seed.package100}</Td>
                    <Td fontSize={{ base: 'xs', md: 'sm' }} px={{ base: 2, md: 4 }} isNumeric>{seed.package200}</Td>
                    <Td fontSize={{ base: 'xs', md: 'sm' }} px={{ base: 2, md: 4 }} isNumeric>{seed.package500}</Td>
                    <Td fontSize={{ base: 'xs', md: 'sm' }} px={{ base: 2, md: 4 }} isNumeric fontWeight="bold">{totalPkgs}</Td>
                    <Td fontSize={{ base: 'xs', md: 'sm' }} px={{ base: 2, md: 4 }} isNumeric>{seed.minQuantity}</Td>
                    <Td fontSize={{ base: 'xs', md: 'sm' }} px={{ base: 2, md: 4 }}>
                      <Badge fontSize={{base: '2xs', sm: 'xs'}} colorScheme={needsRestock ? "red" : "green"}>
                        {needsRestock ? "Comprar" : "Em estoque"}
                      </Badge>
                    </Td>
                    <Td px={{ base: 1, md: 4 }}>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          aria-label="Opções da semente"
                          icon={<MoreVertical size={16} />}
                          variant="ghost"
                          size={{ base: 'xs', sm: 'sm' }}
                        />
                        <MenuList minW="160px">
                          {/* <MenuItem
                            icon={<RefreshCw size={14} />}
                            onClick={() => handleStockAdjustment(seed)}
                            fontSize={{ base: 'xs', sm: 'sm' }}
                          >
                            Ajustar Estoque
                          </MenuItem> */}
                          <MenuItem
                            icon={<Edit size={14} />}
                            onClick={() => handleEditSeed(seed)}
                            fontSize={{ base: 'xs', sm: 'sm' }}
                          >
                            Editar Semente
                          </MenuItem>
                          <MenuItem
                            icon={<Trash2 size={14} />}
                            onClick={() => handleDeleteClick(seed)}
                            color="red.500"
                            fontSize={{ base: 'xs', sm: 'sm' }}
                          >
                            Excluir Semente
                          </MenuItem>
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

      <SeedModal
        isOpen={isSeedModalOpen}
        onClose={onSeedModalClose}
        seed={selectedSeed}
        onSave={handleSeedSaved}
      />

      {/* <SeedStockAdjustmentModal
        isOpen={isStockAdjustmentOpen}
        onClose={onStockAdjustmentClose}
        seed={seedForStockAdjustment}
        onAdjust={handleStockAdjusted}
        size={{ base: 'full', sm: 'md', md: 'lg' }}
      /> */}

      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteDialogClose}
        size={{ base: 'xs', sm: 'md' }}
      >
        <AlertDialogOverlay>
          <AlertDialogContent mx={{ base: 2, sm: 4 }}>
            <AlertDialogHeader fontSize={{ base: 'md', sm: 'lg' }} fontWeight="bold">
              Excluir Semente
            </AlertDialogHeader>
            <AlertDialogBody fontSize={{ base: 'sm', sm: 'md' }}>
              Tem certeza que deseja excluir a semente "{seedToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteDialogClose} size={{ base: 'xs', sm: 'sm' }}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3} size={{ base: 'xs', sm: 'sm' }}>
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default SeedsPage;