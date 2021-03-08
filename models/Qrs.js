const mongoose = require('mongoose');

const qrsSchema = mongoose.Schema({
    status: {
        type: String,
        required: true,
        min: 1,
        max: 255
    },
    longitude: {
        type: String,
        required: false,
        min: 6,
        max: 1024
    },
    latitude: {
        type: String,
        required: false,
        minlength: 6
    },
    lastScan: {
        type: Date,
        required: false,
        minlength: 6
    },
   
    userID: {
        type: Object,
        required: false,
        minlength: 6
    },
    mascotaID: {
        type: Object,
        required: false,
        minlength: 6
    },
   
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Qrs', qrsSchema);