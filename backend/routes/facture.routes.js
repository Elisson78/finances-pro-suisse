const express = require('express');
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

// GET /api/factures - Listar faturas
router.get('/', authenticate, async (req, res) => {
  try {
    const factures = await dbService.all(
      'SELECT * FROM factures WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({
      status: 'success',
      data: factures
    });
  } catch (error) {
    console.error('Error fetching factures:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/factures/stats/dashboard - Estatísticas do dashboard
router.get('/stats/dashboard', authenticate, async (req, res) => {
  try {
    // Total de faturas
    const totalFacturesResult = await dbService.get(
      'SELECT COUNT(*) as count FROM factures WHERE user_id = $1',
      [req.user.id]
    );

    // Total pago
    const totalPaidResult = await dbService.get(
      'SELECT COALESCE(SUM(total), 0) as total FROM factures WHERE user_id = $1 AND status = $2',
      [req.user.id, 'paid']
    );

    // Total pendente
    const totalPendingResult = await dbService.get(
      'SELECT COALESCE(SUM(total), 0) as total FROM factures WHERE user_id = $1 AND status = $2',
      [req.user.id, 'pending']
    );

    // Total atrasado
    const overdueCountResult = await dbService.get(
      'SELECT COUNT(*) as count FROM factures WHERE user_id = $1 AND status = $2',
      [req.user.id, 'overdue']
    );

    const stats = {
      totalFactures: parseInt(totalFacturesResult.count) || 0,
      totalPaid: parseFloat(totalPaidResult.total) || 0,
      totalPending: parseFloat(totalPendingResult.total) || 0,
      overdueCount: parseInt(overdueCountResult.count) || 0
    };

    res.json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/factures/:id - Obter fatura específica
router.get('/:id', authenticate, async (req, res) => {
  try {
    const facture = await dbService.get(
      'SELECT * FROM factures WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (!facture) {
      return res.status(404).json({
        status: 'error',
        message: 'Fatura não encontrada'
      });
    }

    // Parse articles se for string JSON
    if (typeof facture.articles === 'string') {
      facture.articles = JSON.parse(facture.articles);
    }

    res.json({
      status: 'success',
      data: facture
    });
  } catch (error) {
    console.error('Error fetching facture:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/factures - Criar fatura
router.post('/', authenticate, [
  body('client_id').notEmpty().withMessage('ID do cliente é obrigatório'),
  body('client_name').notEmpty().withMessage('Nome do cliente é obrigatório'),
  body('date').notEmpty().withMessage('Data é obrigatória'),
  body('echeance').notEmpty().withMessage('Data de vencimento é obrigatória'),
  body('articles').isArray().withMessage('Artigos devem ser um array')
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
      client_id,
      client_name,
      date,
      echeance,
      articles,
      subtotal,
      tva,
      total,
      status = 'pending'
    } = req.body;

    // Gerar número da fatura
    const factureCount = await dbService.get(
      'SELECT COUNT(*) as count FROM factures WHERE user_id = $1',
      [req.user.id]
    );
    const numeroFacture = `FAC-${String(parseInt(factureCount.count) + 1).padStart(4, '0')}`;

    const factureId = 'facture_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

    const newFacture = await dbService.run(
      `INSERT INTO factures (id, numero_facture, client_id, client_name, date, echeance, articles, subtotal, tva, total, status, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [factureId, numeroFacture, client_id, client_name, date, echeance, JSON.stringify(articles), subtotal, tva, total, status, req.user.id]
    );

    res.status(201).json({
      status: 'success',
      message: 'Fatura criada com sucesso',
      data: newFacture
    });
  } catch (error) {
    console.error('Error creating facture:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/factures/:id - Atualizar fatura
router.put('/:id', authenticate, async (req, res) => {
  try {
    const {
      client_id,
      client_name,
      date,
      echeance,
      articles,
      subtotal,
      tva,
      total,
      status
    } = req.body;

    const updatedFacture = await dbService.run(
      `UPDATE factures SET 
        client_id = $1, client_name = $2, date = $3, echeance = $4,
        articles = $5, subtotal = $6, tva = $7, total = $8,
        status = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 AND user_id = $11 RETURNING *`,
      [client_id, client_name, date, echeance, JSON.stringify(articles), subtotal, tva, total, status, req.params.id, req.user.id]
    );

    if (!updatedFacture) {
      return res.status(404).json({
        status: 'error',
        message: 'Fatura não encontrada'
      });
    }

    res.json({
      status: 'success',
      message: 'Fatura atualizada com sucesso',
      data: updatedFacture
    });
  } catch (error) {
    console.error('Error updating facture:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/factures/:id - Deletar fatura
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await dbService.run(
      'DELETE FROM factures WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    res.json({
      status: 'success',
      message: 'Fatura deletada com sucesso'
    });
  } catch (error) {
    console.error('Error deleting facture:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;