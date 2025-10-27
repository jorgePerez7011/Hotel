import express from 'express';
import pool from '../config/mysql.js';

const router = express.Router();

// Obtener todas las entregas de turno con información de empleados
router.get('/', async (req, res) => {
  try {
    const [handovers] = await pool.execute(`
      SELECT 
        h.*,
        e1.name as outgoing_employee_name,
        e1.position as outgoing_employee_position,
        e2.name as incoming_employee_name,
        e2.position as incoming_employee_position,
        e3.name as supervisor_name
      FROM shift_handovers h
      LEFT JOIN employees e1 ON h.outgoing_employee_id = e1.id
      LEFT JOIN employees e2 ON h.incoming_employee_id = e2.id
      LEFT JOIN employees e3 ON h.supervisor_approval_id = e3.id
      ORDER BY h.handover_time DESC
    `);

    res.json({ handovers });
  } catch (error) {
    console.error('Error fetching handovers:', error);
    res.status(500).json({ 
      error: 'Failed to fetch handovers',
      message: error.message
    });
  }
});

// Obtener entregas de turno por fecha con transacciones financieras
router.get('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    const [handovers] = await pool.execute(`
      SELECT 
        h.*,
        e1.name as outgoing_employee_name,
        e1.position as outgoing_employee_position,
        e2.name as incoming_employee_name,
        e2.position as incoming_employee_position
      FROM shift_handovers h
      LEFT JOIN employees e1 ON h.outgoing_employee_id = e1.id
      LEFT JOIN employees e2 ON h.incoming_employee_id = e2.id
      WHERE h.shift_date = ?
      ORDER BY h.handover_time DESC
    `, [date]);

    // Obtener transacciones para cada entrega
    for (let handover of handovers) {
      const [transactions] = await pool.execute(`
        SELECT * FROM shift_transactions 
        WHERE handover_id = ? 
        ORDER BY created_at DESC
      `, [handover.id]);
      
      handover.transactions = transactions;
    }

    res.json({ handovers, date });
  } catch (error) {
    console.error('Error fetching handovers by date:', error);
    res.status(500).json({ 
      error: 'Failed to fetch handovers',
      message: error.message
    });
  }
});

// Crear nueva entrega de turno con datos financieros
router.post('/', async (req, res) => {
  try {
    const {
      outgoing_employee_id,
      incoming_employee_id,
      shift_date,
      outgoing_shift,
      incoming_shift,
      rooms_occupied,
      rooms_available,
      pending_checkouts,
      pending_checkins,
      general_notes,
      maintenance_issues,
      guest_requests,
      inventory_notes,
      outgoing_signature,
      // Nuevos campos financieros
      cash_received,
      cash_delivered,
      total_income,
      total_expenses,
      financial_notes,
      transactions
    } = req.body;

    // Validar campos requeridos
    if (!outgoing_employee_id || !incoming_employee_id || !shift_date || !outgoing_shift || !incoming_shift) {
      return res.status(400).json({ 
        error: 'Missing required fields: outgoing_employee_id, incoming_employee_id, shift_date, outgoing_shift, incoming_shift' 
      });
    }

    // Verificar que los empleados existan
    const [employees] = await pool.execute(
      'SELECT id FROM employees WHERE id IN (?, ?) AND is_active = true',
      [outgoing_employee_id, incoming_employee_id]
    );

    if (employees.length < 2) {
      return res.status(400).json({ 
        error: 'One or both employees not found or inactive' 
      });
    }

    // Calcular diferencia de caja
    const cash_difference = (total_income || 0) - (total_expenses || 0);

    // Insertar nueva entrega de turno con datos financieros
    const [result] = await pool.execute(`
      INSERT INTO shift_handovers 
      (outgoing_employee_id, incoming_employee_id, shift_date, outgoing_shift, incoming_shift,
       rooms_occupied, rooms_available, pending_checkouts, pending_checkins,
       general_notes, maintenance_issues, guest_requests, inventory_notes,
       cash_received, cash_delivered, total_income, total_expenses, cash_difference, financial_notes,
       status, outgoing_signature)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `, [
      outgoing_employee_id, incoming_employee_id, shift_date, outgoing_shift, incoming_shift,
      rooms_occupied || 0, rooms_available || 0, pending_checkouts || 0, pending_checkins || 0,
      general_notes, maintenance_issues, guest_requests, inventory_notes,
      cash_received || 0, cash_delivered || 0, total_income || 0, total_expenses || 0, cash_difference, financial_notes,
      outgoing_signature
    ]);

    // Insertar transacciones si se proporcionaron
    if (transactions && Array.isArray(transactions) && transactions.length > 0) {
      for (const transaction of transactions) {
        await pool.execute(`
          INSERT INTO shift_transactions 
          (handover_id, type, category, description, amount, payment_method)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          result.insertId,
          transaction.type,
          transaction.category,
          transaction.description,
          transaction.amount,
          transaction.payment_method || 'cash'
        ]);
      }
    }

    // Obtener la entrega creada con información de empleados
    const [newHandover] = await pool.execute(`
      SELECT 
        h.*,
        e1.name as outgoing_employee_name,
        e2.name as incoming_employee_name
      FROM shift_handovers h
      LEFT JOIN employees e1 ON h.outgoing_employee_id = e1.id
      LEFT JOIN employees e2 ON h.incoming_employee_id = e2.id
      WHERE h.id = ?
    `, [result.insertId]);

    res.status(201).json({
      message: 'Shift handover created successfully',
      handover: newHandover[0]
    });

  } catch (error) {
    console.error('Error creating handover:', error);
    res.status(500).json({ 
      error: 'Failed to create handover',
      message: error.message
    });
  }
});

// Completar entrega de turno (firma del empleado entrante)
router.patch('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { incoming_signature } = req.body;

    if (!incoming_signature) {
      return res.status(400).json({ 
        error: 'Incoming signature is required' 
      });
    }

    const [result] = await pool.execute(`
      UPDATE shift_handovers 
      SET incoming_signature = ?, status = 'completed'
      WHERE id = ? AND status = 'pending'
    `, [incoming_signature, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Handover not found or already completed' 
      });
    }

    // Obtener la entrega actualizada
    const [updatedHandover] = await pool.execute(`
      SELECT 
        h.*,
        e1.name as outgoing_employee_name,
        e2.name as incoming_employee_name
      FROM shift_handovers h
      LEFT JOIN employees e1 ON h.outgoing_employee_id = e1.id
      LEFT JOIN employees e2 ON h.incoming_employee_id = e2.id
      WHERE h.id = ?
    `, [id]);

    res.json({
      message: 'Shift handover completed successfully',
      handover: updatedHandover[0]
    });

  } catch (error) {
    console.error('Error completing handover:', error);
    res.status(500).json({ 
      error: 'Failed to complete handover',
      message: error.message
    });
  }
});

// Aprobar entrega de turno (supervisor)
router.patch('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { supervisor_id } = req.body;

    if (!supervisor_id) {
      return res.status(400).json({ 
        error: 'Supervisor ID is required' 
      });
    }

    // Verificar que el supervisor existe y es admin
    const [supervisor] = await pool.execute(
      'SELECT id FROM employees WHERE id = ? AND position = "admin" AND is_active = true',
      [supervisor_id]
    );

    if (supervisor.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid supervisor or insufficient permissions' 
      });
    }

    const [result] = await pool.execute(`
      UPDATE shift_handovers 
      SET supervisor_approval_id = ?, approval_time = NOW(), status = 'reviewed'
      WHERE id = ? AND status = 'completed'
    `, [supervisor_id, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Handover not found or not ready for approval' 
      });
    }

    res.json({
      message: 'Shift handover approved successfully'
    });

  } catch (error) {
    console.error('Error approving handover:', error);
    res.status(500).json({ 
      error: 'Failed to approve handover',
      message: error.message
    });
  }
});

// Obtener estadísticas de entregas de turno con datos financieros
router.get('/stats', async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_handovers,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_handovers,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_handovers,
        SUM(CASE WHEN status = 'reviewed' THEN 1 ELSE 0 END) as reviewed_handovers,
        AVG(rooms_occupied) as avg_occupancy,
        DATE(MAX(handover_time)) as last_handover_date,
        COALESCE(SUM(total_income), 0) as total_income_all,
        COALESCE(SUM(total_expenses), 0) as total_expenses_all,
        COALESCE(SUM(cash_difference), 0) as total_cash_difference,
        COALESCE(AVG(cash_received), 0) as avg_cash_received,
        COALESCE(AVG(cash_delivered), 0) as avg_cash_delivered
      FROM shift_handovers 
      WHERE shift_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);

    const [transactionStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income_detailed,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses_detailed,
        COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
        COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
      FROM shift_transactions st
      JOIN shift_handovers sh ON st.handover_id = sh.id
      WHERE sh.shift_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);

    res.json({ 
      stats: stats[0],
      transaction_stats: transactionStats[0]
    });
  } catch (error) {
    console.error('Error fetching handover stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch stats',
      message: error.message
    });
  }
});

// Agregar transacción a una entrega existente
router.post('/:id/transactions', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, category, description, amount, payment_method } = req.body;

    if (!type || !category || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields: type, category, amount' 
      });
    }

    // Verificar que la entrega existe
    const [handover] = await pool.execute('SELECT id FROM shift_handovers WHERE id = ?', [id]);
    if (handover.length === 0) {
      return res.status(404).json({ error: 'Handover not found' });
    }

    // Insertar transacción
    const [result] = await pool.execute(`
      INSERT INTO shift_transactions 
      (handover_id, type, category, description, amount, payment_method)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, type, category, description, amount, payment_method || 'cash']);

    // Recalcular totales de la entrega
    const [totals] = await pool.execute(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
      FROM shift_transactions 
      WHERE handover_id = ?
    `, [id]);

    const cash_difference = totals[0].total_income - totals[0].total_expenses;

    // Actualizar totales en la entrega
    await pool.execute(`
      UPDATE shift_handovers 
      SET total_income = ?, total_expenses = ?, cash_difference = ?
      WHERE id = ?
    `, [totals[0].total_income, totals[0].total_expenses, cash_difference, id]);

    res.status(201).json({
      message: 'Transaction added successfully',
      transaction_id: result.insertId,
      updated_totals: {
        total_income: totals[0].total_income,
        total_expenses: totals[0].total_expenses,
        cash_difference: cash_difference
      }
    });

  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ 
      error: 'Failed to add transaction',
      message: error.message
    });
  }
});

// Obtener transacciones de una entrega específica
router.get('/:id/transactions', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [transactions] = await pool.execute(`
      SELECT * FROM shift_transactions 
      WHERE handover_id = ? 
      ORDER BY created_at DESC
    `, [id]);

    res.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch transactions',
      message: error.message
    });
  }
});

// Eliminar una transacción
router.delete('/transactions/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    // Obtener información de la transacción antes de eliminarla
    const [transaction] = await pool.execute('SELECT handover_id FROM shift_transactions WHERE id = ?', [transactionId]);
    
    if (transaction.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const handoverId = transaction[0].handover_id;

    // Eliminar transacción
    await pool.execute('DELETE FROM shift_transactions WHERE id = ?', [transactionId]);

    // Recalcular totales de la entrega
    const [totals] = await pool.execute(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
      FROM shift_transactions 
      WHERE handover_id = ?
    `, [handoverId]);

    const cash_difference = totals[0].total_income - totals[0].total_expenses;

    // Actualizar totales en la entrega
    await pool.execute(`
      UPDATE shift_handovers 
      SET total_income = ?, total_expenses = ?, cash_difference = ?
      WHERE id = ?
    `, [totals[0].total_income, totals[0].total_expenses, cash_difference, handoverId]);

    res.json({
      message: 'Transaction deleted successfully',
      updated_totals: {
        total_income: totals[0].total_income,
        total_expenses: totals[0].total_expenses,
        cash_difference: cash_difference
      }
    });

  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ 
      error: 'Failed to delete transaction',
      message: error.message
    });
  }
});

export default router;