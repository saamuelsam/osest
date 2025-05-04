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
  Select,
  useToast,
  FormErrorMessage,
  VStack,
} from '@chakra-ui/react';
import { Product, ProductFormData } from '../../types';
import api from '../../services/api';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (product: Product) => void;
  categories: string[];
}

const ProductModal = ({ isOpen, onClose, product, onSave, categories }: ProductModalProps) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: '',
    quantity: 0,
    minQuantity: 0,
  });
  const [newCategory, setNewCategory] = useState('');
  const [errors, setErrors] = useState<Partial<ProductFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const toast = useToast();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        quantity: product.quantity,
        minQuantity: product.minQuantity,
      });
    } else {
      resetForm();
    }
  }, [product, isOpen]);

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      quantity: 0,
      minQuantity: 0,
    });
    setNewCategory('');
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Partial<ProductFormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.category && !newCategory) {
      newErrors.category = 'Categoria é obrigatória';
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
      const productData = {
        ...formData,
        category: newCategory || formData.category,
      };
      
      let response;
      
      if (product) {
        // Update existing product
        response = await api.put(`/products/${product.id}`, productData);
        toast({
          title: 'Produto atualizado',
          description: 'O produto foi atualizado com sucesso.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Create new product
        response = await api.post('/products', productData);
        toast({
          title: 'Produto criado',
          description: 'O produto foi criado com sucesso.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      
      onSave(response.data);
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o produto.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
          {product ? 'Editar Produto' : 'Novo Produto'}
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
                placeholder="Nome do produto"
                focusBorderColor="brand.primary"
              />
              {errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
            </FormControl>
            
            <FormControl isInvalid={!!errors.category}>
              <FormLabel>Categoria</FormLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Selecione uma categoria"
                focusBorderColor="brand.primary"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
                <option value="new">+ Nova categoria</option>
              </Select>
              {errors.category && <FormErrorMessage>{errors.category}</FormErrorMessage>}
            </FormControl>
            
            {formData.category === 'new' && (
              <FormControl>
                <FormLabel>Nova Categoria</FormLabel>
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Nome da nova categoria"
                  focusBorderColor="brand.primary"
                />
              </FormControl>
            )}
            
            <FormControl isInvalid={!!errors.quantity}>
              <FormLabel>Quantidade</FormLabel>
              <NumberInput
                value={formData.quantity}
                onChange={(_, value) => handleNumberChange('quantity', value)}
                min={0}
                focusBorderColor="brand.primary"
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
                focusBorderColor="brand.primary"
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
            bg="brand.primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            _hover={{ bg: 'brand.primary', opacity: 0.9 }}
          >
            {product ? 'Atualizar' : 'Salvar'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProductModal;