import express from 'express';
import pool from '../config/mysql.js';

const router = express.Router();

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const [bookings] = await pool.execute(`
      SELECT 
        b.*,
        r.number as room_number,
        r.type as room_type,
        r.floor
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      ORDER BY b.created_at DESC
    `);

    res.json({ 
      success: true,
      bookings 
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener las reservas',
      error: error.message
    });
  }
});

// Create new booking
router.post('/', async (req, res) => {
  try {
    const { 
      room_id,
      guest_name,
      guest_email,
      guest_phone,
      check_in_date,
      check_out_date,
      nights_booked,
      price_per_night,
      total_amount,
      notes,
      status = 'confirmed'
    } = req.body;

    // Validate required fields
    if (!room_id || !guest_name || !check_in_date || !check_out_date || !total_amount) {
      return res.status(400).json({ 
        success: false,
        message: 'Campos requeridos: room_id, guest_name, check_in_date, check_out_date, total_amount' 
      });
    }

    // Validate dates
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkIn >= checkOut) {
      return res.status(400).json({ 
        success: false,
        message: 'La fecha de salida debe ser posterior a la fecha de entrada' 
      });
    }

    if (checkIn < today) {
      return res.status(400).json({ 
        success: false,
        message: 'La fecha de entrada no puede ser anterior a hoy' 
      });
    }

    // Check if room exists
    const [roomCheck] = await pool.execute(
      'SELECT id, current_status, room_number FROM rooms WHERE id = ?',
      [room_id]
    );

    if (roomCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'La habitación no existe'
      });
    }

    const room = roomCheck[0];
    console.log(`Verificando habitación ${room.room_number} (ID: ${room_id}), estado: ${room.current_status}`);

    // Check for conflicting bookings (más importante que el estado de la habitación)
    const [conflictingBookings] = await pool.execute(`
      SELECT id, guest_name, check_in_date, check_out_date FROM bookings 
      WHERE room_id = ? 
      AND status IN ('confirmed', 'checked_in')
      AND (
        (check_in_date <= ? AND check_out_date > ?) OR
        (check_in_date < ? AND check_out_date >= ?) OR
        (check_in_date >= ? AND check_out_date <= ?)
      )
    `, [room_id, check_in_date, check_in_date, check_out_date, check_out_date, check_in_date, check_out_date]);

    if (conflictingBookings.length > 0) {
      const conflict = conflictingBookings[0];
      return res.status(409).json({
        success: false,
        message: `La habitación ${room.room_number} ya tiene una reserva del ${conflict.check_in_date} al ${conflict.check_out_date} a nombre de ${conflict.guest_name}`
      });
    }

    // Only check room status if no booking conflicts
    if (room.current_status && room.current_status !== 'available') {
      return res.status(409).json({
        success: false,
        message: `La habitación ${room.room_number} está en estado: ${room.current_status}`
      });
    }

    // Create the booking
    const [result] = await pool.execute(`
      INSERT INTO bookings (
        room_id, guest_name, guest_email, guest_phone,
        check_in_date, check_out_date, nights_booked,
        price_per_night, total_amount, notes, status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      room_id, guest_name, guest_email, guest_phone,
      check_in_date, check_out_date, nights_booked,
      price_per_night, total_amount, notes, status
    ]);

    // Update room status to reserved
    await pool.execute(
      'UPDATE rooms SET current_status = ? WHERE id = ?',
      ['reserved', room_id]
    );

    // Get the created booking with room details
    const [booking] = await pool.execute(`
      SELECT 
        b.*,
        r.number as room_number,
        r.type as room_type,
        r.floor
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente',
      booking: booking[0]
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al crear la reserva',
      error: error.message
    });
  }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [booking] = await pool.execute(`
      SELECT 
        b.*,
        r.number as room_number,
        r.type as room_type,
        r.floor,
        r.base_price
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.id = ?
    `, [id]);

    if (booking.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Reserva no encontrada' 
      });
    }

    res.json({ 
      success: true,
      booking: booking[0] 
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener la reserva',
      error: error.message
    });
  }
});

// Update booking status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['confirmed', 'checked_in', 'checked_out', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Estado inválido. Opciones válidas: ' + validStatuses.join(', ')
      });
    }

    const [result] = await pool.execute(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Reserva no encontrada' 
      });
    }

    // If booking is cancelled, update room status to available
    if (status === 'cancelled') {
      const [booking] = await pool.execute('SELECT room_id FROM bookings WHERE id = ?', [id]);
      if (booking.length > 0) {
        await pool.execute(
          'UPDATE rooms SET current_status = ? WHERE id = ?',
          ['available', booking[0].room_id]
        );
      }
    }

    res.json({
      success: true,
      message: 'Estado de reserva actualizado exitosamente'
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al actualizar el estado de la reserva',
      error: error.message
    });
  }
});

export default router;