'use strict';

// const users = require('../auth/users-model');

module.exports = (capabilities) => {
   
  return ( req, res, next) => {
    try{
      if (req.user.capabilities.includes(capabilities)) {
        console.log('got it')
        next();
      }
      else {
        next(`Access Denied`);
      }
    }
    catch (e) {
      next ('Invalid Login');
    }
  };
};