const https = require("https");

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body);
    const { name, email, phone, guide } = data;

    // PDF mapping
    const pdfFiles = {
      firsttime: {
        name: "firsttime.pdf",
        subject: "Your First-Time Buyer's Guide is Here!",
      },
      international: {
        name: "international.pdf",
        subject: "Your International Buyer's Guide is Here!",
      },
      luxury: {
        name: "luxury.pdf",
        subject: "Your Luxury Real Estate Guide is Here!",
      },
      sellers: {
        name: "sellers.pdf",
        subject: "Your Seller's Guide is Here!",
      },
    };

    const selectedPdf = pdfFiles[guide];
    if (!selectedPdf) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid guide selection" }),
      };
    }

    // Brevo API payload
    const emailData = {
      sender: {
        name: "Your Real Estate Company",
        email: "noreply@blsdgroup.com", // Change this to your domain
      },
      to: [{ email: email, name: name }],
      subject: selectedPdf.subject,
      htmlContent: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Hi ${name},</h2>
            <p>Thank you for your interest! Your guide is attached to this email.</p>
            <p>If you have any questions, feel free to reach out to us.</p>
            <p>Best regards,<br>Your Real Estate Team</p>
          </body>
        </html>
      `,
      attachment: [
        {
          name: selectedPdf.name,
          url: `https://blsdgroup.com/pdfs/${selectedPdf.name}`, // Change to your actual domain
        },
      ],
    };

    // Send email via Brevo API
    const response = await sendBrevoEmail(emailData, process.env.BREVO_API_KEY);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Guide sent successfully!" }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to send guide" }),
    };
  }
};

function sendBrevoEmail(emailData, apiKey) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(emailData);

    const options = {
      hostname: "api.brevo.com",
      port: 443,
      path: "/v3/smtp/email",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        if (res.statusCode === 201) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Brevo API error: ${body}`));
        }
      });
    });

    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}
