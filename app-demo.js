const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3001;

// ============================================================
// DADOS EM MEMÓRIA (SIMULAÇÃO) - ESTRUTURA MONGODB DESNORMALIZADA
// ============================================================
let db = {
    // ===== UTILIZADORES =====
    usuarios: [
        { 
            _id: 1,
            login: 'gestor1',
            password: '$2a$10$TW07a2dkl6dDaI7gdJD9ROatkfGO5spM0ZR3rxXR7czNQ1Tb4FR4e',
            papel: 'ADMIN',
            nome: 'Gestor Sistema',
            email: 'gestor@ipca.pt',
            ativo: true,
            criadoEm: new Date()
        },
        { 
            _id: 2,
            login: 'aluno1',
            password: '$2a$10$GBO.SNIndIrdAqO0ChdPmOpDBNTA27VKgF5u35PvgdJ.dgQj.n7oy',
            papel: 'ALUNO',
            nome: 'João Silva',
            email: 'joao@aluno.ipca.pt',
            ativo: true,
            criadoEm: new Date()
        },
        { 
            _id: 3,
            login: 'Funcionario1',
            password: '$2a$10$I7l5XBkqo3BFROR1UdYcQuqiKK4vwHCXI5rBDA/1Bp8yjn3KFJmMW',
            papel: 'FUNCIONARIO',
            nome: 'Maria Funcionária',
            email: 'maria@ipca.pt',
            ativo: true,
            criadoEm: new Date()
        }
    ],
    
    // ===== CURSOS COM DISCIPLINAS DESNORMALIZADAS =====
    cursos: [
        { 
            _id: 1, 
            nome: 'Engenharia Informática', 
            descricao: 'Curso de 3 anos',
            ativo: true,
            criadoEm: new Date(),
            disciplinas: [
                {
                    _id: 101,
                    nome: 'Programação Web',
                    ano: 1,
                    semestre: 1,
                    horas: 60,
                    professor: 'Prof. Técnico'
                },
                {
                    _id: 102,
                    nome: 'Bases de Dados',
                    ano: 1,
                    semestre: 2,
                    horas: 60,
                    professor: 'Prof. Técnico'
                },
                {
                    _id: 103,
                    nome: 'Algoritmos Avançados',
                    ano: 2,
                    semestre: 1,
                    horas: 75,
                    professor: 'Prof. Técnico'
                }
            ]
        },
        { 
            _id: 2, 
            nome: 'Gestão Empresarial', 
            descricao: 'Curso de 3 anos',
            ativo: true,
            criadoEm: new Date(),
            disciplinas: [
                {
                    _id: 201,
                    nome: 'Contabilidade',
                    ano: 1,
                    semestre: 1,
                    horas: 60,
                    professor: 'Prof. Gestão'
                },
                {
                    _id: 202,
                    nome: 'Economia',
                    ano: 1,
                    semestre: 2,
                    horas: 60,
                    professor: 'Prof. Gestão'
                }
            ]
        }
    ],
    
    // ===== ALUNOS COM HISTÓRICO ACADÉMICO =====
    alunos: [
        {
            _id: 1001,
            login: 'ana.costa',
            nome: 'Ana Costa',
            email: 'ana@aluno.ipca.pt',
            curso_id: 1,
            ano_atual: 1,
            semestre_atual: 1,
            ativo: true,
            matriculadoEm: new Date(),
            notas: [
                {
                    disciplina_id: 101,
                    disciplina_nome: 'Programação Web',
                    nota: 16,
                    data: new Date()
                }
            ]
        }
    ],
    
    // ===== PAUTAS (RESUMO DE AVALIAÇÕES) =====
    pautas: [
        {
            _id: 1,
            curso_id: 1,
            disciplina_id: 101,
            disciplina_nome: 'Programação Web',
            ano: 1,
            semestre: 1,
            epoca: 'normal',
            criadaEm: new Date(),
            alunos: [
                {
                    aluno_id: 1001,
                    aluno_nome: 'Ana Costa',
                    nota: 16,
                    presenca: true,
                    dataExame: new Date()
                }
            ]
        }
    ]
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
    
    // Encontrar usuario
    const usuario = db.usuarios.find(u => u.login === login);
    if (!usuario) {
        return res.status(401).json({ error: 'Utilizador não existe' });
    }
    
    // Verificar password
    try {
        const isValid = await bcrypt.compare(password, usuario.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Password incorreta' });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Erro ao verificar password' });
    }
    
    // Guardar na sessão
    req.session.user = {
        id: usuario._id,
        login: usuario.login,
        nome: usuario.nome,
        papel: usuario.papel,
        email: usuario.email
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
// APIs: DISCIPLINAS (Desnormalizadas dentro de Cursos)
// ============================================================
// Obter todas as disciplinas de todos os cursos
app.get('/api/disciplinas', requireAuth, (req, res) => {
    const todasDisciplinas = [];
    db.cursos.forEach(curso => {
        curso.disciplinas.forEach(disc => {
            todasDisciplinas.push({
                ...disc,
                curso_id: curso._id,
                curso_nome: curso.nome
            });
        });
    });
    res.json(todasDisciplinas);
});

// Adicionar disciplina a um curso
app.post('/api/disciplinas', requireAuth, (req, res) => {
    const { nome, curso_id, ano, semestre, horas, professor } = req.body;
    if (!nome || !curso_id || !ano || !semestre) {
        return res.status(400).json({ error: 'Nome, curso, ano e semestre obrigatórios' });
    }
    
    const curso = db.cursos.find(c => c._id === parseInt(curso_id));
    if (!curso) return res.status(404).json({ error: 'Curso não encontrado' });
    
    const newId = Math.max(...curso.disciplinas.map(d => d._id), 0) + 1;
    const disciplina = { _id: newId, nome, ano: parseInt(ano), semestre: parseInt(semestre), horas: horas || 60, professor };
    
    curso.disciplinas.push(disciplina);
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
// APIs: PAUTAS (Com dados desnormalizados)
// ============================================================
app.get('/api/pautas', requireAuth, (req, res) => {
    res.json(db.pautas);
});

// Criar nova pauta (folha de avaliação)
app.post('/api/pautas', requireAuth, (req, res) => {
    const { curso_id, disciplina_id, disciplina_nome, ano, semestre, epoca } = req.body;
    if (!curso_id || !disciplina_id || !ano || !semestre || !epoca) {
        return res.status(400).json({ error: 'Campos obrigatórios' });
    }
    
    const newId = Math.max(...db.pautas.map(p => p._id), 0) + 1;
    const pauta = { 
        _id: newId, 
        curso_id: parseInt(curso_id),
        disciplina_id: parseInt(disciplina_id),
        disciplina_nome: disciplina_nome,
        ano: parseInt(ano), 
        semestre: parseInt(semestre),
        epoca: epoca, 
        criadaEm: new Date(),
        alunos: []
    };
    db.pautas.push(pauta);
    
    res.json({ success: true, pauta });
});

// Adicionar nota a um aluno na pauta
app.post('/api/pautas/:id/notas', requireAuth, (req, res) => {
    const pautaId = parseInt(req.params.id);
    const { aluno_id, aluno_nome, nota } = req.body;
    
    const pauta = db.pautas.find(p => p._id === pautaId);
    if (!pauta) return res.status(404).json({ error: 'Pauta não encontrada' });
    
    const alunoExistente = pauta.alunos.find(a => a.aluno_id === parseInt(aluno_id));
    if (alunoExistente) {
        alunoExistente.nota = parseInt(nota);
    } else {
        pauta.alunos.push({
            aluno_id: parseInt(aluno_id),
            aluno_nome: aluno_nome,
            nota: parseInt(nota),
            presenca: true,
            dataExame: new Date()
        });
    }
    
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
