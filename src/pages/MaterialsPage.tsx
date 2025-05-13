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
  // HStack, // Removido se não usado
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
import { Material } from '../types'; // Material agora inclui boxes e weightKg
import MaterialModal from '../components/modals/MaterialModal';
import MaterialUsageModal from '../components/modals/MaterialUsageModal';

// Helper function para normalizar dados da API para o tipo Material
const normalizeApiMaterialToMaterialType = (apiMaterialData: any): Material => {
  return {
    ...apiMaterialData, // Pega todos os campos que já batem
    id: String(apiMaterialData.id ?? ''),
    name: String(apiMaterialData.name ?? ''),
    quantity: Number(apiMaterialData.quantity ?? 0),
    minQuantity: Number(apiMaterialData.minQuantity ?? 0),
    boxes: Number(apiMaterialData.boxes ?? 0), // Normaliza boxes
    // Lida com weightKg (camelCase) ou weight_kg (snake_case) da API
    weightKg: Number(apiMaterialData.weightKg ?? apiMaterialData.weight_kg ?? 0), // Normaliza weightKg
    createdAt: String(apiMaterialData.createdAt ?? new Date().toISOString()),
    updatedAt: String(apiMaterialData.updatedAt ?? new Date().toISOString()),
  };
};


const MaterialsPage = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
  const [materialForUsage, setMaterialForUsage] = useState<Material | null>(null);
  
  const { isOpen: isMaterialModalOpen, onOpen: onMaterialModalOpen, onClose: onMaterialModalClose } = useDisclosure();
  const { isOpen: isDeleteDialogOpen, onOpen: onDeleteDialogOpen, onClose: onDeleteDialogClose } = useDisclosure();
  const { isOpen: isUsageModalOpen, onOpen: onUsageModalOpen, onClose: onUsageModalClose } = useDisclosure();
  
  const toast = useToast();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [searchTerm, materials]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await api.get<any[]>('/materials'); // Espera um array de dados brutos
      const normalizedMaterials = response.data.map(normalizeApiMaterialToMaterialType);
      setMaterials(normalizedMaterials);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os materiais.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterMaterials = () => {
    let result = [...materials];
    if (searchTerm) {
      result = materials.filter(material => 
        material.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredMaterials(result);
  };

  const handleAddMaterial = () => {
    setSelectedMaterial(null);
    onMaterialModalOpen();
  };

  const handleEditMaterial = (material: Material) => {
    setSelectedMaterial(material);
    onMaterialModalOpen();
  };

  const handleDeleteClick = (material: Material) => {
    setMaterialToDelete(material);
    onDeleteDialogOpen();
  };

  const handleDelete = async () => {
    if (!materialToDelete) return;
    
    try {
      await api.delete(`/materials/${materialToDelete.id}`);
      setMaterials(materials.filter(m => m.id !== materialToDelete.id));
      toast({
        title: 'Material excluído',
        description: 'O material foi removido com sucesso.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting material:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o material.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onDeleteDialogClose();
      setMaterialToDelete(null); // Limpa o estado após a operação
    }
  };

  const handleUsageMaterial = (material: Material) => {
    setMaterialForUsage(material);
    onUsageModalOpen();
  };

  // onSave agora espera dados brutos da API e normaliza
  const handleMaterialSaved = (savedMaterialFromApi: any) => {
    const normalizedSavedMaterial = normalizeApiMaterialToMaterialType(savedMaterialFromApi);
    if (materials.some(m => m.id === normalizedSavedMaterial.id)) { // Verifica se é uma atualização
      setMaterials(materials.map(m => m.id === normalizedSavedMaterial.id ? normalizedSavedMaterial : m));
    } else {
      setMaterials([...materials, normalizedSavedMaterial]);
    }
    onMaterialModalClose();
  };

  // onUse agora espera dados brutos da API e normaliza
  const handleMaterialUsed = (updatedMaterialFromApi: any) => {
    const normalizedUpdatedMaterial = normalizeApiMaterialToMaterialType(updatedMaterialFromApi);
    setMaterials(materials.map(m => m.id === normalizedUpdatedMaterial.id ? normalizedUpdatedMaterial : m));
    onUsageModalClose();
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
        <Heading size={{ base: 'md', md: 'lg' }}>Materiais de Uso Interno</Heading>
        <Button 
          leftIcon={<Plus size={18} />} 
          colorScheme="yellow"
          bg="brand.accent"
          color="gray.800"
          onClick={handleAddMaterial}
          _hover={{ bg: 'brand.accent', opacity: 0.9 }}
          w={{ base: 'full', sm: 'auto' }}
          size={{ base: 'md', md: 'md' }}
        >
          Novo Material
        </Button>
      </Flex>
      
      <Box bg="white" p={{ base: 3, md: 4 }} rounded="md" shadow="sm" mb={6}>
        <Flex>
          <Input
            placeholder="Buscar materiais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            focusBorderColor="brand.accent"
            size={{ base: 'sm', md: 'md' }}
          />
          {/* O botão de busca pode ser removido se o filtro é aplicado ao digitar */}
        </Flex>
      </Box>
      
      {loading ? (
        <Center h="200px">
          <Spinner size="xl" color="brand.accent" />
        </Center>
      ) : (
        <>
          {filteredMaterials.length === 0 && !searchTerm ? (
             <Box textAlign="center" py={10} bg="white" rounded="md" shadow="sm">
               <Text fontSize={{ base: 'sm', md: 'md' }}>Nenhum material cadastrado.</Text>
             </Box>
           ) : filteredMaterials.length === 0 && searchTerm ? (
             <Box textAlign="center" py={10} bg="white" rounded="md" shadow="sm">
               <Text fontSize={{ base: 'sm', md: 'md' }}>Nenhum material encontrado para "{searchTerm}".</Text>
             </Box>
           ) : (
            <TableContainer bg="white" rounded="md" shadow="sm" overflowX="auto">
              <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
                <Thead>
                  <Tr>
                    <Th whiteSpace="normal">Nome</Th>
                    <Th isNumeric>Qtd.</Th>
                    <Th isNumeric display={{ base: 'none', sm: 'table-cell' }}>Mín.</Th>
                    <Th isNumeric>Caixas</Th>      {/* Adicionado Cabeçalho */}
                    <Th isNumeric>Peso (kg)</Th>   {/* Adicionado Cabeçalho */}
                    <Th whiteSpace="normal">Status</Th>
                    <Th whiteSpace="normal">Ações</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredMaterials.map((material) => (
                    <Tr key={material.id}>
                      <Td fontWeight="medium" whiteSpace="normal" wordBreak="break-word">{material.name}</Td>
                      <Td isNumeric>{material.quantity}</Td>
                      <Td isNumeric display={{ base: 'none', sm: 'table-cell' }}>{material.minQuantity}</Td>
                      <Td isNumeric>{material.boxes ?? 0}</Td> {/* Adicionado Dado */}
                      <Td isNumeric>{(material.weightKg ?? 0).toFixed(2)}</Td> {/* Adicionado Dado */}
                      <Td>
                        {material.quantity < material.minQuantity ? (
                          <Badge fontSize={{ base: '2xs', md: 'xs' }} colorScheme="red">Comprar</Badge>
                        ) : (
                          <Badge fontSize={{ base: '2xs', md: 'xs' }} colorScheme="green">Em estoque</Badge>
                        )}
                      </Td>
                      <Td>
                        <Stack 
                          direction={{ base: 'column', lg: 'row' }} 
                          spacing={{ base: 1, lg: 2 }}
                          alignItems="flex-start" // Garante que os botões se alinhem bem em coluna
                        >
                          <IconButton
                            aria-label="Registrar uso"
                            icon={<RefreshCw size={16} />}
                            size="xs"
                            colorScheme="blue"
                            onClick={() => handleUsageMaterial(material)}
                          />
                          <IconButton
                            aria-label="Editar material"
                            icon={<Edit size={16} />}
                            size="xs"
                            colorScheme="green"
                            onClick={() => handleEditMaterial(material)}
                          />
                          <IconButton
                            aria-label="Excluir material"
                            icon={<Trash2 size={16} />}
                            size="xs"
                            colorScheme="red"
                            onClick={() => handleDeleteClick(material)}
                          />
                        </Stack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
      
      <MaterialModal
        isOpen={isMaterialModalOpen}
        onClose={onMaterialModalClose}
        material={selectedMaterial}
        onSave={handleMaterialSaved} // Passa a função que espera dados brutos
      />
      
      <MaterialUsageModal
        isOpen={isUsageModalOpen}
        onClose={onUsageModalClose}
        material={materialForUsage}
        onUse={handleMaterialUsed} // Passa a função que espera dados brutos
      />
      
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteDialogClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent mx={{ base: 4, md: 0 }}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Excluir material
            </AlertDialogHeader>

            <AlertDialogBody fontSize={{ base: 'sm', md: 'md' }}>
              Tem certeza que deseja excluir o material "{materialToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteDialogClose} size={{ base: 'sm', md: 'md' }}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3} size={{ base: 'sm', md: 'md' }}>
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default MaterialsPage;