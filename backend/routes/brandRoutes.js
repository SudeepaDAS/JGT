const express = require('express');
const router = express.Router();
const { Brand } = require('../models');

router.get('/', async (req, res) => res.json(await Brand.findAll()));
router.post('/', async (req, res) => res.json(await Brand.create(req.body)));

module.exports = router;
