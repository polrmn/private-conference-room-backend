const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true,
  },
});

const Email = mongoose.model('Email', emailSchema);

module.exports = Email;