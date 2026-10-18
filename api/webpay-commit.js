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
    const { token_ws } = req.body || {};

    if (!token_ws) {
      return res.status(400).json({ error: 'Se requiere token_ws para confirmar la transacción' });
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

    const tbkRes = await fetch(
      `${baseUrl}/rswebpaytransaction/api/webpay/v1.2/transactions/${encodeURIComponent(token_ws)}`,
      {
        method: 'PUT',
        headers: {
          'Tbk-Api-Key-Id': commerceCode,
          'Tbk-Api-Key-Secret': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    const commitResponse = await tbkRes.json();

    if (!tbkRes.ok) {
      console.error('Error devuelto por Transbank en commit:', commitResponse);
      return res.status(tbkRes.status || 500).json({
        success: false,
        error: 'Error al confirmar transacción en Transbank',
        details: commitResponse.error_message || JSON.stringify(commitResponse)
      });
    }

    const isApproved = commitResponse.response_code === 0 && commitResponse.status === 'AUTHORIZED';

    return res.status(200).json({
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
}

