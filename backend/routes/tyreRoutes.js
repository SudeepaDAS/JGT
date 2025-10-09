const express = require('express');
const router = express.Router();
const {
  getTyres,
  addTyre,
  updateTyre,
  deleteTyre,
  getTubelessTyres,  // new
  getTubeTyres       // new
} = require('../controllers/tyreController');

// CRUD routes
router.get('/', getTyres);
router.post('/', addTyre);
router.put('/:id', updateTyre);
router.delete('/:id', deleteTyre);

// New routes
router.get('/tubeless', getTubelessTyres);
router.get('/tube', getTubeTyres);

module.exports = router;
