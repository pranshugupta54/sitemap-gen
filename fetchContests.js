const https = require('https');
require('dotenv').config();

async function fetchContestsData() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: process.env.BACKEND_URL,
      path: '/sitemap.xml',
      method: 'GET',
    };

    const req = https.request(options, (res) => {
      res.on('end', () => {
        resolve(); // Resolve without any data when the request is completed
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

module.exports = fetchContestsData;
