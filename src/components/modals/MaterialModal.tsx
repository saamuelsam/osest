import { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  FormErrorMessage,
  VStack,
} from '@chakra-ui/react';
import { Material, MaterialFormData } from '../../types';
import api from '../../services/api';

interface MaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: Material | null;
  onSave: (material: Material) => void;
}

const MaterialModal = ({ isOpen, onClose, material, onSave }: MaterialModalProps) => {
  const [formData, setFormData] = useState<MaterialFormData>({
    name: '',
    quantity: 0,
    minQuantity: 0,
  });
  const [errors, setErrors] = useState<Partial<MaterialFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const toast = useToast();

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name,
        quantity: material.quantity,
        minQuantity: material.minQuantity,
      });
    } else {
      resetForm();
    }
  }, [material, isOpen]);

  const resetForm = () => {
    setFormData({
      name: '',
      quantity: 0,
      minQuantity: 0,
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Partial<MaterialFormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantidade não pode ser negativa';
    }
    
    if (formData.minQuantity < 0) {
      newErrors.minQuantity = 'Quantidade mínima não pode ser negativa';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      let response;
      
      if (material) {
        // Update existing material
        response = await api.put(`/materials/${material.id}`, formData);
        toast({
          title: 'Material atualizado',
          description: 'O material foi atualizado com sucesso.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Create new material
        response = await api.post('/materials', formData);
        toast({
          title: 'Material criado',
          description: 'O material foi criado com sucesso.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      
      onSave(response.data);
    } catch (error) {
      console.error('Error saving material:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o material.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNumberChange = (name: string, value: number) => {
    setFormData({ ...formData, [name]: value });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {material ? 'Editar Material' : 'Novo Material'}
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.name}>
              <FormLabel>Nome</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nome do material"
                focusBorderColor="brand.accent"
              />
              {errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
            </FormControl>
            
            <FormControl isInvalid={!!errors.quantity}>
              <FormLabel>Quantidade</FormLabel>
              <NumberInput
                value={formData.quantity}
                onChange={(_, value) => handleNumberChange('quantity', value)}
                min={0}
                focusBorderColor="brand.accent"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              {errors.quantity && <FormErrorMessage>{errors.quantity}</FormErrorMessage>}
            </FormControl>
            
            <FormControl isInvalid={!!errors.minQuantity}>
              <FormLabel>Quantidade Mínima</FormLabel>
              <NumberInput
                value={formData.minQuantity}
                onChange={(_, value) => handleNumberChange('minQuantity', value)}
                min={0}
                focusBorderColor="brand.accent"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              {errors.minQuantity && <FormErrorMessage>{errors.minQuantity}</FormErrorMessage>}
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            colorScheme="green"
            bg="brand.accent"
            color="gray.800"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            _hover={{ bg: 'brand.accent', opacity: 0.9 }}
          >
            {material ? 'Atualizar' : 'Salvar'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MaterialModal;