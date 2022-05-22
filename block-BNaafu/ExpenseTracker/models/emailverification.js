const mongoose = require('mongoose');
const verifyEmailSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  verificationCode: {
    type: Number,
  },
});

const Verifyemail = mongoose.model('Verifyemail', verifyEmailSchema);
module.exports = Verifyemail;
