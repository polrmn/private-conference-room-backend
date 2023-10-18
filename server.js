const mongoose = require("mongoose");
const app = require("./app");
require("dotenv").config();

const { DB_HOST, PORT = 3001 } = process.env;

// const { DB_HOST, PORT = 3001 } = process.env

// const DB_HOST = 'mongodb+srv://admin:kYH.zxNV5La7K-S@cluster0.zrkggah.mongodb.net/conference_reader?retryWrites=true&w=majority'

mongoose
  .connect(DB_HOST)
  .then(() => {
    app.listen(PORT);
    console.log(PORT, DB_HOST);
  })
  .catch((error) => console.log(error.message));

// admin
// kYH.zxNV5La7K-S
