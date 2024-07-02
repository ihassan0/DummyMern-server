const mongoose = require('mongoose')

const FoodCategorySchema = new mongoose.Schema({
    CategoryName: String,
})

const FoodCategory = mongoose.model('categories', FoodCategorySchema)
module.exports = FoodCategory