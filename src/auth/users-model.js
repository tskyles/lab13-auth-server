'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('../auth/roles-model');

const SECRET = 'yourpasswordisplaintext';
const persistTokens = new Set();

const userSchema = new mongoose.Schema({
  username: {type:String, required:true, unique:true},
  password: {type:String, required:true},
  email: {type: String},
  role: {type: String, default:'user', enum: ['admin','editor','user']},
}, {toObject: {virtuals: true}, toJSON: {virtuals: true}});

userSchema.virtual('userRoles', {
  ref: 'roles',
  localField: 'role',
  foreignField: 'type',
  justOne: true,
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password'))
  {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.pre('find', function() {
  try {
    console.log('joining')
    this.populate('userRoles');
  } catch (error) {
    console.error(error);
  }
});

userSchema.statics.createFromOauth = function(email) {

  if(! email) { return Promise.reject('Validation Error'); }

  return this.findOne( {email} )
    .then(user => {
      if( !user ) { throw new Error('User Not Found'); }
      console.log('Welcome Back', user.username);
      return user;
    })
    .catch( error => {
      console.log('Creating new user');
      let username = email;
      let password = 'none';
      return this.create({username, password, email});
    });

};

userSchema.statics.authenticateBasic = function(auth) {
  let query = {username:auth.username};
  return this.findOne(query)
    .then( user => user && user.comparePassword(auth.password) )
    .catch(error => {throw error;});
};

userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare( password, this.password )
    .then( valid => valid ? this : null);
};

userSchema.statics.authenticateToken = function(token) {
  try {

    if(persistTokens.has(token)) {
      return Promise.reject('Token has been used');
    }

    let parsedTokenObject = jwt.verify(token, SECRET);
  
    persistTokens.add(token);
    
    let query = {_id:parsedTokenObject.id};

    return this.findOne(query)
  }
  catch (error) {
    return Promise.reject();
  }
}

userSchema.methods.generateToken = function() {

  let token = {
    id: this._id,
    capabilities: capabilities[this.role],
    username: this.username,
    type: 'admin',
  };

  return jwt.sign(token, SECRET, { expiresIn: '15m' });
};

module.exports = mongoose.model('users', userSchema);
