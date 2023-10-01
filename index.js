const express = require('express');
const axios = require('axios');
const xmlbuilder = require('xmlbuilder');
const { DateTime } = require('luxon'); // Luxon library for date and time manipulation
const app = express();


const fetchContestsData = require('./fetchContests');
async function main() {
    try {
        console.log('Pinging...');
        const contestsData = await fetchContestsData();
        console.log('Pong!');
    } catch (error) {
        console.error('Error pinging the server:', error);
    }
}
main();
setInterval(async () => {
    try {
        await main();
        console.log('<======= Sent GET request to AWAKE');
    } catch (error) {
        console.error('Error Pinging', error);
    }
}, 14 * 60 * 1000);


let contestsData = null; // Variable to store fetched contest data
let lastFetchTime = null; // Variable to store the time of the last fetch
let cachedSitemapXML = null; // Variable to store the cached sitemap XML

// Function to convert Unix timestamp to IST time
function convertUnixToIST(unixTimestamp) {
  return DateTime.fromSeconds(unixTimestamp).toFormat('yyyy-MM-dd HH:mm:ss ZZZZ');
}

// Function to fetch contest data from the API
async function fetchContests() {
  try {
    console.log('Fetching contest data...');
    const response = await axios.get(process.env.API); // Your API URL
    contestsData = response.data.results;
    lastFetchTime = new Date();
    console.log('Contest data fetched successfully.');
  } catch (error) {
    console.error('Error fetching contest data:', error);
  }
}

// Initial fetch of contest data
fetchContests();

// Ping the server every 6 hours and fetch contest data if more than 6 hours have passed
setInterval(async () => {
    try {
        await fetchContests();
        console.log('<======= Sent GET request to AWAKE');
    } catch (error) {
        console.error('Error Pinging', error);
    }
}, 6 * 60 * 60 * 1000); // 6 hours

// Function to generate the sitemap XML as a string
function generateSitemapXML() {
    // Create the sitemap XML
    const root = xmlbuilder.create('urlset', {
      version: '1.0',
      encoding: 'UTF-8',
    });
    root.att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');
  
    contestsData.forEach((contest) => {
      const contestUrl = `https://www.digitomize.com/contests/${contest.vanity}`;
  
      root
        .ele('url')
        .ele('loc', {}, contestUrl)
        .up()
        .ele('lastmod', {}, new Date().toISOString()) // You can replace this with the actual last modification date
        .up()
        .ele('changefreq', {}, 'daily') // You can adjust the change frequency as needed
        .up()
        .ele('priority', {}, '0.8'); // You can adjust the priority as needed
    });
  
    return root.end({ pretty: true });
  }
  

// Endpoint for generating and returning the sitemap XML
app.get('/sitemap.xml', async (req, res) => {
  try {
    // Use the cached sitemap XML if it exists and contest data is not outdated
    if (cachedSitemapXML && contestsData && lastFetchTime && (new Date() - lastFetchTime) < 6 * 60 * 60 * 1000) {
      console.log('Using cached sitemap XML.');
    } else {
      // Fetch contest data if it's not available or if it's too old
      await fetchContests();
      // Generate and cache the sitemap XML
      cachedSitemapXML = generateSitemapXML();
    }

    // Set the response headers and send the sitemap XML
    res.header('Content-Type', 'application/xml');
    res.send(cachedSitemapXML);
  } catch (error) {
    console.error('Error fetching or generating sitemap:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the Express app
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
