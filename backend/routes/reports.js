import express from 'express';
import puppeteer from 'puppeteer';
import pdfkit from 'pdfkit';
import mysql from 'mysql2/promise';
import { getMySQLConnection } from '../config/mysql.js';

const router = express.Router();

// List all shift reports
router.get('/', async (req, res) => {
  try {
    const connection = await getMySQLConnection();
    const [rows] = await connection.execute('SELECT * FROM shift_reports ORDER BY created_at DESC');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Create a new shift report
router.post('/', async (req, res) => {
  try {
    const {
      fecha_entrega,
      turno,
      recibe,
      jornada,
      habitaciones_ocupadas,
      gaseosas,
      agua,
      mecatos,
      elementos_aseo,
      dinero_caja,
      mecatos_hidratacion,
      compras_turno,
      desayunos,
      almuerzos,
      cenas,
      habitaciones_pendientes,
      compras_pendientes,
      pagos_pendientes,
      ingresos,
      egresos,
      notas
    } = req.body;

    const connection = await getMySQLConnection();
    const [result] = await connection.execute(
      `INSERT INTO shift_reports (
        fecha_entrega, turno, recibe, jornada, habitaciones_ocupadas,
        gaseosas, agua, mecatos, elementos_aseo, dinero_caja, mecatos_hidratacion,
        compras_turno, desayunos, almuerzos, cenas, habitaciones_pendientes,
        compras_pendientes, pagos_pendientes, ingresos, egresos, notas
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fecha_entrega, turno, recibe, jornada, JSON.stringify(habitaciones_ocupadas || []),
        gaseosas, agua, mecatos, elementos_aseo, dinero_caja, mecatos_hidratacion,
        compras_turno, desayunos, almuerzos, cenas, habitaciones_pendientes,
        compras_pendientes, pagos_pendientes, ingresos, egresos, notas
      ]
    );
    connection.release();

    res.status(201).json({ id: result.insertId, message: 'Reporte creado exitosamente' });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Error creando el reporte' });
  }
});

// Update a shift report
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fecha_entrega,
      turno,
      recibe,
      jornada,
      habitaciones_ocupadas,
      gaseosas,
      agua,
      mecatos,
      elementos_aseo,
      dinero_caja,
      mecatos_hidratacion,
      compras_turno,
      desayunos,
      almuerzos,
      cenas,
      habitaciones_pendientes,
      compras_pendientes,
      pagos_pendientes,
      ingresos,
      egresos,
      notas
    } = req.body;

    const connection = await getMySQLConnection();
    await connection.execute(
      `UPDATE shift_reports SET
        fecha_entrega = ?, turno = ?, recibe = ?, jornada = ?, habitaciones_ocupadas = ?,
        gaseosas = ?, agua = ?, mecatos = ?, elementos_aseo = ?, dinero_caja = ?, mecatos_hidratacion = ?,
        compras_turno = ?, desayunos = ?, almuerzos = ?, cenas = ?, habitaciones_pendientes = ?,
        compras_pendientes = ?, pagos_pendientes = ?, ingresos = ?, egresos = ?, notas = ?
      WHERE id = ?`,
      [
        fecha_entrega, turno, recibe, jornada, JSON.stringify(habitaciones_ocupadas || []),
        gaseosas, agua, mecatos, elementos_aseo, dinero_caja, mecatos_hidratacion,
        compras_turno, desayunos, almuerzos, cenas, habitaciones_pendientes,
        compras_pendientes, pagos_pendientes, ingresos, egresos, notas, id
      ]
    );
    connection.release();

    res.json({ message: 'Reporte actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ error: 'Error actualizando el reporte' });
  }
});

// Delete a shift report
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await getMySQLConnection();
    await connection.execute('DELETE FROM shift_reports WHERE id = ?', [id]);
    connection.release();

    res.json({ message: 'Reporte eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Error eliminando el reporte' });
  }
});

// Generate PDF for a shift report
router.get('/:id/pdf', async (req, res) => {
  try {
    console.log('PDF request received for ID:', req.params.id);
    const { id } = req.params;
    const connection = await getMySQLConnection();
    console.log('Database connection established');
    const [rows] = await connection.execute('SELECT * FROM shift_reports WHERE id = ?', [id]);
    connection.release();

    if (rows.length === 0) {
      console.log('Report not found');
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    const report = rows[0];
    console.log('Report found:', report.id);

    // Create PDF document
    const doc = new pdfkit({
      size: 'A4',
      margin: 50
    });

    console.log('PDF document created');

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="control-turno-${id}.pdf"`);

    // Pipe PDF to response
    doc.pipe(res);

    console.log('Starting PDF generation');
    // Add content to PDF
    generateShiftReportPDF(doc, report);

    // Finalize PDF
    doc.end();
    console.log('PDF generation completed');

  } catch (error) {
    console.error('Error generating PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error generando el PDF', details: error.message });
    }
  }
});

// Helper function to generate PDF for shift report
function generateShiftReportPDF(doc, report) {
  try {
    console.log('Starting PDF content generation');
    let habitaciones = [];
    try {
      habitaciones = JSON.parse(report.habitaciones_ocupadas || '[]');
      if (!Array.isArray(habitaciones)) {
        habitaciones = [];
      }
    } catch (e) {
      console.warn('Error parsing habitaciones_ocupadas:', e);
      habitaciones = [];
    }

    // Format date without timezone
    const formatDate = (dateString) => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CO', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        return dateString;
      }
    };

    const drawSection = (title) => {
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#2C3E50');
      doc.moveDown(0.5);
      doc.fontSize(13).font('Helvetica-Bold').fillColor('#FFFFFF').rect(50, doc.y, 495, 20).fill('#2C3E50');
      doc.fillColor('#FFFFFF').text(title, 55, doc.y + 4, { width: 485 });
      doc.moveDown(1.2);
    };

    // Header with better styling
    doc.fontSize(26).font('Helvetica-Bold').fillColor('#1a472a').text('HOTEL SOL', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#2C3E50').text('REPORTE DE CONTROL DE TURNO', { align: 'center' });
    doc.fillColor('black');
    doc.moveDown(0.5);

    // Decorative line
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#1a472a');
    doc.lineWidth(2);
    doc.moveTo(50, doc.y + 2).lineTo(545, doc.y + 2).stroke('#1a472a');
    doc.lineWidth(1);
    doc.moveDown(1.2);

    // Basic Information Section with table layout
    drawSection('📋 INFORMACIÓN GENERAL');

    // Create info table
    const infoTable = [
      ['Fecha:', formatDate(report.fecha_entrega)],
      ['Turno:', report.turno || '-'],
      ['Recibe:', report.recibe || '-'],
      ['Jornada:', report.jornada || '-']
    ];

    doc.fontSize(10).font('Helvetica');
    infoTable.forEach(row => {
      doc.font('Helvetica-Bold').text(row[0], 60, doc.y, { width: 150, height: 20 });
      doc.font('Helvetica').text(row[1], 220, doc.y - 15, { width: 325 });
      doc.moveDown(0.6);
    });

    doc.moveDown(0.8);

    // Rooms Section with better visual layout
    drawSection('🏠 HABITACIONES OCUPADAS');

    doc.fontSize(9).font('Helvetica').text('Estado de ocupación por habitación:', 60);
    doc.moveDown(0.8);

    // Create a grid layout for rooms
    const allRooms = ['101', '102', '103', '104', '105', '106', '107', '108', '109',
                      '211', '212', '213', '214', '215', '216', '217', '218', '219'];

    const roomsPerRow = 9;
    let currentY = doc.y;
    const roomWidth = 50;
    const roomHeight = 20;

    // First floor label
    doc.fontSize(9).font('Helvetica-Bold').text('Primer Piso (101-109):', 60, currentY);
    currentY += 20;

    for (let i = 0; i < 9; i++) {
      const room = allRooms[i];
      const isOccupied = habitaciones.includes(room);
      const x = 60 + (i * roomWidth);

      if (isOccupied) {
        doc.rect(x, currentY, roomWidth - 5, roomHeight).fill('#90EE90');
        doc.fillColor('#000').fontSize(9).font('Helvetica-Bold').text(room, x + 2, currentY + 5, { width: roomWidth - 9 });
      } else {
        doc.rect(x, currentY, roomWidth - 5, roomHeight).stroke();
        doc.fillColor('#000').fontSize(9).font('Helvetica').text(room, x + 2, currentY + 5, { width: roomWidth - 9 });
      }
    }

    currentY += roomHeight + 15;

    // Second floor label
    doc.fontSize(9).font('Helvetica-Bold').fillColor('black').text('Segundo Piso (211-219):', 60, currentY);
    currentY += 20;

    for (let i = 0; i < 9; i++) {
      const room = allRooms[i + 9];
      const isOccupied = habitaciones.includes(room);
      const x = 60 + (i * roomWidth);

      if (isOccupied) {
        doc.rect(x, currentY, roomWidth - 5, roomHeight).fill('#90EE90');
        doc.fillColor('#000').fontSize(9).font('Helvetica-Bold').text(room, x + 2, currentY + 5, { width: roomWidth - 9 });
      } else {
        doc.rect(x, currentY, roomWidth - 5, roomHeight).stroke();
        doc.fillColor('#000').fontSize(9).font('Helvetica').text(room, x + 2, currentY + 5, { width: roomWidth - 9 });
      }
    }

    doc.y = currentY + roomHeight + 10;
    doc.moveDown(0.5);
    doc.fillColor('black');

    // Inventory Section
    drawSection('📦 INVENTARIO Y EXISTENCIAS');

    doc.fontSize(10).font('Helvetica');
    const inventoryData = [
      { label: 'Gaseosas:', value: report.gaseosas || '-' },
      { label: 'Agua:', value: report.agua || '-' },
      { label: 'Mecatos:', value: report.mecatos || '-' },
      { label: 'Elementos de aseo:', value: report.elementos_aseo || '-' },
      { label: 'Dinero en caja:', value: report.dinero_caja || '-' },
      { label: 'Mecatos e hidratación:', value: report.mecatos_hidratacion || '-' }
    ];

    const colWidth = 230;
    let col = 0;
    let startY = doc.y;

    inventoryData.forEach((item, index) => {
      if (col > 0) {
        doc.y = startY;
      }
      
      doc.font('Helvetica-Bold').text(item.label, 60 + (col * colWidth), doc.y, { width: 100 });
      doc.font('Helvetica').text(item.value, 150 + (col * colWidth), doc.y - 15, { width: 100 });
      
      doc.moveDown(0.6);
      col++;
      
      if (col > 1) {
        col = 0;
        startY = doc.y;
      }
    });

    doc.moveDown(1);

    // Purchases Section
    drawSection('🛒 COMPRAS REALIZADAS EN EL TURNO');

    doc.fontSize(10).font('Helvetica').text(report.compras_turno || '(Sin compras registradas)', 60);
    doc.moveDown(1);

    // Deliveries Section
    drawSection('🍽️ ENTREGAS REALIZADAS');

    doc.fontSize(10).font('Helvetica');
    const deliveryData = [
      { label: 'Desayunos:', value: report.desayunos || '-' },
      { label: 'Almuerzos:', value: report.almuerzos || '-' },
      { label: 'Cenas:', value: report.cenas || '-' }
    ];

    col = 0;
    startY = doc.y;

    deliveryData.forEach((item, index) => {
      if (col > 0) {
        doc.y = startY;
      }
      
      doc.font('Helvetica-Bold').text(item.label, 60 + (col * 160), doc.y, { width: 80 });
      doc.font('Helvetica').text(item.value, 140 + (col * 160), doc.y - 15, { width: 80 });
      
      doc.moveDown(0.6);
      col++;
      
      if (col > 1) {
        col = 0;
        startY = doc.y;
      }
    });

    doc.moveDown(1);

    // Pending Items
    drawSection('⏳ TAREAS PENDIENTES');

    doc.fontSize(10).font('Helvetica');
    const pendingData = [
      { label: 'Habitaciones sin aseo:', value: report.habitaciones_pendientes || '(Ninguna)' },
      { label: 'Compras pendientes:', value: report.compras_pendientes || '(Ninguna)' },
      { label: 'Pagos pendientes:', value: report.pagos_pendientes || '(Ninguno)' }
    ];

    pendingData.forEach(item => {
      doc.font('Helvetica-Bold').text(item.label, 60);
      doc.font('Helvetica').text(item.value, 80, doc.y - 15, { width: 465 });
      doc.moveDown(0.7);
    });

    doc.moveDown(0.8);

    // Financial Section
    drawSection('💰 INFORMACIÓN FINANCIERA');

    doc.fontSize(11).font('Helvetica-Bold');
    doc.text(`Ingresos: ${report.ingresos || '-'}`, 60);
    doc.moveDown(0.5);
    doc.text(`Egresos: ${report.egresos || '-'}`, 60);
    doc.moveDown(1);

    // Notes Section
    if (report.notas && report.notas.trim()) {
      drawSection('📝 NOTAS Y OBSERVACIONES');
      doc.fontSize(10).font('Helvetica').text(report.notas, 60, doc.y, { width: 485, align: 'left' });
      doc.moveDown(1);
    }

    // Footer with timestamp
    doc.moveDown(1.2);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#2C3E50');
    doc.moveDown(0.5);
    doc.fontSize(8).font('Helvetica').fillColor('#666666').text('Generado automáticamente por el Sistema de Gestión Hotel Sol', 60, { align: 'left' });
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}`, 60, { align: 'left' });

    console.log('PDF content generation completed');

  } catch (error) {
    console.error('Error generating PDF content:', error);
    doc.fontSize(12).text('Error generating report content', { align: 'left' });
  }
}

export default router;