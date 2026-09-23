const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = async ({ to, name }) => {
    const message = {
        to,
        from: {
            email: process.env.SENDGRID_FROM_EMAIL,
            name: process.env.SENDGRID_FROM_NAME,
        },
        subject: "Welcome to Shopping Store",
        text: `Hello ${name}, your account was created successfully.`,
        html: `
      <h1>Welcome, ${name}!</h1>
      <p>Your Shopping Store account was created successfully.</p>
    `,
    };

    await sgMail.send(message);
};

module.exports = {
    sendWelcomeEmail,
};