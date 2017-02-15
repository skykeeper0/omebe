const Sequelize = require('sequelize');
const sequelize = new Sequelize('postgres://skye:123@localhost:5432/omebe')
const bcrypt = require('bcryptjs')
const saltRounds = 10;

const  Board = sequelize.define('boards', {
    // change it back to board_id
    _id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }, 
    board_img: {
        type: Sequelize.TEXT,
        allowNull: false,
    }
});


const User = sequelize.define('users', {
    // change it back to user_id
    user_id: {
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

const SharedBoard = sequelize.define('shared_boards', {
    // change it back to shared_id
    _id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
});


Board.belongsTo(User, {foreignKey: 'owner_id'}); 
User.hasMany(Board, {foreignKey: 'owner_id'});

SharedBoard.belongsTo(Board, {foreignKey: 'board_id'}); 
Board.hasMany(SharedBoard, {foreignKey: 'board_id'});

SharedBoard.belongsTo(User, {foreignKey: 'user_id'}); 
User.hasMany(SharedBoard, {foreignKey: 'user_id'});


Board.sync();
User.sync();
SharedBoard.sync();

module.exports = { User, Board, SharedBoard };
