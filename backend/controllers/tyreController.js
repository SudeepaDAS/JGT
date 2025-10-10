const { Tyre, Brand, Type } = require('../models');

// ✅ Get all active tyres
exports.getTyres = async (req, res) => {
  try {
    const tyres = await Tyre.findAll({
      where: { isActive: true }, // ✅ Only active tyres
      include: [
        { model: Brand, attributes: ['name'] },
        { model: Type, attributes: ['name'] },
      ],
    });
    res.json(tyres);
  } catch (error) {
    console.error('Get Tyres error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// ✅ Add tyre
exports.addTyre = async (req, res) => {
  try {
    const { tyre_number, brandId, typeId, model, size, quantity, price, tubeless } = req.body;
    const tyre = await Tyre.create({ tyre_number, brandId, typeId, model, size, quantity, price, tubeless });
    res.status(201).json(tyre);
  } catch (error) {
    console.error('Add Tyre error:', error);
    res.status(400).json({ message: 'Error adding tyre', error });
  }
};

// ✅ Update tyre
exports.updateTyre = async (req, res) => {
  try {
    const { id } = req.params;
    const { tyre_number, brandId, typeId, model, size, quantity, price, tubeless } = req.body;

    const tyre = await Tyre.findByPk(id);
    if (!tyre) return res.status(404).json({ message: 'Tyre not found' });

    await tyre.update({ tyre_number, brandId, typeId, model, size, quantity, price, tubeless });

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

// ✅ Soft Delete (Deactivate tyre)
exports.deleteTyre = async (req, res) => {
  try {
    const { id } = req.params;
    const tyre = await Tyre.findByPk(id);

    if (!tyre) return res.status(404).json({ message: 'Tyre not found' });

    tyre.isActive = false; // ✅ deactivate instead of delete
    await tyre.save();

    res.json({ message: 'Tyre deactivated successfully (isActive set to false)' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Error deactivating tyre', error: error.message });
  }
};

// ✅ Get only active tubeless tyres
exports.getTubelessTyres = async (req, res) => {
  try {
    const tyres = await Tyre.findAll({
      where: { tubeless: true, isActive: true }, // ✅ only active
      include: [
        { model: Brand, attributes: ['name'] },
        { model: Type, attributes: ['name'] },
      ],
    });
    res.json(tyres);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Get only active tube tyres
exports.getTubeTyres = async (req, res) => {
  try {
    const tyres = await Tyre.findAll({
      where: { tubeless: false, isActive: true }, // ✅ only active
      include: [
        { model: Brand, attributes: ['name'] },
        { model: Type, attributes: ['name'] },
      ],
    });
    res.json(tyres);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};