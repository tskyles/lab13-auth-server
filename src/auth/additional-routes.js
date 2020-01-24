'use strict';

const express = require('express');
const router = express.Router();
const bearAuth = require('../auth/bearer-auth-middleware');
const acl = require('./acl-middleware');

router.get('/public');

router.get('/private', bearAuth, (req, res, next) => {

}); 

router.get('/readonly', bearAuth, acl('read'), (req, res, next) => {

}); 

router.get('/create', bearAuth, acl('create'), (req, res, next) => {

});

router.put('/update', bearAuth, acl('update'), (req, res, next) => {

}); 


router.patch('/delete', bearAuth, acl('delete'), (req, res, next) => {

});

router.get('/everything', bearAuth, acl('superuser'), (req, res, next) => {

});

module.exports = router;