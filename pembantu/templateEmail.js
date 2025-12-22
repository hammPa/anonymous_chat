function renderTemplateEmail({ anon, isi, link }) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <style>
      body {
        background: #f5f6fa;
        font-family: Arial, sans-serif;
        padding: 20px;
      }
      .card {
        max-width: 520px;
        margin: auto;
        background: #ffffff;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      }
      .title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 12px;
      }
      .message {
        background: #f1f3f5;
        border-left: 4px solid #111;
        padding: 12px;
        margin: 16px 0;
        font-size: 14px;
        line-height: 1.6;
      }
      .cta {
        display: inline-block;
        margin-top: 20px;
        background: #111;
        color: #fff;
        text-decoration: none;
        padding: 10px 18px;
        border-radius: 8px;
        font-size: 14px;
      }
      .footer {
        margin-top: 24px;
        font-size: 12px;
        color: #888;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="title">Ada curhatan baru</div>

      <div>
        <strong>Anonim ${anon}</strong> mengirim pesan:
      </div>

      <div class="message">
        ${isi}
      </div>

      <a href="${link}" class="cta">Buka Tembok Curhat</a>

      <div class="footer">
        Kamu menerima email ini karena berlangganan post ini.
      </div>
    </div>
  </body>
  </html>
  `;
}

module.exports = { renderTemplateEmail };
