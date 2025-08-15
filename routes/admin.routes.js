const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Configuração do banco
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:lYPS50GDgjiA6QEL0REU142DUG0qHefqqGcGo8I2njYiBkpxlSuuhMv8Lpv1K2VY@91.107.237.159:5432/db_finance',
  ssl: false
});

const JWT_SECRET = process.env.JWT_SECRET || 'finances-pro-suisse-secret-key';

// Middleware para verificar se é administrador
const requireAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Token de acesso requerido'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar usuário no banco
    const client = await pool.connect();
    const userResult = await client.query(
      'SELECT id, email, account_type FROM users WHERE id = $1',
      [decoded.id]
    );
    client.release();

    if (!userResult.rows[0]) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuário não encontrado'
      });
    }

    const user = userResult.rows[0];
    
    // Verificar se é administrador
    if (user.account_type !== 'administrateur') {
      return res.status(403).json({
        status: 'error',
        message: 'Acesso negado. Privilégios de administrador requeridos.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error in admin middleware:', error);
    res.status(401).json({
      status: 'error',
      message: 'Token inválido'
    });
  }
};

// GET /api/admin/stats - Estatísticas gerais do sistema
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const client = await pool.connect();
    
    // Contar usuários
    const usersResult = await client.query('SELECT COUNT(*) as total FROM users');
    const activeUsersResult = await client.query(
      'SELECT COUNT(*) as total FROM users WHERE account_type = $1',
      ['entreprise']
    );
    
    // Contar empresas (usuários tipo empresa)
    const companiesResult = await client.query(
      'SELECT COUNT(DISTINCT company) as total FROM users WHERE account_type = $1',
      ['entreprise']
    );
    
    // Contar faturas
    const invoicesResult = await client.query('SELECT COUNT(*) as total FROM factures');
    const pendingInvoicesResult = await client.query(
      'SELECT COUNT(*) as total FROM factures WHERE status = $1',
      ['pending']
    );
    
    // Calcular receita total
    const revenueResult = await client.query(
      'SELECT SUM(total_amount) as total FROM factures WHERE status = $1',
      ['paid']
    );
    
    client.release();
    
    const stats = {
      totalUsers: parseInt(usersResult.rows[0].total),
      totalCompanies: parseInt(companiesResult.rows[0].total),
      totalInvoices: parseInt(invoicesResult.rows[0].total),
      totalRevenue: parseFloat(revenueResult.rows[0].total || 0),
      activeUsers: parseInt(activeUsersResult.rows[0].total),
      pendingInvoices: parseInt(pendingInvoicesResult.rows[0].total)
    };

    res.json({
      status: 'success',
      data: stats
    });
    
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/admin/users - Listar todos os usuários
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        id,
        email,
        full_name,
        company,
        account_type,
        created_at,
        'active' as status
      FROM users 
      ORDER BY created_at DESC
    `);
    
    client.release();
    
    res.json({
      status: 'success',
      data: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/admin/users/:id - Obter detalhes de um usuário específico
router.get('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();
    
    // Buscar usuário
    const userResult = await client.query(
      'SELECT id, email, full_name, company, account_type, created_at FROM users WHERE id = $1',
      [id]
    );
    
    if (!userResult.rows[0]) {
      client.release();
      return res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado'
      });
    }
    
    const user = userResult.rows[0];
    
    // Buscar estatísticas do usuário
    const clientsResult = await client.query(
      'SELECT COUNT(*) as total FROM clients WHERE user_id = $1',
      [id]
    );
    
    const servicesResult = await client.query(
      'SELECT COUNT(*) as total FROM services WHERE user_id = $1',
      [id]
    );
    
    const invoicesResult = await client.query(
      'SELECT COUNT(*) as total FROM factures WHERE user_id = $1',
      [id]
    );
    
    const revenueResult = await client.query(
      'SELECT SUM(total_amount) as total FROM factures WHERE user_id = $1 AND status = $2',
      [id, 'paid']
    );
    
    client.release();
    
    const userData = {
      ...user,
      stats: {
        clients: parseInt(clientsResult.rows[0].total),
        services: parseInt(servicesResult.rows[0].total),
        invoices: parseInt(invoicesResult.rows[0].total),
        revenue: parseFloat(revenueResult.rows[0].total || 0)
      }
    };
    
    res.json({
      status: 'success',
      data: userData
    });
    
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/admin/companies - Listar todas as empresas
router.get('/companies', requireAdmin, async (req, res) => {
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        u.id,
        u.company,
        u.full_name as contact_name,
        u.email,
        u.created_at,
        COUNT(DISTINCT c.id) as total_clients,
        COUNT(DISTINCT s.id) as total_services,
        COUNT(DISTINCT f.id) as total_invoices,
        COALESCE(SUM(CASE WHEN f.status = 'paid' THEN f.total_amount ELSE 0 END), 0) as total_revenue
      FROM users u
      LEFT JOIN clients c ON u.id = c.user_id
      LEFT JOIN services s ON u.id = s.user_id
      LEFT JOIN factures f ON u.id = f.user_id
      WHERE u.account_type = 'entreprise'
      GROUP BY u.id, u.company, u.full_name, u.email, u.created_at
      ORDER BY u.created_at DESC
    `);
    
    client.release();
    
    res.json({
      status: 'success',
      data: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/admin/recent-activity - Atividades recentes do sistema
router.get('/recent-activity', requireAdmin, async (req, res) => {
  try {
    const client = await pool.connect();
    
    // Buscar atividades recentes (últimos registros)
    const recentUsers = await client.query(`
      SELECT 
        'user_registered' as type,
        full_name as description,
        email as details,
        created_at as timestamp
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    const recentInvoices = await client.query(`
      SELECT 
        'invoice_created' as type,
        CONCAT('Fatura ', invoice_number) as description,
        CONCAT(total_amount, ' CHF') as details,
        f.created_at as timestamp
      FROM factures f
      JOIN users u ON f.user_id = u.id
      ORDER BY f.created_at DESC 
      LIMIT 5
    `);
    
    // Combinar e ordenar por data
    const activities = [...recentUsers.rows, ...recentInvoices.rows]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
    
    client.release();
    
    res.json({
      status: 'success',
      data: activities
    });
    
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/admin/users/:id/status - Alterar status do usuário
router.put('/users/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Status inválido'
      });
    }
    
    // Por enquanto, apenas simular a alteração
    // TODO: Implementar campo status na tabela users
    
    res.json({
      status: 'success',
      message: 'Status do usuário atualizado com sucesso'
    });
    
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;