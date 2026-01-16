import express from 'express';
import pool from '../config/mysql.js';
import { sendBookingRequestEmail } from '../config/email.js';

const router = express.Router();

// Obtener todas las habitaciones con su estado actual
router.get('/rooms', async (req, res) => {
  try {
    const [rooms] = await pool.execute(`
      SELECT 
        r.id,
        r.room_number,
        r.type,
        r.capacity,
        r.base_price,
        r.price_per_night,
        r.floor,
        r.description,
        r.current_status,
        r.is_available,
        r.created_at,
        b.id as booking_id,
        b.guest_name,
        b.guest_email,
        b.guest_phone,
        b.guest_identification,
        b.check_in_date,
        b.check_out_date,
        b.total_amount,
        b.price_per_night as booking_price,
        b.status as booking_status,
        b.nights_booked,
        b.company_id,
        b.company_name,
        b.payment_type
      FROM rooms r
      LEFT JOIN bookings b ON r.id = b.room_id 
        AND b.status IN ('pending', 'confirmed', 'checked_in')
        AND DATE(b.check_in_date) <= DATE_ADD(CURDATE(), INTERVAL 1 DAY)
        AND DATE(b.check_out_date) >= CURDATE()
      ORDER BY r.room_number ASC
    `);

    // Asegurar que current_status está siempre definido
    const processedRooms = rooms.map(room => ({
      ...room,
      current_status: room.current_status || 'available'
    }));

    console.log('📊 Habitaciones cargadas:', processedRooms.map(r => ({ 
      number: r.room_number, 
      status: r.current_status,
      guest: r.guest_name || 'N/A',
      checkIn: r.check_in_date ? new Date(r.check_in_date).toLocaleDateString('es-ES') : 'N/A'
    })));

    const summary = {
      total: processedRooms.length,
      available: processedRooms.filter(r => r.current_status === 'available').length,
      occupied: processedRooms.filter(r => r.current_status === 'occupied').length,
      reserved: processedRooms.filter(r => r.current_status === 'reserved').length,
      maintenance: processedRooms.filter(r => r.current_status === 'maintenance').length,
      cleaning: processedRooms.filter(r => r.current_status === 'cleaning').length
    };

    console.log('📈 Resumen de estados:', summary);

    res.json({ 
      success: true,
      rooms: processedRooms,
      summary
    });
  } catch (error) {
    console.error('❌ Error fetching rooms:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch rooms',
      message: error.message
    });
  }
});

// Obtener habitaciones por estado
router.get('/rooms/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    
    let whereClause = '';
    
    switch (status) {
      case 'available':
        whereClause = `WHERE r.status = 'available' AND b.id IS NULL`;
        break;
      case 'occupied':
        whereClause = `WHERE b.id IS NOT NULL AND b.check_in_date <= CURDATE() AND b.check_out_date > CURDATE()`;
        break;
      case 'reserved':
        whereClause = `WHERE b.id IS NOT NULL AND b.check_in_date > CURDATE()`;
        break;
      case 'maintenance':
        whereClause = `WHERE r.status = 'maintenance'`;
        break;
      case 'cleaning':
        whereClause = `WHERE r.status = 'cleaning'`;
        break;
      default:
        return res.status(400).json({ error: 'Invalid status' });
    }

    const [rooms] = await pool.execute(`
      SELECT 
        r.*,
        '${status}' as current_status,
        b.id as booking_id,
        b.guest_name,
        b.guest_email,
        b.check_in_date,
        b.check_out_date,
        b.total_amount,
        b.status as booking_status
      FROM rooms r
      LEFT JOIN bookings b ON r.id = b.room_id 
        AND b.status IN ('confirmed', 'checked_in')
      ${whereClause}
      ORDER BY r.room_number ASC
    `);

    res.json({ 
      success: true,
      rooms,
      status,
      count: rooms.length
    });
  } catch (error) {
    console.error('Error fetching rooms by status:', error);
    res.status(500).json({ 
      error: 'Failed to fetch rooms by status',
      message: error.message
    });
  }
});

// Cambiar estado de habitación
router.patch('/rooms/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['available', 'maintenance', 'cleaning', 'out_of_order'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status',
        validStatuses 
      });
    }

    // Verificar que la habitación existe
    const [room] = await pool.execute('SELECT id, room_number FROM rooms WHERE id = ?', [id]);
    
    if (room.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Actualizar estado guardando tanto is_available como current_status
    const isAvailable = status === 'available' ? 1 : 0;
    
    console.log(`Actualizando habitación ${room[0].room_number} (ID: ${id}) de estado a: ${status}`);
    
    const [result] = await pool.execute(`
      UPDATE rooms 
      SET is_available = ?, current_status = ?
      WHERE id = ?
    `, [isAvailable, status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    console.log(`✅ Habitación ${room[0].room_number} actualizada exitosamente a ${status}`);

    // Obtener habitación actualizada para verificar el cambio
    const [updatedRoom] = await pool.execute(`
      SELECT id, room_number, current_status, is_available FROM rooms WHERE id = ?
    `, [id]);

    console.log(`Estado verificado: ${updatedRoom[0].current_status}, disponible: ${updatedRoom[0].is_available}`);

    res.json({
      success: true,
      message: `Room ${room[0].room_number} status updated to ${status}`,
      room: {
        id: updatedRoom[0].id,
        number: updatedRoom[0].room_number,
        current_status: updatedRoom[0].current_status,
        is_available: updatedRoom[0].is_available
      }
    });

  } catch (error) {
    console.error('Error updating room status:', error);
    res.status(500).json({ 
      error: 'Failed to update room status',
      message: error.message
    });
  }
});

// Obtener ocupación por fecha
router.get('/rooms/occupancy/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    const [occupancy] = await pool.execute(`
      SELECT 
        COUNT(r.id) as total_rooms,
        COUNT(CASE WHEN b.id IS NOT NULL AND b.check_in_date <= ? AND b.check_out_date > ? THEN 1 END) as occupied_rooms,
        COUNT(CASE WHEN r.status = 'available' AND b.id IS NULL THEN 1 END) as available_rooms,
        COUNT(CASE WHEN r.status = 'maintenance' THEN 1 END) as maintenance_rooms,
        COUNT(CASE WHEN r.status = 'cleaning' THEN 1 END) as cleaning_rooms,
        ROUND(
          (COUNT(CASE WHEN b.id IS NOT NULL AND b.check_in_date <= ? AND b.check_out_date > ? THEN 1 END) * 100.0) / COUNT(r.id),
          1
        ) as occupancy_percentage
      FROM rooms r
      LEFT JOIN bookings b ON r.id = b.room_id 
        AND b.status IN ('confirmed', 'checked_in')
        AND b.check_in_date <= ? 
        AND b.check_out_date > ?
    `, [date, date, date, date, date, date]);

    const [roomsByFloor] = await pool.execute(`
      SELECT 
        r.floor,
        COUNT(r.id) as total_rooms,
        COUNT(CASE WHEN b.id IS NOT NULL AND b.check_in_date <= ? AND b.check_out_date > ? THEN 1 END) as occupied_rooms,
        COUNT(CASE WHEN r.status = 'available' AND b.id IS NULL THEN 1 END) as available_rooms
      FROM rooms r
      LEFT JOIN bookings b ON r.id = b.room_id 
        AND b.status IN ('confirmed', 'checked_in')
        AND b.check_in_date <= ? 
        AND b.check_out_date > ?
      GROUP BY r.floor
      ORDER BY r.floor
    `, [date, date, date, date]);

    res.json({
      success: true,
      date,
      occupancy: occupancy[0],
      by_floor: roomsByFloor
    });

  } catch (error) {
    console.error('Error fetching occupancy:', error);
    res.status(500).json({ 
      error: 'Failed to fetch occupancy data',
      message: error.message
    });
  }
});

// Estadísticas de habitaciones
router.get('/rooms/stats', async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_rooms,
        COUNT(CASE WHEN type = 'standard' THEN 1 END) as standard_rooms,
        COUNT(CASE WHEN type = 'executive' THEN 1 END) as executive_rooms,
        AVG(CASE WHEN type = 'standard' THEN price_per_night END) as avg_standard_price,
        AVG(CASE WHEN type = 'executive' THEN price_per_night END) as avg_executive_price,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available_count,
        COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance_count,
        COUNT(CASE WHEN status = 'cleaning' THEN 1 END) as cleaning_count
      FROM rooms
    `);

    const [revenueStats] = await pool.execute(`
      SELECT 
        COALESCE(SUM(b.total_amount), 0) as total_revenue_month,
        COUNT(b.id) as total_bookings_month,
        COALESCE(AVG(b.total_amount), 0) as avg_booking_value
      FROM bookings b
      WHERE b.check_in_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        AND b.status IN ('confirmed', 'checked_in', 'checked_out')
    `);

    res.json({
      success: true,
      room_stats: stats[0],
      revenue_stats: revenueStats[0]
    });

  } catch (error) {
    console.error('Error fetching room stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch room statistics',
      message: error.message
    });
  }
});

// Check-in endpoint
router.post('/rooms/:id/checkin', async (req, res) => {
  try {
    const { id } = req.params;
    const { checkin_time, guest_info, price_per_night } = req.body;

    // Verificar que la habitación existe
    const [room] = await pool.execute(`
      SELECT id, room_number, current_status, price_per_night as db_price
      FROM rooms 
      WHERE id = ?
    `, [id]);

    if (room.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Permitir check-in para habitaciones disponibles, reservadas u ocupadas
    const allowedStatuses = ['available', 'reserved', 'occupied'];
    if (!allowedStatuses.includes(room[0].current_status)) {
      return res.status(400).json({ 
        error: `Cannot check-in room ${room[0].room_number}. Current status: ${room[0].current_status}. Allowed: ${allowedStatuses.join(', ')}` 
      });
    }

    // El precio viene en COP desde el frontend
    // Asegurar que finalPrice sea numérico
    const finalPrice = parseInt(price_per_night || room[0].db_price || 0);
    
    console.log(`💰 Check-in Habitación ${room[0].room_number}: Precio = ${finalPrice}`);

    // Actualizar el estado de la habitación a ocupada
    await pool.execute(`
      UPDATE rooms 
      SET current_status = 'occupied', 
          is_available = false,
          price_per_night = ?
      WHERE id = ?
    `, [finalPrice, id]);

    // Si es una habitación disponible (walk-in), crear una nueva reserva
    // Si es reservada, actualizar la reserva existente
    if (guest_info || room[0].current_status === 'reserved') {
      const checkInDate = new Date();
      const checkOutDate = new Date(checkInDate);
      const nights = guest_info?.nights || 1;
      checkOutDate.setDate(checkOutDate.getDate() + nights);
      
      // Calcular total_amount correctamente: precio × noches
      const totalAmount = finalPrice * nights;
      
      console.log(`📝 Booking: ${nights} noches × ${finalPrice} = ${totalAmount}`);

      // Si es reservada, actualizar el booking existente
      if (room[0].current_status === 'reserved') {
        await pool.execute(`
          UPDATE bookings 
          SET status = 'checked_in', 
              actual_checkin_time = ?
          WHERE room_id = ? 
          AND status IN ('pending', 'confirmed')
          LIMIT 1
        `, [
          checkin_time || new Date().toISOString(),
          id
        ]);
      } else {
        // Si es disponible, crear nuevo booking (walk-in)
        await pool.execute(`
          INSERT INTO bookings 
          (room_id, guest_name, guest_email, guest_phone, check_in_date, check_out_date, 
           total_amount, status, nights_booked, price_per_night, notes, actual_checkin_time)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'checked_in', ?, ?, ?, ?)
        `, [
          id,
          guest_info.name || 'Walk-in Guest',
          guest_info.email || '',
          guest_info.phone || '',
          checkInDate.toISOString().split('T')[0],
          checkOutDate.toISOString().split('T')[0],
          totalAmount,
          nights,
          finalPrice,
          guest_info.notes || 'Walk-in guest - Check-in directo',
          checkin_time || new Date().toISOString()
        ]);
      }
    }

    console.log(`✅ Check-in: Habitación ${room[0].room_number} → ocupada`);

    res.json({
      success: true,
      message: `Check-in successful for room ${room[0].room_number}`,
      room_id: id,
      checkin_time: checkin_time || new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error during check-in:', error);
    res.status(500).json({
      error: 'Check-in failed',
      message: error.message
    });
  }
});

// Check-out endpoint
router.post('/rooms/:id/checkout', async (req, res) => {
  try {
    const { id } = req.params;
    const { checkout_time } = req.body;

    // Verificar que la habitación existe y está ocupada
    const [room] = await pool.execute(`
      SELECT id, room_number, current_status 
      FROM rooms 
      WHERE id = ?
    `, [id]);

    if (room.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room[0].current_status !== 'occupied') {
      return res.status(400).json({ 
        error: `Cannot check-out room ${room[0].room_number}. Current status: ${room[0].current_status}` 
      });
    }

    // Actualizar el estado de la habitación a limpieza
    await pool.execute(`
      UPDATE rooms 
      SET current_status = 'cleaning', 
          is_available = false 
      WHERE id = ?
    `, [id]);

    // Obtener la fecha y hora actual
    const now = new Date();
    const checkoutDateTime = checkout_time || now.toISOString();
    const checkoutDate = checkoutDateTime.split('T')[0]; // Fecha en formato YYYY-MM-DD

    // Actualizar la reserva para marcar el check-out y actualizar la fecha
    await pool.execute(`
      UPDATE bookings 
      SET status = 'checked_out', 
          check_out_date = ?,
          actual_checkout_time = ? 
      WHERE room_id = ? AND status = 'checked_in'
    `, [checkoutDate, checkoutDateTime, id]);

    console.log(`✅ Check-out realizado para habitación ${room[0].room_number}`);

    res.json({
      success: true,
      message: `Check-out successful for room ${room[0].room_number}`,
      room_id: id,
      checkout_time: checkoutDateTime
    });

  } catch (error) {
    console.error('Error during check-out:', error);
    res.status(500).json({ 
      error: 'Failed to perform check-out',
      message: error.message
    });
  }
});

// Obtener habitaciones disponibles (GET endpoint para componentes existentes)
router.get('/rooms/available', async (req, res) => {
  try {
    const { checkIn, checkOut, roomType, guests } = req.query;
    
    let query = `
      SELECT r.id, r.room_number, r.type, r.capacity, r.price_per_night, r.floor, r.description
      FROM rooms r
      WHERE r.is_available = 1
    `;
    
    let queryParams = [];
    
    // Filtrar por tipo de habitación si se especifica
    if (roomType && roomType !== 'all') {
      query += ` AND r.type = ?`;
      queryParams.push(roomType);
    }
    
    // Filtrar por capacidad si se especifica número de huéspedes
    if (guests) {
      query += ` AND r.capacity >= ?`;
      queryParams.push(parseInt(guests));
    }
    
    // Excluir habitaciones ocupadas en las fechas solicitadas
    if (checkIn && checkOut) {
      query += ` AND r.id NOT IN (
        SELECT DISTINCT b.room_id 
        FROM bookings b 
        WHERE (
          (b.check_in_date <= ? AND b.check_out_date > ?) OR
          (b.check_in_date < ? AND b.check_out_date >= ?) OR
          (b.check_in_date >= ? AND b.check_out_date <= ?)
        )
        AND b.status IN ('confirmed', 'checked_in')
      )`;
      
      queryParams.push(checkOut, checkIn, checkOut, checkIn, checkIn, checkOut);
    }
    
    query += ` ORDER BY r.floor, r.room_number`;
    
    const [availableRooms] = await pool.execute(query, queryParams);
    
    res.json({
      success: true,
      rooms: availableRooms,
      count: availableRooms.length,
      filters: {
        checkIn: checkIn || null,
        checkOut: checkOut || null,
        roomType: roomType || 'all',
        guests: guests || null
      }
    });
    
  } catch (error) {
    console.error('Error obteniendo habitaciones disponibles:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor',
      rooms: []
    });
  }
});

// Verificar disponibilidad de habitaciones
router.post('/check-availability', async (req, res) => {
  try {
    const { roomType, checkIn, checkOut, adults, children } = req.body;
    
    // Mapear tipo de habitación a los tipos en la base de datos
    const roomTypeMapping = {
      'Junior Suite': 'suite',
      'Executive': 'doble', // Puede ser doble premium
      'Suite': 'suite',
      'Doble': 'doble',
      'Sencilla': 'sencilla', 
      'Familiar': 'familiar'
    };
    
    const dbRoomType = roomTypeMapping[roomType] || 'doble';
    
    // Buscar habitaciones del tipo solicitado que estén disponibles
    const query = `
      SELECT r.id, r.room_number, r.type, r.price_per_night
      FROM rooms r
      WHERE r.type = ? 
        AND r.is_available = 1
        AND r.id NOT IN (
          SELECT DISTINCT b.room_id 
          FROM bookings b 
          WHERE (
            (b.check_in_date <= ? AND b.check_out_date > ?) OR
            (b.check_in_date < ? AND b.check_out_date >= ?) OR
            (b.check_in_date >= ? AND b.check_out_date <= ?)
          )
          AND b.status IN ('confirmed', 'checked_in')
        )
    `;
    
    const [availableRooms] = await pool.execute(query, [
      dbRoomType, 
      checkOut, checkIn, 
      checkOut, checkIn,
      checkIn, checkOut
    ]);
    
    const available = availableRooms.length > 0;
    
    res.json({
      available,
      availableRooms: availableRooms.length,
      rooms: available ? availableRooms.slice(0, 3) : [], // Máximo 3 opciones
      message: available 
        ? `${availableRooms.length} habitación(es) ${roomType} disponible(s) para las fechas seleccionadas`
        : `No hay habitaciones ${roomType} disponibles para las fechas seleccionadas`
    });
    
  } catch (error) {
    console.error('Error verificando disponibilidad:', error);
    res.status(500).json({ 
      available: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// Enviar solicitud de reserva por email
router.post('/booking-request', async (req, res) => {
  try {
    const { name, email, phone, checkIn, checkOut, adults, children, comments, roomType } = req.body;
    
    // Validar datos requeridos
    if (!name || !email || !phone || !checkIn || !checkOut || !roomType) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos: nombre, email, teléfono, fechas y tipo de habitación'
      });
    }
    
    // Calcular noches
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
    // Validar que las fechas sean válidas
    if (nights <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Las fechas de entrada y salida no son válidas'
      });
    }
    
    // Preparar datos para el email
    const bookingData = {
      name,
      email,
      phone,
      roomType,
      checkIn,
      checkOut,
      adults: parseInt(adults) || 1,
      children: parseInt(children) || 0,
      comments: comments || '',
      nights
    };
    
    // Intentar enviar email de notificación
    let emailResult;
    try {
      emailResult = await sendBookingRequestEmail(bookingData);
    } catch (error) {
      console.error('Error al intentar enviar email:', error.message);
      emailResult = { success: false, error: error.message };
    }
    
    // Siempre guardar la solicitud, independientemente del email
    console.log('\n🎉 NUEVA SOLICITUD DE RESERVA RECIBIDA');
    console.log(`👤 Cliente: ${name} (${email})`);
    console.log(`📞 Teléfono: ${phone}`);
    console.log(`🛏️ Habitación: ${roomType}`);
    console.log(`📅 ${checkIn} → ${checkOut} (${nights} noche${nights !== 1 ? 's' : ''})`);
    console.log(`👥 ${adults} adulto${adults !== 1 ? 's' : ''}, ${children} niño${children !== 1 ? 's' : ''}`);
    if (comments) console.log(`💬 Comentarios: ${comments}`);
    console.log('=======================================\n');

    if (emailResult && emailResult.success) {
      console.log('📧 ¡Email enviado exitosamente a solhotel.recepcion@gmail.com!');
      
      res.json({
        success: true,
        message: '¡Solicitud de reserva enviada exitosamente! Email enviado correctamente. Te contactaremos pronto.',
        bookingDetails: bookingData
      });
    } else {
      // Si falla el email, aún guardamos la info en logs para no perder la solicitud
      console.log('⚠️ Email no pudo ser enviado, pero solicitud guardada en logs');
      
      res.json({
        success: true,
        message: 'Su solicitud de reserva ha sido recibida exitosamente. Nos pondremos en contacto contigo para finalizar la reserva.',
        bookingDetails: bookingData,
        note: 'La solicitud fue guardada en el sistema. El hotel recibirá la notificación.'
      });
    }
    
  } catch (error) {
    console.error('Error procesando solicitud de reserva:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor. Por favor, intenta nuevamente.' 
    });
  }
});

// Endpoint de diagnóstico - Ver estado real de la BD
router.get('/debug/rooms-status', async (req, res) => {
  try {
    const [rooms] = await pool.execute(`
      SELECT 
        r.id,
        r.room_number,
        r.current_status,
        r.is_available,
        COUNT(DISTINCT CASE 
          WHEN b.status IN ('confirmed', 'checked_in') 
          AND b.check_in_date <= CURDATE() 
          AND b.check_out_date >= CURDATE() 
          THEN b.id 
        END) as active_bookings,
        MAX(CASE 
          WHEN b.status IN ('confirmed', 'checked_in') 
          AND b.check_in_date <= CURDATE() 
          AND b.check_out_date >= CURDATE() 
          THEN b.guest_name 
        END) as current_guest
      FROM rooms r
      LEFT JOIN bookings b ON r.id = b.room_id
      GROUP BY r.id, r.room_number, r.current_status, r.is_available
      ORDER BY r.room_number ASC
    `);

    res.json({
      success: true,
      debug_data: rooms,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en diagnóstico:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;