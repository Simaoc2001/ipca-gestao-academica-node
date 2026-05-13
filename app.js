require('dotenv').config();
const express = require('express');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================
// CONFIGURAÇÃO MONGODB
// ============================================================
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error('❌ MONGODB_URI não configurado em .env');
    process.exit(1);
}
const client = new MongoClient(mongoUri);

let db = null;

async function conectarMongoDB() {
    try {
        await client.connect();
        db = client.db('ipca_academica');
        console.log('✅ Conectado ao MongoDB Atlas');
    } catch (err) {
        console.error('❌ Erro ao conectar ao MongoDB:', err.message);
        process.exit(1);
    }
}

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'ipca_secret_key_2024',
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

// API - Login
app.post('/api/login', async (req, res) => {
    const { login, password } = req.body;
    if (!login || !password) {
        return res.json({ success: false, message: 'Preencha todos os campos.' });
    }
    try {
        const usuario = await db.collection('usuarios').findOne({ login: login });
        if (!usuario) {
            return res.json({ success: false, message: 'Utilizador não encontrado.' });
        }

        const passwordMatch = await bcrypt.compare(password, usuario.password);
        if (!passwordMatch) {
            return res.json({ success: false, message: 'Password incorreta.' });
        }

        req.session.user = {
            id: usuario._id,
            login: usuario.login,
            nome: usuario.nome,
            papel: usuario.papel,
            email: usuario.email
        };

        res.json({ success: true, message: 'Login bem-sucedido!' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao fazer login: ' + err.message });
    }
});

// API - Logout
app.get('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// API - Sessão atual
app.get('/api/sessao', (req, res) => {
    if (req.session && req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ error: 'Não autenticado' });
    }
});

// ============================================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ============================================================
function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    if (req.path.startsWith('/api/')) {
        return res.status(401).json({ error: 'Não autenticado' });
    }
    res.redirect('/login');
}

// ============================================================
// ROTAS PÚBLICAS
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
// ROTAS PRIVADAS - DASHBOARD
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

app.get('/fichas', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'fichas.html'));
});

app.get('/pautas', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pautas.html'));
});

// ============================================================
// APIs - CURSOS
// ============================================================
app.get('/api/cursos', requireAuth, async (req, res) => {
    try {
        const cursos = await db.collection('cursos').find({ ativo: 1 }).toArray();
        res.json(cursos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/cursos/:id', requireAuth, async (req, res) => {
    try {
        const curso = await db.collection('cursos').findOne({ 
            _id: new ObjectId(req.params.id) 
        });
        if (!curso) return res.status(404).json({ error: 'Curso não encontrado' });
        res.json(curso);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/cursos', requireAuth, async (req, res) => {
    const { nome, descricao } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });
    
    try {
        const result = await db.collection('cursos').insertOne({
            Nome: nome,
            descricao: descricao || '',
            ativo: 1,
            data_criacao: new Date()
        });
        res.json({ success: true, id: result.insertedId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/cursos/:id', requireAuth, async (req, res) => {
    const { nome, descricao, ativo } = req.body;
    try {
        const result = await db.collection('cursos').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { Nome: nome, descricao: descricao, ativo: ativo } }
        );
        res.json({ success: result.modifiedCount > 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================================
// APIs - DISCIPLINAS (Desnormalizadas dentro de Cursos)
// ============================================================
app.get('/api/disciplinas', requireAuth, async (req, res) => {
    try {
        // Obter todas as disciplinas de todos os cursos
        const cursos = await db.collection('cursos').find({}).toArray();
        const todasDisciplinas = [];
        
        cursos.forEach(curso => {
            if (curso.disciplinas) {
                curso.disciplinas.forEach(disc => {
                    todasDisciplinas.push({
                        ...disc,
                        curso_id: curso._id,
                        curso_nome: curso.nome
                    });
                });
            }
        });
        
        res.json(todasDisciplinas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/disciplinas', requireAuth, async (req, res) => {
    const { nome, curso_id, ano, semestre, horas, professor } = req.body;
    if (!nome || !curso_id) return res.status(400).json({ error: 'Nome e curso obrigatórios' });
    
    try {
        const result = await db.collection('cursos').updateOne(
            { _id: new ObjectId(curso_id) },
            {
                $push: {
                    disciplinas: {
                        _id: new Date().getTime(),
                        nome: nome,
                        ano: parseInt(ano) || 1,
                        semestre: parseInt(semestre) || 1,
                        horas: horas || 60,
                        professor: professor || 'TBD'
                    }
                }
            }
        );
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================================
// APIs - PLANO DE ESTUDOS
// ============================================================
app.get('/api/plano/:curso_id', requireAuth, async (req, res) => {
    try {
        const plano = await db.collection('plano_estudos')
            .aggregate([
                { $match: { CURSOS: new ObjectId(req.params.curso_id) } },
                {
                    $lookup: {
                        from: 'disciplinas',
                        localField: 'DISCIPLINA',
                        foreignField: '_id',
                        as: 'disciplina'
                    }
                }
            ])
            .toArray();
        res.json(plano);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================================
// APIs - ALUNOS
// ============================================================
app.get('/api/alunos', requireAuth, async (req, res) => {
    try {
        const alunos = await db.collection('ficha_aluno')
            .aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'login',
                        foreignField: 'login',
                        as: 'user'
                    }
                }
            ])
            .toArray();
        res.json(alunos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/alunos', requireAuth, async (req, res) => {
    const { login, nome_completo, email, telefone, morada, data_nascimento, curso_id } = req.body;
    
    try {
        const result = await db.collection('ficha_aluno').insertOne({
            login,
            nome_completo,
            email,
            telefone,
            morada,
            data_nascimento,
            foto: null,
            curso_id: new ObjectId(curso_id),
            estado: 'rascunho',
            data_submissao: null
        });
        res.json({ success: true, id: result.insertedId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================================
// APIs - PAUTAS
// ============================================================
app.get('/api/pautas', requireAuth, async (req, res) => {
    try {
        const pautas = await db.collection('pautas')
            .aggregate([
                {
                    $lookup: {
                        from: 'disciplinas',
                        localField: 'disciplina_id',
                        foreignField: '_id',
                        as: 'disciplina'
                    }
                },
                {
                    $lookup: {
                        from: 'epocas',
                        localField: 'epoca_id',
                        foreignField: '_id',
                        as: 'epoca'
                    }
                }
            ])
            .toArray();
        res.json(pautas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/pautas', requireAuth, async (req, res) => {
    const { disciplina_id, epoca_id, ano_letivo } = req.body;
    
    try {
        const result = await db.collection('pautas').insertOne({
            disciplina_id: new ObjectId(disciplina_id),
            epoca_id: new ObjectId(epoca_id),
            ano_letivo,
            data_criacao: new Date(),
            criado_por: req.session.user.login
        });
        res.json({ success: true, id: result.insertedId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================================
// INICIALIZAR SERVIDOR
// ============================================================
async function iniciarServidor() {
    await conectarMongoDB();
    app.listen(PORT, () => {
        console.log(`🎓 Servidor IPCA Gestão Académica em http://127.0.0.1:${PORT}/`);
        console.log('📚 Base de dados: MongoDB Atlas (ipca_academica)');
    });
}

iniciarServidor().catch(err => {
    console.error('❌ Erro ao iniciar:', err);
    process.exit(1);
});

process.on('SIGINT', async () => {
    console.log('\n🛑 Encerrando...');
    await client.close();
    process.exit(0);
});
