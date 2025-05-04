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
  Select,
  Textarea,
  useToast,
  Text,
} from '@chakra-ui/react';
import { Product, StockAdjustment } from '../../types';
import api from '../../services/api';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAdjust: (product: Product) => void;
}

const StockAdjustmentModal = ({ isOpen, onClose, product, onAdjust }: StockAdjustmentModalProps) => {
  const [formData, setFormData] = useState<StockAdjustment>({
    quantity: 1,
    type: 'add',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const handleSubmit = async () => {
    if (!product) return;
    if (formData.quantity <= 0) {
      setError('A quantidade deve ser maior que zero');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      const response = await api.post(`/products/${product.id}/adjust`, formData);
      
      toast({
        title: 'Estoque ajustado',
        description: `${formData.type === 'add' ? 'Entrada' : 'Saída'} registrada com sucesso.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onAdjust(response.data);
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao ajustar o estoque.',
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
    setFormData({
      quantity: 1,
      type: 'add',
      description: '',
    });
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleOnClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Ajustar Estoque</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {product && (
            <VStack spacing={4} align="stretch">
              <Text fontWeight="bold">
                Produto: {product.name}
              </Text>
              <Text>
                Estoque atual: {product.quantity} unidades
              </Text>
              
              <FormControl isInvalid={!!error}>
                <FormLabel>Tipo de Movimentação</FormLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'add' | 'remove' })}
                  focusBorderColor="brand.primary"
                >
                  <option value="add">Entrada</option>
                  <option value="remove">Saída</option>
                </Select>
              </FormControl>
              
              <FormControl isInvalid={!!error}>
                <FormLabel>Quantidade</FormLabel>
                <NumberInput
                  value={formData.quantity}
                  onChange={(_, value) => setFormData({ ...formData, quantity: value })}
                  min={1}
                  focusBorderColor="brand.primary"
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                {error && <FormErrorMessage>{error}</FormErrorMessage>}
              </FormControl>
              
              <FormControl>
                <FormLabel>Descrição (opcional)</FormLabel>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Motivo da movimentação"
                  focusBorderColor="brand.primary"
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
            colorScheme={formData.type === 'add' ? 'green' : 'orange'}
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            {formData.type === 'add' ? 'Registrar Entrada' : 'Registrar Saída'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default StockAdjustmentModal;