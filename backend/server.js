const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Endpoint dla formularza
app.post('/send-message', async (req, res) => {
  const { name, email, message } = req.body;

  // Konfiguracja SMTP - np. Gmail
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'sobotenko@gmail.com',       // Twój email
      pass: 'Liceum13ptwsl!',           // App Password dla Gmail
    },
  });

  let mailOptions = {
    from: email,
    to: 'sobotenko@gmail.com',          // gdzie mają przychodzić wiadomości
    subject: `Wiadomość od ${name}`,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('Wiadomość wysłana!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Błąd wysyłki.');
  }
});

// Start serwera
app.listen(3000, () => console.log('Serwer działa na porcie 3000'));
