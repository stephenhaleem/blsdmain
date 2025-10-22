const https = require("https");

exports.handler = async (event) => {
  // Add CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { name, email, phone, guide, interest } = data;

    console.log("📥 Received form data:", JSON.stringify(data, null, 2));

    // Validate required fields
    if (!name || !email || !guide) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Missing required fields: name, email, or guide",
        }),
      };
    }

    // 1) Send to Make.com webhook using https module
    try {
      console.log("🔄 Sending to Make.com webhook...");

      const webhookData = JSON.stringify({
        name: name,
        email: email,
        phone: phone || "",
        guide: guide,
        guideName: data.guideName || guide,
        interest: interest || "Not specified",
        timestamp: new Date().toISOString(),
        source: "Guide Download Page",
      });

      const webhookResponse = await sendToMakeWebhook(webhookData);
      console.log("✅ Webhook sent successfully:", webhookResponse);
    } catch (webhookError) {
      console.error("❌ Webhook failed:", webhookError.message);
      console.error("❌ Full error:", webhookError);
      // Continue anyway - don't fail the whole process
    }

    // PDF mapping
    const pdfFiles = {
      firsttime: {
        name: "firsttime.pdf",
        subject: "Your First-Time Buyer's Guide is Here!",
        title: "First-Time Buyer's Guide",
      },
      international: {
        name: "international.pdf",
        subject: "Your International Buyer's Guide is Here!",
        title: "International Buyer's Guide",
      },
      luxury: {
        name: "luxury.pdf",
        subject: "Your Luxury Home Seller's Guide is Here!",
        title: "Luxury Home Seller's Guide",
      },
      sellers: {
        name: "sellers.pdf",
        subject: "Your Home Seller's Success Guide is Here!",
        title: "Home Seller's Success Guide",
      },
    };

    const selectedPdf = pdfFiles[guide];
    if (!selectedPdf) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid guide selection" }),
      };
    }

    // Check if Brevo API key exists
    if (!process.env.BREVO_API_KEY) {
      console.error("BREVO_API_KEY is not set");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Email service not configured" }),
      };
    }

    // Brevo API payload
    const emailData = {
      sender: {
        name: "BLSD Group Real Estate",
        email: "blsd@blsdgroup.com",
      },
      to: [{ email: email, name: name }],
      subject: selectedPdf.subject,
      htmlContent: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #868686 0%, #ffffff 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { color: white; margin: 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #d3d3d3; color: #000; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Your ${selectedPdf.title}</h1>
              </div>
              <div class="content">
                <h2>Hi ${name},</h2>
                <p>Thank you for downloading the <strong>${
                  selectedPdf.title
                }</strong>!</p>
                <p>Your comprehensive guide is attached to this email. This resource contains valuable insights and strategies to help you succeed in your real estate journey.</p>
                <p>If you have any questions or would like to discuss your real estate needs, please don't hesitate to reach out to us.</p>
                <p><strong>Your interest:</strong> ${
                  interest || "Not specified"
                }</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://blsdgroup.com" class="button">Visit Our Website</a>
                </div>
                <p>Best regards,<br><strong>BLSD Group Real Estate Team</strong></p>
              </div>
              <div class="footer">
                <p>© 2025 BLSD Group. All rights reserved.</p>
                <p>This email was sent because you requested a guide from our website.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      attachment: [
        {
          name: selectedPdf.name,
          url: `https://blsdgroup.com/pdfs/${selectedPdf.name}`,
        },
      ],
    };

    // Send email via Brevo API
    console.log("📧 Sending email via Brevo...");
    const response = await sendBrevoEmail(emailData, process.env.BREVO_API_KEY);
    console.log("✅ Email sent successfully:", response);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Guide sent successfully",
        guide: selectedPdf.title,
      }),
    };
  } catch (error) {
    console.error("💥 Error in function:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to send guide. Please try again or contact support.",
        details: error.message,
      }),
    };
  }
};

// New function to send webhook using https module
function sendToMakeWebhook(data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "hook.us2.make.com",
      port: 443,
      path: "/lve72p92w4kocxss22js76t9o3l9m3",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let body = "";

      res.on("data", (chunk) => {
        body += chunk;
      });

      res.on("end", () => {
        console.log("📤 Make.com response status:", res.statusCode);
        console.log("📤 Make.com response body:", body);

        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, body: body });
        } else {
          reject(
            new Error(`Make.com returned status ${res.statusCode}: ${body}`)
          );
        }
      });
    });

    req.on("error", (error) => {
      console.error("❌ Webhook request error:", error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Existing Brevo email function
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
        if (res.statusCode === 201 || res.statusCode === 200) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve(body);
          }
        } else {
          console.error("Brevo API Response:", body);
          reject(new Error(`Brevo API error (${res.statusCode}): ${body}`));
        }
      });
    });

    req.on("error", (error) => {
      console.error("Request error:", error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}
