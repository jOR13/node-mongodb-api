const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        min: 5,
        max: 255
    },
    email: {
        type: String,
        required: true,
        min: 6,
        max: 1024
    },
    address: {
        type: String,
        max: 1024
    },
    phone: {
        type: String,
        max: 1024
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    image:
    {
        type: String,
        min: 0,
        max: 1024
    },
    date: {
        type: Date,
        default: Date.now
    },
    SignUpType: {
        type: String,
        required: true,
        minlength: 5
    },
})

module.exports = mongoose.model('User', userSchema);