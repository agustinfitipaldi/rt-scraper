const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

// Create an axios instance with default config
const client = axios.create({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  },
  timeout: 5000
});

router.get('/api/search', async (req, res) => {
  try {
    const movieName = req.query.movie;
    if (!movieName) {
      return res.status(400).json({ error: 'Movie name is required' });
    }

    // Make the request to Rotten Tomatoes
    const searchUrl = `https://www.rottentomatoes.com/search?search=${encodeURIComponent(movieName)}`;
    const response = await client.get(searchUrl);
    
    // Load the HTML into cheerio
    const $ = cheerio.load(response.data);
    
    // Extract movie data
    const movieData = [];
    $('search-page-media-row').each((i, element) => {
      const $element = $(element);
      const movie = {
        title: $element.find('[data-qa="info-name"]').text().trim(),
        tomatometer: parseInt($element.attr('tomatometerscore')) || null,
        year: $element.attr('releaseyear') || null,
        url: $element.find('[data-qa="info-name"]').attr('href'),
        cast: $element.attr('cast')?.split(',') || []
      };
      
      if (movie.title) {
        movieData.push(movie);
      }
    });

    // Find exact or closest match
    const movie = movieData.find(m => 
      m.title.toLowerCase() === movieName.toLowerCase()
    ) || movieData.find(m => 
      m.title.toLowerCase().includes(movieName.toLowerCase())
    );

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    return res.json(movie);

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

module.exports = router; 