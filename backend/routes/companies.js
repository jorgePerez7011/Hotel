import express from 'express';
import pool from '../config/mysql.js';

const router = express.Router();

// GET all companies
router.get('/', async (req, res) => {
  try {
    const [companies] = await pool.execute(`
      SELECT id, nit, name, description, created_at, updated_at
      FROM companies
      ORDER BY name ASC
    `);

    res.json({
      success: true,
      data: companies,
      count: companies.length
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener las empresas',
      message: error.message
    });
  }
});

// GET company by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [company] = await pool.execute(`
      SELECT id, nit, name, description, created_at, updated_at
      FROM companies
      WHERE id = ?
    `, [id]);

    if (company.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Empresa no encontrada'
      });
    }

    res.json({
      success: true,
      data: company[0]
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener la empresa',
      message: error.message
    });
  }
});

// POST create company
router.post('/', async (req, res) => {
  try {
    const { nit, name, description } = req.body;

    // Validaciones
    if (!nit || !nit.trim()) {
      return res.status(400).json({
        success: false,
        error: 'El NIT es requerido'
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'El nombre de la empresa es requerido'
      });
    }

    // Verificar si el NIT ya existe
    const [existing] = await pool.execute(`
      SELECT id FROM companies WHERE nit = ?
    `, [nit.trim()]);

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe una empresa con ese NIT'
      });
    }

    // Insertar la empresa
    const [result] = await pool.execute(`
      INSERT INTO companies (nit, name, description, created_at, updated_at)
      VALUES (?, ?, ?, NOW(), NOW())
    `, [nit.trim(), name.trim(), (description || '').trim()]);

    const newCompany = {
      id: result.insertId,
      nit: nit.trim(),
      name: name.trim(),
      description: (description || '').trim(),
      created_at: new Date(),
      updated_at: new Date()
    };

    console.log(`✅ Empresa creada: ${name} (NIT: ${nit})`);

    res.status(201).json({
      success: true,
      data: newCompany,
      message: 'Empresa creada exitosamente'
    });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear la empresa',
      message: error.message
    });
  }
});

// PUT update company
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nit, name, description } = req.body;

    // Validaciones
    if (!nit || !nit.trim()) {
      return res.status(400).json({
        success: false,
        error: 'El NIT es requerido'
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'El nombre de la empresa es requerido'
      });
    }

    // Verificar si existe la empresa
    const [company] = await pool.execute(`
      SELECT id FROM companies WHERE id = ?
    `, [id]);

    if (company.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Empresa no encontrada'
      });
    }

    // Verificar si el NIT ya existe (en otra empresa)
    const [existing] = await pool.execute(`
      SELECT id FROM companies WHERE nit = ? AND id != ?
    `, [nit.trim(), id]);

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe otra empresa con ese NIT'
      });
    }

    // Actualizar la empresa
    await pool.execute(`
      UPDATE companies
      SET nit = ?, name = ?, description = ?, updated_at = NOW()
      WHERE id = ?
    `, [nit.trim(), name.trim(), (description || '').trim(), id]);

    const updatedCompany = {
      id: parseInt(id),
      nit: nit.trim(),
      name: name.trim(),
      description: (description || '').trim()
    };

    console.log(`✅ Empresa actualizada: ${name} (ID: ${id})`);

    res.json({
      success: true,
      data: updatedCompany,
      message: 'Empresa actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar la empresa',
      message: error.message
    });
  }
});

// DELETE company
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si existe la empresa
    const [company] = await pool.execute(`
      SELECT name FROM companies WHERE id = ?
    `, [id]);

    if (company.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Empresa no encontrada'
      });
    }

    const companyName = company[0].name;

    // Verificar si hay check-ins relacionados
    const [bookings] = await pool.execute(`
      SELECT COUNT(*) as count FROM bookings WHERE company_id = ?
    `, [id]);

    if (bookings[0].count > 0) {
      return res.status(400).json({
        success: false,
        error: `No se puede eliminar la empresa. Tiene ${bookings[0].count} check-in(s) relacionado(s)`,
        bookingsCount: bookings[0].count
      });
    }

    // Eliminar la empresa
    await pool.execute(`
      DELETE FROM companies WHERE id = ?
    `, [id]);

    console.log(`✅ Empresa eliminada: ${companyName} (ID: ${id})`);

    res.json({
      success: true,
      message: `Empresa "${companyName}" eliminada exitosamente`
    });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar la empresa',
      message: error.message
    });
  }
});

export default router;
