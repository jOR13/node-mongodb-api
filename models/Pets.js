const mongoose = require('mongoose');

const petsSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 3,
        max: 255
    },
    type: {
        type: String,
        required: true,
        min: 3,
        max: 1024
    },
    race: {
        type: String,
        required: true,
        minlength: 3
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
        type: Object,
        required: false,
        minlength: 6
    },
    imageID: {
        type: Object,
        required: false,
        minlength: 6
    },
    qrID: {
        type: Object,
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
    },
    status: {
        type: String
    },

})

module.exports = mongoose.model('Pets', petsSchema);