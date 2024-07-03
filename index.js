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
 
 mongoose.connect("mongodb+srv://rooty:root1122@cluster1.izvgr4k.mongodb.net/gofood?retryWrites=true&w=majority&appName=Cluster1")
  console.log("connected")

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