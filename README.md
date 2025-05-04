# Orgânicos da Fátima - Sistema de Estoque

O Sistema de Gestão de Estoque e Materiais para a empresa "Orgânicos da Fátima" é uma aplicação full-stack desenvolvida para controlar o inventário de produtos e materiais de uso interno.

## Funcionalidades

- Autenticação JWT com dois níveis de acesso (admin e estoque)
- Gerenciamento de estoque de produtos (CRUD completo)
- Gerenciamento de materiais de uso interno
- Dashboard com estatísticas e alertas de baixo estoque
- Sistema responsivo adaptado a diferentes tamanhos de tela

## Tecnologias Utilizadas

### Frontend
- React com TypeScript
- Chakra UI para interface de usuário
- React Router para navegação
- Axios para requisições HTTP
- Lucide React para ícones

### Backend
- Node.js com Express
- Autenticação JWT
- MySQL para persistência de dados
- bcrypt.js para criptografia de senha

## Pré-requisitos

- Node.js 18 ou superior
- MySQL 8 ou superior

## Configuração Inicial

1. Clone o repositório

```bash
git clone <repositório>
cd organicos-fatima
```

2. Configure o ambiente

```bash
# Copie os arquivos de exemplo de ambiente
cp .env.example .env
```

3. Edite o arquivo `.env` com suas configurações

4. Configure o banco de dados

```bash
cd backend
npm install
npm run setup-db
```

Isto criará o banco de dados, tabelas e dados iniciais.

## Execução

### Iniciar o Backend

```bash
cd backend
npm install
npm run dev
```

O servidor estará disponível em http://localhost:3000.

### Iniciar o Frontend

```bash
# Na pasta raiz do projeto
npm install
npm run dev
```

O frontend estará disponível em http://localhost:5173.

## Usuário Padrão

Após a configuração inicial, você pode fazer login utilizando:

- Email: admin@organicosdefatima.com
- Senha: admin123

## Estrutura do Projeto

```
/                   # Raiz do projeto (Frontend)
├── src/            # Código fonte do frontend
│   ├── components/ # Componentes React
│   ├── contexts/   # Contextos (Auth, etc)
│   ├── pages/      # Páginas da aplicação
│   ├── services/   # Serviços (API, etc)
│   └── types/      # Definições de tipos TypeScript
├── backend/        # Código fonte do backend
│   ├── src/        # Código fonte do backend
│   │   ├── controllers/ # Controladores
│   │   ├── models/     # Modelos de dados
│   │   ├── routes/     # Rotas da API
│   │   ├── database/   # Configuração de banco de dados
│   │   └── middleware/ # Middlewares
```

## Recursos Adicionais

- Alerta visual para produtos com baixo estoque
- Filtros por categoria e pesquisa por nome
- Ajuste de estoque com registro de movimentações
- Controle de uso de materiais internos