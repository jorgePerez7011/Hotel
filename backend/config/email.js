import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configuración del transportador de email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'solhotel.recepcion@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password-here' // Se debe configurar en .env
  },
  debug: true, // Habilitar debugging
  logger: true // Habilitar logging
});

// Verificar configuración de email al inicializar
console.log('🔧 Configuración de Email:');
console.log('EMAIL_USER:', process.env.EMAIL_USER || 'NO CONFIGURADO');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '****configurado****' : 'NO CONFIGURADO');
console.log('EMAIL_PASSWORD_REAL:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.substring(0, 4) + '...' : 'NO CONFIGURADO');

// Función para enviar email de solicitud de reserva
export const sendBookingRequestEmail = async (bookingData) => {
  const { name, email, phone, roomType, checkIn, checkOut, adults, children, comments, nights } = bookingData;
  
  const mailOptions = {
    from: 'solhotel.recepcion@gmail.com',
    to: 'solhotel.recepcion@gmail.com',
    subject: `🏨 Nueva Solicitud de Reserva - Hotel Sol`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">🏨 Hotel Sol</h1>
          <h2 style="color: #374151; margin-top: 0;">Nueva Solicitud de Reserva</h2>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin-top: 0;">📋 Información del Cliente</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Nombre:</td>
              <td style="padding: 8px 0; color: #1f2937;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td>
              <td style="padding: 8px 0; color: #1f2937;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Teléfono:</td>
              <td style="padding: 8px 0; color: #1f2937;"><a href="tel:${phone}" style="color: #2563eb; text-decoration: none;">${phone}</a></td>
            </tr>
          </table>
        </div>
        
        <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin-top: 0;">🛏️ Detalles de la Reserva</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Tipo de Habitación:</td>
              <td style="padding: 8px 0; color: #1f2937;">${roomType}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Fecha de Llegada:</td>
              <td style="padding: 8px 0; color: #1f2937;">${checkIn}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Fecha de Salida:</td>
              <td style="padding: 8px 0; color: #1f2937;">${checkOut}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Número de Noches:</td>
              <td style="padding: 8px 0; color: #1f2937;">${nights}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Huéspedes:</td>
              <td style="padding: 8px 0; color: #1f2937;">${adults} adulto(s), ${children} niño(s)</td>
            </tr>
          </table>
        </div>
        
        ${comments ? `
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin-top: 0;">💬 Comentarios Especiales</h3>
          <p style="margin: 0; color: #374151; line-height: 1.5;">${comments}</p>
        </div>
        ` : ''}
        
        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; text-align: center;">
          <h3 style="color: #1f2937; margin-top: 0;">🎯 Próximos Pasos</h3>
          <p style="margin: 10px 0; color: #374151;">
            1. Contactar al cliente lo antes posible<br>
            2. Confirmar disponibilidad de habitaciones<br>
            3. Enviar cotización y opciones de pago<br>
            4. Procesar la reserva una vez confirmada
          </p>
          <div style="margin-top: 20px;">
            <a href="mailto:${email}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 0 10px;">
              📧 Responder por Email
            </a>
            <a href="tel:${phone}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 0 10px;">
              📞 Llamar Cliente
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Este email fue generado automáticamente desde el sistema de reservas de Hotel Sol<br>
            Fecha: ${new Date().toLocaleString('es-ES')}
          </p>
        </div>
      </div>
    `
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email enviado exitosamente:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return { success: false, error: error.message };
  }
};

export default transporter;