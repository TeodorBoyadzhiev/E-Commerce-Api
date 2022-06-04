const express = require("express");
const db = require("./database");
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");



start();

async function start() {
    const port = 5000;
    const app = express();

    await db(app);
    app.use('/api/auth', authRoute);
    app.use('/api/users', userRoute);

    app.listen(port, () => {
        console.log('Server is running on port ' + port);
    });
}
