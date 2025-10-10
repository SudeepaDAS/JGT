const { Brand } = require('../models');

// ✅ Get all active brands
exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.findAll({
      where: { isActive: true }, // ✅ Only active ones
      order: [['id', 'ASC']],
    });
    res.json(brands);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
};

// ✅ Get brand by ID (only if active)
exports.getBrandname = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findOne({
      where: { id, isActive: true },
    });

    if (!brand) return res.status(404).json({ error: 'Brand not found or inactive' });
    res.json(brand);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch brand' });
  }
};

// ✅ Add a new brand
exports.addBrand = async (req, res) => {
  try {
    const { name } = req.body;
    const brand = await Brand.create({ name });
    res.status(201).json(brand);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add brand' });
  }
};

// ✅ Update a brand
exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const brand = await Brand.findByPk(id);
    if (!brand || !brand.isActive) {
      return res.status(404).json({ error: 'Brand not found or inactive' });
    }

    brand.name = name;
    await brand.save();
    res.json(brand);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update brand' });
  }
};

// ✅ Soft delete (set isActive = false)
exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findByPk(id);

    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    // Instead of deleting → deactivate
    brand.isActive = false;
    await brand.save();

    res.json({ message: 'Brand deactivated successfully (isActive set to false)' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to deactivate brand' });
  }
};