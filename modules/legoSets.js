const Sequelize = require('sequelize');
require('dotenv').config();

// Initialize Sequelize with the connection string from the .env file
const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        }
    },
    logging: false,
});

// Define the Theme model
const Theme = sequelize.define('Theme', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: Sequelize.STRING,
}, { timestamps: false });

// Define the Set model
const Set = sequelize.define('Set', {
    set_num: { type: Sequelize.STRING, primaryKey: true },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    theme_id: Sequelize.INTEGER,
    img_url: Sequelize.STRING,
}, { timestamps: false });

// Define the relationship between Set and Theme
Set.belongsTo(Theme, { foreignKey: 'theme_id' });

// Function to initialize the database and sync models
module.exports.initialize = function () {
    return sequelize.sync();
};

// CRUD Operations

// Get all LEGO sets, including their associated themes
module.exports.getAllSets = function () {
    return new Promise((resolve, reject) => {
        Set.findAll({ include: [Theme] }).then((sets) => {
            resolve(sets);
        }).catch((err) => {
            reject("Error retrieving sets: " + err);
        });
    });
};

// Get a single LEGO set by its set number
module.exports.getSetByNum = function (setNum) {
    return new Promise((resolve, reject) => {
        Set.findOne({ where: { set_num: setNum }, include: [Theme] }).then((set) => {
            if (set) {
                resolve(set);
            } else {
                reject("Unable to find set: " + setNum);
            }
        }).catch((err) => {
            reject("Error retrieving set: " + err);
        });
    });
};

// Add a new LEGO set to the database
module.exports.addSet = function (setData) {
    return new Promise((resolve, reject) => {
        Set.create(setData).then(() => {
            resolve();
        }).catch((err) => {
            reject("Error adding set: " + err);
        });
    });
};

// Edit an existing LEGO set by its set number
module.exports.editSet = function (setNum, setData) {
    return new Promise((resolve, reject) => {
        Set.update(setData, {
            where: { set_num: setNum }
        }).then((affectedRows) => {
            if (affectedRows > 0) {
                resolve();
            } else {
                reject("Unable to update set: " + setNum);
            }
        }).catch((err) => {
            reject("Error updating set: " + err);
        });
    });
};

// Delete a LEGO set from the database by its set number
module.exports.deleteSet = function (setNum) {
    return new Promise((resolve, reject) => {
        Set.destroy({
            where: { set_num: setNum }
        }).then((affectedRows) => {
            if (affectedRows > 0) {
                resolve();
            } else {
                reject("Unable to delete set: " + setNum);
            }
        }).catch((err) => {
            reject("Error deleting set: " + err);
        });
    });
};

// Get all themes from the database
module.exports.getAllThemes = function () {
    return new Promise((resolve, reject) => {
        Theme.findAll().then((themes) => {
            resolve(themes);
        }).catch((err) => {
            reject("Error retrieving themes: " + err);
        });
    });
};
