import dotenv from 'dotenv';
dotenv.config();

import { authenticateUser } from '../src/models/userModel.js';

(async () => {
  const email = 'sam@example.com';          // use o email existente no banco
  const password = 'minhaSenha123';       // use a senha em texto simples, não o hash

  const user = await authenticateUser(email, password);
  console.log(user
    ? `✅ Autenticou: ${user.name} (${user.email})`
    : '❌ Falhou autenticação'
  );
  console.log(user);
  process.exit();
})();