# 📚 IPCA - Sistema de Gestão Académica
## Migração de PHP/MySQL para Node.js/Express + MongoDB

---

## 📋 Descrição do Projeto

Sistema completo de gestão académica migrado de uma arquitetura **monolítica em PHP/MySQL** para uma arquitetura **moderna com Node.js/Express** e preparado para **MongoDB**.

### ✅ Funcionalidades Implementadas

- ✅ **Autenticação Segura** - Login com bcryptjs (hashing de passwords)
- ✅ **Gestão de Cursos** - CRUD completo (Create, Read, Update, Delete)
- ✅ **Gestão de Alunos** - Formulário com validação de dados
- ✅ **Gestão de Disciplinas** - Associação a cursos
- ✅ **Gestão de Pautas** - Registro de notas e avaliações
- ✅ **Dashboard** - Estatísticas em tempo real
- ✅ **Sessões** - Timeout de 30 minutos
- ✅ **QR Code** - Acesso rápido a partir de dispositivos móveis
- ✅ **Design Responsivo** - Bootstrap 5.3 + Font Awesome 6.4
- ✅ **APIs REST** - Endpoints para todas as operações

---

## 🚀 Como Executar

### Pré-requisitos
- **Node.js** (v14 ou superior)
- **npm** (gestor de pacotes)

### Instalação e Execução

1. **Navegar até ao diretório do projeto:**
```bash
cd "c:\Users\Huawei\OneDrive\Ambiente de Trabalho\Universidade\Programação Web\Trabalhos\ipca-gestao-academica-node"
```

2. **Instalar dependências (se não estiver feito):**
```bash
npm install
```

3. **Iniciar o servidor:**
```bash
node app-demo.js
```

4. **Abrir o navegador:**
```
http://127.0.0.1:3001/
```

---

## 👤 Credenciais de Teste

| Utilizador | Password | Papel |
|------------|----------|-------|
| `gestor1` | `gestor1` | ADMIN |
| `aluno1` | `aluno1` | ALUNO |
| `Funcionario1` | `Funcionario1` | FUNCIONÁRIO |

---

## 📁 Estrutura do Projeto

```
ipca-gestao-academica-node/
├── app.js                          # Servidor Express (versão MongoDB)
├── app-demo.js                     # Servidor Express (versão DEMO - dados em memória)
├── migrate-from-mysql.js           # Script de migração MySQL → MongoDB
├── generate-hashes.js              # Gerador de hashes bcrypt
├── package.json                    # Dependências do projeto
├── package-lock.json               # Lock file npm
│
└── public/                         # Frontend - Páginas HTML + CSS
    ├── index.html                  # Página inicial com QR code
    ├── login.html                  # Autenticação
    ├── dashboard.html              # Dashboard com estatísticas
    ├── cursos.html                 # Gestão de cursos
    ├── alunos.html                 # Gestão de alunos
    ├── disciplinas.html            # Gestão de disciplinas
    ├── pautas.html                 # Gestão de pautas
    ├── fichas.html                 # Fichas de alunos
    ├── sobre.html                  # Página sobre
    ├── contacto.html               # Contacto
    └── estilos.css                 # Estilos Bootstrap 5.3 personalizados
```

---

## 🔧 Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de dados NoSQL (preparado)
- **bcryptjs** - Hashing de passwords
- **express-session** - Gestão de sessões

### Frontend
- **HTML5** - Markup semântico
- **CSS3** - Estilos avançados com animações
- **Bootstrap 5.3** - Framework CSS responsivo
- **Font Awesome 6.4** - Ícones profissionais
- **JavaScript Vanilla** - Lógica do cliente (sem frameworks)

---

## 📊 Comparação: PHP → Node.js

| Aspeto | PHP Original | Node.js Novo |
|--------|------------|-----------|
| **Backend** | PHP puro | Express.js |
| **BD** | MySQL (10 tabelas) | MongoDB (colecções) |
| **Autenticação** | Sessions PHP | express-session + bcryptjs |
| **APIs** | Sem REST API | 10+ endpoints REST |
| **Frontend** | Misturado em PHP | HTML5 + JavaScript |
| **Segurança** | Básica | Passwords hasheadas, sessões seguras |
| **Design** | Básico | Bootstrap 5.3 profissional |
| **Escalabilidade** | Monolítica | Modular e escalável |

---

## 🔐 Segurança Implementada

✅ **Passwords com bcryptjs** - Hashing com 10 rounds de salt
✅ **Sessões seguras** - Timeout de 30 minutos
✅ **Validação de dados** - Campos obrigatórios no formulário
✅ **Proteção de rotas** - Middleware de autenticação
✅ **HTTPS Ready** - Preparado para produção

---

## 📱 Acesso Móvel

A aplicação inclui um **QR code** na página inicial que permite aceder rapidamente ao sistema a partir de um dispositivo móvel:

1. Abrir a página inicial: `http://127.0.0.1:3001/`
2. Ler o código QR com a câmara do telemóvel
3. Será redirecionado para a página de login

---

## 🗄️ Migração MongoDB

O projeto inclui um script de migração automática do MySQL para MongoDB:

```bash
node migrate-from-mysql.js
```

Este script:
- ✅ Conecta ao MySQL (localhost, base de dados "ipca")
- ✅ Conecta ao MongoDB Atlas
- ✅ Migra 10 tabelas para colecções MongoDB
- ✅ Cria índices apropriados
- ✅ Converte IDs para ObjectId

---

## 🎨 Design e UX

- **Tema Profissional** - Navy blue (#003366) com acentos laranja
- **Dark Mode** - Reduz fadiga visual
- **Responsivo** - Funciona em desktop, tablet e móvel
- **Animações** - Transições suaves e efeitos visuais
- **Acessibilidade** - Contraste adequado, ícones intuitivos

---

## 📝 Funcionalidades por Página

### 🏠 Página Inicial (`/`)
- Apresentação do sistema
- Cards com funcionalidades principais
- **QR code de acesso rápido**
- Link para login

### 🔐 Login (`/login`)
- Autenticação com utilizador e password
- Validação de credenciais com bcryptjs
- Criação de sessão segura
- Redirecionamento para dashboard

### 📊 Dashboard (`/dashboard`)
- Estatísticas em cards:
  - Número de cursos
  - Número de disciplinas
  - Número de alunos
  - Número de pautas
- Quick links para gestão rápida
- Bem-vindo com nome do utilizador

### 📚 Gestão de Cursos (`/cursos`)
- Tabela com todos os cursos
- Botão "Novo Curso"
- Modal para adicionar/editar
- Descrição e estado (Ativo/Inativo)

### 👥 Gestão de Alunos (`/alunos`)
- Tabela com lista de alunos
- Formulário completo:
  - Login único
  - Nome completo
  - Email
  - Password (hashing automático)
  - Telefone
  - Morada
  - Data de nascimento
  - Seleção de curso
- Validação de campos

### 📖 Gestão de Disciplinas (`/disciplinas`)
- Lista de disciplinas
- Associação a cursos
- Formulário para novas disciplinas

### 📊 Gestão de Pautas (`/pautas`)
- Tabela de pautas
- Seleção de disciplina, época e ano letivo
- Formulário para novas pautas

---

## 🐛 Troubleshooting

### Porta 3001 já está em uso
Altere a porta em `app-demo.js`:
```javascript
const PORT = 3002; // Mude para outra porta
```

### Erro ao conectar ao MongoDB
O script `app-demo.js` usa dados em memória, não precisa de MongoDB.
Para usar MongoDB real, execute `app.js`:
```bash
node app.js
```

### Passwords incorretas
Use as credenciais de teste acima ou crie novas executando:
```bash
node generate-hashes.js
```

---

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- Código comentado em `app-demo.js`
- Estrutura das APIs nos endpoints
- Documentação do Bootstrap em `public/estilos.css`

---

## 🎯 Próximas Melhorias (Futuro)

- [ ] Integração com MongoDB Atlas em produção
- [ ] Autenticação com JWT
- [ ] Testes unitários com Jest
- [ ] Deploy em plataforma cloud (Heroku, Railway)
- [ ] Relatórios PDF
- [ ] Notificações por email
- [ ] Importação/Exportação de dados

---

## 📄 Licença

Projeto académico - Instituto Politécnico do Cávado e Ave (2024)

---

**Desenvolvido com ❤️ em Node.js e Express**
