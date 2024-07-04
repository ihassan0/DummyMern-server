const express = require('express')
const routes = express.Router()
const User = require('../models/User')
const {body, validationResult} = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const jwtSecret = 'mynameismynameismynameismyname#$'
const Order = require('../models/Order')

    routes.post('/createUser',
        [
            body('email', 'Invalid Email').isEmail(),
            body('name').isLength({ min:5 }),
            body('password', 'Password must be min 5 characters').isLength({ min:5 }) 
        ]
        
        ,(req, res) => {
            const errors = validationResult(req)
            if(!errors.isEmpty()){
                return res.status(400).json({ errors: errors.array()});
            }
            bcrypt.genSalt(10)
            .then(salt => bcrypt.hash(req.body.password, salt))
            .then(pass => {
        User.create({
            name: req.body.name,
            email: req.body.email,
            location: req.body.location,
            password: pass
        })
    })
        .then(result => res.json(result))
        .catch( err => console.log(err) )
    })

    routes.post('/loginUser',[
        body('email').isEmail(),
        body('password', 'Invalid Password').isLength({min:5})
    ],
         async(req, res) => {
            const errors = validationResult(req)
            if(!errors.isEmpty){
                return res.status(400).json({errors: errors.array()});
            }
            let email = req.body.email;
            try{
                const user = await User.findOne({email})
                if(!user){
                    return res.status(400).json({ errors: "User not found"});
                }
                const pass = await bcrypt.compare(req.body.password, user.password)
                if(!pass) {
                    return res.status(400).json({ errors: "Try correct credentials"});
                }
            const data = {
                uid:{
                    id: user.id
                }

            }
            const authToken = jwt.sign(data, jwtSecret)
                return res.json({success: true, authToken: authToken})

            } catch(err) {
                console.log("err:"+ err)
                // return res.json({success: false})
            }

    })

    routes.post('/orderData', async (req, res) => {
        // console.log(req.body)
        let data = req.body.order_data
        await data.splice(0,0,{Order_date:req.body.order_date})
        // console.log("1231242343242354",req.body.email)
    
        //if email not exisitng in db then create: else: InsertMany()
        let eId = await Order.findOne({ 'email': req.body.email })    
        // console.log(eId)
        if (eId===null) {
            try {
                await Order.create({
                    email: req.body.email,
                    order_data:[data]
                }).then(() => {
                    res.json({ success: true })
                })
            } catch (error) {
                console.log(error.message)
                res.send("Server Error", error.message)
    
            }
        }
    
        else {
            try {
                await Order.findOneAndUpdate({email:req.body.email},
                    { $push:{order_data: data} }).then(() => {
                        res.json({ success: true })
                    })
            } catch (error) {
                console.log(error.message)
                res.send("Server Error", error.message)
            }
        }
    })
    
    routes.post('/myOrderData', async (req, res) => {
        try {
            let eId = await Order.findOne({ 'email': req.body.email })
            //console.log(eId)
            res.json({orderData:eId})
            console.log(res.json({orderData:eId}));
        } catch (error) {
            // res.send("Error",error.message)
        }
        
    
    });

    module.exports = routes;
