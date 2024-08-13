const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
    userName: { type: String, unique: true },
    password: String,
    email: String,
    loginHistory: [{ dateTime: Date, userAgent: String }]
});

let User;

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection(process.env.MONGODB);
        db.on('error', (err) => reject(err));
        db.once('open', () => {
            User = db.model('users', userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = function (userData) {
    return new Promise((resolve, reject) => {
        if (userData.password !== userData.password2) {
            reject('Passwords do not match');
        } else {
            bcrypt.hash(userData.password, 10).then((hash) => {
                userData.password = hash;
                let newUser = new User(userData);
                newUser.save().then(() => resolve()).catch((err) => {
                    if (err.code === 11000) {
                        reject('User Name already taken');
                    } else {
                        reject(`There was an error creating the user: ${err}`);
                    }
                });
            });
        }
    });
};

module.exports.checkUser = function (userData) {
    return new Promise((resolve, reject) => {
        User.findOne({ userName: userData.userName }).exec().then((user) => {
            if (!user) {
                reject(`Unable to find user: ${userData.userName}`);
            } else {
                bcrypt.compare(userData.password, user.password).then((result) => {
                    if (result) {
                        user.loginHistory.push({ dateTime: new Date(), userAgent: userData.userAgent });
                        user.save().then(() => resolve(user));
                    } else {
                        reject(`Incorrect Password for user: ${userData.userName}`);
                    }
                });
            }
        }).catch((err) => reject(`Unable to find user: ${userData.userName}`));
    });
};
