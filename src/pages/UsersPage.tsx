import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  IconButton,
  useDisclosure,
  Spinner,
  Center,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Text,
} from '@chakra-ui/react';
import { Edit, Trash2, Plus } from 'lucide-react';
import api from '../services/api';
import { User } from '../types';
import UserModal from '../components/modals/UserModal';
import { useAuth } from '../contexts/AuthContext';

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  const { isOpen: isUserModalOpen, onOpen: onUserModalOpen, onClose: onUserModalClose } = useDisclosure();
  const { isOpen: isDeleteDialogOpen, onOpen: onDeleteDialogOpen, onClose: onDeleteDialogClose } = useDisclosure();
  
  const toast = useToast();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    onUserModalOpen();
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    onUserModalOpen();
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    onDeleteDialogOpen();
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    
    // Prevent deleting yourself
    if (userToDelete.id === currentUser?.id) {
      toast({
        title: 'Operação não permitida',
        description: 'Você não pode excluir seu próprio usuário.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      onDeleteDialogClose();
      return;
    }
    
    try {
      await api.delete(`/users/${userToDelete.id}`);
      setUsers(users.filter(u => u.id !== userToDelete.id));
      toast({
        title: 'Usuário excluído',
        description: 'O usuário foi removido com sucesso.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o usuário.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onDeleteDialogClose();
    }
  };

  const handleUserSaved = (savedUser: User) => {
    if (selectedUser) {
      // Update existing user
      setUsers(users.map(u => u.id === savedUser.id ? savedUser : u));
    } else {
      // Add new user
      setUsers([...users, savedUser]);
    }
    onUserModalClose();
  };

  // Check if user is admin
  if (currentUser?.role !== 'admin') {
    return (
      <Box textAlign="center" p={10}>
        <Heading size="md" mb={4}>Acesso Negado</Heading>
        <Text>Você não tem permissão para acessar esta página.</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Gerenciar Usuários</Heading>
        <Button 
          leftIcon={<Plus size={18} />} 
          colorScheme="green" 
          bg="brand.primary"
          onClick={handleAddUser}
          _hover={{ bg: 'brand.primary', opacity: 0.9 }}
        >
          Novo Usuário
        </Button>
      </Flex>
      
      {loading ? (
        <Center h="200px">
          <Spinner size="xl" color="brand.primary" />
        </Center>
      ) : (
        <TableContainer bg="white" rounded="md" shadow="sm">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th>Email</Th>
                <Th>Perfil</Th>
                <Th>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((user) => (
                <Tr key={user.id}>
                  <Td fontWeight="medium">{user.name}</Td>
                  <Td>{user.email}</Td>
                  <Td>
                    <Badge colorScheme={user.role === 'admin' ? 'purple' : 'green'}>
                      {user.role === 'admin' ? 'Administrador' : 'Estoque'}
                    </Badge>
                  </Td>
                  <Td>
                    <Flex gap={2}>
                      <IconButton
                        aria-label="Editar usuário"
                        icon={<Edit size={16} />}
                        size="sm"
                        colorScheme="green"
                        onClick={() => handleEditUser(user)}
                      />
                      <IconButton
                        aria-label="Excluir usuário"
                        icon={<Trash2 size={16} />}
                        size="sm"
                        colorScheme="red"
                        isDisabled={user.id === currentUser?.id} // Can't delete yourself
                        onClick={() => handleDeleteClick(user)}
                      />
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
      
      <UserModal
        isOpen={isUserModalOpen}
        onClose={onUserModalClose}
        user={selectedUser}
        onSave={handleUserSaved}
      />
      
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteDialogClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Excluir usuário
            </AlertDialogHeader>

            <AlertDialogBody>
              Tem certeza que deseja excluir o usuário "{userToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteDialogClose}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default UsersPage;