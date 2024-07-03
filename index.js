const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const FoodItem = require('../models/FoodItem');
const FoodCategory = require('../models/FoodCategory');
const createUserRoute = require('../routes/CreateUser');

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://rooty:root1122@cluster1.izvgr4k.mongodb.net/gofood?retryWrites=true&w=majority&appName=Cluster1", { useNewUrlParser: true, useUnifiedTopology: true });
console.log("connected");

app.get('/', (req, res) => {
  res.send('Hello world');
});

app.post('/foods', (req, res) => {
  Promise.all([
    FoodItem.find().exec(),
    FoodCategory.find().exec()
  ])
  .then(([foodItems, foodCategories]) => {
    res.json({ foodItems, foodCategories });
  })
  .catch(err => {
    res.status(500).json({ error: err.message });
  });
});

app.use('/api', createUserRoute);

// Export the Express app as a handler for Vercel
module.exports = app;
