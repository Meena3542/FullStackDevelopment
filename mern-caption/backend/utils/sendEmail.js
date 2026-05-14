const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "meenakshidasari05@gmail.com",   // your gmail
    pass: "rdbo bqry tmif aot"              //  app password (no spaces)
  }
});

const sendEmail = async (email, token) => {
  const url = `http://localhost:5000/api/auth/verify/${token}`;

  await transporter.sendMail({
    to: email,
    subject: "Verify Email",
    html: `<h3>Click to verify</h3><a href="${url}">${url}</a>`
  });
};

module.exports = sendEmail;