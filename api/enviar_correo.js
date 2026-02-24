const nodemailer = require('nodemailer');

export default async function handler(req, res) {
    // Permisos CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

    // AQUÍ ESTÁ LA CLAVE: Recibimos "cuerpoHtml"
    const { destino, cc, asunto, cuerpoHtml, adjunto, nombreArchivo } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    });

    try {
        const mailOptions = {
            from: `"Cristian - Maquipan" <${process.env.GMAIL_USER}>`,
            to: destino,
            cc: cc,
            subject: asunto,
            html: cuerpoHtml, // <-- ESTO CONVIERTE LAS ETIQUETAS EN NEGRITAS REALES
            attachments: adjunto ? [{
                filename: nombreArchivo || 'cotizacion.pdf',
                content: adjunto.split("base64,")[1],
                encoding: 'base64'
            }] : []
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ mensaje: '¡Correo enviado con éxito!' });
    } catch (error) {
        console.error('Error detallado:', error);
        return res.status(500).json({ error: 'Error al enviar el correo', detalle: error.message });
    }
}
