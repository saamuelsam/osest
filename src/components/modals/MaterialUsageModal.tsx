import { useState } from 'react';
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormErrorMessage,
  VStack,
  Textarea,
  useToast,
  Text,
  HStack,
  Box,
} from '@chakra-ui/react';
import { Minus, Plus } from 'lucide-react';
import { Material } from '../../types';
import api from '../../services/api';

interface MaterialUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: Material | null;
  onUse: (material: Material) => void;
}

const MaterialUsageModal = ({ isOpen, onClose, material, onUse }: MaterialUsageModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const handleSubmit = async () => {
    if (!material) return;
    if (quantity <= 0) {
      setError('A quantidade deve ser maior que zero');
      return;
    }

    if (quantity > material.quantity) {
      setError('Quantidade solicitada excede o estoque disponível');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      const response = await api.post(`/materials/${material.id}/use`, {
        quantity,
        description,
      });
      
      toast({
        title: 'Material utilizado',
        description: `Uso de material registrado com sucesso.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onUse(response.data);
    } catch (error) {
      console.error('Error using material:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao registrar uso do material.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when modal opens
  const handleOnClose = () => {
    setQuantity(1);
    setDescription('');
    setError('');
    onClose();
  };

  const handleQuickAdd = (amount: number) => {
    setQuantity(Math.max(1, quantity + amount));
  };

  return (
    <Modal isOpen={isOpen} onClose={handleOnClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Registrar Uso de Material</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {material && (
            <VStack spacing={4} align="stretch">
              <Text fontWeight="bold">
                Material: {material.name}
              </Text>
              <Text>
                Disponível: {material.quantity} unidades
              </Text>
              
              <FormControl isInvalid={!!error}>
                <FormLabel>Quantidade</FormLabel>
                <HStack>
                  <NumberInput
                    value={quantity}
                    onChange={(_, value) => setQuantity(value)}
                    min={1}
                    max={material.quantity}
                    w="full"
                    focusBorderColor="brand.accent"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  
                  <Box>
                    <HStack>
                      <Button
                        size="sm"
                        onClick={() => handleQuickAdd(-1)}
                        leftIcon={<Minus size={14} />}
                        isDisabled={quantity <= 1}
                      >
                        1
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleQuickAdd(1)}
                        leftIcon={<Plus size={14} />}
                        isDisabled={quantity >= material.quantity}
                      >
                        1
                      </Button>
                    </HStack>
                  </Box>
                </HStack>
                {error && <FormErrorMessage>{error}</FormErrorMessage>}
              </FormControl>
              
              <FormControl>
                <FormLabel>Motivo / Observação (opcional)</FormLabel>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o motivo da utilização"
                  focusBorderColor="brand.accent"
                />
              </FormControl>
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleOnClose}>
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
            Registrar Uso
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MaterialUsageModal;