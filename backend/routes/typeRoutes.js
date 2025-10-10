const express = require('express');
const router = express.Router();
const {
  getAllTypes,
  getTypenameById,
  addType,
  updateTypeById,
  deleteTypeById,
} = require('../controllers/typeController');

// CRUD routes
router.get('/', getAllTypes);
router.get('/:id', getTypenameById);
router.post('/', addType);
router.put('/:id', updateTypeById);
router.delete('/:id', deleteTypeById);

module.exports = router;