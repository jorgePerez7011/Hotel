import express from 'express';
import pool from '../config/mysql.js';
import pdfkit from 'pdfkit';

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

    // Parse selected_rooms JSON for each handover
    handovers.forEach(handover => {
      if (handover.selected_rooms) {
        try {
          handover.selected_rooms = JSON.parse(handover.selected_rooms);
        } catch (e) {
          handover.selected_rooms = [];
        }
      } else {
        handover.selected_rooms = [];
      }
    });

    res.json({ handovers });
  } catch (error) {
    console.error('Error fetching handovers:', error);
    res.status(500).json({ 
      error: 'Failed to fetch handovers',
      message: error.message
    });
  }
});

// Eliminar entrega de turno
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(`
      DELETE FROM shift_handovers 
      WHERE id = ?
    `, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Entrega de turno no encontrada' 
      });
    }

    res.json({
      message: 'Entrega de turno eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error deleting handover:', error);
    res.status(500).json({ 
      error: 'Error al eliminar la entrega de turno',
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

    // Parse selected_rooms JSON for each handover
    handovers.forEach(handover => {
      if (handover.selected_rooms) {
        try {
          handover.selected_rooms = JSON.parse(handover.selected_rooms);
        } catch (e) {
          handover.selected_rooms = [];
        }
      } else {
        handover.selected_rooms = [];
      }
    });

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
      selected_rooms,
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

    // Calcular rooms_occupied basándose en selected_rooms
    let calculatedRoomsOccupied = rooms_occupied || 0;
    let calculatedRoomsAvailable = rooms_available || 20;
    
    if (selected_rooms && Array.isArray(selected_rooms)) {
      calculatedRoomsOccupied = selected_rooms.length;
      calculatedRoomsAvailable = 20 - selected_rooms.length;
    }

    // Calcular diferencia de caja
    const cash_difference = (total_income || 0) - (total_expenses || 0);

    // Insertar nueva entrega de turno con datos financieros
    const [result] = await pool.execute(`
      INSERT INTO shift_handovers 
      (outgoing_employee_id, incoming_employee_id, shift_date, outgoing_shift, incoming_shift,
       rooms_occupied, rooms_available, pending_checkouts, pending_checkins, selected_rooms,
       general_notes, maintenance_issues, guest_requests, inventory_notes,
       cash_received, cash_delivered, total_income, total_expenses, cash_difference, financial_notes,
       status, outgoing_signature)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `, [
      outgoing_employee_id, incoming_employee_id, shift_date, outgoing_shift, incoming_shift,
      calculatedRoomsOccupied, calculatedRoomsAvailable, pending_checkouts || 0, pending_checkins || 0, 
      selected_rooms ? JSON.stringify(selected_rooms) : null,
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

// Obtener ingresos totales del mes actual
router.get('/monthly-income', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Ingresos de entregas de turnos
    const [handoverResult] = await pool.execute(`
      SELECT 
        COALESCE(SUM(total_income), 0) as total_income,
        COUNT(*) as handover_count
      FROM shift_handovers 
      WHERE shift_date >= ? AND shift_date <= ?
      AND status = 'completed'
    `, [startOfMonth.toISOString().split('T')[0], endOfMonth.toISOString().split('T')[0]]);

    // Ingresos de bookings (checkouts completados + checked_in walkings)
    const [checkoutResult] = await pool.execute(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as checkout_income,
        COUNT(*) as checkout_count
      FROM bookings 
      WHERE created_at >= ? AND created_at <= ?
      AND status IN ('checked_out', 'checked_in')
    `, [startOfMonth.toISOString(), endOfMonth.toISOString()]);

    console.log(`📊 Ingresos check-out: ${checkoutResult[0].checkout_income} (${checkoutResult[0].checkout_count} registros)`);

    // Sumar ambos ingresos
    const totalHandoverIncome = parseFloat(handoverResult[0].total_income || 0);
    const totalCheckoutIncome = parseFloat(checkoutResult[0].checkout_income || 0);
    const totalIncome = totalHandoverIncome + totalCheckoutIncome;

    res.json({
      success: true,
      data: {
        total_income: totalIncome,
        handover_income: totalHandoverIncome,
        checkout_income: totalCheckoutIncome,
        handover_count: handoverResult[0].handover_count,
        checkout_count: checkoutResult[0].checkout_count,
        month: startOfMonth.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' }),
        year: startOfMonth.getFullYear()
      }
    });
  } catch (error) {
    console.error('Error fetching monthly income:', error);
    res.status(500).json({ 
      error: 'Failed to fetch monthly income',
      message: error.message
    });
  }
});

// Obtener detalles detallados de ingresos mensuales (checkouts y handovers separados)
router.get('/monthly-income-details', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Detalles de checkouts - HACER JOIN CON ROOMS PARA OBTENER ROOM_NUMBER
    const [checkouts] = await pool.execute(`
      SELECT 
        b.id,
        r.room_number,
        b.guest_name,
        b.check_in_date,
        b.check_out_date,
        b.total_amount,
        b.created_at,
        b.payment_type
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE b.created_at >= ? AND b.created_at <= ?
      AND b.status IN ('checked_out', 'checked_in')
      ORDER BY b.check_out_date DESC
    `, [startOfMonth.toISOString(), endOfMonth.toISOString()]);

    // Detalles de entregas de turno
    const [handovers] = await pool.execute(`
      SELECT 
        h.id,
        h.shift_date,
        h.handover_time,
        h.total_income,
        h.outgoing_employee_id,
        h.incoming_employee_id,
        e1.name as outgoing_employee_name,
        e2.name as incoming_employee_name,
        h.created_at
      FROM shift_handovers h
      LEFT JOIN employees e1 ON h.outgoing_employee_id = e1.id
      LEFT JOIN employees e2 ON h.incoming_employee_id = e2.id
      WHERE h.shift_date >= ? AND h.shift_date <= ?
      AND h.status = 'completed'
      ORDER BY h.handover_time DESC
    `, [startOfMonth.toISOString().split('T')[0], endOfMonth.toISOString().split('T')[0]]);

    console.log(`📊 Check-outs encontrados: ${checkouts.length}`);
    console.log(`📊 Entregas encontradas: ${handovers.length}`);

    res.json({
      success: true,
      data: {
        checkouts: checkouts.map(c => ({
          id: c.id,
          room_number: c.room_number || 'N/A',
          guest_name: c.guest_name,
          check_in_date: c.check_in_date,
          check_out_date: c.check_out_date,
          total_amount: parseFloat(c.total_amount),
          created_at: c.created_at,
          payment_type: c.payment_type
        })),
        handovers: handovers.map(h => ({
          id: h.id,
          shift_date: h.shift_date,
          handover_time: h.handover_time,
          income: parseFloat(h.total_income || 0),
          employee_name: h.outgoing_employee_name || h.incoming_employee_name || 'Sin especificar',
          created_at: h.created_at || h.handover_time
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching monthly income details:', error);
    res.status(500).json({ 
      error: 'Failed to fetch monthly income details',
      message: error.message
    });
  }
});

// Helper function to generate PDF for shift handover
function generateShiftHandoverPDF(doc, handover) {
  console.log('Starting PDF content generation');

  // Header
  doc.fontSize(24).text('ENTREGA DE TURNO', { align: 'center' });
  doc.moveDown(1);

  // Hotel info
  doc.fontSize(14).text('Hotel Sol - Sistema de Gestión', { align: 'center' });
  doc.moveDown(2);

  // Handover details
  doc.fontSize(16).text('INFORMACIÓN GENERAL', { align: 'left' });
  doc.moveDown(1);

  doc.fontSize(12);
  doc.text(`Fecha del Turno: ${new Date(handover.shift_date).toLocaleDateString('es-ES')}`, { align: 'left' });
  doc.moveDown(0.8);
  doc.text(`Hora de Entrega: ${new Date(handover.handover_time).toLocaleTimeString('es-ES')}`, { align: 'left' });
  doc.moveDown(0.8);
  doc.text(`Turno Saliente: ${handover.outgoing_shift}`, { align: 'left' });
  doc.moveDown(0.8);
  doc.text(`Turno Entrante: ${handover.incoming_shift}`, { align: 'left' });
  doc.moveDown(0.8);
  doc.text(`Estado: ${handover.status === 'completed' ? 'Completado' : 'Pendiente'}`, { align: 'left' });
  doc.moveDown(2);

  // Employee information
  doc.fontSize(16).text('INFORMACIÓN DE EMPLEADOS', { align: 'left' });
  doc.moveDown(1);

  doc.fontSize(12);
  doc.text(`Empleado Saliente: ${handover.outgoing_employee_name} (${handover.outgoing_employee_position})`, { align: 'left' });
  doc.moveDown(0.8);
  doc.text(`Empleado Entrante: ${handover.incoming_employee_name} (${handover.incoming_employee_position})`, { align: 'left' });
  if (handover.supervisor_name) {
    doc.moveDown(0.8);
    doc.text(`Supervisor: ${handover.supervisor_name}`, { align: 'left' });
  }
  doc.moveDown(2);

  // Room visualization
  doc.fontSize(16).text('ESTADO DE HABITACIONES', { align: 'left' });
  doc.moveDown(1);

  // Room grid - First floor (101-109)
  doc.fontSize(12).text('Primer Piso (101-109):', { align: 'left' });
  doc.moveDown(0.5);

  const roomsFirstFloor = [101, 102, 103, 104, 105, 106, 107, 108, 109];
  const roomsSecondFloor = [211, 212, 213, 214, 215, 216, 217, 218, 219];
  
  // Use selected rooms if available, otherwise fall back to count-based simulation
  let occupiedRooms = [];
  if (handover.selected_rooms && handover.selected_rooms.length > 0) {
    occupiedRooms = handover.selected_rooms;
  } else {
    // Fallback: simulate based on count
    const occupiedCount = handover.rooms_occupied || 0;
    for (let i = 0; i < occupiedCount && i < roomsFirstFloor.length; i++) {
      occupiedRooms.push(roomsFirstFloor[i]);
    }
    const remainingOccupied = Math.max(0, occupiedCount - roomsFirstFloor.length);
    for (let i = 0; i < remainingOccupied && i < roomsSecondFloor.length; i++) {
      occupiedRooms.push(roomsSecondFloor[i]);
    }
  }

  // Draw room boxes for first floor
  const boxWidth = 40;
  const boxHeight = 25;
  const margin = 10;
  let x = 50;
  let y = doc.y;

  roomsFirstFloor.forEach((room, index) => {
    if (index > 0 && index % 5 === 0) {
      x = 50;
      y += boxHeight + margin;
    }

    // Draw room box
    doc.rect(x, y, boxWidth, boxHeight).stroke();

    // Fill if occupied
    if (occupiedRooms.includes(room)) {
      doc.fillColor('#FFE4B5').rect(x, y, boxWidth, boxHeight).fill();
      doc.fillColor('black');
    }

    // Room number
    doc.fontSize(10).text(room.toString(), x + 5, y + 8, {
      width: boxWidth - 10,
      align: 'center'
    });

    x += boxWidth + margin;
  });

  doc.moveDown(4);

  // Second floor (211-219)
  doc.fontSize(12).text('Segundo Piso (211-219):', { align: 'left' });
  doc.moveDown(0.5);

  x = 50;
  y = doc.y;

  roomsSecondFloor.forEach((room, index) => {
    if (index > 0 && index % 5 === 0) {
      x = 50;
      y += boxHeight + margin;
    }

    // Draw room box
    doc.rect(x, y, boxWidth, boxHeight).stroke();

    // Fill if occupied
    if (occupiedRooms.includes(room)) {
      doc.fillColor('#FFE4B5').rect(x, y, boxWidth, boxHeight).fill();
      doc.fillColor('black');
    }

    // Room number
    doc.fontSize(10).text(room.toString(), x + 5, y + 8, {
      width: boxWidth - 10,
      align: 'center'
    });

    x += boxWidth + margin;
  });

  doc.moveDown(3);

  // Room statistics
  doc.fontSize(12);
  doc.text(`Habitaciones Ocupadas: ${handover.rooms_occupied}`, { align: 'left' });
  doc.moveDown(0.8);
  doc.text(`Habitaciones Disponibles: ${handover.rooms_available}`, { align: 'left' });
  doc.moveDown(0.8);
  doc.text(`Check-outs Pendientes: ${handover.pending_checkouts}`, { align: 'left' });
  doc.moveDown(0.8);
  doc.text(`Check-ins Pendientes: ${handover.pending_checkins}`, { align: 'left' });
  doc.moveDown(2);

  // Financial information
  doc.fontSize(16).text('INFORMACIÓN FINANCIERA', { align: 'left' });
  doc.moveDown(1);

  doc.fontSize(12);
  doc.text(`Caja Recibida: $${Number(handover.cash_received || 0).toFixed(2)}`, { align: 'left' });
  doc.moveDown(0.8);
  doc.text(`Caja Entregada: $${Number(handover.cash_delivered || 0).toFixed(2)}`, { align: 'left' });
  doc.moveDown(0.8);
  doc.text(`Ingresos Totales: $${Number(handover.total_income || 0).toFixed(2)}`, { align: 'left' });
  doc.moveDown(0.8);
  doc.text(`Egresos Totales: $${Number(handover.total_expenses || 0).toFixed(2)}`, { align: 'left' });
  doc.moveDown(0.8);
  doc.text(`Diferencia en Caja: $${Number(handover.cash_difference || 0).toFixed(2)}`, { align: 'left' });
  doc.moveDown(2);

  // Transactions
  if (handover.transactions && handover.transactions.length > 0) {
    doc.fontSize(16).text('TRANSACCIONES', { align: 'left' });
    doc.moveDown(1);

    doc.fontSize(12);
    handover.transactions.forEach((transaction, index) => {
      doc.text(`${index + 1}. ${transaction.description} - $${Number(transaction.amount).toFixed(2)} (${transaction.type})`, { align: 'left' });
      doc.moveDown(0.5);
    });
    doc.moveDown(1);
  }

  // Notes
  if (handover.general_notes || handover.maintenance_issues || handover.guest_requests || handover.inventory_notes || handover.financial_notes) {
    doc.fontSize(16).text('NOTAS Y OBSERVACIONES', { align: 'left' });
    doc.moveDown(1);

    doc.fontSize(12);
    if (handover.general_notes) {
      doc.text(`Notas Generales: ${handover.general_notes}`, { align: 'left' });
      doc.moveDown(0.8);
    }
    if (handover.maintenance_issues) {
      doc.text(`Problemas de Mantenimiento: ${handover.maintenance_issues}`, { align: 'left' });
      doc.moveDown(0.8);
    }
    if (handover.guest_requests) {
      doc.text(`Solicitudes de Huéspedes: ${handover.guest_requests}`, { align: 'left' });
      doc.moveDown(0.8);
    }
    if (handover.inventory_notes) {
      doc.text(`Notas de Inventario: ${handover.inventory_notes}`, { align: 'left' });
      doc.moveDown(0.8);
    }
    if (handover.financial_notes) {
      doc.text(`Notas Financieras: ${handover.financial_notes}`, { align: 'left' });
      doc.moveDown(0.8);
    }
    doc.moveDown(1);
  }

  // Signatures
  doc.fontSize(16).text('FIRMAS', { align: 'left' });
  doc.moveDown(1);

  doc.fontSize(12);
  if (handover.outgoing_signature) {
    doc.text(`Firma Empleado Saliente: ${handover.outgoing_signature}`, { align: 'left' });
    doc.moveDown(0.8);
  }
  if (handover.incoming_signature) {
    doc.text(`Firma Empleado Entrante: ${handover.incoming_signature}`, { align: 'left' });
  }

  // Footer
  doc.moveDown(3);
  doc.fontSize(10).text(`Generado el ${new Date().toLocaleString('es-ES')}`, { align: 'center' });
  doc.moveDown(0.5);
  doc.text('Hotel Sol - Sistema de Gestión Hotelera', { align: 'center' });
}

// Generate PDF for a shift handover
router.get('/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('PDF request received for handover ID:', id);

    // Get handover with employee information and transactions
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
      WHERE h.id = ?
    `, [id]);

    if (handovers.length === 0) {
      return res.status(404).json({ error: 'Handover not found' });
    }

    const handover = handovers[0];

    // Parse selected_rooms JSON
    if (handover.selected_rooms) {
      try {
        handover.selected_rooms = JSON.parse(handover.selected_rooms);
      } catch (e) {
        handover.selected_rooms = [];
      }
    } else {
      handover.selected_rooms = [];
    }

    // Get transactions for this handover
    const [transactions] = await pool.execute(`
      SELECT * FROM shift_transactions 
      WHERE handover_id = ? 
      ORDER BY created_at DESC
    `, [id]);

    handover.transactions = transactions;

    console.log('Handover data retrieved:', handover.id);

    // Create PDF document
    const doc = new pdfkit({
      size: 'A4',
      margin: 50
    });

    console.log('PDF document created');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="entrega-turno-${id}.pdf"`);

    // Pipe PDF to response
    doc.pipe(res);

    console.log('Starting PDF generation');
    // Add content to PDF
    generateShiftHandoverPDF(doc, handover);

    // Finalize PDF
    doc.end();

    console.log('PDF generation completed');

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Error generando el PDF', details: error.message });
  }
});

export default router;