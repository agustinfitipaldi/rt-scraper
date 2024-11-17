const express = require('express');
const searchRouter = require('./api/search');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Add CORS middleware
app.use(cors());

app.use('/', searchRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 