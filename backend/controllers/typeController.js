// controllers/typeController.js
const { Type } = require('../models');

// Get all types
exports.getAllTypes = async (req, res) => {
  try {
    const types = await Type.findAll({
      where: { isActive: true }, // ✅ only fetch active records
      order: [['id', 'ASC']], // optional: keep results ordered
    });

    res.json(types);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch active types' });
  }
};


// Get type by ID
exports.getTypenameById = async (req, res) => {
  try {
    const { id } = req.params;
    const type = await Type.findByPk(id);

    if (!type) return res.status(404).json({ error: 'Type not found' });

    res.json(type);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch type' });
  }
};

// Add new type
exports.addType = async (req, res) => {
  try {
    const { name, isActive } = req.body;
    const newType = await Type.create({
      name,
      isActive: isActive ?? true,
    });
    res.status(201).json(newType);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add type' });
  }
};

// Update type by ID
exports.updateTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    const type = await Type.findByPk(id);
    if (!type) return res.status(404).json({ error: 'Type not found' });

    if (name !== undefined) type.name = name;
    if (isActive !== undefined) type.isActive = isActive;

    await type.save();
    res.json(type);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update type' });
  }
};

// Delete type by ID (hard delete)
exports.deleteTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const type = await Type.findByPk(id);

    if (!type) {
      return res.status(404).json({ error: 'Type not found' });
    }

    // Instead of deleting, mark as inactive
    type.isActive = false;
    await type.save();

    res.json({ message: 'Type deactivated successfully (isActive set to false)' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to deactivate type' });
  }
};