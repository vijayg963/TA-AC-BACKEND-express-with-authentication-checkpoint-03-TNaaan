const mongoose = require('mongoose');
let Schema = mongoose.Schema;
let expenseSchema = new Schema(
  {
    name: {
      type: String,
    },
    category: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

let Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;
