import {
    Box,
    Heading,
    Text,
    VStack,
    Avatar,
    Button,
    Divider,
    Spinner,
    Center,
    useToast,
    SimpleGrid,
    FormControl,
    FormLabel,
    Input,
  } from '@chakra-ui/react';
  import { useAuth } from '../contexts/AuthContext'; // Para obter dados do usuário logado
  import { useState, useEffect } from 'react';
  // import { Edit } from 'lucide-react'; // Ícone para botão de editar
  
  const ProfilePage = () => {
    const { user, loading: authLoading, updateUser } = useAuth(); // Supondo que updateUser exista no contexto
    const toast = useToast();
  
    // Estados para o formulário de edição (exemplo)
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    // Adicione mais estados conforme necessário, por exemplo, para mudar senha
  
    useEffect(() => {
      if (user) {
        setName(user.name || '');
        setEmail(user.email || ''); // Supondo que o email esteja no objeto user
      }
    }, [user]);
  
    if (authLoading) {
      return (
        <Center h="200px">
          <Spinner />
        </Center>
      );
    }
  
    if (!user) {
      return (
        <Center h="200px">
          <Text>Usuário não encontrado. Por favor, faça login novamente.</Text>
        </Center>
      );
    }
  
    const handleSaveChanges = async () => {
      // Lógica para salvar as alterações do perfil
      // Exemplo: Chamar uma função do AuthContext ou uma API
      if (!updateUser) {
          toast({
              title: 'Funcionalidade não disponível.',
              description: 'A atualização de perfil não está configurada no contexto de autenticação.',
              status: 'warning',
              duration: 5000,
              isClosable: true,
            });
          return;
      }
      try {
        // Supondo que updateUser retorne o usuário atualizado ou uma flag de sucesso
        // E que ele lide com a chamada à API e atualização do estado local do usuário
        await updateUser({ name, email /*, outros campos como senha se houver */ });
        toast({
          title: 'Perfil atualizado!',
          description: 'Suas informações foram salvas com sucesso.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Erro ao atualizar perfil.',
          description: (error as Error).message || 'Não foi possível salvar as alterações.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };
  
    return (
      <Box p={{ base: 4, md: 8 }}>
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl" textAlign="center">
            Meu Perfil
          </Heading>
  
          <Center>
            <Avatar size="2xl" name={user.name} mb={4} />
            {/* Se você tiver uma URL de avatar: src={user.avatarUrl} */}
          </Center>
  
          <Box p={6} shadow="md" borderWidth="1px" borderRadius="md">
            <VStack spacing={5} as="form" onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }}>
              <Heading as="h2" size="lg" mb={4}>Informações Pessoais</Heading>
              
              <FormControl id="name">
                <FormLabel>Nome Completo</FormLabel>
                <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
              </FormControl>
  
              <FormControl id="email">
                <FormLabel>Email</FormLabel>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                {/* Considere desabilitar a edição de email ou ter um processo de verificação */}
              </FormControl>
  
              <FormControl id="role" isReadOnly>
                <FormLabel>Função</FormLabel>
                <Input type="text" value={user.role === 'admin' ? 'Administrador' : 'Estoque'} />
              </FormControl>
              
              <Divider my={4} />
              
              {/* Seção para mudança de senha (exemplo) */}
              <Heading as="h3" size="md" mb={3}>Alterar Senha</Heading>
              <FormControl id="current-password">
                <FormLabel>Senha Atual</FormLabel>
                <Input type="password" placeholder="********" />
              </FormControl>
              <FormControl id="new-password">
                <FormLabel>Nova Senha</FormLabel>
                <Input type="password" placeholder="********" />
              </FormControl>
              <FormControl id="confirm-password">
                <FormLabel>Confirmar Nova Senha</FormLabel>
                <Input type="password" placeholder="********" />
              </FormControl>
  
              <Button
                type="submit"
                colorScheme="brand"
                mt={6}
                // leftIcon={<Edit size={18} />} // Descomente se quiser o ícone
              >
                Salvar Alterações
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Box>
    );
  };
  
  export default ProfilePage;