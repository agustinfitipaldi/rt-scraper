const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

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

    // Add a second request to get detailed movie info
    try {
      const movieUrl = movie.url.startsWith('https://') 
        ? movie.url 
        : `https://www.rottentomatoes.com${movie.url}`;
        
      const detailResponse = await client.get(movieUrl);
      const $detail = cheerio.load(detailResponse.data);
      
      // Get the media-scorecard element
      const scorecard = $detail('media-scorecard');
      
      // Add score details
      movie.scores = {
        audience: {
          score: scorecard.find('[slot="audienceScore"]').text().trim(),
          reviews: scorecard.find('[slot="audienceReviews"]').text().trim()
        },
        critics: {
          score: scorecard.find('[slot="criticsScore"]').text().trim(),
          reviews: scorecard.find('[slot="criticsReviews"]').text().trim()
        }
      };
      
      movie.posterImage = scorecard.find('[slot="posterImage"]').attr('src');
      movie.synopsis = $detail('[data-qa="synopsis-value"]').text().trim();

      // Get all the detailed info
      movie.details = {};
      $detail('.category-wrap[data-qa="item"]').each((i, element) => {
        const label = $detail(element).find('[data-qa="item-label"]').text().trim();
        const valueGroup = $detail(element).find('[data-qa="item-value-group"]');
        
        // Handle multiple values (like cast, producers, etc.)
        const values = [];
        valueGroup.find('[data-qa="item-value"]').each((i, val) => {
          values.push($detail(val).text().trim());
        });
        
        // Store single value or array based on number of items
        movie.details[label] = values.length === 1 ? values[0] : values;
      });

    } catch (detailError) {
      console.error('Error fetching movie details:', detailError);
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