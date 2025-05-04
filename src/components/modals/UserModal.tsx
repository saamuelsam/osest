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
  Select,
  useToast,
  FormErrorMessage,
  VStack,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { Eye, EyeOff } from 'lucide-react';
import { User, UserFormData } from '../../types';
import api from '../../services/api';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (user: User) => void;
}

const UserModal = ({ isOpen, onClose, user, onSave }: UserModalProps) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'estoque',
  });
  const [errors, setErrors] = useState<Partial<UserFormData & { confirm: string }>>({});
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const toast = useToast();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
      });
      setConfirmPassword('');
    } else {
      resetForm();
    }
  }, [user, isOpen]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'estoque',
    });
    setConfirmPassword('');
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Partial<UserFormData & { confirm: string }> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!user && !formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (formData.password && formData.password !== confirmPassword) {
      newErrors.confirm = 'As senhas não coincidem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      let response;
      
      if (user) {
        // Update existing user
        const updateData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          ...(formData.password ? { password: formData.password } : {}),
        };
        
        response = await api.put(`/users/${user.id}`, updateData);
        toast({
          title: 'Usuário atualizado',
          description: 'O usuário foi atualizado com sucesso.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Create new user
        response = await api.post('/users', formData);
        toast({
          title: 'Usuário criado',
          description: 'O usuário foi criado com sucesso.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      
      onSave(response.data);
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o usuário.',
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {user ? 'Editar Usuário' : 'Novo Usuário'}
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
                placeholder="Nome completo"
                focusBorderColor="brand.primary"
              />
              {errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
            </FormControl>
            
            <FormControl isInvalid={!!errors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@exemplo.com"
                focusBorderColor="brand.primary"
              />
              {errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
            </FormControl>
            
            <FormControl isInvalid={!!errors.password}>
              <FormLabel>{user ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}</FormLabel>
              <InputGroup>
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={user ? 'Nova senha (opcional)' : 'Senha'}
                  focusBorderColor="brand.primary"
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                    icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                    size="sm"
                  />
                </InputRightElement>
              </InputGroup>
              {errors.password && <FormErrorMessage>{errors.password}</FormErrorMessage>}
            </FormControl>
            
            <FormControl isInvalid={!!errors.confirm}>
              <FormLabel>Confirmar Senha</FormLabel>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a senha"
                focusBorderColor="brand.primary"
              />
              {errors.confirm && <FormErrorMessage>{errors.confirm}</FormErrorMessage>}
            </FormControl>
            
            <FormControl>
              <FormLabel>Perfil</FormLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                focusBorderColor="brand.primary"
              >
                <option value="admin">Administrador</option>
                <option value="estoque">Estoque</option>
              </Select>
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
            {user ? 'Atualizar' : 'Salvar'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UserModal;