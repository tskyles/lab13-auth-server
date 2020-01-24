'use strict';
const User = require('../auth/users-model');

module.exports = (req, res, next) => {

  if (!req.headers.authorization) { next('Invalid Login'); return;}

  let token = req.headers.authorization.split(' ').pop();

  console.log(token)

  User
    .authenticateToken(token)
    .then( validUser => {
      console.log(validUser)
      req.user = validUser;
      next();
    })
    .catch( err => next('Unauthorized Token'));

};