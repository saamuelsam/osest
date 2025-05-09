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
  HStack, // Manter se usado em algum lugar, mas para ações usaremos Stack
  Text,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Stack, // Adicionado para empilhamento responsivo
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
    // Corrigido: Aplicar filtro mesmo se searchTerm estiver vazio para resetar para todos os materiais
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
    }
  };

  const handleUsageMaterial = (material: Material) => {
    setMaterialForUsage(material);
    onUsageModalOpen();
  };

  const handleMaterialSaved = (savedMaterial: Material) => {
    if (selectedMaterial) {
      setMaterials(materials.map(m => m.id === savedMaterial.id ? savedMaterial : m));
    } else {
      setMaterials([...materials, savedMaterial]);
    }
    onMaterialModalClose();
  };

  const handleMaterialUsed = (updatedMaterial: Material) => {
    setMaterials(materials.map(m => m.id === updatedMaterial.id ? updatedMaterial : m));
    onUsageModalClose();
  };

  return (
    <Box p={{ base: 4, md: 6 }}> {/* Padding responsivo */}
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
          colorScheme="yellow" // Ajustado para melhor contraste com brand.accent se for amarelo/laranja
          bg="brand.accent"
          color="gray.800" // Garantir contraste do texto do botão
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
          <IconButton
            aria-label="Buscar"
            icon={<Search size={18} />}
            ml={2}
            colorScheme="yellow" // Coerente com o botão de adicionar
            variant="outline"
            size={{ base: 'sm', md: 'md' }}
          />
        </Flex>
      </Box>
      
      {loading ? (
        <Center h="200px">
          <Spinner size="xl" color="brand.accent" />
        </Center>
      ) : (
        <>
          {filteredMaterials.length === 0 && !searchTerm ? ( // Mostrar apenas se não houver materiais e não houver busca
             <Box textAlign="center" py={10} bg="white" rounded="md" shadow="sm">
               <Text fontSize={{ base: 'sm', md: 'md' }}>Nenhum material cadastrado.</Text>
             </Box>
           ) : filteredMaterials.length === 0 && searchTerm ? ( // Mensagem para busca sem resultados
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
                          alignItems="flex-start"
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