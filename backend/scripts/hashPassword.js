import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import path from 'path';

// Recriar __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`Running script from directory: ${__dirname}`);

(async () => {
  const hash = await bcrypt.hash('org2025estoque', 10);
  console.log(hash);
  process.exit();
})();