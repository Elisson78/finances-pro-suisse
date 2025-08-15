const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
// Criar uma versão local do database service
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:lYPS50GDgjiA6QEL0REU142DUG0qHefqqGcGo8I2njYiBkpxlSuuhMv8Lpv1K2VY@91.107.237.159:5432/db_finance',
  ssl: false
});

const dbService = {
  async query(text, params = []) {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  },
  async get(text, params = []) {
    const result = await this.query(text, params);
    return result.rows[0] || null;
  },
  async all(text, params = []) {
    const result = await this.query(text, params);
    return result.rows;
  },
  async run(text, params = []) {
    const result = await this.query(text, params);
    return result.rows[0] || null;
  }
};

const router = express.Router();

// JWT Secret (em produção, usar variável de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || 'finances-pro-suisse-secret-key';

// Middleware para validação de erros
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// POST /api/auth/register - Registro
router.post('/register', [
  body('email').isEmail().withMessage('Email válido é obrigatório'),
  body('password').isLength({ min: 8 }).withMessage('Senha deve ter pelo menos 8 caracteres'),
  body('full_name').notEmpty().withMessage('Nome completo é obrigatório'),
  body('company').notEmpty().withMessage('Nome da empresa é obrigatório'),
  body('account_type').optional().isIn(['entreprise', 'administrateur']).withMessage('Tipo de conta deve ser entreprise ou administrateur')
], handleValidationErrors, async (req, res) => {
  try {
    const { email, password, full_name, company, account_type = 'entreprise' } = req.body;

    // Verificar se usuário já existe
    const existingUser = await dbService.get(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email já está em uso'
      });
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 10);

    // Criar usuário (usando UUID padrão do PostgreSQL)
    const newUser = await dbService.run(
      'INSERT INTO users (email, password_hash, full_name, company, account_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [email, passwordHash, full_name, company, account_type]
    );

    // Gerar JWT
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email,
        role: newUser.account_type === 'administrateur' ? 'admin' : 'user'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Retornar dados do usuário (sem senha)
    const userResponse = {
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
      company_name: newUser.company,
      account_type: newUser.account_type || 'entreprise',
      role: newUser.account_type === 'administrateur' ? 'admin' : 'user',
      created_at: newUser.created_at
    };

    res.status(201).json({
      status: 'success',
      message: 'Usuário criado com sucesso',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/auth/login - Login
router.post('/login', [
  body('email').isEmail().withMessage('Email válido é obrigatório'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
], handleValidationErrors, async (req, res) => {
  try {
    console.log('🔍 Backend /auth/login - Iniciando login...');
    const { email, password } = req.body;
    console.log('🔍 Backend /auth/login - Email recebido:', email);

    // Buscar usuário
    console.log('🔍 Backend /auth/login - Buscando usuário no banco...');
    const user = await dbService.get(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    console.log('🔍 Backend /auth/login - Usuário encontrado no banco:', user ? 'Sim' : 'Não');

    if (!user) {
      console.log('❌ Backend /auth/login - Usuário não encontrado');
      return res.status(401).json({
        status: 'error',
        message: 'Email ou senha incorretos'
      });
    }

    // Verificar senha
    console.log('🔍 Backend /auth/login - Verificando senha...');
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    console.log('🔍 Backend /auth/login - Senha válida:', passwordValid);
    
    if (!passwordValid) {
      console.log('❌ Backend /auth/login - Senha inválida');
      return res.status(401).json({
        status: 'error',
        message: 'Email ou senha incorretos'
      });
    }

    // Gerar JWT
    console.log('🔍 Backend /auth/login - Gerando JWT...');
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.account_type === 'administrateur' ? 'admin' : 'user'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Retornar dados do usuário (sem senha)
    const userResponse = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      company_name: user.company,
      account_type: user.account_type || 'entreprise',
      role: user.account_type === 'administrateur' ? 'admin' : 'user',
      created_at: user.created_at
    };

    console.log('🔍 Backend /auth/login - Login bem-sucedido, enviando resposta:', {
      userId: userResponse.id,
      email: userResponse.email,
      accountType: userResponse.account_type,
      hasToken: !!token
    });

    res.json({
      status: 'success',
      message: 'Login realizado com sucesso',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('❌ Backend /auth/login - Erro:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/auth/me - Verificar token e obter dados do usuário
router.get('/me', async (req, res) => {
  try {
    console.log('🔍 Backend /auth/me - Iniciando verificação...');
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('🔍 Backend /auth/me - Token recebido:', !!token, 'Length:', token?.length);
    
    if (!token) {
      console.log('❌ Backend /auth/me - Token não fornecido');
      return res.status(401).json({
        status: 'error',
        message: 'Token de acesso requerido'
      });
    }

    // Verificar JWT
    console.log('🔍 Backend /auth/me - Verificando JWT...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('🔍 Backend /auth/me - JWT decodificado:', decoded);
    
    // Buscar dados atualizados do usuário
    console.log('🔍 Backend /auth/me - Buscando usuário no banco...');
    const user = await dbService.get(
      'SELECT id, email, full_name, company, account_type, created_at FROM users WHERE id = $1',
      [decoded.id]
    );

    console.log('🔍 Backend /auth/me - Usuário encontrado no banco:', user);

    if (!user) {
      console.log('❌ Backend /auth/me - Usuário não encontrado no banco');
      return res.status(401).json({
        status: 'error',
        message: 'Usuário não encontrado'
      });
    }

    const userResponse = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      company_name: user.company,
      account_type: user.account_type || 'entreprise',
      role: user.account_type === 'administrateur' ? 'admin' : 'user',
      created_at: user.created_at
    };

    console.log('🔍 Backend /auth/me - Resposta preparada:', userResponse);

    res.json({
      status: 'success',
      data: { user: userResponse }
    });

  } catch (error) {
    console.error('❌ Backend /auth/me - Erro:', error);
    res.status(401).json({
      status: 'error',
      message: 'Token inválido'
    });
  }
});

module.exports = router;