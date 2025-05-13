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
import { Material, MaterialFormData } from '../../types'; // MaterialFormData agora inclui boxes e weightKg
import api from '../../services/api';

interface MaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: Material | null;
  onSave: (material: Material) => void;
}

// Interface para erros do formulário
interface MaterialFormErrors {
  name?: string;
  quantity?: string;
  minQuantity?: string;
  boxes?: string;      // Adicionado
  weightKg?: string;   // Adicionado
}

const MaterialModal: React.FC<MaterialModalProps> = ({
  isOpen,
  onClose,
  material,
  onSave,
}) => {
  const [formData, setFormData] = useState<MaterialFormData>({
    name: '',
    quantity: 0,
    minQuantity: 0,
    boxes: 0,        // Adicionado
    weightKg: 0,     // Adicionado
  });
  const [errors, setErrors] = useState<MaterialFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name,
        quantity: material.quantity,
        minQuantity: material.minQuantity,
        boxes: material.boxes || 0,          // Adicionado
        weightKg: material.weightKg || 0,    // Adicionado
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
      boxes: 0,        // Adicionado
      weightKg: 0,     // Adicionado
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: MaterialFormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (typeof formData.quantity !== 'number' || formData.quantity < 0) {
      newErrors.quantity = 'Quantidade inválida';
    }
    if (typeof formData.minQuantity !== 'number' || formData.minQuantity < 0) {
      newErrors.minQuantity = 'Quantidade mínima inválida';
    }
    if (formData.boxes !== undefined && (typeof formData.boxes !== 'number' || formData.boxes < 0)) { // Adicionado
      newErrors.boxes = 'Número de caixas inválido';
    }
    if (formData.weightKg !== undefined && (typeof formData.weightKg !== 'number' || formData.weightKg < 0)) { // Adicionado
      newErrors.weightKg = 'Peso inválido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    // Backend pode esperar weight_kg (snake_case)
    // Se for o caso, transforme aqui antes de enviar:
    // const { weightKg, ...rest } = formData;
    // const dataToSend = { ...rest, weight_kg: weightKg };
    // Por enquanto, enviaremos como está em formData (weightKg)
    const dataToSend = { ...formData };

console.log('Dados enviados para o backend (Material):', dataToSend);
    try {
      let response;
      if (material) {
        response = await api.put(`/materials/${material.id}`, dataToSend);
      } else {
        response = await api.post('/materials', dataToSend);
      }
      onSave(response.data); // response.data deve ser o material salvo/atualizado
      onClose();
      toast({
        title: material ? 'Material atualizado' : 'Material criado',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      console.error('Erro salvando material:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || 'Erro ao salvar material.';
      toast({
        title: 'Erro',
        description: errorMsg,
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (
    name: keyof MaterialFormData,
    _valueAsString: string,
    valueAsNumber: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(valueAsNumber) ? 0 : valueAsNumber,
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{material ? 'Editar Material' : 'Novo Material'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
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
                onChange={(str, num) => handleNumberChange('quantity', str, num)}
                min={0}
                focusBorderColor="brand.accent"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              {errors.quantity && (<FormErrorMessage>{errors.quantity}</FormErrorMessage>)}
            </FormControl>

            <FormControl isInvalid={!!errors.minQuantity}>
              <FormLabel>Quantidade Mínima</FormLabel>
              <NumberInput
                value={formData.minQuantity}
                onChange={(str, num) => handleNumberChange('minQuantity', str, num)}
                min={0}
                focusBorderColor="brand.accent"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              {errors.minQuantity && (<FormErrorMessage>{errors.minQuantity}</FormErrorMessage>)}
            </FormControl>

            {/* Novo campo Caixas */}
            <FormControl isInvalid={!!errors.boxes}>
              <FormLabel>Caixas</FormLabel>
              <NumberInput
                value={formData.boxes}
                onChange={(str, num) => handleNumberChange('boxes', str, num)}
                min={0}
                focusBorderColor="brand.accent"
              >
                <NumberInputField placeholder="Qtd. de caixas" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              {errors.boxes && <FormErrorMessage>{errors.boxes}</FormErrorMessage>}
            </FormControl>

            {/* Novo campo Peso (kg) */}
            <FormControl isInvalid={!!errors.weightKg}>
              <FormLabel>Peso (kg)</FormLabel>
              <NumberInput
                precision={2}
                step={0.01}
                value={formData.weightKg}
                onChange={(str, num) => handleNumberChange('weightKg', str, num)}
                min={0}
                focusBorderColor="brand.accent"
              >
                <NumberInputField placeholder="Peso em kg" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              {errors.weightKg && <FormErrorMessage>{errors.weightKg}</FormErrorMessage>}
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            colorScheme="yellow" // Manter consistência com a página
            bg="brand.accent"
            color="gray.800"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            _hover={{ opacity: 0.9 }}
          >
            {material ? 'Atualizar' : 'Salvar'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MaterialModal;