const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3001;

// ============================================================
// DADOS EM MEMÓRIA (SIMULAÇÃO)
// ============================================================
let db = {
    grupos: [
        { _id: 1, GRUPO: 'ADMIN' },
        { _id: 2, GRUPO: 'ALUNO' },
        { _id: 3, GRUPO: 'FUNCIONARIO' }
    ],
    users: [
        { 
            _id: 1,
            login: 'gestor1',
            password: '$2a$10$TW07a2dkl6dDaI7gdJD9ROatkfGO5spM0ZR3rxXR7czNQ1Tb4FR4e',
            grupo_id: 1,
            nome: 'Gestor Sistema',
            email: 'gestor@ipca.pt'
        },
        { 
            _id: 2,
            login: 'aluno1',
            password: '$2a$10$GBO.SNIndIrdAqO0ChdPmOpDBNTA27VKgF5u35PvgdJ.dgQj.n7oy',
            grupo_id: 2,
            nome: 'João Silva',
            email: 'joao@aluno.ipca.pt'
        },
        { 
            _id: 3,
            login: 'Funcionario1',
            password: '$2a$10$I7l5XBkqo3BFROR1UdYcQuqiKK4vwHCXI5rBDA/1Bp8yjn3KFJmMW',
            grupo_id: 3,
            nome: 'Maria Funcionária',
            email: 'maria@ipca.pt'
        }
    ],
    cursos: [
        { _id: 1, nome: 'Engenharia Informática', descricao: 'Curso de 3 anos' },
        { _id: 2, nome: 'Gestão Empresarial', descricao: 'Curso de 3 anos' }
    ],
    disciplinas: [
        { _id: 1, nome: 'Programação Web', curso_id: 1 },
        { _id: 2, nome: 'Bases de Dados', curso_id: 1 },
        { _id: 3, nome: 'Contabilidade', curso_id: 2 }
    ],
    plano_estudos: [
        { _id: 1, curso_id: 1, disciplina_id: 1, ano: 1, semestre: 1 },
        { _id: 2, curso_id: 1, disciplina_id: 2, ano: 1, semestre: 2 }
    ],
    alunos: [],
    pautas: [],
    notas: []
};

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'ipca_secret_key_2024',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1800000 } // 30 minutos
}));

// ============================================================
// ROTAS DE AUTENTICAÇÃO
// ============================================================

// Página de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// API: Login
app.post('/api/login', async (req, res) => {
    const { login, password } = req.body;
    
    if (!login || !password) {
        return res.status(400).json({ error: 'Login e password são obrigatórios' });
    }
    
    // Encontrar user
    const user = db.users.find(u => u.login === login);
    if (!user) {
        return res.status(401).json({ error: 'Utilizador não existe' });
    }
    
    // Verificar password
    try {
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Password incorreta' });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Erro ao verificar password' });
    }
    
    // Guardar na sessão
    req.session.user = {
        id: user._id,
        login: user.login,
        nome: user.nome,
        grupo_id: user.grupo_id,
        email: user.email
    };
    
    res.json({ 
        success: true, 
        message: 'Login com sucesso!',
        user: req.session.user
    });
});

// API: Logout
app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'Logout com sucesso!' });
});

// API: Sessão atual
app.get('/api/sessao', (req, res) => {
    if (req.session && req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ error: 'Não autenticado' });
    }
});

// ============================================================
// MIDDLEWARE: VERIFICAÇÃO AUTENTICAÇÃO
// ============================================================
function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    if (req.path.startsWith('/api/')) {
        return res.status(401).json({ error: 'Não autenticado' });
    }
    return res.redirect('/login');
}

// ============================================================
// ROTAS PÚBLICO
// ============================================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/sobre', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sobre.html'));
});

app.get('/contacto', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contacto.html'));
});

// ============================================================
// ROTAS PROTEGIDAS
// ============================================================
app.get('/dashboard', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/cursos', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cursos.html'));
});

app.get('/disciplinas', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'disciplinas.html'));
});

app.get('/alunos', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'alunos.html'));
});

app.get('/pautas', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pautas.html'));
});

app.get('/fichas', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'fichas.html'));
});

// ============================================================
// APIs: CURSOS
// ============================================================
app.get('/api/cursos', requireAuth, (req, res) => {
    res.json(db.cursos);
});

app.post('/api/cursos', requireAuth, (req, res) => {
    const { nome, descricao } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome obrigatório' });
    
    const newId = Math.max(...db.cursos.map(c => c._id), 0) + 1;
    const curso = { _id: newId, nome, descricao };
    db.cursos.push(curso);
    
    res.json({ success: true, curso });
});

app.put('/api/cursos/:id', requireAuth, (req, res) => {
    const id = parseInt(req.params.id);
    const { nome, descricao } = req.body;
    
    const curso = db.cursos.find(c => c._id === id);
    if (!curso) return res.status(404).json({ error: 'Curso não encontrado' });
    
    if (nome) curso.nome = nome;
    if (descricao) curso.descricao = descricao;
    
    res.json({ success: true, curso });
});

app.delete('/api/cursos/:id', requireAuth, (req, res) => {
    const id = parseInt(req.params.id);
    const index = db.cursos.findIndex(c => c._id === id);
    if (index === -1) return res.status(404).json({ error: 'Curso não encontrado' });
    
    db.cursos.splice(index, 1);
    res.json({ success: true });
});

// ============================================================
// APIs: DISCIPLINAS
// ============================================================
app.get('/api/disciplinas', requireAuth, (req, res) => {
    res.json(db.disciplinas);
});

app.post('/api/disciplinas', requireAuth, (req, res) => {
    const { nome, curso_id } = req.body;
    if (!nome || !curso_id) return res.status(400).json({ error: 'Nome e curso obrigatórios' });
    
    const newId = Math.max(...db.disciplinas.map(d => d._id), 0) + 1;
    const disciplina = { _id: newId, nome, curso_id };
    db.disciplinas.push(disciplina);
    
    res.json({ success: true, disciplina });
});

// ============================================================
// APIs: ALUNOS
// ============================================================
app.get('/api/alunos', requireAuth, (req, res) => {
    res.json(db.alunos);
});

app.post('/api/alunos', requireAuth, async (req, res) => {
    const { login, nome_completo, email, telefone, morada, data_nascimento, curso_id, password } = req.body;
    
    if (!login || !nome_completo || !password) {
        return res.status(400).json({ error: 'Login, nome e password obrigatórios' });
    }
    
    // Verificar se login já existe
    const exists = db.users.find(u => u.login === login);
    if (exists) {
        return res.status(400).json({ error: 'Login já existe' });
    }
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = Math.max(...db.users.map(u => u._id), 0) + 1;
        const alunoId = Math.max(...db.alunos.map(a => a._id), 0) + 1;
        
        // Criar user
        db.users.push({
            _id: userId,
            login,
            password: hashedPassword,
            grupo_id: 2, // ALUNO
            nome: nome_completo,
            email
        });
        
        // Criar aluno
        const aluno = {
            _id: alunoId,
            user_id: userId,
            nome_completo,
            email,
            telefone,
            morada,
            data_nascimento,
            curso_id
        };
        db.alunos.push(aluno);
        
        res.json({ success: true, aluno });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================================
// APIs: PAUTAS
// ============================================================
app.get('/api/pautas', requireAuth, (req, res) => {
    res.json(db.pautas);
});

app.post('/api/pautas', requireAuth, (req, res) => {
    const { disciplina_id, epoca, ano_letivo } = req.body;
    if (!disciplina_id || !epoca || !ano_letivo) {
        return res.status(400).json({ error: 'Campos obrigatórios' });
    }
    
    const newId = Math.max(...db.pautas.map(p => p._id), 0) + 1;
    const pauta = { _id: newId, disciplina_id, epoca, ano_letivo, criada_em: new Date() };
    db.pautas.push(pauta);
    
    res.json({ success: true, pauta });
});

// ============================================================
// INICIAR SERVIDOR
// ============================================================
app.listen(PORT, () => {
    console.log(`🎓 Servidor IPCA Gestão Académica em http://127.0.0.1:${PORT}/`);
    console.log(`📝 Login de teste: gestor1 / gestor1`);
    console.log(`📝 Login de teste: aluno1 / aluno1`);
    console.log(`📝 Login de teste: Funcionario1 / Funcionario1`);
});
