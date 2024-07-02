const mongoose = require('mongoose')

const FoodItemSchema = new mongoose.Schema({
    CategoryName: String,
    name: String,
    img: String,
    options: Array,
    description: String,
})

const FoodItem = mongoose.model('foods', FoodItemSchema)
module.exports = FoodItem