const express = require("express");
const db = require("./database");
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");



start();

async function start() {
    const port = 5000;
    const app = express();

    await db(app);
    app.use('/api/auth', authRoute);
    app.use('/api/users', userRoute);
    app.use('/api/products', productRoute);
    app.use('/api/carts', cartRoute);
    app.use('/api/orders', orderRoute)

    app.listen(port, () => {
        console.log('Server is running on port ' + port);
    });
}
