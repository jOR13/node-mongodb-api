const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  userID: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
    min: 1,
    max: 9999,
  },

  image: {
    type: String,
    min: 0,
    max: 1024,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Posts", postSchema);
