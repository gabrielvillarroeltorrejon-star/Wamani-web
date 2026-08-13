export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.status(200).json({
    status: 'ok',
    service: 'Wamani Experience Vercel Serverless API',
    timestamp: new Date().toISOString()
  });
}
