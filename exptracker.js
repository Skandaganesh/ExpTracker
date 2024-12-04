const express = require('express');
const cron = require('node-cron');
const app = express();

app.use(express.json());

let expenses = [];
const categories = ["Food", "Travel", "Shopping", "Utilities", "Other"];

app.get('/', (req, res) => {
    res.send('Welcome to Expense Tracker');
});

app.post('/expenses', (req, res) => {
    const { amount, description, category, date } = req.body;
if (!amount || !description || !category || !date) {
     return res.status(400).send('Missing required fields');
    }

if (isNaN(amount) || amount <= 0) {
 return res.status(400).send("Amount should be a valid number greater than 0");
}

if (!categories.includes(category)) {
      return res.status(400).send("Invalid category");
    }

    if (isNaN(Date.parse(date))) {
       return res.status(400).send("Invalid date format");
    }

    const newExpense = { id: expenses.length + 1, amount, description, category, date };
    expenses.push(newExpense);
    res.status(201).send('Expense added');
});

app.get('/expenses', (req, res) => {
const { category, startDate, endDate } = req.query;
    let filteredExpenses = expenses;
 if (category) {
 filteredExpenses = filteredExpenses.filter(expense => expense.category === category);
    }

    if (startDate) {
  filteredExpenses = filteredExpenses.filter(expense => new Date(expense.date) >= new Date(startDate));
    }
    
 if (endDate) {
        filteredExpenses = filteredExpenses.filter(expense => new Date(expense.date) <= new Date(endDate));
    }
    res.json(filteredExpenses);
});
app.get('/expenses/:analysis', (req, res) => {
    if (expenses.length === 0) {
        return res.status(400).json({
            status: "error",
            message: "No expenses found for analysis."
        });
    }
    const totalsByCategory = {};
    let totalAmount = 0;
    expenses.forEach(({ category, amount }) => {
        if (!totalsByCategory[category]) totalsByCategory[category] = 0;
        totalsByCategory[category] += amount;
        totalAmount += amount;
    });

    res.json({
        totalsByCategory,
        totalAmount
    });
});

app.get('/expenses/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const expense = expenses.find(exp => exp.id === id);

    if (!expense) {
        return res.status(404).send('Expense not found');
    }

    res.json(expense);
});

cron.schedule("0 0 * * *", () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const weeklyExpenses = expenses.filter(exp => new Date(exp.date) >= startOfWeek);
    const weeklyTotal = weeklyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
});

app.listen(3000, () => {
    console.log('Expense Tracker is running on port 3000');
});
