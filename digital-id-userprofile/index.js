/************************************************
 * 1 Day , 1 challenge , until urgh... I get gf?*
 * by Syafiqlim                                 *
 * date : 14th January 2024                     *
 *          Day 8 (PART1) :                     *
 * Secure Digital ID                            *
 * Unique token QR code changes every 30 seconds*
 * store and update uniqueToken in database     *
 * Create API for GET request username for      *
 * Digital ID scanner                           *
 * [Embedded JavaScript (EJS) , Express.js ,    *
 * bcrpytjs , cors, Node.js , MySQL]            *
 ************************************************
 */

// digital-id-userprofile/index.js
const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const ejs = require('ejs');
const QRCode = require('qrcode');
const cors = require('cors');

const app = express();
const port = 3000;

// Set up MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Replace with your MySQL password
  database: '1day_1challenge_day8',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

app.use(cors());
// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

// Routes
app.get('/', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user into the database
  db.query(
    'INSERT INTO Users (username, password) VALUES (?, ?)',
    [username, hashedPassword],
    (err, results) => {
      if (err) throw err;
      res.redirect('/');
    }
  );
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Retrieve hashed password from the database
  db.query(
    'SELECT * FROM Users WHERE username = ?',
    [username],
    async (err, results) => {
      if (err) throw err;

      if (results.length > 0) {
        const isMatch = await bcrypt.compare(password, results[0].password);

        if (isMatch) {
          req.session.username = username;
          res.redirect('/userprofile');
        } else {
          res.redirect('/');
        }
      } else {
        res.redirect('/');
      }
    }
  );
});

app.get('/userprofile', async (req, res) => {
    if (!req.session.username) {
      res.redirect('/');
      return;
    }
  
    // Generate a unique token (you can use a library like `uuid`)
    const uniqueToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
    // Generate QR code with the unique token
    const qrCodeData = await QRCode.toDataURL(uniqueToken);
  
    res.render('userprofile', { username: req.session.username, qrCodeData });
  });
  
// New /refreshToken endpoint
app.get('/refreshToken', async (req, res) => {
  if (!req.session.username) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Generate a new unique token
  const newUniqueToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  // Update the Users table with the new unique token
  db.query(
    'UPDATE Users SET uniqueToken = ? WHERE username = ?',
    [newUniqueToken, req.session.username],
    (err, results) => {
      if (err) {
        console.error('Error updating uniqueToken:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }

      // Generate QR code with the new unique token
      QRCode.toDataURL(newUniqueToken)
        .then(qrCodeData => {
          // Update the session with the new token
          req.session.uniqueToken = newUniqueToken;

          res.json({ qrCodeData });
        })
        .catch(error => {
          console.error('Error generating QR code:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        });
    }
  );
});

app.get('/api/user/:uniqueToken', (req, res) => {
  const uniqueToken = req.params.uniqueToken;

  // Query the database to retrieve the username associated with the uniqueToken
  db.query(
    'SELECT username FROM Users WHERE uniqueToken = ?',
    [uniqueToken],
    (err, results) => {
      if (err) {
        console.error('Error retrieving username:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }

      if (results.length > 0) {
        const username = results[0].username;
        console.log('Retrieved username:', username);

        // Send the username as a response
        res.json({ username });
      } else {
        res.status(404).json({ error: 'Username not found' });
      }
    }
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
