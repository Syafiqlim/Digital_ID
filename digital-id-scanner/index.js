/******************************************************
 * 1 Day , 1 challenge , until urgh... I get gf?      *
 * by Syafiqlim                                       *
 * date : 14th January 2024                           *
 *          Day 8 (PART2) :                           *
 * Secure Digital ID Scanner                          *
 * using QR code script from                          *
 * https://cdn.jsdelivr.net/npm/jsqr/dist/jsQR.min.js *
 * and HTML5 camera access , GET request from API     *
 * for retrieve username of corresponding QR code     *
 ******************************************************
 */

// digital-id-scanner/index.js
const express = require('express');
const app = express();
const port = 3001;

// Middleware
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Routes for scanner (using HTML5 camera API)
app.get('/', (req, res) => {
  res.render('scanner');
});

// Start the server
app.listen(port, () => {
  console.log(`Digital ID Scanner is running on http://localhost:${port}`);
});
