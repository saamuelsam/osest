import { useState, useEffect } from 'react';
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
import { Material } from '../types';
import MaterialModal from '../components/modals/MaterialModal';
import MaterialUsageModal from '../components/modals/MaterialUsageModal';

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
      const response = await api.get('/materials');
      setMaterials(response.data);
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
    if (!searchTerm) {
      setFilteredMaterials(materials);
      return;
    }
    
    const filtered = materials.filter(material => 
      material.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMaterials(filtered);
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
    }
  };

  const handleUsageMaterial = (material: Material) => {
    setMaterialForUsage(material);
    onUsageModalOpen();
  };

  const handleMaterialSaved = (savedMaterial: Material) => {
    if (selectedMaterial) {
      // Update existing material
      setMaterials(materials.map(m => m.id === savedMaterial.id ? savedMaterial : m));
    } else {
      // Add new material
      setMaterials([...materials, savedMaterial]);
    }
    onMaterialModalClose();
  };

  const handleMaterialUsed = (updatedMaterial: Material) => {
    setMaterials(materials.map(m => m.id === updatedMaterial.id ? updatedMaterial : m));
    onUsageModalClose();
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Materiais de Uso Interno</Heading>
        <Button 
          leftIcon={<Plus size={18} />} 
          colorScheme="green" 
          bg="brand.accent"
          color="gray.800"
          onClick={handleAddMaterial}
          _hover={{ bg: 'brand.accent', opacity: 0.9 }}
        >
          Novo Material
        </Button>
      </Flex>
      
      <Box bg="white" p={4} rounded="md" shadow="sm" mb={6}>
        <Flex>
          <Input
            placeholder="Buscar materiais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            focusBorderColor="brand.accent"
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
      
      {loading ? (
        <Center h="200px">
          <Spinner size="xl" color="brand.accent" />
        </Center>
      ) : (
        <>
          {filteredMaterials.length === 0 ? (
            <Box textAlign="center" py={10} bg="white" rounded="md" shadow="sm">
              <Text>Nenhum material encontrado.</Text>
            </Box>
          ) : (
            <TableContainer bg="white" rounded="md" shadow="sm">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Nome</Th>
                    <Th isNumeric>Quantidade</Th>
                    <Th isNumeric>Mínimo</Th>
                    <Th>Status</Th>
                    <Th>Ações</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredMaterials.map((material) => (
                    <Tr key={material.id}>
                      <Td fontWeight="medium">{material.name}</Td>
                      <Td isNumeric>{material.quantity}</Td>
                      <Td isNumeric>{material.minQuantity}</Td>
                      <Td>
                        {material.quantity < material.minQuantity ? (
                          <Badge colorScheme="red">Comprar</Badge>
                        ) : (
                          <Badge colorScheme="green">Em estoque</Badge>
                        )}
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Registrar uso"
                            icon={<RefreshCw size={16} />}
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleUsageMaterial(material)}
                          />
                          <IconButton
                            aria-label="Editar material"
                            icon={<Edit size={16} />}
                            size="sm"
                            colorScheme="green"
                            onClick={() => handleEditMaterial(material)}
                          />
                          <IconButton
                            aria-label="Excluir material"
                            icon={<Trash2 size={16} />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeleteClick(material)}
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
      
      <MaterialModal
        isOpen={isMaterialModalOpen}
        onClose={onMaterialModalClose}
        material={selectedMaterial}
        onSave={handleMaterialSaved}
      />
      
      <MaterialUsageModal
        isOpen={isUsageModalOpen}
        onClose={onUsageModalClose}
        material={materialForUsage}
        onUse={handleMaterialUsed}
      />
      
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteDialogClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Excluir material
            </AlertDialogHeader>

            <AlertDialogBody>
              Tem certeza que deseja excluir o material "{materialToDelete?.name}"? Esta ação não pode ser desfeita.
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

export default MaterialsPage;