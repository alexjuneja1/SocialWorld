var
  mongoose = require('mongoose')
  , bcrypt = require('bcrypt-nodejs')
  , Schema = mongoose.Schema

var userSchema = new Schema({
  local: {
    username: String,
    email: String,
    password: String
  }
})

userSchema.methods.info = function(){
  console.log('my username is ' + username)
}

var User = mongoose.model('User', userSchema)

module.exports = User
