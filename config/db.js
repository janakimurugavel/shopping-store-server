const mongoose = require("mongoose");

async function connectToDatabase() {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME;

    if (!uri || !dbName) {
        throw new Error("Set MONGODB_URI and MONGODB_DB_NAME in your .env file.");
    }

    await mongoose.connect(uri, {
        dbName,
        serverSelectionTimeoutMS: 5000,
    });

    console.log(`Connected to MongoDB database: ${dbName}`);
}

async function closeDatabaseConnection() {
    await mongoose.disconnect();
}

module.exports = {
    connectToDatabase,
    closeDatabaseConnection,
};