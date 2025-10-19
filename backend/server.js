const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CORS setup: allow frontend in prod; allow localhost/file:// in dev
const isProd = process.env.NODE_ENV === 'production';
const allowedOrigins = isProd
  ? [
      'https://sobotenko.github.io',
      'https://my-page-frontend.onrender.com'
    ]
  : ['http://localhost:5500', 'http://127.0.0.1:5500', 'null'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser or file:// requests (no origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  }
}));

// Simple health check
app.get('/health', (_, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// Endpoint dla formularza
app.post('/send-message', async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: 'Brak wymaganych pól.' });
  }

  // SMTP (Gmail via App Password)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,       // must be authenticated user for Gmail
    replyTo: email,                     // user email as reply-to
    to: process.env.EMAIL_USER,         // your inbox
    subject: `Wiadomość z formularza: ${name} <${email}>`,
    text: message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    res.status(200).json({ ok: true, id: info.messageId });
  } catch (error) {
    console.error('Email send error:', error && error.response || error);
    res.status(500).json({ ok: false, error: 'Błąd wysyłki' });
  }
});

// Start serwera
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));
