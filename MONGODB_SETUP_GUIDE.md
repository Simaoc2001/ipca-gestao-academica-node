# 🗄️ MongoDB Atlas Setup Guide

## 📋 Visão Geral

O `setup-mongodb.js` configura automaticamente a base de dados MongoDB Atlas com:

- ✅ **Colecções** com validação JSON Schema
- ✅ **Índices** para performance otimizada
- ✅ **Dados iniciais** de teste
- ✅ **Constraints** de integridade de dados

---

## 🚀 Como Usar

### 1. Configurar Variáveis de Ambiente

Cria um ficheiro `.env` com a tua URI do MongoDB:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ipca_academica?retryWrites=true&w=majority
```

### 2. Executar Setup

```bash
node setup-mongodb.js
```

### 3. Resultado Esperado

```
🔄 A conectar ao MongoDB Atlas...

✅ Conectado ao MongoDB Atlas

📝 A criar colecção: usuarios
   ✅ Colecção criada com validação
   ✅ Índices criados

📚 A criar colecção: cursos
   ✅ Colecção criada com validação
   ✅ Índices criados

👥 A criar colecção: alunos
   ✅ Colecção criada com validação
   ✅ Índices criados

📊 A criar colecção: pautas
   ✅ Colecção criada com validação
   ✅ Índices criados

📥 A carregar dados iniciais...
   ✅ 3 utilizadores inseridos
   ✅ 2 cursos inseridos
   ✅ 1 alunos inseridos
   ✅ 1 pautas inseridas

✅ SETUP MONGODB COMPLETO!

📊 Resumo da configuração:
   - Colecções: 4 (usuarios, cursos, alunos, pautas)
   - Índices: 12 (com validação JSON Schema)
   - Dados iniciais: 8 documentos
```

---

## 📊 Colecções Criadas

### **usuarios**
- **Índices:** `login` (unique), `papel`, `ativo`
- **Validação:** Login de 3+ caracteres, papel em (ADMIN, ALUNO, FUNCIONARIO)
- **Dados iniciais:** 3 utilizadores

### **cursos**
- **Índices:** `nome`, `ativo`, `disciplinas.ano`
- **Validação:** Disciplinas com ano 1-4, semestre 1-2
- **Dados iniciais:** 2 cursos com disciplinas

### **alunos**
- **Índices:** `login` (unique), `curso_id`, `notas.disciplina_id`, `ano_atual`
- **Validação:** Notas entre 0-20, ano mínimo 1
- **Dados iniciais:** 1 aluno

### **pautas**
- **Índices:** `curso_id + disciplina_id + epoca`, `ano + semestre`, `alunos.aluno_id`
- **Validação:** Época em (normal, recurso, especial)
- **Dados iniciais:** 1 pauta

---

## 🔐 Dados de Teste

Após executar o setup, tens estas credenciais disponíveis:

```
👤 ADMIN:
   Login: gestor1
   Password: gestor1
   
👨‍🎓 ALUNO:
   Login: aluno1
   Password: aluno1
   
👨‍💼 FUNCIONARIO:
   Login: funcionario1
   Password: funcionario1
```

---

## 🔍 Validação JSON Schema

Todas as colecções têm **validação de schema**. Tentar inserir dados inválidos resultará em erro:

```javascript
// ❌ Isto falhará - papel inválido
db.usuarios.insertOne({
    login: "teste",
    password: "hash",
    papel: "PROFESSOR",  // ❌ não permitido
    nome: "Teste",
    email: "teste@ipca.pt"
})

// ✅ Isto funciona
db.usuarios.insertOne({
    login: "teste",
    password: "hash",
    papel: "ALUNO",      // ✅ permitido
    nome: "Teste",
    email: "teste@ipca.pt"
})
```

---

## ⚡ Índices para Performance

| Colecção | Índice | Tipo | Razão |
|----------|--------|------|-------|
| usuarios | login | unique | Evita logins duplicados |
| usuarios | papel | normal | Filtragens por papel |
| cursos | nome | normal | Buscas por nome |
| alunos | login | unique | Identificação única |
| alunos | curso_id | normal | Alunos por curso |
| pautas | curso_id + disciplina_id + epoca | compound | Pautas específicas |

---

## 📈 Escalabilidade

### Sharding (Pronto para implementação)

Se precisares de sharding em produção:

```javascript
// Distribuir alunos por ano académico
sh.shardCollection("ipca_academica.alunos", { ano_atual: 1 })

// Distribuir pautas por ano
sh.shardCollection("ipca_academica.pautas", { ano: 1 })
```

### TTL Indexes (Para dados temporários)

```javascript
// Deletar sessões expiradas após 30 minutos
db.sessoes.createIndex({ criadoEm: 1 }, { expireAfterSeconds: 1800 })
```

---

## 🧪 Testar a Configuração

### Query Examples

```javascript
// Contar documentos
db.usuarios.countDocuments()        // 3
db.cursos.countDocuments()          // 2
db.alunos.countDocuments()          // 1

// Buscar por login
db.usuarios.findOne({ login: "gestor1" })

// Alunos de um curso específico
db.alunos.find({ curso_id: 1 })

// Pautas com alunos
db.pautas.findOne({ 
    $and: [
        { curso_id: 1 },
        { disciplina_id: 101 }
    ]
})
```

---

## 🔧 Troubleshooting

### Erro: "MONGODB_URI not configured"
→ Cria `.env` com a tua URI do MongoDB Atlas

### Erro: "Authentication failed"
→ Verifica username/password na URI

### Erro: "Validation failed"
→ Alguns dados não correspondem ao schema. Verifica os tipos de dados.

---

## 📚 Recursos Adicionais

- [MongoDB JSON Schema](https://docs.mongodb.com/manual/reference/operator/query/jsonSchema/)
- [Índices MongoDB](https://docs.mongodb.com/manual/indexes/)
- [Sharding](https://docs.mongodb.com/manual/sharding/)
- [Validação](https://docs.mongodb.com/manual/core/schema-validation/)

---

**Desenvolvido para fins educacionais - IPCA 2024**
