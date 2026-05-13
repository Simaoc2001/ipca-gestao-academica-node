# 📊 Estrutura MongoDB - Boas Práticas de Desnormalização

## 📋 Visão Geral

O sistema IPCA Gestão Académica foi refatorado para usar uma **estrutura desnormalizada do MongoDB**, seguindo as melhores práticas de design NoSQL.

---

## 🗂️ Colecções

### 1️⃣ **usuarios** (Utilizadores com Papéis)

```javascript
{
    _id: 1,
    login: "gestor1",
    password: "hash_bcrypt",
    papel: "ADMIN",           // ADMIN, ALUNO, FUNCIONARIO
    nome: "Gestor Sistema",
    email: "gestor@ipca.pt",
    ativo: true,
    criadoEm: Date
}
```

**Papéis:**
- `ADMIN` - Gestor/Administrador
- `ALUNO` - Estudante
- `FUNCIONARIO` - Pessoal administrativo

---

### 2️⃣ **cursos** (Cursos com Disciplinas Desnormalizadas)

```javascript
{
    _id: 1,
    nome: "Engenharia Informática",
    descricao: "Curso de 3 anos",
    ativo: true,
    criadoEm: Date,
    disciplinas: [
        {
            _id: 101,
            nome: "Programação Web",
            ano: 1,
            semestre: 1,
            horas: 60,
            professor: "Prof. Técnico"
        },
        {
            _id: 102,
            nome: "Bases de Dados",
            ano: 1,
            semestre: 2,
            horas: 60,
            professor: "Prof. Técnico"
        }
    ]
}
```

**Vantagens desta abordagem:**
- ✅ Acesso rápido a todas as disciplinas de um curso
- ✅ Informações completas em um único documento
- ✅ Facilita operações em curso e suas disciplinas

---

### 3️⃣ **alunos** (Alunos com Histórico Académico)

```javascript
{
    _id: 1001,
    login: "ana.costa",
    nome: "Ana Costa",
    email: "ana@aluno.ipca.pt",
    curso_id: 1,                    // Referência ao curso
    ano_atual: 1,
    semestre_atual: 1,
    ativo: true,
    matriculadoEm: Date,
    notas: [
        {
            disciplina_id: 101,
            disciplina_nome: "Programação Web",
            nota: 16,
            data: Date
        },
        {
            disciplina_id: 102,
            disciplina_nome: "Bases de Dados",
            nota: 14,
            data: Date
        }
    ]
}
```

**Benefícios:**
- ✅ Histórico de notas junto ao aluno
- ✅ Query única para perfil completo do aluno
- ✅ Fácil filtrar alunos por nota

---

### 4️⃣ **pautas** (Folhas de Avaliação)

```javascript
{
    _id: 1,
    curso_id: 1,
    disciplina_id: 101,
    disciplina_nome: "Programação Web",
    ano: 1,
    semestre: 1,
    epoca: "normal",                // normal, recurso, especial
    criadaEm: Date,
    alunos: [
        {
            aluno_id: 1001,
            aluno_nome: "Ana Costa",
            nota: 16,
            presenca: true,
            dataExame: Date
        },
        {
            aluno_id: 1002,
            aluno_nome: "Carlos Silva",
            nota: 12,
            presenca: true,
            dataExame: Date
        }
    ]
}
```

**Características:**
- ✅ Dados completos de uma época de avaliação
- ✅ Acesso rápido a todas as notas de uma disciplina
- ✅ Histórico de épocas de avaliação

---

## 🔄 Comparação: SQL vs MongoDB

| Operação | SQL | MongoDB |
|----------|-----|---------|
| **Obter curso com disciplinas** | 2 JOINs | 1 query |
| **Obter notas de um aluno** | 2-3 JOINs | 1 query |
| **Adicionar nota** | UPDATE + INSERT | 1 array push |
| **Filtrar por nota > 15** | WHERE nota > 15 | $elemMatch |

---

## 🚀 APIs RESTful

### Usuarios
```
POST   /api/login              - Autenticação
GET    /api/sessao             - Info da sessão
GET    /api/logout             - Desconectar
```

### Cursos
```
GET    /api/cursos             - Lista todos os cursos
POST   /api/cursos             - Criar novo curso
PUT    /api/cursos/:id         - Atualizar curso
DELETE /api/cursos/:id         - Deletar curso
```

### Disciplinas (dentro de Cursos)
```
GET    /api/disciplinas        - Lista todas as disciplinas de todos os cursos
POST   /api/disciplinas        - Adicionar disciplina a um curso
```

### Alunos
```
GET    /api/alunos             - Lista todos os alunos
POST   /api/alunos             - Registar novo aluno
GET    /api/alunos/:id         - Info completa do aluno com histórico
```

### Pautas
```
GET    /api/pautas             - Lista todas as pautas
POST   /api/pautas             - Criar pauta
POST   /api/pautas/:id/notas   - Adicionar/atualizar nota
```

---

## ✅ Boas Práticas Implementadas

1. **Desnormalização Estratégica**
   - Dados frequentemente acessados juntos estão no mesmo documento
   - Reduz necessidade de múltiplas queries

2. **Referências por ID**
   - `curso_id` e `aluno_id` para manter integridade
   - Permite operações de lookup quando necessário

3. **Timestamps**
   - `criadoEm` para auditoria
   - `dataExame` para rastreabilidade

4. **Arrays para Dados Relacionados**
   - Disciplinas dentro de Cursos
   - Notas dentro de Alunos
   - Alunos dentro de Pautas

5. **Campos Booleanos**
   - `ativo` para soft delete
   - `presenca` para controle de presença

---

## 🔐 Segurança

- Passwords hasheadas com **bcryptjs**
- Sessions com timeout de 30 minutos
- Middleware de autenticação em todas as rotas protegidas
- Variáveis de ambiente para credenciais (`.env`)

---

## 📈 Escalabilidade

Esta estrutura suporta:
- ✅ Milhares de alunos
- ✅ Centenas de cursos
- ✅ Múltiplas épocas de avaliação
- ✅ Histórico completo de notas
- ✅ Replicação em MongoDB Atlas

---

## 🎯 Próximas Otimizações (Futuro)

- [ ] Índices em `login`, `curso_id`, `aluno_id`
- [ ] Agregações para relatórios
- [ ] TTL indexes para dados temporários
- [ ] Sharding por ano académico
- [ ] Backups automáticos

---

**Desenvolvido com ❤️ para demonstrar boas práticas MongoDB**
