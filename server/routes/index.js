const express = require('express');
const api = express.Router();
const socket = require('../controllers/socket.io');

module.exports = function (io) {
    
    socket.multiplayer(io);

    return api;
}