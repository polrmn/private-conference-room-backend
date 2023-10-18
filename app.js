const express = require("express");
const app = express();
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const cors = require("cors");
const logger = require("morgan");
const { v4: uuidv4 } = require("uuid");
const Email = require("./models/Email");
const User = require("./models/User");

app.use(logger("dev"));
app.use(cors());
app.use(express.json());

const sendEmails = async () => {
  const emails = await Email.find();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "dev.polrmn@gmail.com",
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  for (const email of emails) {
    const password = uuidv4().slice(0, 8);
    const option = {
      from: "dev.polrmn@gmail.com",
      to: email.address,
      subject: "Запрошення на конференцію",
      text: `Ваш email: ${email.address}, Ваш пароль: ${password}`,
    };
    transporter.sendMail(option, (error, info) => {
      if (error) {
        console.log("error:", error);
      } else {
        console.log("mail sended", info);
        const newUser = new User({ email: email.address, password });
        newUser.save();
      }
    });
  }
};

cron.schedule("54 21 17 10 *", () => {
  console.log("cron date");
  sendEmails();
});

app.listen(3000, () => {
  console.log(`App listening on port ${process.env.PORT}!`);
});

module.exports = app;
