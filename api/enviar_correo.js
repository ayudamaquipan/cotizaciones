require('dotenv').config();
const nodemailer = require('nodemailer');

export default async function handler(req, res) {
    // Solo permitimos peticiones POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { destino, cc, asunto, cuerpo, adjunto, nombreArchivo } = req.body;

    // 1. Configuración del transporte de Gmail
    // Usamos variables de entorno para proteger tus credenciales
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER, // Tu correo configurado en el .env
            pass: process.env.GMAIL_PASS  // Tu clave de aplicación de 16 letras
        }
    });

    try {
        // 2. Definir las opciones del correo
        const mailOptions = {
            from: `"Cristian - Maquipan" <${process.env.GMAIL_USER}>`,
            to: destino,
            cc: cc,
            subject: asunto,
            text: cuerpo,
            attachments: adjunto ? [
                {
                    filename: nombreArchivo || 'cotizacion.pdf',
                    content: adjunto.split("base64,")[1], // Extraemos solo el contenido base64
                    encoding: 'base64'
                }
            ] : []
        };

        // 3. Enviar el correo
        await transporter.sendMail(mailOptions);
        
        return res.status(200).json({ mensaje: '¡Correo enviado con éxito!' });

    } catch (error) {
        console.error('Error detallado:', error);
        return res.status(500).json({ 
            error: 'Error al enviar el correo', 
            detalle: error.message 
        });
    }
}
