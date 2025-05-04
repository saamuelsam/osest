import { ReactNode } from 'react';
import {
  Flex,
  HStack,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Box,
  IconButton,
} from '@chakra-ui/react';
import { LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  menuButton?: ReactNode;
}

const Navbar = ({ menuButton }: NavbarProps) => {
  const { user, logout } = useAuth();

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      bg="white"
      p={4}
      boxShadow="sm"
      position="fixed"
      top={0}
      right={0}
      left={{ base: 0, lg: '240px' }}
      zIndex={10}
      transition="left 0.3s"
    >
      <HStack spacing={4}>
        {menuButton}
        <Text fontSize="lg" fontWeight="bold" color="brand.primary">
          Orgânicos da Fátima
        </Text>
      </HStack>

      <Menu>
        <MenuButton>
          <HStack spacing={3} cursor="pointer">
            <Box textAlign="right">
              <Text fontWeight="medium">{user?.name}</Text>
              <Text fontSize="xs" color="gray.500">{user?.role === 'admin' ? 'Administrador' : 'Estoque'}</Text>
            </Box>
            <Avatar size="sm" name={user?.name} bg="brand.primary" color="white" />
          </HStack>
        </MenuButton>
        <MenuList>
          <MenuItem icon={<User size={18} />}>Perfil</MenuItem>
          <MenuItem icon={<Settings size={18} />}>Configurações</MenuItem>
          <MenuItem icon={<LogOut size={18} />} onClick={logout}>
            Sair
          </MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
};

export default Navbar;