import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';

const db = new Database(process.env.DATABASE_URL?.replace('file:', '') || './local.db');

const hashedPassword = bcrypt.hashSync('motorista123', 10);

const stmt = db.prepare(`
  INSERT INTO users (username, name, email, phone, password, role, active, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const now = new Date().toISOString();

try {
  const result = stmt.run(
    'motorista',
    'João Silva - Motorista',
    'motorista@martinsviagens.com.br',
    '(41) 99999-8888',
    hashedPassword,
    'motorista',
    1,
    now,
    now
  );
  console.log('✅ Usuário motorista criado com sucesso!');
  console.log('Username: motorista');
  console.log('Senha: motorista123');
  console.log('ID:', result.lastInsertRowid);
} catch (error) {
  console.error('❌ Erro ao criar motorista:', error.message);
}

db.close();
