const mongoose = require('mongoose');

const petsSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 5,
        max: 255
    },
    type: {
        type: String,
        required: true,
        min: 6,
        max: 1024
    },
    race: {
        type: String,
        required: true,
        minlength: 6
    },
    address: {
        type: String,
        required: true,
        minlength: 6
    },
    description: {
        type: String,
        required: true,
        minlength: 6
    },
    contact: {
        type: String,
        required: true,
        minlength: 6
    },
    userID: {
        type: String,
        required: false,
        minlength: 6
    },
    imageID: {
        type: String,
        required: false,
        minlength: 6
    },
    qrID: {
        type: String,
        required: false,
        minlength: 6
    },
    reward: {
        type: Number,
        required: true
    },

    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Pets', petsSchema);