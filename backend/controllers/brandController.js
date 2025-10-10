const { Brand } = require('../models');

// Get all brands
exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.findAll();
    res.json(brands);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
};

//Get brand by ID
exports.getBrandname = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findByPk(id);
    if (!brand) return res.status(404).json({ error: 'Brand not found' });
    res.json(brand);
    } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch brand' });
  }
};

// Add a new brand
exports.addBrand = async (req, res) => {
  try {
    const { name } = req.body;
    const brand = await Brand.create({ name });
    res.json(brand);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add brand' });
  }
};

// Update a brand
exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const brand = await Brand.findByPk(id);
    if (!brand) return res.status(404).json({ error: 'Brand not found' });

    brand.name = name;
    await brand.save();

    res.json(brand);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update brand' });
  }
};

// Delete a brand
exports.deleteBrand = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10); // convert to integer
    const deleted = await Brand.destroy({ where: { id } });

    if (deleted) {
      res.json({ message: 'Brand deleted successfully' });
    } else {
      res.status(404).json({ error: 'Brand not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete brand' });
  }
};

// Update a brand
exports.updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const brand = await Brand.findByPk(id);
        if (!brand) return res.status(404).json({ error: 'Brand not found' });
        brand.name = name;
        await brand.save();
        res.json(brand);
    } catch (err) {
        console.error(err);
    res.status(500).json({ error: 'Failed to update brand' });
  }
};
