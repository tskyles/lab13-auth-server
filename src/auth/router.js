'use strict';

const express = require('express');
const authRouter = express.Router();

const User = require('./users-model.js');
const auth = require('./middleware.js');
const oauth = require('./oauth/github.js');
const bearerAuth = require('./bearer-auth-middleware');

authRouter.post('/signup', (req, res, next) => {
  let user = new User(req.body);
  user.save()
    .then( (user) => {
      req.token = user.generateToken();
      req.user = user;
      res.set('token', req.token);
      res.cookie('auth', req.token);
      res.send(req.token);
    }).catch(next);
});

authRouter.post('/signin', auth, (req, res, next) => {
  res.cookie('auth', req.token);
  res.send(req.token);
});

authRouter.get('/user', bearerAuth, (req, res) => {
  console.log(req.user)
  res.json(req.user);
});

authRouter.get('/oauth', oauth, (req, res) => {
  res.send(req.token);
});

module.exports = authRouter;
