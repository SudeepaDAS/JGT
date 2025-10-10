const express = require('express');
const router = express.Router();
const {
  getBrands,
  getBrandname,
  addBrand,
  updateBrand,
  deleteBrand,
} = require('../controllers/brandController');

// CRUD routes
router.get('/', getBrands);
router.get('/:id', getBrandname);
router.post('/', addBrand);
router.put('/:id', updateBrand);
router.delete('/:id', deleteBrand);


module.exports = router;
