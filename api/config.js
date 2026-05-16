module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  
  const key = process.env.GOOGLE_MAPS_API_KEY;
  const vercelEnv = process.env.VERCEL_ENV;
  const hasKey = key ? 'YES' : 'NO';
  
  res.end(`window.AppConfig = {
    googleMapsKey: '${key}',
    hasKey: '${hasKey}',
    env: '${vercelEnv}'
  };`);
}
