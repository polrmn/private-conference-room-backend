const express = require("express");
const app = express();
const nodemailer = require("nodemailer");
const cors = require("cors");
const logger = require("morgan");
const { v4: uuidv4 } = require("uuid");
const Excel = require("exceljs");
const Email = require("./models/Email");
const User = require("./models/User");

const createUsers = async () => {
  const emails = await Email.find();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "dev.polrmn@gmail.com",
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  const users = [];

  for (const email of emails) {
    const { address } = email;
    const password = uuidv4().slice(0, 8);

    const newUser = new User({ email: address, password });
    users.push({ email: address, password });
    newUser.save();
  }
  const workbook = new Excel.Workbook();
  const sheet = workbook.addWorksheet("Users");

  sheet.columns = [
    { header: "Email", key: "email", width: 30 },
    { header: "Password", key: "password", width: 20 },
  ];

  for (const user of users) {
    sheet.addRow(user);
  }

  const filePath = "./users.xlsx";
  await workbook.xlsx.writeFile(filePath);

  const option = {
    from: "dev.polrmn@gmail.com",
    to: "polrmn@gmail.com",
    subject: "Користувачі на конференцію",
    html: `<p>Привіт.</p><p>В додатку до цього листа прикріпляю всіх користувачів у яких є доступ до конференції</p><p>Гарного дня)</p>`,
    attachments: [
      {
        filename: "users.xlsx",
        path: filePath,
      },
    ],
  };
  transporter.sendMail(option, (error, info) => {
    if (error) {
      console.log("error:", error);
    } else {
      console.log("mail sended", info);
    }
  });
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

app.post("/createUsers", async (_, res) => {
  try {
    const emailsSended = await createUsers();
    res.status(200).json(emailsSended);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log(`App listening on port ${process.env.PORT}!`);
});

module.exports = app;
