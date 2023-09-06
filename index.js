const express = require('express');
const axios = require('axios');
const xmlbuilder = require('xmlbuilder');
const { DateTime } = require('luxon'); // Luxon library for date and time manipulation

const app = express();

// Function to convert Unix timestamp to IST time
function convertUnixToIST(unixTimestamp) {
  return DateTime.fromSeconds(unixTimestamp).toFormat('yyyy-MM-dd HH:mm:ss ZZZZ');
}

// Endpoint for generating and returning the sitemap XML
app.get('/sitemap.xml', async (req, res) => {
  try {
    // Make a GET request to your API to fetch contest data
    const apiUrl = 'https://digitomize-backend.onrender.com/api/contests'; // Your API URL
    const response = await axios.get(apiUrl);
    const contests = response.data.results; // Assuming the contest data is in the 'results' property

    // Create the sitemap XML
    const root = xmlbuilder.create('urlset', {
      version: '1.0',
      encoding: 'UTF-8',
    });
    root.att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

    contests.forEach((contest) => {
      const contestUrl = `https://www.digitomize.com/contests/${contest.vanity}`;
      const title = `${contest.name} | Digitomize`;
      const startTimeIST = convertUnixToIST(contest.startTimeUnix);
      const description = `${contest.name} starts at ${startTimeIST}`;

      root
        .ele('url')
        .ele('loc', {}, contestUrl)
        .up()
        .ele('lastmod', {}, new Date().toISOString()) // You can replace this with the actual last modification date
        .up()
        .ele('changefreq', {}, 'daily') // You can adjust the change frequency as needed
        .up()
        .ele('priority', {}, '0.8') // You can adjust the priority as needed
        .up()
        .ele('title', {}, title) // Add the title
        .up()
        .ele('description', {}, description); // Add the description
    });

    const sitemapXML = root.end({ pretty: true });

    // Set the response headers and send the sitemap XML
    res.header('Content-Type', 'application/xml');
    res.send(sitemapXML);
  } catch (error) {
    console.error('Error fetching contest data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the Express app
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});