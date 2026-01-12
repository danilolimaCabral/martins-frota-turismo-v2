import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log('🔧 Criando usuário de teste...');

try {
  // Gerar hash da senha
  const passwordHash = await bcrypt.hash('teste123', 10);
  
  // Inserir usuário
  await connection.execute(
    `INSERT INTO local_users (username, password, email, name, role, permissions, active) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['teste', passwordHash, 'teste@martins.com', 'Usuário Teste', 'user', JSON.stringify({frota: true}), true]
  );
  
  console.log('✅ Usuário de teste criado com sucesso!');
  console.log('📧 Username: teste');
  console.log('🔑 Password: teste123');
  console.log('🔒 Permissões: Apenas Frota');
  
} catch (error) {
  if (error.code === 'ER_DUP_ENTRY') {
    console.log('⚠️  Usuário "teste" já existe!');
  } else {
    console.error('❌ Erro ao criar usuário:', error);
  }
} finally {
  await connection.end();
}
