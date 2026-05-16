module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  res.end(`window.AppConfig = {
    googleMapsKey: '${process.env.GOOGLE_MAPS_API_KEY}'
  };`);
}
