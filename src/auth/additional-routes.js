'use strict';

const express = require('express');
const router = express.Router();
const bearAuth = require('../auth/bearer-auth-middleware');

router.get('/public');
router.get('/private'); 
router.get('/readonly'); 
router.get('/create'); 
router.put('/update'); 
router.patch('/delete'); 
router.get('/everything');

module.exports = router;