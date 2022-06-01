const express = require("express");
const { start } = require("repl");
const db = require("./database");



appStart();

async function appStart() {
    const port = 5000;
    const app = express();

    await db(app);
    app.listen(port, () => {
        console.log('Server is running on port ' + port);
    });
}
