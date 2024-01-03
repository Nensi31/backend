const mongoose = require("mongoose");
const Joi = require("joi");
const {string} = require("joi");

const appSchema = mongoose.Schema({
  name: { type: String, require: true, minlength: 3,  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 5 },
  role: { type: String, required: true },
  token: { type: String },
  department: { type: String, required: true },
});

module.exports = mongoose.model("App", appSchema);
