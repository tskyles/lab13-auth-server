'use strict';

const mongoose = require('mongoose');

const capabilities = {
  user: ['read'],
  editor: ['read', 'create', 'update'],
  admin: ['read', 'create', 'update', 'delete'],
};

const rolesSchema = new mongoose.Schema({
  role: {type: String, required: true},
  capabilities: {type: Array, required: true}
});

module.exports = mongoose.model('roles', rolesSchema);