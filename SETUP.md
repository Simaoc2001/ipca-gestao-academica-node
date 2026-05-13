# 🚀 Guia de Setup e Deployment

## 📋 Pré-requisitos

- **Node.js** (v14 ou superior) - [Download](https://nodejs.org/)
- **npm** (incluído com Node.js)
- **MongoDB** (local ou Atlas) - [Info](https://www.mongodb.com/)
- **Git** (para clonar o repositório)

---

## 💻 Setup Local (Desenvolvimento)

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-username/ipca-gestao-academica-node.git
cd ipca-gestao-academica-node
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Depois edite `.env` com as suas credenciais:

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ipca
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=ipca
SESSION_SECRET=sua_chave_muito_segura
```

### 4. Iniciar em Desenvolvimento

```bash
node app-demo.js
```

O servidor estará disponível em: `http://localhost:3001/`

---

## 📊 Migração de Dados (MySQL → MongoDB)

Se tem dados MySQL originais:

```bash
# Editar migrate-from-mysql.js com as suas credenciais
node migrate-from-mysql.js
```

---

## 🔐 Gerar Hashes de Passwords

Para criar novas passwords hasheadas:

```bash
node generate-hashes.js
```

---

## 🌐 Deployment em Produção

### Opção 1: Railway (Recomendado - Gratuito)

1. Criar conta em [railway.app](https://railway.app/)
2. Conectar repositório GitHub
3. Configurar variáveis de ambiente no Railway
4. Deploy automático!

### Opção 2: Heroku

```bash
# Instalar Heroku CLI
npm install -g heroku

# Login
heroku login

# Criar app
heroku create seu-app-name

# Deploy
git push heroku main

# Ver logs
heroku logs --tail
```

### Opção 3: VPS (AWS, DigitalOcean, etc.)

1. Instalar Node.js no servidor
2. Clonar repositório
3. Configurar `.env` com credenciais do servidor
4. Usar PM2 para gerir o processo:

```bash
npm install -g pm2

# Iniciar com PM2
pm2 start app.js --name "ipca-api"

# Salvar configuração
pm2 save

# Iniciar automaticamente no boot
pm2 startup
```

---

## 🗄️ Configurar MongoDB Atlas (Cloud)

1. Ir para [mongodb.com/cloud](https://www.mongodb.com/cloud)
2. Criar conta gratuita (free tier M0)
3. Criar cluster
4. Obter connection string
5. Adicionar em `.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ipca?retryWrites=true&w=majority
```

---

## 📝 Estrutura de Pastas para Produção

Para organizar melhor em produção, considere:

```
ipca-gestao-academica-node/
├── src/
│   ├── routes/        # Rotas da API
│   ├── middleware/    # Middleware customizado
│   ├── models/        # Modelos de dados
│   └── utils/         # Utilitários
├── public/            # Frontend (já temos)
├── config/            # Configurações
├── .env
├── .env.example
├── app.js
└── package.json
```

---

## 🧪 Testes

Para adicionar testes no futuro:

```bash
npm install --save-dev jest supertest
npm test
```

---

## 📦 Checklist de Deployment

Antes de fazer deploy, verificar:

- [ ] `.env` configurado com credenciais de produção
- [ ] MongoDB Atlas criado e acessível
- [ ] NODE_ENV=production
- [ ] Todas as dependências instaladas
- [ ] Testes executados (se houver)
- [ ] README atualizado
- [ ] Todos os ficheiros commitados no Git

---

## 🐛 Troubleshooting

### Erro: "Port already in use"
```bash
# Mudar PORT em .env
PORT=3002
```

### Erro: "Cannot connect to MongoDB"
```bash
# Verificar MONGODB_URI em .env
# Verificar se IP está whitelisted no MongoDB Atlas
```

### Erro: "Session not found"
```bash
# Limpar cookies do browser
# Ou usar modo incógnito
```

---

## 📞 Suporte

Para problemas ou sugestões, abra uma **Issue** no GitHub!

---

**Desenvolvido com ❤️ para IPCA**
