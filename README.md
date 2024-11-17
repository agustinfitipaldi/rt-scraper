# rt-scraper

## Overview

**rt-scraper** is a Node.js-based backend API, made with Claude and Cursor, that returns
Rotten Tomatoes movie details based on the movie name. By leveraging web scraping techniques
with Axios and Cheerio, this project provides a simple and efficient way to retrieve movie
details such as title, tomatometer score, release year, URL, and cast information.

## Table of Contents

- [Features](#features)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Technologies Used](#technologies-used)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Search Movies:** Fetch movie details from Rotten Tomatoes based on the movie name.
- **RESTful API:** Provides a simple API endpoint for integration with other applications.
- **CORS Enabled:** Allows cross-origin requests, making it easy to use with frontend applications.
- **Error Handling:** Comprehensive error responses for better debugging and user experience.

## Usage

The API is hosted on Vercel and can be accessed directly without the need for installation.

## API Endpoints

### Search for a Movie

- **Endpoint:** `/api/search`
- **Method:** `GET`
- **Query Parameters:**

  - `movie` (string, required) - The name of the movie to search for.

- **Example Request:**

  ```http
  GET https://rt-scraper.vercel.app/api/search?movie=Interstellar
  ```

- **Example Response:**

```json
{
  "title": "Interstellar",
  "tomatometer": 73,
  "year": "2014",
  "url": "https://www.rottentomatoes.com/m/interstellar_2014",
  "cast": ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
  "scores": {
    "audience": {
      "score": "86%",
      "reviews": "100,000+ Ratings"
    },
    "critics": {
      "score": "73%",
      "reviews": "375 Reviews"
    }
  },
  "posterImage": "https://resizing.flixster.com/7c3qnZfPzZgID7Ft97PccFwEf9U=/206x305/v2/https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p10543523_p_v8_as.jpg",
  "synopsis": "In Earth's future, a global crop blight and second Dust Bowl are slowly rendering the planet uninhabitable. Professor Brand (Michael Caine), a brilliant NASA physicist, is working on plans to save mankind by transporting Earth's population to a new home via a wormhole. But first, Brand must send former NASA pilot Cooper (Matthew McConaughey) and a team of researchers through the wormhole and across the galaxy to find out which of three planets could be mankind's new home.",
  "details": {
    "Director": "Christopher Nolan",
    "Producer": ["Emma Thomas", "Christopher Nolan", "Lynda Obst"],
    "Screenwriter": ["Jonathan Nolan", "Christopher Nolan"],
    "Distributor": "Paramount Pictures",
    "Production Co": ["Syncopy", "Lynda Obst Productions"],
    "Rating": "PG-13 (Some Intense Perilous Action|Brief Strong Language)",
    "Genre": ["Sci-Fi", "Adventure", "Action"],
    "Original Language": "English",
    "Release Date (Theaters)": "Nov 7, 2014, Wide",
    "Release Date (Streaming)": "May 24, 2016",
    "Box Office (Gross USA)": "$188.0M",
    "Runtime": "2h 45m",
    "Sound Mix": ["Datasat", "Dolby Digital"]
  }
}
  ```

- **Error Responses:**
  - `400 Bad Request` - If the `movie` query parameter is missing.
  - `404 Not Found` - If the movie is not found.
  - `500 Internal Server Error` - For any unexpected server errors.

## Technologies Used

- **Node.js:** JavaScript runtime environment.
- **Express:** Web framework for building the API.
- **Axios:** Promise-based HTTP client for making HTTP requests.
- **Cheerio:** Fast, flexible, and lean implementation of core jQuery designed for the server.
- **CORS:** Middleware for enabling Cross-Origin Resource Sharing.

## Deployment

The API is hosted on [Vercel](https://vercel.com/) and is accessible at:

[https://rt-scraper.vercel.app/api/search](https://rt-scraper.vercel.app/api/search)

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. **Fork the repository.**
2. **Create a new branch:**

   ```bash
   git checkout -b feature/YourFeature
   ```

3. **Make your changes and commit them:**

   ```bash
   git commit -m "Add some feature"
   ```

4. **Push to the branch:**

   ```bash
   git push origin feature/YourFeature
   ```

5. **Open a pull request.**

## License

This project is licensed under the [MIT License](LICENSE).
