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
    const { token_ws } = req.body;

    if (!token_ws) {
      return res.status(400).json({ error: 'Se requiere token_ws para confirmar la transacción' });
    }

    const tbEnvironment = (process.env.TRANSBANK_ENVIRONMENT || 'INTEGRATION').toUpperCase();
    let txOptions;

    if (tbEnvironment === 'PRODUCTION' && process.env.TRANSBANK_COMMERCE_CODE && process.env.TRANSBANK_API_KEY) {
      txOptions = new Options(process.env.TRANSBANK_COMMERCE_CODE, process.env.TRANSBANK_API_KEY, Environment.Production);
    } else {
      txOptions = new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration);
    }

    const wpTransaction = new WebpayPlus.Transaction(txOptions);
    const commitResponse = await wpTransaction.commit(token_ws);

    const isApproved = commitResponse.response_code === 0;

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
    console.error('Error al confirmar transacción Webpay en Vercel:', error);
    return res.status(500).json({
      error: 'Error al validar la transacción con Transbank',
      details: error.message
    });
  }
}
