const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
// Criar uma versão local do database service
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:lYPS50GDgjiA6QEL0GG0qHefqqGcGo8I2njYiBkpxlSuuhMv8Lpv1K2VY@91.107.237.159:5432/db_finance',
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

// GET /api/services - Listar serviços
router.get('/', authenticate, async (req, res) => {
  try {
    const services = await dbService.all(
      'SELECT * FROM services WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({
      status: 'success',
      data: services
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/services/:id - Obter serviço específico
router.get('/:id', authenticate, async (req, res) => {
  try {
    const service = await dbService.get(
      'SELECT * FROM services WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (!service) {
      return res.status(404).json({
        status: 'error',
        message: 'Serviço não encontrado'
      });
    }

    res.json({
      status: 'success',
      data: service
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/services - Criar serviço
router.post('/', authenticate, [
  body('name').notEmpty().withMessage('Nome do serviço é obrigatório'),
  body('price').isNumeric().withMessage('Preço deve ser um número')
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
      name,
      description,
      price,
      category = 'service'
    } = req.body;

    const serviceId = 'service_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

    const newService = await dbService.run(
      `INSERT INTO services (id, name, description, price, category, user_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [serviceId, name, description, price, category, req.user.id]
    );

    res.status(201).json({
      status: 'success',
      message: 'Serviço criado com sucesso',
      data: newService
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/services/:id - Atualizar serviço
router.put('/:id', authenticate, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category
    } = req.body;

    const updatedService = await dbService.run(
      `UPDATE services SET 
        name = $1, description = $2, price = $3, category = $4,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND user_id = $6 RETURNING *`,
      [name, description, price, category, req.params.id, req.user.id]
    );

    if (!updatedService) {
      return res.status(404).json({
        status: 'error',
        message: 'Serviço não encontrado'
      });
    }

    res.json({
      status: 'success',
      message: 'Serviço atualizado com sucesso',
      data: updatedService
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/services/:id - Deletar serviço
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await dbService.run(
      'DELETE FROM services WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    res.json({
      status: 'success',
      message: 'Serviço deletado com sucesso'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;