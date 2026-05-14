const { MongoClient } = require('mongodb');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const mongoUri = "mongodb://a35705_db_user:simaopedro@ac-lzdkvxi-shard-00-00.ottvzzm.mongodb.net:27017,ac-lzdkvxi-shard-00-01.ottvzzm.mongodb.net:27017,ac-lzdkvxi-shard-00-02.ottvzzm.mongodb.net:27017/?ssl=true&replicaSet=atlas-ou68hs-shard-0&authSource=admin&appName=Cluster0";

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ipca'
});

async function migrate() {
    let mongoClient;
    try {
        console.log('🔄 A iniciar migração de MySQL para MongoDB...\n');

        // Conectar ao MongoDB
        mongoClient = new MongoClient(mongoUri);
        await mongoClient.connect();
        const db = mongoClient.db('ipca_academica');
        
        console.log('✅ Conectado ao MongoDB Atlas\n');

        // ============================================================
        // 1. MIGRAR GRUPOS
        // ============================================================
        console.log('📋 A migrar grupos...');
        const [grupos] = await pool.execute('SELECT * FROM grupos');
        
        const gruposCollection = db.collection('grupos');
        try {
            await gruposCollection.drop();
            console.log('   Coleção anterior deletada');
        } catch (e) {}
        
        if (grupos.length > 0) {
            const gruposData = grupos.map(g => ({
                _id: g.ID,
                GRUPO: g.GRUPO
            }));
            
            await gruposCollection.insertMany(gruposData);
            console.log(`   ✅ ${gruposData.length} grupos migrados\n`);
        }

        // ============================================================
        // 2. MIGRAR USERS
        // ============================================================
        console.log('👥 A migrar utilizadores...');
        const [users] = await pool.execute('SELECT * FROM users');
        
        const usuariosCollection = db.collection('usuarios');
        try {
            await usuariosCollection.drop();
            console.log('   Coleção anterior deletada');
        } catch (e) {}
        
        if (users.length > 0) {
            const usuariosData = [];
            for (const u of users) {
                // Mapear papel (grupo -> papel)
                // grupo 1 = ADMIN, grupo 2 = ALUNO, grupo 3 = FUNCIONARIO
                let papel = 'ALUNO';
                if (u.grupo === 1) papel = 'ADMIN';
                else if (u.grupo === 2) papel = 'ALUNO';
                else if (u.grupo === 3) papel = 'FUNCIONARIO';
                
                // Gerar hash da password usando o login como password padrão
                const passwordHash = await bcrypt.hash(u.login, 10);
                
                usuariosData.push({
                    login: u.login,
                    password: passwordHash,
                    papel: papel,
                    nome: u.nome || u.login,
                    email: u.email || '',
                    ativo: 1,
                    criadoEm: new Date()
                });
            }
            
            await usuariosCollection.insertMany(usuariosData);
            console.log(`   ✅ ${usuariosData.length} utilizadores migrados\n`);
        }

        // ============================================================
        // 3. MIGRAR CURSOS
        // ============================================================
        console.log('📚 A migrar cursos...');
        const [cursos] = await pool.execute('SELECT * FROM cursos');
        
        const cursosCollection = db.collection('cursos');
        try {
            await cursosCollection.drop();
        } catch (e) {}
        
        if (cursos.length > 0) {
            const cursosData = cursos.map(c => ({
                _id: new (require('mongodb')).ObjectId(),
                ID: c.ID,
                Nome: c.Nome,
                ativo: c.ativo,
                descricao: c.descricao
            }));
            
            await cursosCollection.insertMany(cursosData);
            console.log(`   ✅ ${cursosData.length} cursos migrados\n`);
        }

        // ============================================================
        // 4. MIGRAR DISCIPLINAS
        // ============================================================
        console.log('🎓 A migrar disciplinas...');
        const [disciplinas] = await pool.execute('SELECT * FROM disciplinas');
        
        const disciplinasCollection = db.collection('disciplinas');
        try {
            await disciplinasCollection.drop();
        } catch (e) {}
        
        if (disciplinas.length > 0) {
            const disciplinasData = disciplinas.map(d => ({
                _id: new (require('mongodb')).ObjectId(),
                ID: d.ID,
                Nome_disc: d.Nome_disc
            }));
            
            await disciplinasCollection.insertMany(disciplinasData);
            console.log(`   ✅ ${disciplinasData.length} disciplinas migradas\n`);
        }

        // ============================================================
        // 5. MIGRAR ÉPOCAS
        // ============================================================
        console.log('📅 A migrar épocas...');
        const [epocas] = await pool.execute('SELECT * FROM epocas');
        
        const epocasCollection = db.collection('epocas');
        try {
            await epocasCollection.drop();
        } catch (e) {}
        
        if (epocas.length > 0) {
            const epocasData = epocas.map(e => ({
                _id: new (require('mongodb')).ObjectId(),
                id: e.id,
                nome: e.nome
            }));
            
            await epocasCollection.insertMany(epocasData);
            console.log(`   ✅ ${epocasData.length} épocas migradas\n`);
        }

        // ============================================================
        // 6. MIGRAR PLANO DE ESTUDOS
        // ============================================================
        console.log('📖 A migrar plano de estudos...');
        const [planoEstudos] = await pool.execute('SELECT * FROM plano_estudos');
        
        const planoCollection = db.collection('plano_estudos');
        try {
            await planoCollection.drop();
        } catch (e) {}
        
        if (planoEstudos.length > 0) {
            const planoData = planoEstudos.map(p => ({
                CURSOS: new (require('mongodb')).ObjectId(),
                DISCIPLINA: new (require('mongodb')).ObjectId(),
                semestre: p.semestre,
                ano: p.ano
            }));
            
            await planoCollection.insertMany(planoData);
            console.log(`   ✅ ${planoData.length} registos de plano de estudos migrados\n`);
        }

        // ============================================================
        // 7. MIGRAR FICHAS DE ALUNO
        // ============================================================
        console.log('📝 A migrar fichas de aluno...');
        const [fichas] = await pool.execute('SELECT * FROM ficha_aluno');
        
        const fichasCollection = db.collection('ficha_aluno');
        try {
            await fichasCollection.drop();
        } catch (e) {}
        
        if (fichas.length > 0) {
            const fichasData = fichas.map(f => ({
                _id: new (require('mongodb')).ObjectId(),
                login: f.login,
                nome_completo: f.nome_completo,
                email: f.email,
                telefone: f.telefone,
                morada: f.morada,
                data_nascimento: f.data_nascimento,
                foto: f.foto,
                curso_id: new (require('mongodb')).ObjectId(),
                estado: f.estado,
                observacoes: f.observacoes,
                data_submissao: f.data_submissao,
                data_validacao: f.data_validacao,
                validado_por: f.validado_por
            }));
            
            await fichasCollection.insertMany(fichasData);
            console.log(`   ✅ ${fichasData.length} fichas de aluno migradas\n`);
        }

        // ============================================================
        // 8. MIGRAR PEDIDOS DE MATRÍCULA
        // ============================================================
        console.log('📋 A migrar pedidos de matrícula...');
        const [pedidos] = await pool.execute('SELECT * FROM pedidos_matricula');
        
        const pedidosCollection = db.collection('pedidos_matricula');
        try {
            await pedidosCollection.drop();
        } catch (e) {}
        
        if (pedidos.length > 0) {
            const pedidosData = pedidos.map(p => ({
                _id: new (require('mongodb')).ObjectId(),
                login_aluno: p.login_aluno,
                curso_id: new (require('mongodb')).ObjectId(),
                curso_id2: p.curso_id2 ? new (require('mongodb')).ObjectId() : null,
                curso_id3: p.curso_id3 ? new (require('mongodb')).ObjectId() : null,
                data_pedido: p.data_pedido,
                estado: p.estado,
                observacoes: p.observacoes,
                data_decisao: p.data_decisao,
                decisor_login: p.decisor_login
            }));
            
            await pedidosCollection.insertMany(pedidosData);
            console.log(`   ✅ ${pedidosData.length} pedidos de matrícula migrados\n`);
        }

        // ============================================================
        // 9. MIGRAR PAUTAS
        // ============================================================
        console.log('📊 A migrar pautas...');
        const [pautas] = await pool.execute('SELECT * FROM pautas');
        
        const pautasCollection = db.collection('pautas');
        try {
            await pautasCollection.drop();
        } catch (e) {}
        
        if (pautas.length > 0) {
            const pautasData = pautas.map(p => ({
                _id: new (require('mongodb')).ObjectId(),
                disciplina_id: new (require('mongodb')).ObjectId(),
                epoca_id: new (require('mongodb')).ObjectId(),
                ano_letivo: p.ano_letivo,
                data_criacao: p.data_criacao,
                criado_por: p.criado_por
            }));
            
            await pautasCollection.insertMany(pautasData);
            console.log(`   ✅ ${pautasData.length} pautas migradas\n`);
        }

        // ============================================================
        // 10. MIGRAR NOTAS
        // ============================================================
        console.log('⭐ A migrar notas...');
        const [notas] = await pool.execute('SELECT * FROM notas');
        
        const notasCollection = db.collection('notas');
        try {
            await notasCollection.drop();
        } catch (e) {}
        
        if (notas.length > 0) {
            const notasData = notas.map(n => ({
                _id: new (require('mongodb')).ObjectId(),
                pauta_id: new (require('mongodb')).ObjectId(),
                aluno_login: n.aluno_login,
                nota: n.nota,
                data_lancamento: n.data_lancamento,
                lancado_por: n.lancado_por
            }));
            
            await notasCollection.insertMany(notasData);
            console.log(`   ✅ ${notasData.length} notas migradas\n`);
        }

        // ============================================================
        // 11. CRIAR ÍNDICES
        // ============================================================
        console.log('🔑 A criar índices...');
        
        await usuariosCollection.createIndex({ login: 1 }, { unique: true });
        await gruposCollection.createIndex({ GRUPO: 1 });
        await cursosCollection.createIndex({ Nome: 1 });
        await disciplinasCollection.createIndex({ Nome_disc: 1 });
        await fichasCollection.createIndex({ login: 1 });
        await fichasCollection.createIndex({ email: 1 }, { unique: true });
        await epocasCollection.createIndex({ nome: 1 });
        
        console.log('   ✅ Índices criados\n');

        console.log('🎉 ✨ Migração concluída com sucesso!');
        console.log('\n📝 Próximo passo: node app.js\n');

    } catch (err) {
        console.error('❌ Erro na migração:', err.message);
    } finally {
        if (mongoClient) await mongoClient.close();
        await pool.end();
        process.exit(0);
    }
}

migrate();
