const bcrypt = require('bcryptjs');

async function generateHashes() {
    console.log('Gerando hashes de password...\n');
    
    const passwords = {
        'gestor1': 'gestor1',
        'aluno1': 'aluno1',
        'Funcionario1': 'Funcionario1'
    };
    
    for (const [login, password] of Object.entries(passwords)) {
        const hash = await bcrypt.hash(password, 10);
        console.log(`Login: ${login}`);
        console.log(`Password: ${password}`);
        console.log(`Hash: ${hash}\n`);
    }
}

generateHashes();
