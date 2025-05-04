import { Box, Heading, Text, Button, Center, VStack, Icon } from '@chakra-ui/react';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NotFoundPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Center h="100vh" bg="brand.background">
      <VStack spacing={6} textAlign="center" p={8}>
        <Icon as={AlertTriangle} w={16} h={16} color="brand.primary" />
        <Heading>Página não encontrada</Heading>
        <Text fontSize="lg">
          A página que você está procurando não existe ou foi removida.
        </Text>
        <Button
          as={Link}
          to={isAuthenticated ? '/dashboard' : '/login'}
          colorScheme="green"
          bg="brand.primary"
          size="lg"
          _hover={{ bg: 'brand.primary', opacity: 0.9 }}
        >
          {isAuthenticated ? 'Voltar para o Dashboard' : 'Voltar para Login'}
        </Button>
      </VStack>
    </Center>
  );
};

export default NotFoundPage;