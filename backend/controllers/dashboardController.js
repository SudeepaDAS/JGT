const { 
  Tyre, 
  Brand, 
  Type, 
  PurchaseOrder, 
  PurchaseOrderItem, 
  SalesOrder, 
  SalesOrderItem 
} = require("../models");

const { Op, fn, col, literal } = require("sequelize");

// ==================================================
// 1️⃣ TOP TYRES (Stock movement ranking)
// ==================================================
exports.getTopTyres = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Please provide month and year" });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // ---- STOCK IN ----
    const stockInData = await PurchaseOrderItem.findAll({
      include: [
        {
          model: PurchaseOrder,
          attributes: [],
          where: { order_date: { [Op.between]: [startDate, endDate] } },
        },
        {
          model: Tyre,
          attributes: ["id", "tyre_number"],
        },
      ],
      attributes: [
        [col("Tyre.tyre_number"), "tyre_number"],
        [fn("SUM", col("PurchaseOrderItem.quantity")), "stock_in"],
      ],
      group: ["Tyre.id", "Tyre.tyre_number"],
    });

    // ---- STOCK OUT ----
    const stockOutData = await SalesOrderItem.findAll({
      include: [
        {
          model: SalesOrder,
          attributes: [],
          where: { order_date: { [Op.between]: [startDate, endDate] } },
        },
        {
          model: Tyre,
          attributes: ["id", "tyre_number"],
        },
      ],
      attributes: [
        [col("Tyre.tyre_number"), "tyre_number"],
        [fn("SUM", col("SalesOrderItem.quantity")), "stock_out"],
      ],
      group: ["Tyre.id", "Tyre.tyre_number"],
    });

    // ---- MERGE RESULTS ----
    const combined = {};

    stockInData.forEach((row) => {
      const tyre = row.get();
      combined[tyre.tyre_number] = {
        tyrename: tyre.tyre_number,
        stock_in: Number(tyre.stock_in) || 0,
        stock_out: 0,
      };
    });

    stockOutData.forEach((row) => {
      const tyre = row.get();
      if (!combined[tyre.tyre_number]) {
        combined[tyre.tyre_number] = {
          tyrename: tyre.tyre_number,
          stock_in: 0,
          stock_out: Number(tyre.stock_out) || 0,
        };
      } else {
        combined[tyre.tyre_number].stock_out = Number(tyre.stock_out) || 0;
      }
    });

    const finalData = Object.values(combined)
      .sort((a, b) => (b.stock_in + b.stock_out) - (a.stock_in + a.stock_out))
      .slice(0, 10);

    return res.json(finalData);
  } catch (err) {
    console.error("Error fetching top tyres:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ==================================================
// 2️⃣ SUMMARY CARD DATA
// ==================================================
exports.getCardData = async (req, res) => {
  try {
    // ============================
    // 1. TOTAL PRODUCTS & STOCK VALUE
    // ============================
    const productResult = await Tyre.findOne({
      attributes: [
        [fn("SUM", col("quantity")), "totalQuantity"],
        [fn("SUM", literal("quantity * price")), "totalStockValue"],
      ],
      where: { isActive: true },
      raw: true,
    });

    const totalProducts = Number(productResult?.totalQuantity) || 0;
    const totalStockValue = Number(productResult?.totalStockValue) || 0;

    // ============================
    // 2. TOTAL SALES THIS MONTH
    // ============================
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const salesResult = await SalesOrderItem.findOne({
      attributes: [
        [fn("SUM", literal("quantity * price")), "totalSalesThisMonth"],
      ],
      include: [
        {
          model: SalesOrder,
          attributes: [],
          where: {
            order_date: {
              [Op.between]: [startOfMonth, endOfMonth],
            },
          },
        },
      ],
      raw: true,
    });

    const totalSalesThisMonth =
      Number(salesResult?.totalSalesThisMonth) || 0;

    // ============================
    // 3. LOW STOCK COUNT (NEW)
    // ============================
    const LOW_STOCK_LIMIT = 10;

    const lowStockCount = await Tyre.count({
      where: {
        isActive: true,
        quantity: { [Op.lt]: LOW_STOCK_LIMIT },
      },
    });

    // ============================
    // 4. FINAL RESPONSE
    // ============================
    return res.json({
      totalProducts,
      totalStockValue,
      totalSalesThisMonth,
      lowStockCount,
    });

  } catch (err) {
    console.error("Dashboard Summary Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

// ==================================================
// 3️⃣ LOW STOCK
// ==================================================
exports.getLowStock = async (req, res) => {
  try {
    const lowStockItems = await Tyre.findAll({
      where: {
        quantity: { [Op.lt]: 10 },
        isActive: true,
      },
      attributes: ["id", "tyre_number", "brandId", "typeId", "quantity"],
      include: [
        { model: Brand, attributes: ["name"] },
        { model: Type, attributes: ["name"] },
      ],
    });

    res.json(lowStockItems);
  } catch (err) {
    console.error("Low Stock Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

// ==================================================
// 4️⃣ OUT OF STOCK
// ==================================================
exports.getOutOfStock = async (req, res) => {
  try {
    const outOfStock = await Tyre.findAll({
      where: { quantity: 0, isActive: true },
      attributes: ["id", "tyre_number", "brandId", "typeId", "quantity"],
      include: [
        { model: Brand, attributes: ["name"] },
        { model: Type, attributes: ["name"] },
      ],
    });

    res.json(outOfStock);
  } catch (err) {
    console.error("Out of Stock Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

// ==================================================
// 5️⃣ STOCK BY BRAND - FIXED
// ==================================================
exports.getStockByBrand = async (req, res) => {
  try {
    const data = await Tyre.findAll({
      attributes: [
        "brandId",
        [fn("COUNT", col("Tyre.id")), "totalTyres"], // Fixed: specify Tyre.id
        [fn("SUM", col("quantity")), "totalQuantity"],
      ],
      where: { isActive: true },
      group: ["brandId", "Brand.id"], // Added Brand.id to GROUP BY
      include: [{ model: Brand, attributes: ["id", "name"] }],
      raw: true,
    });

    // Format the response
    const formattedData = data.map(item => ({
      brandId: item.brandId,
      totalTyres: parseInt(item.totalTyres) || 0,
      totalQuantity: parseInt(item.totalQuantity) || 0,
      Brand: {
        id: item["Brand.id"],
        name: item["Brand.name"]
      }
    }));

    res.json(formattedData);
  } catch (err) {
    console.error("Stock By Brand Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

// ==================================================
// 6️⃣ STOCK BY TYPE - FIXED
// ==================================================
exports.getStockByType = async (req, res) => {
  try {
    const data = await Tyre.findAll({
      attributes: [
        "typeId",
        [fn("COUNT", col("Tyre.id")), "totalTyres"], // Fixed: specify Tyre.id
        [fn("SUM", col("quantity")), "totalQuantity"],
      ],
      where: { isActive: true },
      group: ["typeId", "Type.id"], // Added Type.id to GROUP BY
      include: [{ model: Type, attributes: ["id", "name"] }],
      raw: true,
    });

    // Format the response
    const formattedData = data.map(item => ({
      typeId: item.typeId,
      totalTyres: parseInt(item.totalTyres) || 0,
      totalQuantity: parseInt(item.totalQuantity) || 0,
      Type: {
        id: item["Type.id"],
        name: item["Type.name"]
      }
    }));

    res.json(formattedData);
  } catch (err) {
    console.error("Stock By Type Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

// ==================================================
// 7️⃣ RECENT ADDED TYRES
// ==================================================
exports.getRecentAdded = async (req, res) => {
  try {
    const recent = await Tyre.findAll({
      where: { isActive: true },
      order: [["createdAt", "DESC"]],
      limit: 10,
      attributes: ["id", "tyre_number", "quantity", "price", "createdAt"],
      include: [
        { model: Brand, attributes: ["name"] },
        { model: Type, attributes: ["name"] },
      ],
    });

    res.json(recent);
  } catch (err) {
    console.error("Recent Added Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

// ==================================================
// 8️⃣ RECENT SALES
// ==================================================
exports.getRecentSales = async (req, res) => {
  try {
    const recentSales = await SalesOrderItem.findAll({
      order: [["createdAt", "DESC"]],
      limit: 10,
      attributes: ["id", "quantity", "price", "createdAt"],
      include: [
        { model: Tyre, attributes: ["tyre_number"] },
        { model: SalesOrder, attributes: ["customer_name", "order_date"] },
      ],
    });

    res.json(recentSales);
  } catch (err) {
    console.error("Recent Sales Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

// ==================================================
// 9️⃣ MONTHLY STOCK MOVEMENT (Last 6 Months) - FIXED
// ==================================================
exports.getMonthlyStockMovement = async (req, res) => {
  try {
    const months = [];
    const now = new Date();

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString("default", { month: "short" }),
        year: d.getFullYear(),
        month: d.getMonth() + 1,
      });
    }

    const results = [];

    for (const m of months) {
      const start = new Date(m.year, m.month - 1, 1);
      const end = new Date(m.year, m.month, 0, 23, 59, 59);

      // FIXED: Use raw query or specify only the needed attributes
      const stockIn = await PurchaseOrderItem.sum("quantity", {
        include: [
          { 
            model: PurchaseOrder, 
            attributes: [], // Empty attributes to avoid GROUP BY issues
            where: { 
              order_date: { 
                [Op.between]: [start, end] 
              } 
            } 
          },
        ],
        raw: true // Add raw to avoid Sequelize trying to include all attributes
      });

      const stockOut = await SalesOrderItem.sum("quantity", {
        include: [
          { 
            model: SalesOrder, 
            attributes: [], // Empty attributes to avoid GROUP BY issues
            where: { 
              order_date: { 
                [Op.between]: [start, end] 
              } 
            } 
          },
        ],
        raw: true // Add raw to avoid Sequelize trying to include all attributes
      });

      results.push({
        month: m.label,
        stock_in: stockIn || 0,
        stock_out: stockOut || 0,
      });
    }

    res.json(results);
  } catch (err) {
    console.error("Monthly Stock Movement Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

// ==================================================
// 🔟 BRAND SALES DATA - ALL TIME (NO FILTERS)
// ==================================================
exports.getBrandSales = async (req, res) => {
  try {
    // Simple raw query for all-time sales data
    const brandSalesQuery = `
      SELECT 
        b.id as "brandId",
        b.name as "brandName",
        COALESCE(SUM(soi.quantity), 0) as "totalSold",
        COALESCE(SUM(soi.quantity * soi.price), 0) as "totalRevenue"
      FROM "Brands" b
      LEFT JOIN "Tyres" t ON b.id = t."brandId"
      LEFT JOIN "SalesOrderItems" soi ON t.id = soi."tyreId"
      WHERE b."isActive" = true
      GROUP BY b.id, b.name
      ORDER BY "totalRevenue" DESC
    `;

    const brandSales = await Brand.sequelize.query(brandSalesQuery, {
      type: Brand.sequelize.QueryTypes.SELECT
    });

    // Calculate popularity based on sales (normalize to 0-100 scale)
    const maxSold = Math.max(...brandSales.map(item => item.totalSold));
    const formattedData = brandSales.map(item => ({
      id: item.brandId,
      name: item.brandName,
      totalSold: parseInt(item.totalSold) || 0,
      totalRevenue: parseFloat(item.totalRevenue) || 0,
      popularity: maxSold > 0 ? Math.round((item.totalSold / maxSold) * 100) : 0
    }));

    res.json(formattedData);
  } catch (err) {
    console.error("Brand Sales Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

// ==================================================
// 11 TYPE SALES DATA - SIMPLE VERSION
// ==================================================
exports.getTypeSales = async (req, res) => {
  try {
    // Get all active types
    const allTypes = await Type.findAll({
      where: { isActive: true },
      attributes: ['id', 'name'],
      raw: true
    });

    const typeSalesData = [];

    for (const type of allTypes) {
      // Get sales data for this type
      const salesQuery = `
        SELECT 
          COALESCE(SUM(soi.quantity), 0) as total_sold,
          COALESCE(SUM(soi.quantity * soi.price), 0) as total_revenue
        FROM "SalesOrderItems" soi
        INNER JOIN "Tyres" t ON soi."tyreId" = t.id
        WHERE t."typeId" = ${type.id}
      `;

      const salesResult = await Type.sequelize.query(salesQuery, {
        type: Type.sequelize.QueryTypes.SELECT
      });

      const salesData = salesResult[0];
      
      typeSalesData.push({
        name: type.name,
        value: parseFloat(salesData?.total_revenue) || 0,
        totalSold: parseInt(salesData?.total_sold) || 0
      });
    }

    // Filter out types with zero sales for better visualization
    const filteredData = typeSalesData.filter(item => item.value > 0);

    res.json(filteredData);
  } catch (err) {
    console.error("Type Sales Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
};