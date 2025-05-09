import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  Flex,
} from '@chakra-ui/react';
import { Eye, EyeOff, Leaf } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      toast({
        title: 'Login realizado com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Erro ao fazer login!',
        // description: 'Email ou senha incorretos.', // Considerar mensagem de erro mais genérica ou específica da API
        description: (error as Error)?.message || 'Ocorreu um erro. Tente novamente.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="brand.background" p={{ base: 4, sm: 6 }}> {/* Adicionado padding responsivo ao Flex container */}
      <Box
        bg="white"
        p={{ base: 6, sm: 8 }} // Padding responsivo para o Box do formulário
        rounded="md"
        shadow="lg"
        w={{ base: '100%', sm: '450px', md: '500px' }} // Ajuste na largura, permitindo um pouco mais de espaço
        maxW="500px" // Garante que não fique excessivamente largo em telas muito grandes
        borderTop="4px solid"
        borderColor="brand.primary"
      >
        <VStack spacing={{ base: 4, sm: 6 }} align="center" mb={{ base: 4, sm: 6 }}> {/* Spacing e margin bottom responsivos */}
          <Flex alignItems="center" direction={{ base: 'column', sm: 'row' }}> {/* Direção responsiva para o logo e título */}
            <Leaf size={28} color="#336636" />
            <Heading 
              ml={{ base: 0, sm: 2 }} 
              mt={{ base: 2, sm: 0 }}
              size={{ base: 'md', sm: 'lg' }} // Tamanho do Heading responsivo
              color="brand.primary"
              textAlign={{ base: 'center', sm: 'left' }}
            >
              Orgânicos da Fátima
            </Heading>
          </Flex>
          <Text color="gray.600" textAlign="center"> {/* Centraliza o texto de subtítulo */}
            Faça login para acessar o sistema
          </Text>
        </VStack>

        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl id="email">
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu email"
                focusBorderColor="brand.primary"
                size={{ base: 'md', sm: 'lg' }} // Tamanho do input responsivo
              />
            </FormControl>

            <FormControl id="password">
              <FormLabel>Senha</FormLabel>
              <InputGroup size={{ base: 'md', sm: 'lg' }}> {/* Tamanho do InputGroup responsivo */}
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  focusBorderColor="brand.primary"
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
                    icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                    size="sm" // Mantém o tamanho do ícone consistente
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Button
              type="submit"
              colorScheme="green"
              bg="brand.primary"
              size={{ base: 'md', sm: 'lg' }} // Tamanho do botão responsivo
              w="full"
              mt={4}
              isLoading={loading}
              _hover={{ bg: 'brand.primary', opacity: 0.9 }}
            >
              Entrar
            </Button>
          </VStack>
        </form>
      </Box>
    </Flex>
  );
};

export default LoginPage;