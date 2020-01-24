'use strict';

const express = require('express');
const router = express.Router();
const bearAuth = require('../auth/bearer-auth-middleware');
const acl = require('./acl-middleware');
const Role = require('../auth/roles-model');

const capabilities = {
  admin: ['create','read','update','delete', 'superuser'],
  editor: ['create', 'read', 'update'],
  user: ['read'],
};

router.post('/roles', (req, res, next) => {
  let saved = [];
  Object.keys(capabilities).map(role => {
    let newRecord = new Role({type: role, capabilities: capabilities[role]});
    saved.push(newRecord.save());
    console.log(saved)
  });
  Promise.all(saved);
  console.log(saved)
  res.status(200).send('Roles Created');
})

router.get('/public');

router.get('/private', bearAuth, (req, res, next) => {
  res.send('OK');
}); 

router.get('/readonly', bearAuth, acl('read'), (req, res, next) => {
  res.send('OK');
}); 

router.get('/create', bearAuth, acl('create'), (req, res, next) => {
  res.send('OK');
});

router.post('/update', bearAuth, acl('update'), (req, res, next) => {
  res.send('OK');
}); 


router.patch('/delete', bearAuth, acl('delete'), (req, res, next) => {
  res.send('OK');
});

router.get('/everything', bearAuth, acl('superuser'), (req, res, next) => {
  res.send('OK');
});

module.exports = router;