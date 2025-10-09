import { Resend } from "resend";
import fs from "fs";
import path from "path";

export async function handler(event) {
  try {
    const { fullName, email, guideType } = JSON.parse(event.body);

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Ensure guideType matches a real file in your /public folder
    const pdfPath = path.join(process.cwd(), "public", guideType);
    const pdfBuffer = fs.readFileSync(pdfPath);

    await resend.emails.send({
      from: "BLSD Group <no-reply@yourdomain.com>",
      to: email,
      subject: `Your Requested Guide: ${guideType.replace(".pdf", "")}`,
      html: `
        <p>Hi ${fullName},</p>
        <p>Thank you for your interest! Here's your requested guide: <strong>${guideType.replace(
          ".pdf",
          ""
        )}</strong>.</p>
        <p>We hope it helps you on your real estate journey!</p>
        <p>Warm regards,<br>BLSD Group Team</p>
      `,
      attachments: [
        {
          filename: guideType,
          content: pdfBuffer.toString("base64"),
          type: "application/pdf",
        },
      ],
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: error.message }),
    };
  }
}
