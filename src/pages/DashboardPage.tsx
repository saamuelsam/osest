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
import { Package, ShoppingBag, AlertTriangle, Leaf } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { Product, Material, Seed } from '../types';

const DashboardPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, materialsRes, seedsRes] = await Promise.all([
          api.get('/products'),
          api.get('/materials'),
          api.get('/seeds'),
        ]);
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
        setMaterials(Array.isArray(materialsRes.data) ? materialsRes.data : []);
        setSeeds(Array.isArray(seedsRes.data) ? seedsRes.data : []);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        setProducts([]);
        setMaterials([]);
        setSeeds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtros
  const lowStockProducts = products.filter(product => product.quantity < product.minQuantity);
  const lowStockMaterials = materials.filter(material => material.quantity < material.minQuantity);

  // Totais
  const totalProducts = products.length;
  const totalMaterials = materials.length;
  // Somar todos os pacotes de todas as sementes
  const totalSeeds = seeds.reduce(
    (sum, s) =>
      sum +
      (Number(s.package100 || s.package100 || 0) +
        Number(s.package200 || s.package200 || 0) +
        Number(s.package500 || s.package500 || 0)),
    0
  );
  const totalLowStock = lowStockProducts.length + lowStockMaterials.length;

  if (loading) {
    return (
      <Center h="70vh">
        <Spinner size="xl" color="brand.primary" />
      </Center>
    );
  }

  return (
    <Box p={{ base: 4, md: 6 }} overflowX="hidden">
      <Heading size={{ base: 'lg', md: 'xl' }} mb={{ base: 4, md: 6 }}>
        Dashboard
      </Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 4, md: 6 }} mb={{ base: 6, md: 8 }}>
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
          title="Total de Sementes"
          value={totalSeeds}
          icon={<Leaf size={24} />} // Ícone de folha para representar sementes!
          accentColor="green.500"
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
          <Heading size={{ base: 'md', md: 'lg' }} mb={{ base: 3, md: 4 }}>
            Itens em Baixo Estoque
          </Heading>
          
          {lowStockProducts.length > 0 && (
            <Box mb={{ base: 4, md: 6 }}>
              <Flex align="center" mb={2}>
                <Icon as={Package} mr={2} color="brand.primary" />
                <Text fontWeight="medium" fontSize={{ base: 'md', md: 'lg' }}>Produtos</Text>
              </Flex>
              <TableContainer bg="white" rounded="md" shadow="sm" overflowX="auto" maxW="100%">
                <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
                  <Thead>
                    <Tr>
                      <Th whiteSpace="normal">Nome</Th>
                      <Th display={{ base: 'none', sm: 'table-cell' }} whiteSpace="normal">Categoria</Th>
                      <Th isNumeric>Atual</Th>
                      <Th isNumeric>Mínimo</Th>
                      <Th whiteSpace="normal">Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {lowStockProducts.map((product) => (
                      <Tr key={product.id}>
                        <Td fontWeight="medium" whiteSpace="normal" wordBreak="break-word">{product.name}</Td>
                        <Td display={{ base: 'none', sm: 'table-cell' }} whiteSpace="normal" wordBreak="break-word">{product.category}</Td>
                        <Td isNumeric>{product.quantity}</Td>
                        <Td isNumeric>{product.minQuantity}</Td>
                        <Td>
                          <Badge fontSize={{ base: 'xs', md: 'sm' }} colorScheme={product.quantity === 0 ? "red" : "orange"}>
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
                <Text fontWeight="medium" fontSize={{ base: 'md', md: 'lg' }}>Materiais</Text>
              </Flex>
              <TableContainer bg="white" rounded="md" shadow="sm" overflowX="auto" maxW="100%">
                <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
                  <Thead>
                    <Tr>
                      <Th whiteSpace="normal">Nome</Th>
                      <Th isNumeric>Atual</Th>
                      <Th isNumeric>Mínimo</Th>
                      <Th whiteSpace="normal">Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {lowStockMaterials.map((material) => (
                      <Tr key={material.id}>
                        <Td fontWeight="medium" whiteSpace="normal" wordBreak="break-word">{material.name}</Td>
                        <Td isNumeric>{material.quantity}</Td>
                        <Td isNumeric>{material.minQuantity}</Td>
                        <Td>
                          <Badge fontSize={{ base: 'xs', md: 'sm' }} colorScheme={material.quantity === 0 ? "red" : "orange"}>
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

// Componente de estatística
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
      px={{ base: 3, md: 4 }}
      py={{ base: 4, md: 5 }}
      bg="white"
      rounded="lg"
      shadow="sm"
      borderTop="4px solid"
      borderColor={accentColor}
      transition="transform 0.2s"
      _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
    >
      <Flex justifyContent="space-between" alignItems="center">
        <Box>
          <StatLabel fontSize={{ base: 'xs', md: 'sm' }} fontWeight="medium" isTruncated>
            {title}
          </StatLabel>
          <StatNumber fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold">
            {value}
          </StatNumber>
          {helpText && (
            <StatHelpText mb={0} color="gray.500" fontSize={{ base: 'xs', md: 'sm' }}>
              {helpText}
            </StatHelpText>
          )}
        </Box>
        <Box
          p={{ base: 1, md: 2 }}
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
