const mongoose = require('mongoose');
require("dotenv").config();

const conectionURL = process.env.MONGODB_URL;
function connectToMongoDB() {
    mongoose.connect(conectionURL)

    mongoose.connection.on("connected", ()=> {
        console.log("connected to monogDB Instance successfully");
    })

    mongoose.connection.on("error", (err)=> {
        console.log("failed to connect to the mongoDB instance", err)
    })
}

module.exports = { connectToMongoDB };