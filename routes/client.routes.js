const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
// Criar uma versão local do database service
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/financespro',
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
const JWT_SECRET = process.env.JWT_SECRET || 'finances-pro-suisse-secret-key';

// Middleware de autenticação
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Token de acesso requerido'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Token inválido'
    });
  }
};

// GET /api/clients - Listar clientes
router.get('/', authenticate, async (req, res) => {
  try {
    const clients = await dbService.all(
      'SELECT * FROM clients WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({
      status: 'success',
      data: clients
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/clients/:id - Obter cliente específico
router.get('/:id', authenticate, async (req, res) => {
  try {
    const client = await dbService.get(
      'SELECT * FROM clients WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (!client) {
      return res.status(404).json({
        status: 'error',
        message: 'Cliente não encontrado'
      });
    }

    res.json({
      status: 'success',
      data: client
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/clients - Criar cliente
router.post('/', authenticate, [
  body('company').notEmpty().withMessage('Nome da empresa é obrigatório'),
  body('email').isEmail().withMessage('Email válido é obrigatório')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      company,
      contact_person,
      email,
      phone,
      address,
      city,
      postal_code,
      country = 'Suisse',
      category = 'facture'
    } = req.body;

    const clientId = 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

    const newClient = await dbService.run(
      `INSERT INTO clients (id, company, contact_person, email, phone, address, city, postal_code, country, category, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [clientId, company, contact_person, email, phone, address, city, postal_code, country, category, req.user.id]
    );

    res.status(201).json({
      status: 'success',
      message: 'Cliente criado com sucesso',
      data: newClient
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/clients/:id - Atualizar cliente
router.put('/:id', authenticate, async (req, res) => {
  try {
    const {
      company,
      contact_person,
      email,
      phone,
      address,
      city,
      postal_code,
      country,
      category
    } = req.body;

    const updatedClient = await dbService.run(
      `UPDATE clients SET 
        company = $1, contact_person = $2, email = $3, phone = $4,
        address = $5, city = $6, postal_code = $7, country = $8,
        category = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 AND user_id = $11 RETURNING *`,
      [company, contact_person, email, phone, address, city, postal_code, country, category, req.params.id, req.user.id]
    );

    if (!updatedClient) {
      return res.status(404).json({
        status: 'error',
        message: 'Cliente não encontrado'
      });
    }

    res.json({
      status: 'success',
      message: 'Cliente atualizado com sucesso',
      data: updatedClient
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/clients/:id - Deletar cliente
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await dbService.run(
      'DELETE FROM clients WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    res.json({
      status: 'success',
      message: 'Cliente deletado com sucesso'
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;