require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const apiHandler = require('./api/index');

app.use('/api', (req, res) => {
  req.url = req.originalUrl;
  return apiHandler(req, res);
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});