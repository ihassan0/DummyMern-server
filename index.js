const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const Order = require('./models/Order')
require("dotenv").config();
app.use(cors());
// app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.raw({ type: 'application/json' }));
const connectDB = require("./connectMongo");
const stripe = require('stripe')('sk_test_51Lk41oCCH7KhoNuOZkvqf74MAQlysMXutmWShCgZ1wweUnRH1W11hRGZ4CrAiKBFv66cuxK1ccCWUo3JxykuLuBq00UkxdOxma');

connectDB();
const FoodItem = require('./models/FoodItem')
const FoodCategory = require('./models/FoodCategory')

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


  app.post('/api/create-checkout-session', async (req, res) => {
    try {
      const { order_data, email, order_date } = req.body;
      console.log(req.body)
      if (!order_data || !Array.isArray(order_data)) {
        return res.status(400).json({ error: 'Invalid order data' });
      }
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: order_data.map(item => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
            },
            unit_amount: item.price * 100,
          },
          quantity: 1,
        })),
        mode: 'payment',
        success_url: 'https://foodie-client-orpin.vercel.app/',
        cancel_url: 'https://foodie-client-orpin.vercel.app/',
        metadata: {
          email,
          order_date,
        },
      });

    res.json({ id: session.id });
  } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  const PORT = process.env.PORT;

  app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
  });