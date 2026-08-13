import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { WebpayPlus, Options, Environment, IntegrationCommerceCodes, IntegrationApiKeys } from 'transbank-sdk';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Ciberseguridad y Middleware
app.use(helmet());
app.use(express.json());

// Configuración de CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
  process.env.PRODUCTION_FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.wamani.cl') || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por política CORS de Wamani Experience'));
    }
  },
  credentials: true
}));

// Rate Limiter para mitigar ataques de fuerza bruta y DDoS
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 peticiones por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes desde esta IP, por favor reintenta más tarde.' }
});
app.use('/api/', apiLimiter);

// 2. Configuración de Transbank Webpay Plus
const tbEnvironment = (process.env.TRANSBANK_ENVIRONMENT || 'INTEGRATION').toUpperCase();
let txOptions;

if (tbEnvironment === 'PRODUCTION') {
  const commerceCode = process.env.TRANSBANK_COMMERCE_CODE;
  const apiKey = process.env.TRANSBANK_API_KEY;
  if (!commerceCode || !apiKey) {
    console.warn('⚠️ ADVERTENCIA: Credenciales de Producción de Transbank no encontradas en .env. Se usará modo Integración de prueba.');
    txOptions = new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration);
  } else {
    txOptions = new Options(commerceCode, apiKey, Environment.Production);
    console.log('🔒 Transbank Webpay Plus configurado en MODO PRODUCCIÓN.');
  }
} else {
  txOptions = new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration);
  console.log('🧪 Transbank Webpay Plus configurado en MODO INTEGRACIÓN (SANDBOX DE PRUEBA).');
}

const wpTransaction = new WebpayPlus.Transaction(txOptions);

// 3. Configuración de Correo Transaccional (Nodemailer)
const createMailTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return null;
};

// Generador de Plantilla HTML de Voucher de Lujo
const generateVoucherHTML = (booking) => {
  const formattedPrice = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(booking.totalPrice);
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #033E3B; }
      .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #e0e0e0; }
      .header { background: linear-gradient(135deg, #045D56 0%, #033E3B 100%); padding: 35px 30px; text-align: center; color: #ffffff; }
      .header h1 { margin: 0; font-size: 26px; font-weight: bold; letter-spacing: 1px; }
      .header p { margin: 8px 0 0; color: #2DD4BF; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; }
      .content { padding: 30px; }
      .status-box { background-color: #E6FFFA; border-left: 4px solid #2DD4BF; padding: 15px 20px; border-radius: 8px; margin-bottom: 25px; }
      .details-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
      .details-table td { padding: 12px 8px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
      .details-table td.label { color: #666666; width: 40%; font-weight: 500; }
      .details-table td.value { color: #045D56; font-weight: bold; width: 60%; }
      .total-box { background: #045D56; color: #ffffff; padding: 18px 24px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
      .total-box .total-label { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
      .total-box .total-amount { font-size: 24px; font-weight: bold; color: #2DD4BF; }
      .footer { background: #022C2A; color: #ffffff; padding: 25px; text-align: center; font-size: 12px; opacity: 0.9; }
      .footer a { color: #2DD4BF; text-decoration: none; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>WAMANI EXPERIENCE</h1>
        <p>Comprobante Oficial de Reserva</p>
      </div>
      <div class="content">
        <div class="status-box">
          <strong style="color: #045D56; font-size: 16px;">¡Tu reserva ha sido confirmada con éxito!</strong>
          <p style="margin: 5px 0 0; color: #033E3B; font-size: 13px;">A continuación encuentras el desglose de tu experiencia en la naturaleza.</p>
        </div>

        <table class="details-table">
          <tr>
            <td class="label">N° de Orden:</td>
            <td class="value" style="font-family: monospace; font-size: 16px; color: #0FA095;">${booking.buyOrder}</td>
          </tr>
          <tr>
            <td class="label">Experiencia / Tour:</td>
            <td class="value">${booking.experienceTitle}</td>
          </tr>
          <tr>
            <td class="label">Titular de la Reserva:</td>
            <td class="value">${booking.customerName}</td>
          </tr>
          <tr>
            <td class="label">RUT / Pasaporte:</td>
            <td class="value">${booking.customerRut || 'N/A'}</td>
          </tr>
          <tr>
            <td class="label">Fecha del Tour:</td>
            <td class="value">${booking.bookingDate}</td>
          </tr>
          <tr>
            <td class="label">Número de Pasajeros:</td>
            <td class="value">${booking.pax} ${booking.pax === 1 ? 'persona' : 'personas'}</td>
          </tr>
          <tr>
            <td class="label">Método de Pago:</td>
            <td class="value">${booking.paymentMethod === 'webpay' ? 'Webpay Plus (Transbank)' : 'Transferencia Bancaria'}</td>
          </tr>
          ${booking.authorizationCode ? `
          <tr>
            <td class="label">Código Autorización:</td>
            <td class="value" style="font-family: monospace;">${booking.authorizationCode}</td>
          </tr>` : ''}
          ${booking.notes ? `
          <tr>
            <td class="label">Notas / Acompañantes:</td>
            <td class="value">${booking.notes}</td>
          </tr>` : ''}
        </table>

        <div class="total-box">
          <span class="total-label">Monto Total Pagado:</span>
          <span class="total-amount">${formattedPrice}</span>
        </div>

        <div style="background: #fdfdfd; border: 1px dashed #cccccc; padding: 15px; border-radius: 8px; font-size: 12px; color: #555555; line-height: 1.5;">
          <strong>Punto de Encuentro:</strong> Oficina Wamani, Centro de Pucón, Región de La Araucanía.<br>
          <strong>Recomendaciones:</strong> Presentarse 15 minutos antes de la hora acordada con vestimenta acorde a la actividad y calzado de trekking.
        </div>
      </div>

      <div class="footer">
        <p style="margin: 0 0 8px;">Wamani Experience • Turismo Exclusivo en Pucón, Chile</p>
        <p style="margin: 0;">Contacto: <a href="mailto:contacto@wamani.cl">contacto@wamani.cl</a> | WhatsApp: +56 9 8567 3376</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

// ============================================================================
// ENDPOINTS DE LA API
// ============================================================================

// 1. Healthcheck & Config Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Wamani Experience Backend API',
    environment: tbEnvironment,
    timestamp: new Date().toISOString()
  });
});

// 2. Crear Transacción Webpay Plus
app.post('/api/webpay/create', async (req, res) => {
  try {
    const { buyOrder, sessionId, amount, returnUrl } = req.body;

    if (!buyOrder || !sessionId || !amount || !returnUrl) {
      return res.status(400).json({ error: 'Faltan parámetros obligatorios (buyOrder, sessionId, amount, returnUrl)' });
    }

    const roundedAmount = Math.round(Number(amount));
    const createResponse = await wpTransaction.create(buyOrder, sessionId, roundedAmount, returnUrl);

    return res.json({
      token: createResponse.token,
      url: createResponse.url,
      buyOrder,
      amount: roundedAmount
    });
  } catch (error) {
    console.error('Error al crear transacción Webpay:', error);
    return res.status(500).json({
      error: 'No se pudo iniciar la transacción con Transbank Webpay Plus',
      details: error.message
    });
  }
});

// 3. Confirmar / Validar Transacción Webpay Plus (Commit)
app.post('/api/webpay/commit', async (req, res) => {
  try {
    const { token_ws } = req.body;

    if (!token_ws) {
      return res.status(400).json({ error: 'Se requiere token_ws para confirmar la transacción' });
    }

    const commitResponse = await wpTransaction.commit(token_ws);

    // response_code 0 indica aprobación exitosa
    const isApproved = commitResponse.response_code === 0;

    return res.json({
      success: isApproved,
      status: commitResponse.status,
      responseCode: commitResponse.response_code,
      authorizationCode: commitResponse.authorization_code,
      amount: commitResponse.amount,
      buyOrder: commitResponse.buy_order,
      sessionId: commitResponse.session_id,
      cardDetail: commitResponse.card_detail,
      accountingDate: commitResponse.accounting_date,
      transactionDate: commitResponse.transaction_date,
      paymentTypeCode: commitResponse.payment_type_code,
      installmentsNumber: commitResponse.installments_number
    });
  } catch (error) {
    console.error('Error al confirmar transacción Webpay:', error);
    return res.status(500).json({
      error: 'Error al validar la transacción con Transbank',
      details: error.message
    });
  }
});

// 4. Enviar Comprobante / Voucher por Correo Electrónico
app.post('/api/email/send-voucher', async (req, res) => {
  try {
    const { booking } = req.body;

    if (!booking || !booking.customerEmail || !booking.buyOrder) {
      return res.status(400).json({ error: 'Datos de reserva o correo de cliente inválidos' });
    }

    const transporter = createMailTransporter();
    if (!transporter) {
      console.warn('⚠️ SMTP no configurado. El voucher se generó pero no se despachó el correo real.');
      return res.json({
        success: true,
        sent: false,
        message: 'Servicio de correo no configurado en variables de entorno (simulación exitosa).'
      });
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || '"Wamani Experience" <contacto@wamani.cl>',
      to: booking.customerEmail,
      bcc: process.env.ADMIN_NOTIFICATION_EMAIL || 'contacto@wamani.cl',
      subject: `Comprobante de Reserva Wamani: ${booking.buyOrder} - ${booking.experienceTitle}`,
      html: generateVoucherHTML(booking)
    };

    const info = await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      sent: true,
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Error al enviar correo de voucher:', error);
    return res.status(500).json({
      error: 'Error al enviar correo electrónico',
      details: error.message
    });
  }
});

// Inicio del Servidor
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🏔️  WAMANI EXPERIENCE BACKEND API INICIADO`);
  console.log(`📡 Puerto: http://localhost:${PORT}`);
  console.log(`💳 Pasarela: Transbank Webpay Plus (${tbEnvironment})`);
  console.log(`======================================================\n`);
});
