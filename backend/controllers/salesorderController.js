const { SalesOrder, SalesOrderItem, Tyre, sequelize } = require('../models');

// GET all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await SalesOrder.findAll({
      include: [
        {
          model: SalesOrderItem,
          include: [{ model: Tyre, attributes: ['tyre_number'] }],
        },
      ],
      order: [['order_date', 'DESC']],
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// GET single order by ID
exports.getOrderById = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await SalesOrder.findByPk(orderId, {
      include: [
        {
          model: SalesOrderItem,
          include: [{ model: Tyre, attributes: ['tyre_number', 'price', 'tubeless'] }],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE order
exports.createOrder = async (req, res) => {
  const { customer_name, contact_number, status, items } = req.body;
  const t = await sequelize.transaction();

  try {
    const order_number = 'ORD' + Date.now();
    let total_amount = 0;

    // Calculate total (no stock deduction if Pending)
    for (let i of items) {
      const tyre = await Tyre.findByPk(i.tyreId, { transaction: t });
      if (!tyre) throw new Error(`Tyre ID ${i.tyreId} not found`);

      if (status === 'Completed') {
        if (tyre.quantity < i.quantity) throw new Error(`Not enough stock for tyre ${tyre.tyre_number}`);
        tyre.quantity -= i.quantity;
        await tyre.save({ transaction: t });
      }

      total_amount += i.price * i.quantity;
    }

    // Create order
    const order = await SalesOrder.create(
      { customer_name, contact_number, status, total_amount, order_number },
      { transaction: t }
    );

    // Create order items (stock already deducted above if Completed)
    for (let i of items) {
      await SalesOrderItem.create(
        {
          orderId: order.id,
          tyreId: i.tyreId,
          quantity: i.quantity,
          price: i.price,
          total_price: i.price * i.quantity,
        },
        { transaction: t }
      );
    }

    await t.commit();
    res.status(201).json(order);
  } catch (err) {
    await t.rollback();
    res.status(400).json({ error: err.message });
  }
};

// UPDATE order
exports.updateOrder = async (req, res) => {
  const { orderId } = req.params;
  const { customer_name, contact_number, status, items } = req.body;
  const t = await sequelize.transaction();

  try {
    const order = await SalesOrder.findByPk(orderId, { include: [SalesOrderItem], transaction: t });
    if (!order) throw new Error('Order not found');

    const oldStatus = order.status;

    // Map old items by tyreId for easy lookup
    const oldItemsMap = {};
    for (let oldItem of order.SalesOrderItems) {
      oldItemsMap[oldItem.tyreId] = oldItem.quantity;
    }

    // Delete previous order items
    await SalesOrderItem.destroy({ where: { orderId: order.id }, transaction: t });

    let total_amount = 0;

    if (status === 'Completed') {
      for (let i of items) {
        const tyre = await Tyre.findByPk(i.tyreId, { transaction: t });
        if (!tyre) throw new Error(`Tyre ID ${i.tyreId} not found`);

        const oldQty = oldItemsMap[i.tyreId] || 0;
        let diff = i.quantity - oldQty;

        // If previous status was Pending/Cancelled, deduct full quantity
        if (oldStatus === 'Pending' || oldStatus === 'Cancelled') {
          diff = i.quantity;
        }

        if (diff > 0 && tyre.quantity < diff) {
          throw new Error(`Not enough stock for tyre ${tyre.tyre_number}`);
        }

        tyre.quantity -= diff; // if diff negative, this adds back
        await tyre.save({ transaction: t });

        total_amount += i.price * i.quantity;

        await SalesOrderItem.create(
          {
            orderId: order.id,
            tyreId: i.tyreId,
            quantity: i.quantity,
            price: i.price,
            total_price: i.price * i.quantity,
          },
          { transaction: t }
        );
      }
    } else if (status === 'Cancelled') {
      // Restore all old stock
      for (let oldItem of order.SalesOrderItems) {
        const tyre = await Tyre.findByPk(oldItem.tyreId, { transaction: t });
        tyre.quantity += oldItem.quantity;
        await tyre.save({ transaction: t });
      }

      // Create new order items without touching stock
      for (let i of items) {
        total_amount += i.price * i.quantity;
        await SalesOrderItem.create(
          {
            orderId: order.id,
            tyreId: i.tyreId,
            quantity: i.quantity,
            price: i.price,
            total_price: i.price * i.quantity,
          },
          { transaction: t }
        );
      }
    } else if (status === 'Pending') {
      // Just create items, stock unchanged
      for (let i of items) {
        total_amount += i.price * i.quantity;
        await SalesOrderItem.create(
          {
            orderId: order.id,
            tyreId: i.tyreId,
            quantity: i.quantity,
            price: i.price,
            total_price: i.price * i.quantity,
          },
          { transaction: t }
        );
      }
    }

    // Update order info
    order.customer_name = customer_name;
    order.contact_number = contact_number;
    order.status = status;
    order.total_amount = total_amount;
    await order.save({ transaction: t });

    await t.commit();
    res.json(order);
  } catch (err) {
    await t.rollback();
    res.status(400).json({ error: err.message });
  }
};


// DELETE order
exports.deleteOrder = async (req, res) => {
  const { orderId } = req.params;
  const t = await sequelize.transaction();

  try {
    const order = await SalesOrder.findByPk(orderId, { include: [SalesOrderItem], transaction: t });
    if (!order) throw new Error('Order not found');

    // Restore stock
    for (let item of order.SalesOrderItems) {
      const tyre = await Tyre.findByPk(item.tyreId, { transaction: t });
      tyre.quantity += item.quantity;
      await tyre.save({ transaction: t });
    }

    await SalesOrder.destroy({ where: { id: orderId }, transaction: t });
    await t.commit();

    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    await t.rollback();
    res.status(400).json({ error: err.message });
  }
};
