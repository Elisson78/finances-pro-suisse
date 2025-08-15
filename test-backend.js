const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const PORT = 5000;

// Configuração do banco
const pool = new Pool({
  connectionString: 'postgres://postgres:lYPS50GDgjiA6QEL0REU142DUG0qHefqqGcGo8I2njYiBkpxlSuuhMv8Lpv1K2VY@91.107.237.159:5432/db_finance',
  ssl: false
});

app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'Backend funcionando!' });
});

// Rota de registro
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Dados recebidos:', req.body);
    
    const { email, password, full_name, company } = req.body;

    // Verificar se usuário já existe
    const client = await pool.connect();
    const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);

    if (existingUser.rows.length > 0) {
      client.release();
      return res.status(400).json({
        status: 'error',
        message: 'Email já está em uso'
      });
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

    // Criar usuário
    const result = await client.query(
      'INSERT INTO users (id, email, password_hash, full_name, company) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, email, passwordHash, full_name, company]
    );

    client.release();

    // Gerar JWT
    const token = jwt.sign(
      { id: userId, email, role: 'user' },
      'finances-pro-suisse-secret-key',
      { expiresIn: '24h' }
    );

    const userResponse = {
      id: userId,
      email,
      full_name,
      company_name: company,
      role: 'user',
      created_at: new Date().toISOString()
    };

    console.log('Usuário criado com sucesso:', userResponse);

    res.status(201).json({
      status: 'success',
      message: 'Usuário criado com sucesso',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor: ' + error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor de teste rodando na porta ${PORT}`);
});