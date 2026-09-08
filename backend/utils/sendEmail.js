import nodemailer from "nodemailer";

const sendEmail = async (to, subject, message) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"LAPZONE" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: message,
  });
};

export default sendEmail;
