import express from 'express';
import {
  authUser, // <<< Certifique-se de que esta função existe e está importada
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  // Se você tiver uma função para registrar um novo usuário que não precise de admin:
  // registerUser 
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rota de Login - NÃO USA 'protect' aqui
router.post('/login', authUser);

// Rota de Registro (exemplo, se aplicável e não precisa de admin)
// router.post('/register', registerUser);


// Rotas protegidas para gerenciamento de usuários
router.route('/')
  .get(protect, admin, getUsers) // Adiciona protect individualmente se necessário
  .post(protect, admin, createUser); // Adiciona protect individualmente

router.route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

// Se você tinha router.use(protect) no topo, remova-o
// e adicione 'protect' (e 'admin' quando necessário) a cada rota individualmente,
// exceto para /login e /register.

export default router;