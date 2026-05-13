const { MongoClient } = require('mongodb');

const mongoUri = "mongodb://a35705_db_user:simaopedro@ac-lzdkvxi-shard-00-00.ottvzzm.mongodb.net:27017,ac-lzdkvxi-shard-00-01.ottvzzm.mongodb.net:27017,ac-lzdkvxi-shard-00-02.ottvzzm.mongodb.net:27017/?ssl=true&replicaSet=atlas-ou68hs-shard-0&authSource=admin&appName=Cluster0";

async function test() {
    const client = new MongoClient(mongoUri);
    try {
        console.log('🔄 Testando conexão ao MongoDB...');
        await client.connect();
        console.log('✅ Conectado com sucesso!');
        
        const db = client.db('ipca_academica');
        
        // Testar inserção de dados
        console.log('\n📊 Inserindo dados de teste...');
        
        // Inserir grupos
        await db.collection('grupos').deleteMany({});
        const gruposResult = await db.collection('grupos').insertMany([
            { _id: 1, GRUPO: 'ADMIN' },
            { _id: 2, GRUPO: 'ALUNO' },
            { _id: 3, GRUPO: 'FUNCIONARIO' }
        ]);
        console.log(`✅ ${gruposResult.insertedCount} grupos inseridos`);
        
        // Inserir users com bcrypt
        const bcrypt = require('bcryptjs');
        const hashedPassword1 = await bcrypt.hash('gestor1', 10);
        const hashedPassword2 = await bcrypt.hash('aluno1', 10);
        const hashedPassword3 = await bcrypt.hash('Funcionario1', 10);
        
        await db.collection('users').deleteMany({});
        const usersResult = await db.collection('users').insertMany([
            { 
                _id: 1,
                login: 'gestor1', 
                password: hashedPassword1,
                grupo_id: 1,
                nome: 'Gestor Sistema',
                email: 'gestor@ipca.pt'
            },
            { 
                _id: 2,
                login: 'aluno1', 
                password: hashedPassword2,
                grupo_id: 2,
                nome: 'João Silva',
                email: 'joao@aluno.ipca.pt'
            },
            { 
                _id: 3,
                login: 'Funcionario1', 
                password: hashedPassword3,
                grupo_id: 3,
                nome: 'Maria Funcionária',
                email: 'maria@ipca.pt'
            }
        ]);
        console.log(`✅ ${usersResult.insertedCount} users inseridos`);
        
        // Criar índice único em login
        await db.collection('users').createIndex({ login: 1 }, { unique: true });
        console.log('✅ Índice único criado em login');
        
        // Inserir alguns cursos
        await db.collection('cursos').deleteMany({});
        const cursosResult = await db.collection('cursos').insertMany([
            { _id: 1, nome: 'Engenharia Informática', descricao: 'Curso de 3 anos' },
            { _id: 2, nome: 'Gestão Empresarial', descricao: 'Curso de 3 anos' }
        ]);
        console.log(`✅ ${cursosResult.insertedCount} cursos inseridos`);
        
        console.log('\n🎉 Dados de teste inseridos com sucesso!');
        
        // Listar documentos
        const grupos = await db.collection('grupos').find({}).toArray();
        console.log('\n📋 Grupos:', grupos);
        
        const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
        console.log('📋 Users:', users);
        
    } catch (err) {
        console.error('❌ Erro:', err.message);
    } finally {
        await client.close();
        console.log('\n👋 Conexão fechada');
    }
}

test();
