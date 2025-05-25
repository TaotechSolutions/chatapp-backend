const mongoose = require("mongoose");
mongoose.set('strictQuery', true);
mongoose.set('strictPopulate', false);


module.exports.connectDB = async () => {
  const retries = 5, delay = 2000;

  for (let attempt = 1; attempt <= retries; attempt++){
    try {
      await mongoose.connect(process.env.CONNECTIONSTRING);

      console.log("Mongo DB connected");
      break;
    } catch (error) {
      console.error(`Database connection attempt ${attempt} failed:`, error);

      if (attempt < retries) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }else {
        console.error('All retries failed. Could not connect to Database.');
        throw error;
      }
    }
  }
};

// Disconnect db
module.exports.closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
};

// Remove all the data for all db collections.
module.exports.clearDatabase = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
};
