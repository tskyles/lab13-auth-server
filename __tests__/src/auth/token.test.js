'use strict';

const Users = require('../../../src/auth/users-model');

describe('JWT Token', () => {
  let token;

  const userObj = {
    username: 'Trevor',
    password: 'Testing token',
  };

  it('Should generate token', () => {
    token = new Users().generateToken(userObj);

    expect(token).toBeDefined();
  });
});