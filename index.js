const express = require("express");
const db = require("./database");
const cors = require("cors");
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
const stripeRoute = require("./routes/stripe");
require('dotenv').config()

start();

async function start() {
    const port = 5000;
    const app = express();

    await db(app);
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use(express.json());
    app.use('/api/auth', authRoute);
    app.use('/api/users', userRoute);
    app.use('/api/products', productRoute);
    app.use('/api/carts', cartRoute);
    app.use('/api/orders', orderRoute);
    app.use('/api/checkout', stripeRoute)

    app.listen(port, () => {
        console.log('Server is running on port ' + port);
    });
}
