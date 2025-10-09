const { Tyre, Brand, Type } = require('../models');

exports.getTyres = async (req, res) => {
  try {
    const tyres = await Tyre.findAll({
      include: [
        { model: Brand, attributes: ['name'] },
        { model: Type, attributes: ['name'] }
      ],
    });
    res.json(tyres);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.addTyre = async (req, res) => {
  try {
    const { tyre_number, brandId, typeId, model, size, quantity, price } = req.body;
    const tyre = await Tyre.create({ tyre_number, brandId, typeId, model, size, quantity, price });
    res.status(201).json(tyre);
  } catch (error) {
    res.status(400).json({ message: 'Error adding tyre', error });
  }
};

// @desc Update tyre
exports.updateTyre = async (req, res) => {
  try {
    const { id } = req.params;
    const { tyre_number, brandId, typeId, model, size, quantity, price } = req.body;

    const tyre = await Tyre.findByPk(id);
    if (!tyre) {
      return res.status(404).json({ message: 'Tyre not found' });
    }

    // Explicitly update only known fields (avoids accidental overwrites)
    await tyre.update({
      tyre_number,
      brandId,
      typeId,
      model,
      size,
      quantity,
      price
    });

    // Re-fetch with associations (optional)
    const updatedTyre = await Tyre.findByPk(id, {
      include: [
        { model: Brand, attributes: ['name'] },
        { model: Type, attributes: ['name'] },
      ],
    });

    res.json({ message: 'Tyre updated successfully', tyre: updatedTyre });
  } catch (error) {
    console.error('Update error:', error);
    res.status(400).json({ message: 'Error updating tyre', error: error.message });
  }
};

// @desc Delete tyre
exports.deleteTyre = async (req, res) => {
  try {
    const { id } = req.params;
    const tyre = await Tyre.findByPk(id);

    if (!tyre) {
      return res.status(404).json({ message: 'Tyre not found' });
    }

    await tyre.destroy();
    res.json({ message: 'Tyre deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Error deleting tyre', error: error.message });
  }
};

// Get all tubeless tyres
exports.getTubelessTyres = async (req, res) => {
  try {
    const tyres = await Tyre.findAll({
      where: { tubeless: true },
      include: [
        { model: Brand, attributes: ['name'] },
        { model: Type, attributes: ['name'] }
      ]
    });
    res.json(tyres);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all tube tyres
exports.getTubeTyres = async (req, res) => {
  try {
    const tyres = await Tyre.findAll({
      where: { tubeless: false },
      include: [
        { model: Brand, attributes: ['name'] },
        { model: Type, attributes: ['name'] }
      ]
    });
    res.json(tyres);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};