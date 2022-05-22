const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Income = require('../models/income');
const Expense = require('../models/expenses');
const allMonths = require('../public/javascripts/index');
const auth = require('../middlewares/auth');
const { route } = require('.');

router.get('/', auth.isUserLoggedIn, auth.userIsVerified, async (req, res) => {
  try {
    //to get  the current month income
    let date = new Date();
    let year = date.getFullYear();
    let month = getMonth();
    let fulldate = `${year}/${month}/01`;
    let endDate = `${year}/${month}/30`;
    //finding all the income  that is added by  the user in this month
    let monthIncomeData = await Income.find({
      user: req.user._id,
      date: {
        $gte: fulldate,
        $lte: endDate,
      },
    });
    // finding all the expenses in this month that is added by the user
    let monthExpenseData = await Expense.find({
      user: req.user._id,
      date: {
        $gte: fulldate,
        $lte: endDate,
      },
    });
    // total amount of income of this month
    let monthTotalIncome = totalAmount(monthIncomeData);
    //total amount of  all the expeses by the user in a month
    let monthTotalExpenses = totalAmount(monthExpenseData);

    //get all the expenses by categories
    let expenses = await Expense.find({});
    let expenseCategories = [...new Set(expenses.map((cv) => cv.category))];

    // get all the  distnict income source   so we can show list all these in the dashboard
    let allincome = await Income.find({});
    let incomeCategories = [...new Set(allincome.map((cv) => cv.category))];
    //to differentiate  the get requerst on the  income in the dashboard
    let incomeData = ['salary', 'trading', 'buisness'];
    if (incomeData.includes(req.query.category)) {
      req.query.user = req.user._id;
      let userIncome = await Income.create(req.query);

      return res.redirect('/dashboard');
    }
    //  to differentiate  the get request on the expense in the dashboard
    let expenseData = [
      'health',
      'lifestyle',
      'grocery',
      'investment',
      'others',
    ];

    if (req.query.date && expenseData.includes(req.query.category)) {
      req.query.user = req.user._id;
      let enterExpense = await Expense.create(req.query);
      return res.redirect('/dashboard');
    }
    // filter the  data according to user filter
    if (req.query.category) {
      let categoryName = req.query.category;
      let categoryData = await Expense.find({
        user: req.user._id,
        category: categoryName,
        date: {
          $gte: fulldate,
          $lte: endDate,
        },
      });
      let amount = totalAmount(categoryData);
      let expenseData = getNormalDate(categoryData);
      return res.render('dashboard', {
        incomeCategories: incomeCategories,
        expensCategorie: expenseCategories,
        totalIncome: monthTotalIncome,
        totalExpense: amount,
        categoryData: expenseData,
        incomeData: undefined,
      });
    }
    //if the user request for the income categories
    if (req.query.incomecategory) {
      let categoryName = req.query.incomecategory;
      let incomeData = await Income.find({
        user: req.user._id,
        category: categoryName,
        date: {
          $gte: fulldate,
          $lte: endDate,
        },
      });
      //   to get the date in the normal format i have used the getNormalDate function here
      let resultIncomeData = getNormalDate(incomeData);
      return res.render('dashboard', {
        incomeCategories: incomeCategories,
        expensCategorie: expenseCategories,
        totalIncome: monthTotalIncome,
        totalExpense: monthTotalExpenses,
        categoryData: undefined,
        incomeData: resultIncomeData,
      });
    }

    //   display the date wise data here
    if (req.query.start_date && req.query.end_date) {
      //  all the expenses in between this date
      let expenseInBetweendate = await Expense.find({
        user: req.user._id,
        date: {
          $gte: req.query.start_date,
          $lte: req.query.end_date,
        },
      });
      //  all the income between in this date
      let incomeInBetweendate = await Income.find({
        user: req.user._id,
        date: {
          $gte: req.query.start_date,
          $lte: req.query.end_date,
        },
      });
      // total amount  of income and expense
      let totalExpense = totalAmount(expenseInBetweendate);
      let totalIncome = totalAmount(incomeInBetweendate);

      return res.render('dashboard', {
        incomeCategories: incomeCategories,
        expensCategorie: expenseCategories,
        totalIncome: totalIncome,
        totalExpense: totalExpense,
        categoryData: undefined,
        incomeData: undefined,
      });
    }
    // render the dashboard along with the sidebar and  the required data
    return res.render('dashboard', {
      incomeCategories: incomeCategories,
      expensCategorie: expenseCategories,
      totalIncome: monthTotalIncome,
      totalExpense: monthTotalExpenses,
      categoryData: false,
      incomeData: undefined,
    });
  } catch (err) {
    res.redirect('/');
  }
});

// this function is  to get the month
function getMonth() {
  let date = new Date();
  let month = date.getMonth() + 1;
  if (month) {
    let str = '' + month;
    if (str.length === 1) {
      month = '0' + month;
    }
  }
  return month;
}

// to get  the total amount
function totalAmount(arr) {
  return arr.reduce((acc, cv) => {
    acc += cv.amount;
    return acc;
  }, 0);
}

// to get  the date in the normal format coming from the database in the iso format
function getNormalDate(arr) {
  let result = [];
  arr.forEach((cv) => {
    let today = '' + cv.date;
    let normaldate = today.split('05');
    result.push({ date: normaldate[0], name: cv.name, amount: cv.amount });
  });
  return result;
}

module.exports = router;
