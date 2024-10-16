import nodemailer from 'nodemailer';

export async function POST(request) {
  const { email, image, studentName, receiptNumber } = await request.json();
  if (!email || !image || !studentName || !receiptNumber) {
    return new Response(JSON.stringify({ message: 'Faltan datos: email, imagen, nombre del alumno o número de recibo' }), {
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

  const fileName = `Recibo-MerecumbéSR-${studentName}-Ref${receiptNumber}.png`;

  const mailOptions = {
    from: 'Merecumbé San Ramón' + '<' + process.env.NEXT_PUBLIC_EMAIL_USER + '>', 
    to: email,                                           
    subject: 'Comprobante de Pago',
    text: 'Adjunto encontrarás tu comprobante de pago.\n\n¡Gracias por ser parte de nuestra academia!',
    attachments: [
      {
        filename: fileName,
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
    return new Response(JSON.stringify({ message: 'Error al enviar el correo', error }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}