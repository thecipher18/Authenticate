var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    firstname: String,
    lastname: String,
    role: String,
    password: String
});
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("user", UserSchema);