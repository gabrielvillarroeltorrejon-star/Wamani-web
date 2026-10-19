export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  const forceIntegration = process.env.FORCE_INTEGRATION === 'true';
  res.status(200).json({
    status: 'ok',
    service: 'Wamani Experience Vercel Serverless API',
    environment: forceIntegration ? 'INTEGRATION' : 'PRODUCTION',
    commerceCode: forceIntegration ? '597055555532' : (process.env.TRANSBANK_COMMERCE_CODE || '597053104647').trim(),
    timestamp: new Date().toISOString()
  });
}
