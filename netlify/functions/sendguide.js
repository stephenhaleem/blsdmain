const https = require("https");
const fetch = require("node-fetch");
const nodemailer = require("nodemailer");

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

    console.log("📥 Received data:", JSON.stringify(data, null, 2));

    // 1. Send to Make.com webhook
    try {
      console.log("🔄 Sending to Make.com webhook...");

      const webhookResponse = await fetch(
        "https://hook.us2.make.com/lve72p92w4kocxss22js76t9o3l9m3",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            phone: data.phone,
            guide: data.guide,
            guideName: data.guideName,
            interest: data.interest,
            timestamp: data.timestamp,
            source: data.source,
          }),
        }
      );

      const webhookText = await webhookResponse.text();
      console.log("📤 Make.com response status:", webhookResponse.status);
      console.log("📤 Make.com response body:", webhookText);

      if (!webhookResponse.ok) {
        console.error(
          "❌ Make.com webhook failed:",
          webhookResponse.status,
          webhookText
        );
      } else {
        console.log("✅ Webhook sent successfully");
      }
    } catch (webhookError) {
      console.error("❌ Webhook error:", webhookError.message);
      console.error("❌ Full webhook error:", webhookError);
      // Don't fail the whole process - continue to send email
    }

    // 2. Send email with guide
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Map guide types to PDF files
    const guideFiles = {
      luxury: "guides/luxury-guide.pdf",
      sellers: "guides/sellers-guide.pdf",
      international: "guides/international-guide.pdf",
      investment: "guides/investment-guide.pdf",
      firsttime: "guides/firsttime-guide.pdf",
      mortgage: "guides/mortgage-guide.pdf",
    };

    const mailOptions = {
      from: `"BLSD Group" <${process.env.SMTP_USER}>`,
      to: data.email,
      subject: `Your ${data.guideName} is Ready!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hi ${data.name}!</h2>
          <p>Thank you for downloading the <strong>${data.guideName}</strong>.</p>
          <p>Your guide is attached to this email. We hope you find it valuable!</p>
          <p>If you have any questions, feel free to reach out to us.</p>
          <br>
          <p>Best regards,<br><strong>BLSD Group Team</strong></p>
        </div>
      `,
      attachments: [
        {
          filename: `${data.guideName}.pdf`,
          path: guideFiles[data.guide],
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent successfully:", info);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Guide sent successfully",
        webhookSent: true,
      }),
    };
  } catch (error) {
    console.error("💥 Error in function:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        details: "Check function logs for more information",
      }),
    };
  }
};
