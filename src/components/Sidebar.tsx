import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Box, Flex, Icon, Text, VStack, HStack, Divider, Image } from '@chakra-ui/react';
// Adicione o ícone para Sementes, por exemplo, Sprout
import { Home, Package, ShoppingBag, Users, Leaf, Sprout } from 'lucide-react'; 
import { useAuth } from '../contexts/AuthContext';

interface NavItemProps {
  icon: ReactNode;
  to: string;
  children: ReactNode;
}

const NavItem = ({ icon, to, children }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to === '/dashboard' && location.pathname === '/');


  return (
    <NavLink to={to} style={{ width: '100%' }}>
      <Flex
        align="center"
        p="3"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? 'brand.light' : 'transparent'}
        color={isActive ? 'brand.primary' : 'gray.600'}
        _hover={{
          bg: 'brand.light',
          color: 'brand.primary',
        }}
        transition="all 0.2s"
      >
        <Icon mr="4" fontSize="16" as={() => icon} />
        <Text>{children}</Text>
      </Flex>
    </NavLink>
  );
};

const Sidebar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Box h="full" bg="white" borderRight="1px" borderColor="gray.200">
      <Flex h="20" alignItems="center" justifyContent="center" >
        <Flex alignItems="center">
          {/* Você pode usar uma imagem de logo aqui se tiver */}
          {/* <Image src="/path/to/your/logo.png" alt="Logo" boxSize="40px" mr={2} /> */}
          <Icon as={Leaf} w={8} h={8} color="brand.primary" mr={2} />
          <Text fontSize="xl" fontWeight="bold" color="brand.primary">
            Orgânicos da Fátima
          </Text>
        </Flex>
      </Flex>
      <Divider />
      <VStack align="stretch" spacing={1} mt={4}>
        <NavItem icon={<Home size={20} />} to="/dashboard">
          Dashboard
        </NavItem>
        <NavItem icon={<Package size={20} />} to="/products">
          Produtos
        </NavItem>
        <NavItem icon={<ShoppingBag size={20} />} to="/materials">
          Materiais
        </NavItem>
        {/* Adicionando o NavItem para Sementes */}
        <NavItem icon={<Sprout size={20} />} to="/seeds">
          Sementes
        </NavItem>
        {isAdmin && (
          <NavItem icon={<Users size={20} />} to="/users">
            Usuários
          </NavItem>
        )}
      </VStack>
      <Box position="absolute" bottom="0" w="full" p={4}>
        <Divider mb={4} />
        <Text fontSize="xs" color="gray.500" textAlign="center">
          © {new Date().getFullYear()} Orgânicos da Fátima
        </Text>
      </Box>
    </Box>
  );
};

export default Sidebar;