const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // Configuración de cabeceras para permitir la comunicación entre el HTML y la API
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Manejar la petición de verificación del navegador
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Seguridad: Solo aceptamos envíos de datos (POST)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Por favor usa POST.' });
  }

  const { destino, cc, asunto, cuerpo, adjunto, nombreArchivo } = req.body;

  // Configuración del motor de Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // Tu correo en las variables de Vercel
      pass: process.env.GMAIL_PASS  // Tu clave de 16 letras en Vercel
    }
  });

  try {
    const mailOptions = {
      from: `"Cristian - Maquipan" <${process.env.GMAIL_USER}>`,
      to: destino,
      cc: cc,
      subject: asunto,
      text: cuerpo,
      attachments: adjunto ? [
        {
          filename: nombreArchivo || 'Cotizacion.pdf',
          content: adjunto.split("base64,")[1],
          encoding: 'base64'
        }
      ] : []
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ mensaje: '¡Correo enviado con éxito!' });
  } catch (error) {
    console.error('Error en Nodemailer:', error);
    return res.status(500).json({ error: 'Error al enviar: ' + error.message });
  }
}
