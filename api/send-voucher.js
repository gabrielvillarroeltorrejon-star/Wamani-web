import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { booking } = req.body;

    if (!booking || !booking.customerEmail || !booking.buyOrder) {
      return res.status(400).json({ error: 'Datos de reserva o correo de cliente inválidos' });
    }

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP no configurado en variables de entorno de Vercel.');
      return res.status(200).json({
        success: true,
        sent: false,
        message: 'Servicio de correo no configurado en Vercel (simulación exitosa).'
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const formattedPrice = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(booking.totalPrice);

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: sans-serif; background-color: #f4f6f8; padding: 20px; color: #033E3B;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e0e0e0;">
        <div style="background: linear-gradient(135deg, #045D56 0%, #033E3B 100%); padding: 30px; text-align: center; color: #fff;">
          <h1 style="margin: 0; font-size: 24px;">WAMANI EXPERIENCE</h1>
          <p style="margin: 5px 0 0; color: #2DD4BF; font-size: 13px; text-transform: uppercase;">Comprobante Oficial de Reserva</p>
        </div>
        <div style="padding: 25px;">
          <h3 style="color: #045D56; margin-top: 0;">¡Hola ${booking.customerName}!</h3>
          <p>Tu reserva para <strong>${booking.experienceTitle}</strong> está confirmada.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px 0; color: #666;">N° de Orden:</td><td style="font-weight: bold; color: #0FA095; font-family: monospace;">${booking.buyOrder}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Fecha:</td><td style="font-weight: bold;">${booking.bookingDate}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Pasajeros:</td><td style="font-weight: bold;">${booking.pax}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Total:</td><td style="font-weight: bold; color: #045D56; font-size: 18px;">${formattedPrice}</td></tr>
          </table>
          <p style="font-size: 12px; color: #777;">Punto de Encuentro: Oficina Wamani, Centro de Pucón. Por favor presentarse con 15 min de anticipación.</p>
        </div>
        <div style="background: #022C2A; color: #fff; padding: 15px; text-align: center; font-size: 11px;">
          Wamani Experience • Pucón, Chile • contacto@wamani.cl
        </div>
      </div>
    </body>
    </html>
    `;

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Wamani Experience" <contacto@wamani.cl>',
      to: booking.customerEmail,
      bcc: process.env.ADMIN_NOTIFICATION_EMAIL || 'contacto@wamani.cl',
      subject: `Comprobante de Reserva Wamani: ${booking.buyOrder} - ${booking.experienceTitle}`,
      html: htmlContent
    });

    return res.status(200).json({
      success: true,
      sent: true,
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Error al enviar correo en Vercel:', error);
    return res.status(500).json({
      error: 'Error al enviar correo electrónico',
      details: error.message
    });
  }
}
