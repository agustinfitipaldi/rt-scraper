const express = require('express');
const chromium = require('chrome-aws-lambda');

const router = express.Router();

router.get('/api/search', async (req, res) => {
  let browser;
  try {
    const movieName = req.query.movie;
    if (!movieName) {
      return res.status(400).json({ error: 'Movie name is required' });
    }

    // Launch browser with chrome-aws-lambda
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    // Set viewport and user agent
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Navigate to search page
    const encodedMovie = encodeURIComponent(movieName);
    const searchUrl = `https://www.rottentomatoes.com/search?search=${encodedMovie}`;
    console.log('Navigating to:', searchUrl);
    
    await page.goto(searchUrl, {
      waitUntil: 'networkidle0'
    });

    // Log the page content to see what we're getting
    // Wait for search results to load with a more general selector first
    console.log('Waiting for search results to appear...');
    await page.waitForSelector('[data-qa="search-result"]', { timeout: 5000 });

    // Extract movie data with more detailed logging and multiple selector attempts
    const movieData = await page.evaluate(() => {
      console.log('Starting data extraction...');
      
      // Target the specific custom element
      const elements = document.querySelectorAll('search-page-media-row');
      console.log(`Found ${elements.length} search-page-media-row elements`);
      
      return Array.from(elements).map(movie => {
        const title = movie.querySelector('[data-qa="info-name"]')?.textContent?.trim();
        const tomatometer = movie.getAttribute('tomatometerscore');
        const year = movie.getAttribute('releaseyear');
        const url = movie.querySelector('[data-qa="info-name"]')?.getAttribute('href');
        const cast = movie.getAttribute('cast')?.split(',');
        
        console.log('Found movie:', { title, tomatometer, year, url, cast });
        
        return {
          title,
          tomatometer: tomatometer ? parseInt(tomatometer) : null,
          year: year || null,
          url,
          cast
        };
      }).filter(movie => movie.title);
    });

    console.log('Extracted movie data:', movieData);
    console.log('Searching for movie match with name:', movieName);

    await browser.close();

    // Find exact or closest match
    const movie = movieData.find(m => {
      if (!m || !m.title) return false;
      // First try exact match (case insensitive)
      return m.title.toLowerCase() === movieName.toLowerCase();
    }) || movieData.find(m => {
      // If no exact match, then try partial match
      if (!m || !m.title) return false;
      return m.title.toLowerCase().includes(movieName.toLowerCase());
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