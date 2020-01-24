'use strict';

module.exports = (capabilities) => {
   
  return ( req, res, next) => {
    try{
      console.log(req.user.userRoles);
      if (req.user.capabilities.includes(capabilities)) {
        console.log('got it');
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