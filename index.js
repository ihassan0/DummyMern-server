const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
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
  
      // Check if order_data is provided and is an array
      if (!order_data || !Array.isArray(order_data)) {
        return res.status(400).json({ error: 'Invalid order data' });
      }
  
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: order_data.map(item => ({
          price_data: {
            currency: 'pkr',
            product_data: {
              name: item.name,
            },
            unit_amount: item.price * 100,
          },
          quantity: item.qty,
        })),
        mode: 'payment',
        success_url: 'http://localhost:5173/',
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


  app.post('/webhook', bodyParser.raw({ type: 'application/json' }), (request, response) => {
    const sig = request.headers['stripe-signature'];
    const endpointSecret = 'whsec_YOUR_WEBHOOK_SECRET'; // Replace with your webhook secret
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      console.log(`Webhook Error: ${err.message}`);
      return response.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
  
      // Fulfill the purchase...
      handleCheckoutSession(session);
    }
  
    response.json({ received: true });
  });
  
  const handleCheckoutSession = async (session) => {
    // Create the order in your database
    const { email, order_date } = session.metadata;
    const order_data = session.display_items.map(item => ({
      name: item.custom.name,
      price: item.amount / 100,
      qty: item.quantity,
    }));
  
    await Order.create({
      email,
      order_data: [order_data],
    }).then(() => {
      console.log('Order created successfully');
    }).catch((error) => {
      console.error('Error creating order:', error);
    });
  };

  const PORT = process.env.PORT;

  app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
  });