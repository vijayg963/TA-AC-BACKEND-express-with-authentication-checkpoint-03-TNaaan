const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let incomeSchema = new Schema(
  {
    name: {
      type: String,
    },
    category: {
      type: String,
    },
    amount: {
      type: Number,
      require: true,
    },
    date: {
      type: Date,
      require: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const Income = mongoose.model('Income', incomeSchema);
module.exports = Income;
