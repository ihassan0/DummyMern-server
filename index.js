const express = require('express')
const app = express()
const cors = require('cors')
require("dotenv").config();
app.use(cors());
app.use(express.json());
const connectDB = require("./connectMongo");

connectDB();
const FoodItem = require('../models/FoodItem')
const FoodCategory = require('../models/FoodCategory')

  app.get('/', (req, res) => {
    res.send('Hello world')
  })
  app.post('/foods', (req, res) => {
    Promise.all([
      FoodItem.find().exec(),
      FoodCategory.find().exec()
  ])
  .then(([foodItems, foodCategories]) => {
      res.json({ foodItems, foodCategories });
  })

  })

  app.use('/api/', require('../routes/CreateUser'))

  const PORT = process.env.PORT;

  app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
  });