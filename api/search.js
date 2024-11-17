const express = require('express');
const puppeteer = require('puppeteer');

const router = express.Router();

router.get('/api/search', async (req, res) => {
  let browser;
  try {
    const movieName = req.query.movie;
    if (!movieName) {
      return res.status(400).json({ error: 'Movie name is required' });
    }

    // Launch browser
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set viewport and user agent
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Navigate to search page
    const encodedMovie = encodeURIComponent(movieName);
    await page.goto(`https://www.rottentomatoes.com/search?search=${encodedMovie}`, {
      waitUntil: 'networkidle0'
    });

    // Wait for search results to load
    await page.waitForSelector('search-page-media-row', { timeout: 5000 });

    // Extract movie data
    const movieData = await page.evaluate(() => {
      const movies = Array.from(document.querySelectorAll('search-page-media-row'));
      return movies.map(movie => {
        const title = movie.getAttribute('title') || '';
        const tomatometer = movie.getAttribute('tomatometerscore');
        const year = movie.getAttribute('releaseyear');
        
        return {
          title,
          tomatometer: tomatometer ? parseInt(tomatometer) : null,
          year: year || null
        };
      }).filter(movie => movie.title); // Filter out movies with empty titles
    });

    console.log('Extracted movie data:', movieData);

    await browser.close();

    // Find exact or closest match
    const movie = movieData.find(m => {
      if (!m || !m.title) return false;
      return m.title.toLowerCase() === movieName.toLowerCase() ||
             m.title.toLowerCase().includes(movieName.toLowerCase());
    });

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    return res.json(movie);

  } catch (error) {
    console.error('Error:', error);
    if (browser) await browser.close();
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
});

module.exports = router; 