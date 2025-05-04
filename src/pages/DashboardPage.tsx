import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Heading,
  Flex,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Spinner,
  Center,
  Icon,
} from '@chakra-ui/react';
import { Package, ShoppingBag, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { Product, Material } from '../types';

const DashboardPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, materialsRes] = await Promise.all([
          api.get('/products'),
          api.get('/materials'),
        ]);
        
        setProducts(productsRes.data);
        setMaterials(materialsRes.data);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter low stock items
  const lowStockProducts = products.filter(product => product.quantity < product.minQuantity);
  const lowStockMaterials = materials.filter(material => material.quantity < material.minQuantity);

  // Calculate total quantities
  const totalProducts = products.length;
  const totalMaterials = materials.length;
  const totalLowStock = lowStockProducts.length + lowStockMaterials.length;

  if (loading) {
    return (
      <Center h="70vh">
        <Spinner size="xl" color="brand.primary" />
      </Center>
    );
  }

  return (
    <Box>
      <Heading size="lg" mb={6}>Dashboard</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <StatCard
          title="Total de Produtos"
          value={totalProducts}
          icon={<Package size={24} />}
          accentColor="brand.primary"
        />
        <StatCard
          title="Total de Materiais"
          value={totalMaterials}
          icon={<ShoppingBag size={24} />}
          accentColor="brand.accent"
        />
        <StatCard
          title="Itens em Baixo Estoque"
          value={totalLowStock}
          icon={<AlertTriangle size={24} />}
          accentColor="warning.500"
          helpText="Requer atenção"
        />
      </SimpleGrid>

      {totalLowStock > 0 && (
        <Box>
          <Heading size="md" mb={4}>Itens em Baixo Estoque</Heading>
          
          {lowStockProducts.length > 0 && (
            <Box mb={6}>
              <Flex align="center" mb={2}>
                <Icon as={Package} mr={2} color="brand.primary" />
                <Text fontWeight="medium">Produtos</Text>
              </Flex>
              <TableContainer bg="white" rounded="md" shadow="sm">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Nome</Th>
                      <Th>Categoria</Th>
                      <Th isNumeric>Atual</Th>
                      <Th isNumeric>Mínimo</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {lowStockProducts.map((product) => (
                      <Tr key={product.id}>
                        <Td fontWeight="medium">{product.name}</Td>
                        <Td>{product.category}</Td>
                        <Td isNumeric>{product.quantity}</Td>
                        <Td isNumeric>{product.minQuantity}</Td>
                        <Td>
                          <Badge colorScheme={product.quantity === 0 ? "red" : "orange"}>
                            {product.quantity === 0 ? "Em falta" : "Baixo estoque"}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          )}
          
          {lowStockMaterials.length > 0 && (
            <Box>
              <Flex align="center" mb={2}>
                <Icon as={ShoppingBag} mr={2} color="brand.accent" />
                <Text fontWeight="medium">Materiais</Text>
              </Flex>
              <TableContainer bg="white" rounded="md" shadow="sm">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Nome</Th>
                      <Th isNumeric>Atual</Th>
                      <Th isNumeric>Mínimo</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {lowStockMaterials.map((material) => (
                      <Tr key={material.id}>
                        <Td fontWeight="medium">{material.name}</Td>
                        <Td isNumeric>{material.quantity}</Td>
                        <Td isNumeric>{material.minQuantity}</Td>
                        <Td>
                          <Badge colorScheme={material.quantity === 0 ? "red" : "orange"}>
                            {material.quantity === 0 ? "Em falta" : "Baixo estoque"}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  helpText?: string;
  icon: React.ReactNode;
  accentColor: string;
}

const StatCard = ({ title, value, helpText, icon, accentColor }: StatCardProps) => {
  return (
    <Stat
      px={4}
      py={5}
      bg="white"
      rounded="lg"
      shadow="sm"
      borderTop="4px solid"
      borderColor={accentColor}
      transition="transform 0.2s"
      _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
    >
      <Flex justifyContent="space-between">
        <Box>
          <StatLabel fontSize="sm" fontWeight="medium" isTruncated>
            {title}
          </StatLabel>
          <StatNumber fontSize="3xl" fontWeight="bold">
            {value}
          </StatNumber>
          {helpText && (
            <StatHelpText mb={0} color="gray.500">
              {helpText}
            </StatHelpText>
          )}
        </Box>
        <Box
          p={2}
          bg={accentColor}
          color="white"
          rounded="md"
          alignSelf="flex-start"
        >
          {icon}
        </Box>
      </Flex>
    </Stat>
  );
};

export default DashboardPage;