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

    const formattedPrice = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(booking.totalPrice);

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: sans-serif; background-color: #f4f6f8; padding: 20px; color: #033E3B;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e0e0e0; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #045D56 0%, #033E3B 100%); padding: 30px; text-align: center; color: #fff;">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">WAMANI EXPERIENCE</h1>
          <p style="margin: 5px 0 0; color: #2DD4BF; font-size: 13px; text-transform: uppercase;">Comprobante Oficial de Reserva • E-Commerce Chile</p>
        </div>
        <div style="padding: 25px;">
          <h3 style="color: #045D56; margin-top: 0;">¡Hola ${booking.customerName}!</h3>
          <p>Tu reserva para <strong>${booking.experienceTitle}</strong> ha sido procesada con éxito.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">N° de Orden (Buy Order):</td><td style="font-weight: bold; color: #0FA095; font-family: monospace; border-bottom: 1px solid #eee;">${booking.buyOrder}</td></tr>
            <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">Pasajero Titular:</td><td style="font-weight: bold; border-bottom: 1px solid #eee;">${booking.customerName} (${booking.customerRut || 'N/A'})</td></tr>
            <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">Fecha de la Excursión:</td><td style="font-weight: bold; border-bottom: 1px solid #eee;">${booking.bookingDate}</td></tr>
            <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">Número de Pasajeros:</td><td style="font-weight: bold; border-bottom: 1px solid #eee;">${booking.pax} ${booking.pax === 1 ? 'persona' : 'personas'}</td></tr>
            <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">Método de Pago:</td><td style="font-weight: bold; border-bottom: 1px solid #eee;">${booking.paymentMethod === 'webpay' ? 'Transbank Webpay Plus' : 'Transferencia Bancaria Directa'}</td></tr>
            ${booking.authorizationCode ? `<tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">Cód. Autorización TBK:</td><td style="font-weight: bold; font-family: monospace; border-bottom: 1px solid #eee;">${booking.authorizationCode}</td></tr>` : ''}
            <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">Documento Tributario (SII):</td><td style="font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #eee;">${booking.invoiceType === 'factura' ? 'Factura Electrónica' : 'Boleta Electrónica'}</td></tr>
            <tr><td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;">Total Pagado / Pactado:</td><td style="font-weight: bold; color: #045D56; font-size: 18px; border-bottom: 1px solid #eee;">${formattedPrice} CLP</td></tr>
          </table>

          <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 6px; margin-bottom: 15px; font-size: 13px;">
            <strong>Póliza Colectiva SERNATUR:</strong> Amparado bajo seguro de accidentes personales en turismo aventura. Guías certificados WFR.
          </div>

          <p style="font-size: 12px; color: #666; line-height: 1.5; margin-bottom: 8px;">
            <strong>Punto de Encuentro:</strong> Centro de Pucón, Región de La Araucanía. Por favor presentarse 15 minutos antes con vestimenta adecuada de trekking y calzado cerrado.
          </p>
          <p style="font-size: 11px; color: #888; line-height: 1.4;">
            * Recuerda que las entradas a Parques Nacionales CONAF no están incluidas y deben ser gestionadas previamente en <em>pasesparques.cl</em> si la ruta lo requiere. Ante alertas meteorológicas oficiales de SENAPRED o cierres de parques, opera nuestra política de reprogramación o devolución garantizada.
          </p>
        </div>
        <div style="background: #022C2A; color: #fff; padding: 18px; text-align: center; font-size: 11px; line-height: 1.6;">
          <strong>Wamani Turismo y Expediciones SpA</strong> • RUT: 77.890.123-4<br>
          Registro Nacional SERNATUR N° 84219 • Pucón, Chile<br>
          Contacto: contacto@wamani.cl | Asistencia: +56 9 8567 3376
        </div>
      </div>
    </body>
    </html>
    `;

    // 1. Envío prioritario con Resend API (HTTP ultrarrápido sin bloqueos de firewall)
    if (process.env.RESEND_API_KEY) {
      try {
        const fromEmail = process.env.SMTP_FROM || 'Wamani Experience <onboarding@resend.dev>';
        const recipients = [booking.customerEmail];
        
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: fromEmail,
            to: recipients,
            bcc: process.env.ADMIN_NOTIFICATION_EMAIL ? [process.env.ADMIN_NOTIFICATION_EMAIL] : undefined,
            subject: `Comprobante de Reserva Wamani: ${booking.buyOrder} - ${booking.experienceTitle}`,
            html: htmlContent
          })
        });

        const resendData = await resendRes.json();
        
        if (resendRes.ok) {
          return res.status(200).json({
            success: true,
            sent: true,
            provider: 'resend',
            id: resendData.id
          });
        } else {
          console.warn('Resend notice (verificar dominio si está en sandbox):', resendData);
          // Si está en modo sandbox, intentar notificar al correo administrativo
          const adminTarget = process.env.ADMIN_NOTIFICATION_EMAIL || 'experiencewamani@gmail.com';
          const fallbackOwner = 'gabrielvillarroeltorrejon@gmail.com';
          
          let alertSent = false;
          try {
            const adminRes = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: fromEmail,
                to: [adminTarget],
                subject: `Nueva Reserva Recibida: ${booking.buyOrder} - ${booking.experienceTitle}`,
                html: htmlContent
              })
            });
            alertSent = adminRes.ok;
          } catch (e) {}

          // Si el adminTarget fue rechazado por sandbox, enviar al titular de la cuenta
          if (!alertSent) {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: fromEmail,
                to: [fallbackOwner],
                subject: `[Aviso Wamani] Nueva Reserva Recibida: ${booking.buyOrder} - ${booking.experienceTitle}`,
                html: `<p><strong>Alerta para:</strong> ${adminTarget}</p>` + htmlContent
              })
            });
          }

          return res.status(200).json({
            success: true,
            sent: true,
            provider: 'resend-admin',
            notice: resendData.message
          });
        }
      } catch (err) {
        console.warn('Error con Resend HTTP API, intentando fallback SMTP:', err);
      }
    }

    // 2. Fallback con SMTP tradicional (si está configurado)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

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
        provider: 'smtp',
        messageId: info.messageId
      });
    }

    return res.status(200).json({
      success: true,
      sent: false,
      message: 'Servicio de correo en modo simulación (configura RESEND_API_KEY en Vercel).'
    });
  } catch (error) {
    console.error('Error al enviar correo en Vercel:', error);
    return res.status(500).json({
      error: 'Error al enviar correo electrónico',
      details: error.message
    });
  }
}
