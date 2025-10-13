const { PurchaseOrder, PurchaseOrderItem, Tyre, Brand } = require('../models');

// --- CREATE PURCHASE ORDER ---
exports.createPurchaseOrder = async (req, res) => {
  const { brand_id, order_number, status = 'Pending', items } = req.body;

  if (!brand_id || !order_number || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'brand_id, order_number, and items are required' });
  }

  const t = await PurchaseOrder.sequelize.transaction();

  try {
    let totalAmount = 0;

    // Step 1: Create PO
    const po = await PurchaseOrder.create(
      {
        brand_id,
        order_number,
        total_amount: 0,
        status,
      },
      { transaction: t }
    );

    // Step 2: Process Items
    for (const item of items) {
      const { tyre_id, tyre_name, qty, import_price, typeId, tubeless } = item;

      if (
        qty == null ||
        import_price == null ||
        !typeId ||
        !tyre_name ||
        typeof qty !== 'number' ||
        typeof import_price !== 'number'
      ) {
        throw new Error('Each item must have valid qty (number), import_price (number), typeId, and tyre_name');
      }

      let tyreId = tyre_id;
      let tyre;

      if (!tyreId) {
        // Try to find existing tyre
        tyre = await Tyre.findOne({
          where: {
            tyre_number: tyre_name,
            brandId: brand_id,
          },
          transaction: t,
        });

        if (!tyre) {
          // Create new tyre
          tyre = await Tyre.create(
            {
              tyre_number: tyre_name,
              brandId: brand_id,
              typeId,
              quantity: status === 'Completed' ? qty : 0,
              price: import_price,
              tubeless: tubeless ?? true,
            },
            { transaction: t }
          );
        } else {
          if (status === 'Completed') {
            await tyre.increment('quantity', { by: qty, transaction: t });
            // ✅ Update price when PO is marked Completed
            if (parseFloat(tyre.price) !== parseFloat(item.import_price)) {
              await tyre.update({ price: item.import_price }, { transaction: t });
            }
          }
        }

        tyreId = tyre.id;
      } else {
        // If tyre_id is provided
        tyre = await Tyre.findByPk(tyreId, { transaction: t });

        if (!tyre) {
          throw new Error(`Tyre with ID ${tyreId} not found`);
        }

        // Update price or tubeless if changed
        const tyreUpdates = {};
        if (Number(tyre.price) !== Number(import_price)) tyreUpdates.price = import_price;
        if (tyre.tubeless !== tubeless) tyreUpdates.tubeless = tubeless;

        if (Object.keys(tyreUpdates).length > 0) {
          await tyre.update(tyreUpdates, { transaction: t });
        }

        // If PO is completed, increase stock
        if (status === 'Completed') {
          await tyre.increment('quantity', { by: qty, transaction: t });
        }
      }

      const total = parseFloat(qty) * parseFloat(import_price);
      totalAmount += total;

      // Step 3: Create PO Item
      await PurchaseOrderItem.create(
        {
          purchase_order_id: po.id,
          tyre_id: tyreId,
          quantity: qty,
          price: import_price,
          total,
        },
        { transaction: t }
      );
    }

    // Step 4: Update total on PO
    await po.update({ total_amount: totalAmount }, { transaction: t });

    await t.commit();
    return res.status(201).json({
      message: 'Purchase Order created successfully',
      purchaseOrder: po,
    });
  } catch (err) {
    await t.rollback();
    console.error('Error creating purchase order:', err);
    return res.status(500).json({ error: err.message || 'Failed to create Purchase Order' });
  }
};

// --- UPDATE PURCHASE ORDER ---
exports.updatePurchaseOrder = async (req, res) => {
  const { id } = req.params;
  const { brand_id, order_number, status, items } = req.body;

  const t = await PurchaseOrder.sequelize.transaction();

  try {
    const po = await PurchaseOrder.findByPk(id, {
      include: [PurchaseOrderItem],
      transaction: t,
    });

    if (!po) return res.status(404).json({ error: 'Purchase Order not found' });

    const oldStatus = po.status;

    // Step 1: Update basic PO fields if needed
    const updateData = {};
    if (brand_id) updateData.brand_id = brand_id;
    if (order_number) updateData.order_number = order_number;
    if (status && status !== po.status) updateData.status = status;

    await po.update(updateData, { transaction: t });

    const newStatus = po.status;
    const statusChangedToCompleted = oldStatus !== 'Completed' && newStatus === 'Completed';

    // Step 2: Handle deleted items and adjust tyre stock only on transition to Completed
    const existingItemsMap = {};
    for (const existingItem of po.PurchaseOrderItems) {
      existingItemsMap[existingItem.id] = existingItem;
    }

    const existingItemIds = po.PurchaseOrderItems.map(i => i.id);
    const updatedItemIds = items.map(i => i.id).filter(Boolean);
    const removedIds = existingItemIds.filter(id => !updatedItemIds.includes(id));

    

    if (removedIds.length > 0) {
      await PurchaseOrderItem.destroy({ where: { id: removedIds }, transaction: t });
    }

    // Step 3: Process new and updated items and update tyre stock only on status change to Completed
    let totalAmount = 0;

    for (const item of items) {
      if (item.qty == null || item.import_price == null || item.typeId == null) {
        throw new Error('Each item must have qty, import_price, and typeId');
      }

      let tyreId = item.tyre_id;
      const typeId = item.typeId;

      // Find or create tyre
      if (!tyreId && item.tyre_name) {
        let existingTyre = await Tyre.findOne({
          where: { tyre_number: item.tyre_name, brandId: po.brand_id },
          transaction: t,
        });

        if (existingTyre) {
          tyreId = existingTyre.id;
        } else {
          const newTyre = await Tyre.create(
            {
              tyre_number: item.tyre_name,
              brandId: po.brand_id,
              typeId,
              quantity: statusChangedToCompleted ? item.qty : 0,
              price: item.import_price,
              tubeless: item.tubeless ?? true,
            },
            { transaction: t }
          );
          tyreId = newTyre.id;
        }
      }

      const subtotal = parseFloat(item.qty) * parseFloat(item.import_price);
      totalAmount += subtotal;

      if (statusChangedToCompleted) {
        const tyre = await Tyre.findByPk(tyreId, { transaction: t });

        if (tyre) {
          const newQty = parseFloat(item.qty);
          const oldQty =
            item.id && existingItemsMap[item.id]
              ? parseFloat(existingItemsMap[item.id].quantity || 0)
              : 0;

          const qtyDiff = newQty - oldQty;

          if (qtyDiff !== 0) {
            const updatedTyreQty = parseFloat(tyre.quantity || 0) + qtyDiff;
            await tyre.update({ quantity: updatedTyreQty }, { transaction: t });
          }
          // ✅ Update price when PO is marked Completed
          if (parseFloat(tyre.price) !== parseFloat(item.import_price)) {
            await tyre.update({ price: item.import_price }, { transaction: t });
          }
        }
      }

      if (item.id) {
        await PurchaseOrderItem.update(
          {
            quantity: item.qty,
            price: item.import_price,
            subtotal,
            typeId,
            tyre_id: tyreId,
          },
          { where: { id: item.id }, transaction: t }
        );
      } else {
        await PurchaseOrderItem.create(
          {
            purchase_order_id: po.id,
            tyre_id: tyreId,
            tyre_name: item.tyre_name || null,
            typeId,
            quantity: item.qty,
            price: item.import_price,
            subtotal,
          },
          { transaction: t }
        );
      }
    }

    await po.update({ total_amount: totalAmount }, { transaction: t });

    await t.commit();
    res.json({ message: 'Purchase Order updated successfully', po });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to update Purchase Order' });
  }
};


// --- GET ALL PURCHASE ORDERS ---
exports.getAllPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.findAll({
      include: [{ model: PurchaseOrderItem, include: [Tyre] }, Brand],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch Purchase Orders' });
  }
};


// --- GET TYRES BY BRAND ---
exports.getTyresByBrand = async (req, res) => {
  try {
    const brandId = req.params.brandId;
    const tyres = await Tyre.findAll({
      where: { brandId },
      attributes: ['id', 'tyre_number', 'tubeless', 'typeId'],
    });
    res.json(tyres);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tyres' });
  }
};
