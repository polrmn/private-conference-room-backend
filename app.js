const express = require("express");
const app = express();
const path = require("path");
const nodemailer = require("nodemailer");
const cors = require("cors");
const logger = require("morgan");
const { v4: uuidv4 } = require("uuid");
const Excel = require("exceljs");
const User = require("./models/User");

const createUsers = async () => {
  const workbook = new Excel.Workbook();
  const filePath = path.join(__dirname, "users.xlsx");
  await workbook.xlsx.readFile(filePath);

  const worksheet = workbook.eachSheet((worksheet, sheetId) => {
    console.log(`Sheet ${sheetId} - ${worksheet.name}`);
    if (sheetId === 5) {
      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber !== 1) {
          const email = row.getCell(2).value.trim();
          const password = uuidv4().slice(0, 8);
          const newUser = new User({ email, password });
          newUser.save();
          row.getCell(3).value = password;
        } else {
          row.getCell(3).value = "password";
        }
      });
    } else {
      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber !== 1) {
          const email = row.getCell(2).value.trim();
          const password = uuidv4().slice(0, 8);
          const newUser = new User({ email, password });
          newUser.save();
          row.getCell(4).value = password;
        } else {
          row.getCell(4).value = "password";
        }
      });
    }
  });

  await workbook.xlsx.writeFile("conference_participants.xlsx");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "dev.polrmn@gmail.com",
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const option = {
    from: "dev.polrmn@gmail.com",
    to: "Yulaa344@gmail.com",
    subject: "Користувачі на конференцію",
    html: `<p>Привіт.</p><p>В додатку до цього листа прикріпляю всіх користувачів у яких є доступ до конференції</p><p>Гарного дня)</p>`,
    attachments: [
      {
        filename: "conference_participants.xlsx",
        path: "./conference_participants.xlsx",
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
    await createUsers();
    res.status(200).json({ message: "Mail sended" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log(`App listening on port ${process.env.PORT}!`);
});

module.exports = app;
