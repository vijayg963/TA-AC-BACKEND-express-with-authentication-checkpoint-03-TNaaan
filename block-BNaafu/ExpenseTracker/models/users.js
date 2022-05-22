const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
let userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  age: {
    type: Number,
    default: 18,
  },
  country: {
    type: String,
    default: 'india',
  },
  isverified: {
    type: Boolean,
    default: false,
  },
});
//  hash (Bcrypt) user password before saving the user data into the database
userSchema.pre('save', async function (next) {
  try {
    this.password = await bcrypt.hash(this.password, 10);
  } catch (err) {
    res.redirect('/users/register');
  }
});
let User = mongoose.model('User', userSchema);
module.exports = User;
