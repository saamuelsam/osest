// scripts/testAuth.js
import dotenv from 'dotenv';
import { authenticateUser } from '../src/models/userModel.js';

dotenv.config();

(async () => {
  const user = await authenticateUser('seu@email.com', 'suaSenhaPlain');
  console.log(user ? '✅ Autenticou:' : '❌ Falhou autenticação');
  console.log(user);
  process.exit();
})();
