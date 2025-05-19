import React, { useState, useEffect } from 'react';
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
  Stack,
  useToast,
  Select,
} from '@chakra-ui/react';
import api from '../../services/api';
import { Seed } from '../../types';

interface SeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (seed: Seed) => void;
  seed: Seed | null;
}

// Normaliza os dados do formulário para o tipo Seed antes de enviar para a API
const normalizeFormDataToSeed = (formData: any, existingSeedId?: string): Partial<Seed> => {
  const seedData: Partial<Seed> = {
    name: formData.name,
    type: formData.type,
    package100: parseInt(formData.package100, 10) || 0,
    package200: parseInt(formData.package200, 10) || 0,
    package500: parseInt(formData.package500, 10) || 0,
    minQuantity: parseInt(formData.minQuantity, 10) || 0,
  };
  if (existingSeedId) {
    seedData.id = existingSeedId;
  }
  return seedData;
};

const SeedModal: React.FC<SeedModalProps> = ({ isOpen, onClose, onSave, seed }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    package100: '0',
    package200: '0',
    package500: '0',
    minQuantity: '0',
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (seed) {
      setFormData({
        name: seed.name,
        type: seed.type,
        package100: String(seed.package100 || 0),
        package200: String(seed.package200 || 0),
        package500: String(seed.package500 || 0),
        minQuantity: String(seed.minQuantity || 0),
      });
    } else {
      setFormData({
        name: '',
        type: '',
        package100: '0',
        package200: '0',
        package500: '0',
        minQuantity: '0',
      });
    }
  }, [seed, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (name: string, valueAsString: string, valueAsNumber: number) => {
    setFormData((prev) => ({ ...prev, [name]: isNaN(valueAsNumber) ? valueAsString : String(valueAsNumber) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const seedPayload = normalizeFormDataToSeed(formData, seed?.id);

    try {
      let response;
      if (seed && seed.id) {
        response = await api.put(`/seeds/${seed.id}`, seedPayload);
      } else {
        response = await api.post('/seeds', seedPayload);
      }
      onSave(response.data); // A API deve retornar a semente salva/atualizada
      toast({
        title: `Semente ${seed ? 'atualizada' : 'criada'} com sucesso.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error: any) {
      toast({
        title: `Erro ao ${seed ? 'atualizar' : 'criar'} semente.`,
        description: error.response?.data?.message || error.message || 'Ocorreu um erro desconhecido.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Exemplo de tipos de sementes, idealmente viriam de uma API ou config
  const exampleSeedTypes = ["Hortaliça", "Tempero", "Frutífera", "Flor", "Grão", "Outro"];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', sm: 'md', md: 'xl' }}>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>{seed ? 'Editar Semente' : 'Nova Semente'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Nome da Semente</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Alface Crespa Orgânica"
                size={{ base: 'sm', md: 'md' }}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Tipo</FormLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                placeholder="Selecione o tipo"
                size={{ base: 'sm', md: 'md' }}
              >
                {exampleSeedTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Pacotes de 100 sementes</FormLabel>
              <NumberInput
                name="package100"
                value={formData.package100}
                onChange={(valueAsString, valueAsNumber) => handleNumberChange('package100', valueAsString, valueAsNumber)}
                min={0}
                size={{ base: 'sm', md: 'md' }}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Pacotes de 200 sementes</FormLabel>
              <NumberInput
                name="package200"
                value={formData.package200}
                onChange={(valueAsString, valueAsNumber) => handleNumberChange('package200', valueAsString, valueAsNumber)}
                min={0}
                size={{ base: 'sm', md: 'md' }}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Pacotes de 500 sementes</FormLabel>
              <NumberInput
                name="package500"
                value={formData.package500}
                onChange={(valueAsString, valueAsNumber) => handleNumberChange('package500', valueAsString, valueAsNumber)}
                min={0}
                size={{ base: 'sm', md: 'md' }}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Quantidade Mínima (total de pacotes)</FormLabel>
              <NumberInput
                name="minQuantity"
                value={formData.minQuantity}
                onChange={(valueAsString, valueAsNumber) => handleNumberChange('minQuantity', valueAsString, valueAsNumber)}
                min={0}
                size={{ base: 'sm', md: 'md' }}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose} mr={3} size={{ base: 'sm', md: 'md' }}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            colorScheme="green" 
            bg="brand.primary" 
            isLoading={isLoading}
            size={{ base: 'sm', md: 'md' }}
          >
            {seed ? 'Salvar Alterações' : 'Criar Semente'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SeedModal;
