/* eslint-disable no-unused-vars */
'use strict';

process.env.SECRET='yourpasswordisplaintext';

const jwt = require('jsonwebtoken');

const server = require('../../../src/app.js').server;
const supergoose = require('../../supergoose.js');

const mockRequest = supergoose.server(server);

let users = {
  admin: {username: 'admin', password: 'password', role: 'admin'},
  editor: {username: 'editor', password: 'password', role: 'editor'},
  user: {username: 'user', password: 'password', role: 'user'},
};

beforeAll(supergoose.startDB);
afterAll(supergoose.stopDB);

describe('Auth Router', () => {

  Object.keys(users).forEach( userType => {

    describe(`${userType} users`, () => {

      let id;

      it('Can create user', () => {
        return mockRequest.post('/signup')
          .send(users[userType])
          .then(results => {
            var token = jwt.verify(results.text, process.env.SECRET);
            id = token.id;
            expect(token.id).toEqual(id);
          });
      });

      it('Can authenticate user on signin', () => {
        return mockRequest.post('/signin')
          .auth(users[userType].username, users[userType].password)
          .then(results => {
            var token = jwt.verify(results.text, process.env.SECRET);
            expect(token.id).toEqual(id);
          });
      });
    });
  });

  it('/users returns all users', () => {
    return mockRequest.get('/users')
      .then(data => {
        console.log(data.body)
        expect(data.body.count).toEqual(3);
      });
  });

  it('Returns invalid login when wrong header', () => {
    return mockRequest.post('/signin')
      .auth({name: 5, password: 6})
      .then(results => {
        expect(results.status).toEqual(500);
      });
  });
});