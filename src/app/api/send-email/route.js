import nodemailer from 'nodemailer';

export async function POST(request) {
  const { email, image } = await request.json();

  if (!email || !image) {
    return new Response(JSON.stringify({ message: 'Faltan datos: email o imagen' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NEXT_PUBLIC_EMAIL_USER,
      pass: process.env.NEXT_PUBLIC_EMAIL_PASS,     
    },
  });

  const mailOptions = {
    from: '"Pago Completado" <justinalonsomm@gmail.com>', 
    to: email,                                           
    subject: 'Comprobante de Pago',
    text: 'Adjunto encontrarás tu comprobante de pago.',
    attachments: [
      {
        filename: 'recibo.png',
        content: image, 
        encoding: 'base64',
      },
    ],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return new Response(JSON.stringify({ message: 'Correo enviado con éxito', info }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    return new Response(JSON.stringify({ message: 'Error al enviar el correo', error }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}