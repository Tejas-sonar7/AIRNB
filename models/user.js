const express = require("express");
const mongoose = require("mongoose");
const passprtlocalmongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  }
});

UserSchema.plugin(passprtlocalmongoose);
module.exports = mongoose.model("User", UserSchema);
  