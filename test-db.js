const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '91.107.237.159',
  database: 'db_finance',
  password: 'lYPS50GDgjiA6QEL0GG0qHefqqGcGo8I2njYiBkpxlSuuhMv8Lpv1K2VY',
  port: 5432,
  ssl: false
});

async function testConnection() {
  try {
    console.log('🔌 Tentando conectar ao banco de dados...');
    const client = await pool.connect();
    console.log('✅ Conexão com PostgreSQL bem-sucedida!');
    
    // Testar se a tabela users existe
    const result = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users';");
    
    if (result.rows.length > 0) {
      console.log('✅ Tabela users existe!');
      
      // Verificar estrutura da tabela
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position;
      `);
      
      console.log('📋 Estrutura da tabela users:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
      
    } else {
      console.log('❌ Tabela users não existe!');
      console.log('💡 Execute o script SQL para criar as tabelas');
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 PostgreSQL não está rodando ou não aceita conexões na porta 5432');
    } else if (error.code === '3D000') {
      console.log('💡 Banco de dados "financespro" não existe');
    } else if (error.code === '28P01') {
      console.log('💡 Credenciais incorretas (usuário/senha)');
    }
  } finally {
    await pool.end();
  }
}

testConnection();