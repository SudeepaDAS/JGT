const express = require('express');
const router = express.Router();
const { Type } = require('../models');

router.get('/', async (req, res) => res.json(await Type.findAll()));
router.post('/', async (req, res) => res.json(await Type.create(req.body)));

module.exports = router;
