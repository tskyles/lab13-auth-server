'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('../auth/roles-model');

const SECRET = 'yourpasswordisplaintext';
const persistTokens = new Set();

const capabilities = {
  admin: ['create','read','update','delete', 'superuser'],
  editor: ['create', 'read', 'update'],
  user: ['read'],
};

const userSchema = new mongoose.Schema({
  username: {type:String, required:true, unique:true},
  password: {type:String, required:true},
  email: {type: String},
  role: {type: String, default:'user', enum: ['admin','editor','user']},
}, {toObject: {virtuals: true, getters: true}, toJSON: {virtuals: true, getters: true}});

userSchema.virtual('userRoles', {
  ref: 'roles',
  localField: 'role',
  foreignField: 'type',
  justOne: true,
});

/** 
 * @description Hashes password before saving to DB
 */
userSchema.pre('save', async function(next) {
  if (this.isModified('password'))
  {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.pre('save', join);
userSchema.pre('find', join);

function join(next) {
  try {
    this.populate('userRoles');
  } catch (error) {
    console.error(error);
  }
  next();
}

/**
 * @description Saves OAuth user in database
 * @returns user
 */
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

/**
 * @description Authenticates user in database and returns
 */
userSchema.statics.authenticateBasic = function(auth) {
  let query = {username:auth.username};
  return this.findOne(query)
    .then( user => user && user.comparePassword(auth.password) )
    .catch(error => {throw error;});
};

/**
 * @description Compares hashed password against inputted password
 */
userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare( password, this.password )
    .then( valid => valid ? this : null);
};

/**
 * @description Verifies token against expiration and single use
 */
userSchema.statics.authenticateToken = function(token) {
  try {

    if(persistTokens.has(token)) {
      return Promise.reject('Token has been used');
    }

    let parsedTokenObject = jwt.verify(token, SECRET);
  
    persistTokens.add(token);
    
    let query = {_id:parsedTokenObject.id};

    return this.find(query);
  }
  catch (error) {
    return Promise.reject();
  }
};

/**
 * @description Generates token 
 */
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
