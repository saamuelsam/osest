import { useState, useEffect } from "react";
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
  Select,
  useToast,
  FormErrorMessage,
  VStack,
} from "@chakra-ui/react";
import { Product, ProductFormData } from "../../types";
import api from "../../services/api";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (product: Product) => void;
  categories: string[];
}

// Form error messages in camelCase
interface ProductFormErrors {
  name?: string;
  category?: string;
  quantity?: string;
  minQuantity?: string;
  boxes?: string;
  weightKg?: string;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onSave,
  categories,
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    category: "",
    quantity: 0,
    minQuantity: 0,
    boxes: 0,
    weightKg: 0,
  });
  const [newCategory, setNewCategory] = useState("");
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        quantity: product.quantity,
        minQuantity: product.minQuantity,
        boxes: product.boxes || 0,
        weightKg: product.weightKg || 0,
      });
    } else {
      resetForm();
    }
  }, [product, isOpen]);

  const resetForm = () => {
    setFormData({ name: "", category: "", quantity: 0, minQuantity: 0, boxes: 0, weightKg: 0 });
    setNewCategory("");
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: ProductFormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!formData.category && !newCategory) newErrors.category = "Categoria é obrigatória";
    if (formData.quantity < 0) newErrors.quantity = "Quantidade inválida";
    if (formData.minQuantity < 0) newErrors.minQuantity = "Quantidade mínima inválida";
    if (formData.boxes < 0) newErrors.boxes = "Número de caixas inválido";
    if (formData.weightKg < 0) newErrors.weightKg = "Peso inválido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    const productDataToSubmit = { ...formData, category: newCategory || formData.category };
    console.log("Enviando payload:", productDataToSubmit);
    try {
      let response;
      if (product) {
        response = await api.put(`/products/${product.id}`, productDataToSubmit);
      } else {
        response = await api.post("/products", productDataToSubmit);
      }
      onSave(response.data);
      onClose();
      toast({
        title: product ? "Produto atualizado" : "Produto criado",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      console.error("Erro salvando produto:", err.response || err.message);
      const msg = err.response?.data?.message || "Erro ao salvar produto";
      toast({
        title: "Erro",
        description: msg,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (name: keyof ProductFormData, _str: string, num: number) => {
    setFormData((prev) => ({ ...prev, [name]: isNaN(num) ? 0 : num }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{product ? "Editar Produto" : "Novo Produto"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {/* Nome */}
            <FormControl isInvalid={!!errors.name}>
              <FormLabel>Nome</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nome do produto"
                focusBorderColor="brand.primary"
              />
              {errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
            </FormControl>
            {/* Categoria */}
            <FormControl isInvalid={!!errors.category}>
              <FormLabel>Categoria</FormLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Selecione uma categoria"
                focusBorderColor="brand.primary"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="new">+ Nova categoria</option>
              </Select>
              {errors.category && <FormErrorMessage>{errors.category}</FormErrorMessage>}
            </FormControl>
            {/* Nova Categoria */}
            {formData.category === "new" && (
              <FormControl>
                <FormLabel>Nova Categoria</FormLabel>
                <Input
                  placeholder="Nome da nova categoria"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  focusBorderColor="brand.primary"
                />
              </FormControl>
            )}
            {/* Quantidade */}
            <FormControl isInvalid={!!errors.quantity}>
              <FormLabel>Quantidade</FormLabel>
              <NumberInput
                value={formData.quantity}
                onChange={(_, v) => handleNumberChange("quantity", "", v)}
                min={0}
                focusBorderColor="brand.primary"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              {errors.quantity && <FormErrorMessage>{errors.quantity}</FormErrorMessage>}
            </FormControl>
            {/* Min. Quantidade */}
            <FormControl isInvalid={!!errors.minQuantity}>
              <FormLabel>Quantidade Mínima</FormLabel>
              <NumberInput
                value={formData.minQuantity}
                onChange={(_, v) => handleNumberChange("minQuantity", "", v)}
                min={0}
                focusBorderColor="brand.primary"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              {errors.minQuantity && <FormErrorMessage>{errors.minQuantity}</FormErrorMessage>}
            </FormControl>
            {/* Caixas */}
            <FormControl isInvalid={!!errors.boxes}>
              <FormLabel>Caixas</FormLabel>
              <NumberInput
                value={formData.boxes}
                onChange={(_, v) => handleNumberChange("boxes", "", v)}
                min={0}
                focusBorderColor="brand.primary"
              >
                <NumberInputField placeholder="Qtd. de caixas" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              {errors.boxes && <FormErrorMessage>{errors.boxes}</FormErrorMessage>}
            </FormControl>
            {/* Peso (kg) */}
            <FormControl isInvalid={!!errors.weightKg}>
              <FormLabel>Peso (kg)</FormLabel>
              <NumberInput
                precision={2}
                step={0.01}
                value={formData.weightKg}
                onChange={(_, v) => handleNumberChange("weightKg", "", v)}
                min={0}
                focusBorderColor="brand.primary"
              >
                <NumberInputField placeholder="Peso em kg" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              {errors.weightKg && <FormErrorMessage>{errors.weightKg}</FormErrorMessage>}
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            colorScheme="green"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            bg="brand.primary"
            _hover={{ bg: "brand.primary", opacity: 0.9 }}
          >
            {product ? "Atualizar" : "Salvar"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProductModal;
