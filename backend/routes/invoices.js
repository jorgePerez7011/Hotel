import express from 'express';
import pool from '../config/mysql.js';

const router = express.Router();

// GET all invoices with optional filters
router.get('/', async (req, res) => {
  try {
    const { status, start_date, end_date, company_id } = req.query;

    let query = 'SELECT * FROM invoices WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (start_date) {
      query += ' AND invoice_date >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND invoice_date <= ?';
      params.push(end_date);
    }

    if (company_id) {
      query += ' AND company_id = ?';
      params.push(company_id);
    }

    query += ' ORDER BY invoice_date DESC, invoice_number DESC';

    const [invoices] = await pool.execute(query, params);
    
    // Para cada factura, si no tiene guest_phone, intentar obtenerlo del booking
    const enrichedInvoices = await Promise.all(
      invoices.map(async (invoice) => {
        if (!invoice.guest_phone && invoice.booking_id) {
          try {
            const [booking] = await pool.execute(
              'SELECT guest_phone FROM bookings WHERE id = ?',
              [invoice.booking_id]
            );
            if (booking.length > 0 && booking[0].guest_phone) {
              invoice.guest_phone = booking[0].guest_phone;
            }
          } catch (err) {
            // Si hay error, simplemente continuar con el teléfono null
            console.warn('Error fetching phone from booking:', err.message);
          }
        }
        return invoice;
      })
    );
    
    res.json(enrichedInvoices);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener facturas',
      error: error.message
    });
  }
});

// GET single invoice
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [invoice] = await pool.execute('SELECT * FROM invoices WHERE id = ?', [id]);

    if (invoice.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    let result = invoice[0];
    
    // Si no tiene guest_phone, intentar obtenerlo del booking
    if (!result.guest_phone && result.booking_id) {
      try {
        const [booking] = await pool.execute(
          'SELECT guest_phone FROM bookings WHERE id = ?',
          [result.booking_id]
        );
        if (booking.length > 0 && booking[0].guest_phone) {
          result.guest_phone = booking[0].guest_phone;
        }
      } catch (err) {
        console.warn('Error fetching phone from booking:', err.message);
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la factura',
      error: error.message
    });
  }
});

// CREATE new invoice
router.post('/', async (req, res) => {
  try {
    const {
      invoice_number,
      booking_id,
      guest_name,
      guest_identification,
      guest_phone,
      guest_email,
      guest_address,
      guest_city,
      company_id,
      invoice_date,
      check_in_date,
      check_out_date,
      room_number,
      nights,
      subtotal,
      tax,
      total,
      payment_method,
      status,
      notes
    } = req.body;

    // Validate required fields
    if (!invoice_number || !guest_name || !total) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: invoice_number, guest_name, total'
      });
    }

    // Check if invoice number already exists
    const [existing] = await pool.execute(
      'SELECT id FROM invoices WHERE invoice_number = ?',
      [invoice_number]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una factura con este número'
      });
    }

    const result = await pool.execute(
      `INSERT INTO invoices 
       (invoice_number, booking_id, guest_name, guest_identification, guest_phone, guest_email, guest_address, guest_city, 
        company_id, invoice_date, check_in_date, check_out_date, room_number, nights, subtotal, tax, total, 
        payment_method, status, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoice_number,
        booking_id || null,
        guest_name,
        guest_identification || null,
        guest_phone || null,
        guest_email || null,
        guest_address || null,
        guest_city || null,
        company_id || null,
        invoice_date || new Date().toISOString().split('T')[0],
        check_in_date || null,
        check_out_date || null,
        room_number || null,
        nights || null,
        subtotal || 0,
        tax || 0,
        total,
        payment_method || null,
        status || 'emitida',
        notes || null
      ]
    );

    console.log(`✅ Factura creada exitosamente (ID: ${result[0].insertId})`);

    res.status(201).json({
      success: true,
      message: 'Factura creada exitosamente',
      data: {
        id: result[0].insertId,
        invoice_number
      }
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la factura',
      error: error.message
    });
  }
});

// UPDATE invoice
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      invoice_number,
      booking_id,
      guest_name,
      guest_identification,
      guest_phone,
      guest_email,
      guest_address,
      guest_city,
      company_id,
      invoice_date,
      check_in_date,
      check_out_date,
      room_number,
      nights,
      subtotal,
      tax,
      total,
      payment_method,
      status,
      notes
    } = req.body;

    // Check if invoice exists
    const [existing] = await pool.execute('SELECT id FROM invoices WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    // Check if invoice_number is unique (excluding current)
    if (invoice_number) {
      const [duplicate] = await pool.execute(
        'SELECT id FROM invoices WHERE invoice_number = ? AND id != ?',
        [invoice_number, id]
      );
      if (duplicate.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe otra factura con este número'
        });
      }
    }

    await pool.execute(
      `UPDATE invoices SET 
       invoice_number = ?, booking_id = ?, guest_name = ?, guest_identification = ?, guest_phone = ?, guest_email = ?, 
       guest_address = ?, guest_city = ?, company_id = ?, invoice_date = ?, check_in_date = ?, check_out_date = ?, 
       room_number = ?, nights = ?, subtotal = ?, tax = ?, total = ?, 
       payment_method = ?, status = ?, notes = ? 
       WHERE id = ?`,
      [
        invoice_number || existing[0].invoice_number,
        booking_id || null,
        guest_name,
        guest_identification || null,
        guest_phone || null,
        guest_email || null,
        guest_address || null,
        guest_city || null,
        company_id || null,
        invoice_date,
        check_in_date || null,
        check_out_date || null,
        room_number || null,
        nights || null,
        subtotal || 0,
        tax || 0,
        total,
        payment_method || null,
        status || 'emitida',
        notes || null,
        id
      ]
    );

    console.log(`✅ Factura actualizada exitosamente (ID: ${id})`);

    res.json({
      success: true,
      message: 'Factura actualizada exitosamente'
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la factura',
      error: error.message
    });
  }
});

// DELETE invoice
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if invoice exists
    const [existing] = await pool.execute('SELECT id FROM invoices WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    await pool.execute('DELETE FROM invoices WHERE id = ?', [id]);

    console.log(`✅ Factura eliminada exitosamente (ID: ${id})`);

    res.json({
      success: true,
      message: 'Factura eliminada exitosamente'
    });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la factura',
      error: error.message
    });
  }
});

// GET invoice stats
router.get('/stats/summary', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let query = `
      SELECT 
        COUNT(*) as total_invoices,
        SUM(total) as total_amount,
        AVG(total) as average_amount,
        MAX(total) as max_amount,
        COUNT(CASE WHEN status = 'pagada' THEN 1 END) as paid_invoices,
        COUNT(CASE WHEN status = 'emitida' THEN 1 END) as pending_invoices,
        COUNT(CASE WHEN status = 'cancelada' THEN 1 END) as cancelled_invoices
      FROM invoices
      WHERE 1=1
    `;
    const params = [];

    if (start_date) {
      query += ' AND invoice_date >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND invoice_date <= ?';
      params.push(end_date);
    }

    const [stats] = await pool.execute(query, params);
    res.json(stats[0]);
  } catch (error) {
    console.error('Get invoice stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

export default router;
