'use strict';

const express = require('express');
const accessRouter = express.Router();
const bearAuth = require('../auth/bearer-auth-middleware');
const acl = require('./acl-middleware');
const Role = require('../auth/roles-model');

const capabilities = {
  admin: ['create','read','update','delete', 'superuser'],
  editor: ['create', 'read', 'update'],
  user: ['read'],
};

accessRouter.post('/roles', (req, res, next) => {
  let saved = [];
  Object.keys(capabilities).map(role => {
    let newRecord = new Role({type: role, capabilities: capabilities[role]});
    saved.push(newRecord.save());
  });
  Promise.all(saved);
  res.send('Roles Created');
});

accessRouter.get('/public');

accessRouter.get('/private', bearAuth, (req, res, next) => {
  res.send('OK');
}); 

accessRouter.get('/readonly', bearAuth, acl('read'), (req, res, next) => {
  res.send('OK');
}); 

accessRouter.get('/create', bearAuth, acl('create'), (req, res, next) => {
  res.send('OK');
});

accessRouter.post('/update', bearAuth, acl('update'), (req, res, next) => {
  res.send('OK');
}); 

accessRouter.patch('/delete', bearAuth, acl('delete'), (req, res, next) => {
  res.send('OK');
});

accessRouter.get('/everything', bearAuth, acl('superuser'), (req, res, next) => {
  res.send('OK');
});

module.exports = accessRouter;