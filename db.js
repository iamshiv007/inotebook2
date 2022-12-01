const mongoose = require('mongoose');
const {MONGOURI} = require("./config/keys") 

const connectToMongo = () => {
    mongoose.connect(MONGOURI,()=>{
        console.log("Connected to Mongo Successfully");
    })
}

module.exports = connectToMongo;