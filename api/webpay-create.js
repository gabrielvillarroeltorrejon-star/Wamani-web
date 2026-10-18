const INTEGRATION_COMMERCE_CODE = '597055555532';
const INTEGRATION_API_KEY = '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C';

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
    const { buyOrder, sessionId, amount, returnUrl } = req.body || {};

    if (!buyOrder || !sessionId || !amount || !returnUrl) {
      return res.status(400).json({ error: 'Faltan parámetros obligatorios (buyOrder, sessionId, amount, returnUrl)' });
    }

    const tbEnvironment = (process.env.TRANSBANK_ENVIRONMENT || 'INTEGRATION').toUpperCase();
    const isProduction =
      tbEnvironment === 'PRODUCTION' &&
      Boolean(process.env.TRANSBANK_COMMERCE_CODE) &&
      Boolean(process.env.TRANSBANK_API_KEY);

    const baseUrl = isProduction
      ? 'https://webpay3g.transbank.cl'
      : 'https://webpay3gint.transbank.cl';

    const commerceCode = isProduction
      ? process.env.TRANSBANK_COMMERCE_CODE.trim()
      : INTEGRATION_COMMERCE_CODE;

    const apiKey = isProduction
      ? process.env.TRANSBANK_API_KEY.trim()
      : INTEGRATION_API_KEY;

    const roundedAmount = Math.round(Number(amount));

    const tbkRes = await fetch(`${baseUrl}/rswebpaytransaction/api/webpay/v1.2/transactions`, {
      method: 'POST',
      headers: {
        'Tbk-Api-Key-Id': commerceCode,
        'Tbk-Api-Key-Secret': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        buy_order: String(buyOrder).slice(0, 26),
        session_id: String(sessionId).slice(0, 61),
        amount: roundedAmount,
        return_url: returnUrl
      })
    });

    const createResponse = await tbkRes.json();

    if (!tbkRes.ok || !createResponse.token || !createResponse.url) {
      console.error('Error devuelto por Transbank al crear transacción:', createResponse);
      return res.status(tbkRes.status || 500).json({
        error: 'Transbank rechazó la creación de la transacción',
        details: createResponse.error_message || JSON.stringify(createResponse)
      });
    }

    return res.status(200).json({
      token: createResponse.token,
      url: createResponse.url,
      buyOrder,
      amount: roundedAmount,
      environment: isProduction ? 'PRODUCTION' : 'INTEGRATION'
    });
  } catch (error) {
    console.error('Error al crear transacción Webpay:', error);
    return res.status(500).json({
      error: 'No se pudo iniciar la transacción con Transbank Webpay Plus',
      details: error.message
    });
  }
}

