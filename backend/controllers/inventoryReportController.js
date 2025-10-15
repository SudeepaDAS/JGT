const { Tyre, Brand, Type } = require('../models');
const { Op } = require('sequelize');

exports.getInventoryReport = async (req, res) => {
  try {
    const {
      brandId,
      typeId,
      tubeless,
      minQty,
      maxQty,
      page = 1,
      pageSize = 10,
    } = req.query;

    const where = {};

    if (brandId) where.brandId = brandId;
    if (typeId) where.typeId = typeId;
    if (tubeless !== undefined && tubeless !== "") {
      where.tubeless = tubeless === "true";
    }

    if (minQty) where.quantity = { ...(where.quantity || {}), [Op.gte]: parseInt(minQty) };
    if (maxQty) where.quantity = { ...(where.quantity || {}), [Op.lte]: parseInt(maxQty) };

    // ---- Get total items count (for pagination) ----
    const totalItems = await Tyre.count({ where });

    // ---- Get full filtered data (for totals only) ----
    const allFilteredTyres = await Tyre.findAll({ where });
    const totalQty = allFilteredTyres.reduce((sum, t) => sum + (t.quantity || 0), 0);
    const totalValue = allFilteredTyres.reduce(
      (sum, t) => sum + (t.quantity * (t.price || 0)),
      0
    );

    // ---- Paginated data ----
    const tyres = await Tyre.findAll({
      where,
      include: [
        { model: Brand, attributes: ['name'] },
        { model: Type, attributes: ['name'] },
      ],
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize),
      order: [['id', 'ASC']],
    });

    const data = tyres.map((t) => ({
      id: t.id,
      tyreNumber: t.tyre_number,
      brand: t.Brand?.name || 'N/A',
      type: t.Type?.name || 'N/A',
      tubeless: t.tubeless,
      quantity: t.quantity,
      price: t.price,
      stockValue: t.quantity * t.price,
    }));

    res.json({
      success: true,
      data,
      totals: {
        totalQty,
        totalValue,
      },
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(totalItems / pageSize),
        totalItems,
      },
    });
  } catch (err) {
    console.error('Error in getInventoryReport:', err);
    res.status(500).json({
      success: false,
      message: 'Server error generating inventory report',
    });
  }
};
