import puppeteer from 'puppeteer';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { htmlContent, cssStyles } = await req.json();

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    const contentWithStyles = `
      <html>
        <head>
          <style>${cssStyles}</style>
        </head>
        <body style="margin: 0; padding: 0;">
          ${htmlContent}
        </body>
      </html>
    `;

    await page.setContent(contentWithStyles, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      width: '100mm',  
      height: '230mm',
      margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' }, 
      printBackground: true,
    });

    await browser.close();

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="recibo.pdf"',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Error generating PDF' }, { status: 500 });
  }
}
