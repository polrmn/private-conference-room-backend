const express = require("express");
const app = express();
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const cors = require("cors");
const logger = require("morgan");
const { v4: uuidv4 } = require("uuid");
const Email = require("./models/Email");
const User = require("./models/User");

const sendEmails = async () => {
  const emails = await Email.find();
  const sendedEmails = [];
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "dev.polrmn@gmail.com",
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  for (const email of emails) {
    const { address, appeal } = email;
    console.log(address, appeal, email);
    const password = uuidv4().slice(0, 8);
    const option = {
      from: "dev.polrmn@gmail.com",
      to: address,
      subject: "Запрошення на конференцію",
      html: `<p>${
        appeal ? appeal : "Вітаємо"
      }.</p><p>Раді вас запросити до трансляції  дилерської конференції за посиланням нижче: </p><p><a href="https://toyota-lexus-conference.vercel.app/">Посилання на трансляцію</a></p><p><b>ВАЖЛИВО: </b>Щоб долучитись до трансляції - вам потрібно ввести логін та пароль які надсилаємо нижче.</p><p>Ваш логін: ${address}</p><p>Ваш пароль: ${password}</p><p>У вкладенні ви можете ознайомитись з інструкцією входу.
      Контакти технічної підтримки</p><p>Дякуємо та до зустрічі!</p><p>З повагою, ваші Тойота та Лексус.</p>`,
      attachments: [
        {
          filename: "Інстукції.txt",
          path: "./attachment.txt",
        },
      ],
    };
    transporter.sendMail(option, (error, info) => {
      if (error) {
        console.log("error:", error);
        sendedEmails.push(`sending error for ${email}`);
      } else {
        console.log("mail sended", info);
        const newUser = new User({ email: email.address, password });
        newUser.save();
        sendedEmails.push(email);
      }
    });
  }
  return sendedEmails;
};

app.use(logger("dev"));
app.use(cors());
app.use(express.json());

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(401).json({
      message: "Email is wrong",
    });
    return;
  }
  if (user.password !== password) {
    res.status(401).json({
      message: "Password is wrong",
    });
    return;
  }
  if (user.password === password) {
    res.status(200).json({
      message: "Welcome",
    });
  }
});

app.use("/wake-up", (_, res) => {
  console.log("I am not slepping");
  res.status(200).json({ message: "I am not sleeping" });
});

app.post("/send-emails", async (_, res) => {
  try {
    const emailsSended = await sendEmails();
    res.status(200).json(emailsSended);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log(`App listening on port ${process.env.PORT}!`);
});

module.exports = app;
