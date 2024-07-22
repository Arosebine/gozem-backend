const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL, )
    console.log("Gozem PackagesDB Connected");
}
catch (error) {
    console.log("Gozem PackagesDB Connection Failed");
}
}


module.exports = connectDB;