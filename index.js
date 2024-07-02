const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors());
app.use(express.json());

const mongoose = require('mongoose')
const FoodItem = require('./models/FoodItem')
const FoodCategory = require('./models/FoodCategory')
 
 mongoose.connect("mongodb://localhost:27017/gofood")
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

  app.use('/api/', require('./routes/CreateUser'))


app.listen(4000, () => {
    console.log('listening to port')
})