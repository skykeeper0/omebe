const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs')

const sequelize = new Sequelize('postgres://skye:123@localhost:5432/omebe')
const saltRounds = 10;

const User = sequelize.define('users', {
    // change it back to user_id
    _id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    cookie: {
        type: Sequelize.STRING,
        allowNull: false,
    }, 
}, {
    hooks: {
            afterValidate: (user) => {
                user.password = bcrypt.hashSync(user.password, saltRounds)
                user.cookie = bcrypt.hashSync(user.username, saltRounds)
            } 
        }
    }
);

User.sync();

module.exports = User;