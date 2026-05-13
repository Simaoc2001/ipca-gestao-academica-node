/**
 * IPCA - Migração MySQL → MongoDB (Desnormalizado)
 * 
 * Script que importa dados reais do MySQL e os insere
 * no MongoDB com a estrutura DESNORMALIZADA
 * 
 * Uso: node migrate-to-mongodb.js
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const mongoUri = process.env.MONGODB_URI;
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ipca'
});

async function migrate() {
    let mongoClient;
    try {
        console.log('🔄 Migração MySQL → MongoDB (Desnormalizado)\n');

        // Conectar ao MongoDB
        mongoClient = new MongoClient(mongoUri);
        await mongoClient.connect();
        const db = mongoClient.db('ipca_academica');
        console.log('✅ Conectado ao MongoDB Atlas\n');

        // ============================================================
        // 1. IMPORTAR GRUPOS E USERS → USUARIOS (Desnormalizado)
        // ============================================================
        console.log('👥 A migrar utilizadores...');
        const [grupos] = await pool.execute('SELECT * FROM grupos');
        const [users] = await pool.execute('SELECT * FROM users');

        try {
            await db.collection('usuarios').drop();
        } catch (e) {}

        if (users.length > 0) {
            const usuariosData = await Promise.all(
                users.map(async (u) => {
                    const grupo = grupos.find(g => g.ID === u.grupo);
                    const papel = grupo ? grupo.GRUPO : 'ALUNO';
                    const hashedPassword = await bcrypt.hash(u.pwd || 'senha123', 10);

                    return {
                        _id: u.ID || Math.random(),
                        login: u.login,
                        password: hashedPassword,
                        papel: papel,
                        nome: u.login,
                        email: `${u.login}@ipca.pt`,
                        ativo: true,
                        criadoEm: new Date()
                    };
                })
            );

            await db.collection('usuarios').insertMany(usuariosData);
            console.log(`   ✅ ${usuariosData.length} utilizadores importados\n`);
        }

        // ============================================================
        // 2. IMPORTAR CURSOS COM DISCIPLINAS (Desnormalizado)
        // ============================================================
        console.log('📚 A migrar cursos com disciplinas...');
        const [cursos] = await pool.execute('SELECT * FROM cursos');
        const [disciplinas] = await pool.execute('SELECT * FROM disciplinas');
        const [planoEstudos] = await pool.execute('SELECT * FROM plano_estudos');

        try {
            await db.collection('cursos').drop();
        } catch (e) {}

        if (cursos.length > 0) {
            const cursosData = cursos.map((c) => {
                // Obter disciplinas deste curso
                const disciplinasCurso = planoEstudos
                    .filter(p => p.CURSOS === c.ID)
                    .map(p => {
                        const disc = disciplinas.find(d => d.ID === p.DISCIPLINA);
                        return {
                            _id: p.DISCIPLINA || Math.random(),
                            nome: disc ? disc.Nome_disc : 'Disciplina desconhecida',
                            ano: p.ano,
                            semestre: p.semestre,
                            horas: 60,
                            professor: '-'
                        };
                    });

                return {
                    _id: c.ID,
                    nome: c.Nome,
                    descricao: c.descricao || '',
                    ativo: c.ativo === 1,
                    criadoEm: new Date(),
                    disciplinas: disciplinasCurso
                };
            });

            await db.collection('cursos').insertMany(cursosData);
            console.log(`   ✅ ${cursosData.length} cursos com ${disciplinas.length} disciplinas importados\n`);
        }

        // ============================================================
        // 3. IMPORTAR FICHAS DE ALUNOS (como alunos)
        // ============================================================
        console.log('👨‍🎓 A migrar fichas de alunos...');
        const [fichas] = await pool.execute('SELECT * FROM ficha_aluno');

        try {
            await db.collection('alunos').drop();
        } catch (e) {}

        if (fichas.length > 0) {
            const alunosData = fichas.map((f) => ({
                _id: f.ID || Math.random(),
                login: f.login,
                nome: f.nome_completo,
                email: f.email,
                curso_id: f.curso_id || 1,
                ano_atual: 1,
                semestre_atual: 1,
                ativo: f.estado === 'aprovada',
                matriculadoEm: f.data_submissao || new Date(),
                notas: [] // Será preenchido depois
            }));

            await db.collection('alunos').insertMany(alunosData);
            console.log(`   ✅ ${alunosData.length} alunos importados\n`);
        }

        // ============================================================
        // 4. IMPORTAR PAUTAS COM NOTAS (Desnormalizado)
        // ============================================================
        console.log('📊 A migrar pautas com notas...');
        const [pautas] = await pool.execute('SELECT * FROM pautas');
        const [notas] = await pool.execute('SELECT * FROM notas');
        const [epocas] = await pool.execute('SELECT * FROM epocas');

        try {
            await db.collection('pautas').drop();
        } catch (e) {}

        if (pautas.length > 0) {
            const pautasData = pautas.map((p) => {
                const epoca = epocas.find(e => e.id === p.epoca_id);
                const notasPauta = notas
                    .filter(n => n.pauta_id === p.ID)
                    .map(n => ({
                        aluno_id: n.aluno_login ? 
                            fichas.find(f => f.login === n.aluno_login)?.ID : Math.random(),
                        aluno_nome: n.aluno_login,
                        nota: n.nota,
                        presenca: true,
                        dataExame: n.data_lancamento || new Date()
                    }));

                return {
                    _id: p.ID,
                    curso_id: p.curso_id || 1,
                    disciplina_id: p.disciplina_id || 1,
                    disciplina_nome: disciplinas.find(d => d.ID === p.disciplina_id)?.Nome_disc || '-',
                    ano: parseInt(p.ano_letivo?.split('/')[0]) || 1,
                    semestre: 1,
                    epoca: epoca?.nome?.toLowerCase() || 'normal',
                    criadaEm: p.data_criacao || new Date(),
                    alunos: notasPauta
                };
            });

            await db.collection('pautas').insertMany(pautasData);
            console.log(`   ✅ ${pautasData.length} pautas com notas importadas\n`);
        }

        // ============================================================
        // 5. CRIAR ÍNDICES
        // ============================================================
        console.log('🔑 A criar índices...');
        
        await db.collection('usuarios').createIndex({ login: 1 }, { unique: true });
        await db.collection('usuarios').createIndex({ papel: 1 });
        
        await db.collection('cursos').createIndex({ nome: 1 });
        await db.collection('cursos').createIndex({ 'disciplinas.ano': 1 });
        
        await db.collection('alunos').createIndex({ login: 1 }, { unique: true });
        await db.collection('alunos').createIndex({ curso_id: 1 });
        
        await db.collection('pautas').createIndex({ curso_id: 1, disciplina_id: 1, epoca: 1 });
        
        console.log('   ✅ Índices criados\n');

        // ============================================================
        // 6. RESUMO
        // ============================================================
        const statsUsuarios = await db.collection('usuarios').countDocuments();
        const statsCursos = await db.collection('cursos').countDocuments();
        const statsAlunos = await db.collection('alunos').countDocuments();
        const statsPautas = await db.collection('pautas').countDocuments();

        console.log('🎉 ✨ Migração concluída com sucesso!\n');
        console.log('📊 Resumo dos dados importados:');
        console.log(`   - Utilizadores: ${statsUsuarios}`);
        console.log(`   - Cursos: ${statsCursos}`);
        console.log(`   - Alunos: ${statsAlunos}`);
        console.log(`   - Pautas: ${statsPautas}\n`);
        console.log('✅ Próximo passo: npm start ou node app.js\n');

    } catch (err) {
        console.error('❌ Erro na migração:', err.message);
        console.error(err);
    } finally {
        if (mongoClient) await mongoClient.close();
        await pool.end();
        process.exit(0);
    }
}

migrate();
