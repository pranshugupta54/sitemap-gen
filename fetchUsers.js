const mongoose = require('mongoose');
const url = process.env.MONGO_URI || 'mongodb://localhost:27017/digitomize';

let myUsers = [];

async function getAllUsers() {
    console.log("Fetching all users");
    await mongoose.connect(url);
    let User;
    try {
        // Try to get the existing model
        User = mongoose.model('User');
    } catch (error) {
        // If the model doesn't exist, create it
        User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    }

    const users = await User.find({}, 'username').lean();
    myUsers = users;
    console.log("fetched users.");
}


async function sendMyUsers() {
    // console.log("Sending my users", myUsers);

    return myUsers;
}


module.exports = {
    getAllUsers,
    sendMyUsers
};
