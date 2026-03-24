import express from 'express';
import pool from '../config/mysql.js';

const router = express.Router();

// Middleware para autenticación (opcional pero recomendado)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Por ahora permitimos sin token, pero puedes agregarlo después
  next();
}

// GET todos los productos
router.get('/products', async (req, res) => {
  try {
    const [products] = await pool.execute(
      'SELECT * FROM inventory_products ORDER BY created_at DESC'
    );
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos'
    });
  }
});

// GET producto por ID
router.get('/products/:id', async (req, res) => {
  try {
    const [products] = await pool.execute(
      'SELECT * FROM inventory_products WHERE id = ?',
      [req.params.id]
    );
    
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: products[0]
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener producto'
    });
  }
});

// POST crear producto
router.post('/products', authenticateToken, async (req, res) => {
  try {
    const { code, name, category, quantity, min_stock, unit_price, description } = req.body;
    
    // Validar campos requeridos
    if (!code || !name || !category || !unit_price) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos'
      });
    }
    
    // Verificar que el código sea único
    const [existing] = await pool.execute(
      'SELECT id FROM inventory_products WHERE code = ?',
      [code]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'El código de producto ya existe'
      });
    }
    
    // Insertar producto
    const [result] = await pool.execute(
      `INSERT INTO inventory_products 
       (code, name, category, quantity, min_stock, unit_price, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [code, name, category, quantity || 0, min_stock || 0, unit_price, description || '']
    );
    
    // Obtener el producto creado
    const [newProduct] = await pool.execute(
      'SELECT * FROM inventory_products WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Producto creado correctamente',
      data: newProduct[0]
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear producto'
    });
  }
});

// PUT actualizar producto
router.put('/products/:id', authenticateToken, async (req, res) => {
  try {
    const { code, name, category, quantity, min_stock, unit_price, description } = req.body;
    const productId = req.params.id;
    
    // Validar que el producto exista
    const [existing] = await pool.execute(
      'SELECT id FROM inventory_products WHERE id = ?',
      [productId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    
    // Actualizar producto
    await pool.execute(
      `UPDATE inventory_products 
       SET code = ?, name = ?, category = ?, quantity = ?, min_stock = ?, unit_price = ?, description = ?
       WHERE id = ?`,
      [code, name, category, quantity || 0, min_stock || 0, unit_price, description || '', productId]
    );
    
    // Obtener el producto actualizado
    const [updatedProduct] = await pool.execute(
      'SELECT * FROM inventory_products WHERE id = ?',
      [productId]
    );
    
    res.json({
      success: true,
      message: 'Producto actualizado correctamente',
      data: updatedProduct[0]
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar producto'
    });
  }
});

// DELETE eliminar producto
router.delete('/products/:id', authenticateToken, async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Obtener el producto antes de eliminar (para devolver su nombre)
    const [product] = await pool.execute(
      'SELECT name FROM inventory_products WHERE id = ?',
      [productId]
    );
    
    if (product.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    
    // Eliminar producto
    await pool.execute(
      'DELETE FROM inventory_products WHERE id = ?',
      [productId]
    );
    
    res.json({
      success: true,
      message: `Producto "${product[0].name}" eliminado correctamente`
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar producto'
    });
  }
});

export default router;
