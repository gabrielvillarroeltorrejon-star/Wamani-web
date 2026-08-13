import { WebpayPlus, Options, Environment, IntegrationCommerceCodes, IntegrationApiKeys } from 'transbank-sdk';

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
    const { buyOrder, sessionId, amount, returnUrl } = req.body;

    if (!buyOrder || !sessionId || !amount || !returnUrl) {
      return res.status(400).json({ error: 'Faltan parámetros obligatorios (buyOrder, sessionId, amount, returnUrl)' });
    }

    const tbEnvironment = (process.env.TRANSBANK_ENVIRONMENT || 'INTEGRATION').toUpperCase();
    let txOptions;

    if (tbEnvironment === 'PRODUCTION' && process.env.TRANSBANK_COMMERCE_CODE && process.env.TRANSBANK_API_KEY) {
      txOptions = new Options(process.env.TRANSBANK_COMMERCE_CODE, process.env.TRANSBANK_API_KEY, Environment.Production);
    } else {
      txOptions = new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration);
    }

    const wpTransaction = new WebpayPlus.Transaction(txOptions);
    const roundedAmount = Math.round(Number(amount));
    const createResponse = await wpTransaction.create(buyOrder, sessionId, roundedAmount, returnUrl);

    return res.status(200).json({
      token: createResponse.token,
      url: createResponse.url,
      buyOrder,
      amount: roundedAmount
    });
  } catch (error) {
    console.error('Error al crear transacción Webpay en Vercel:', error);
    return res.status(500).json({
      error: 'No se pudo iniciar la transacción con Transbank Webpay Plus',
      details: error.message
    });
  }
}
