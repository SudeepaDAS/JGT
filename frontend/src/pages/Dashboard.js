import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ENV from '../env';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  Legend
} from "recharts";

import { FaBox, FaDollarSign, FaUndo } from "react-icons/fa";

export default function Dashboard() {
  /* ---------------------- STATE DECLARATION ------------------------ */
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [tyreData, setTyreData] = useState([]);
  const [stats, setStats] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [brandStockData, setBrandStockData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [monthlyStockMovement, setMonthlyStockMovement] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brandSales, setBrandSales] = useState([]);
  const [typeSales, setTypeSales] = useState([]);

  const API = ENV.API_URL;

  /* ---------------------- API CALLS ------------------------ */

  const fetchTyres = async () => {
    try {
      const res = await axios.get(`${API}/tyres`);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBrandSales = async () => {
    try {
      const res = await axios.get(`${API}/dashboard/brand-sales`);
      setBrandSales(res.data);
    } catch (err) {
      console.error("Error fetching brand sales:", err);
    }
  };

  const fetchTypeSales = async () => {
    try {
      const res = await axios.get(`${API}/dashboard/type-sales`);
      setTypeSales(res.data);
    } catch (err) {
      console.error("Error fetching type sales:", err);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await axios.get(`${API}/brands`);
      setBrands(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTopTyres = async () => {
    try {
      const res = await axios.get(`${API}/dashboard/top-tyres?month=${selectedMonth}&year=${selectedYear}`);
      setTyreData(res.data);
    } catch (err) {
      console.error("Error fetching top tyres:", err);
    }
  };

  const fetchCardData = async () => {
    try {
      const res = await axios.get(`${API}/dashboard/carddata`);
      const data = res.data;
      
      setStats([
        {
          title: "Total Products",
          value: data.totalProducts || 0,
          color: "bg-purple-100",
          icon: <FaBox className="text-purple-600" size={24} />
        },
        {
          title: "Total Stock Value",
          value: `₹${data.totalStockValue || 0}`,
          color: "bg-blue-100",
          icon: <FaBox className="text-blue-600" size={24} />
        },
        {
          title: "Total Sales This Month",
          value: `₹${data.totalSalesThisMonth || 0}`,
          color: "bg-green-100",
          icon: <FaDollarSign className="text-green-600" size={24} />
        },
        {
          title: "Low Stock Items",
          value: data.lowStockCount || 0,
          color: "bg-red-100",
          icon: <FaUndo className="text-red-600" size={24} />
        },
      ]);
    } catch (err) {
      console.error("Error fetching card data:", err);
    }
  };

  const fetchLowStock = async () => {
    try {
      const res = await axios.get(`${API}/dashboard/low-stock`);
      setLowStockItems(res.data);
    } catch (err) {
      console.error("Error fetching low stock:", err);
    }
  };

  const fetchOutOfStock = async () => {
    try {
      const res = await axios.get(`${API}/dashboard/out-of-stock`);
      setOutOfStockItems(res.data);
    } catch (err) {
      console.error("Error fetching out of stock:", err);
    }
  };

  const fetchStockByBrand = async () => {
  try {
    const res = await axios.get(`${API}/dashboard/stock-by-brand`);
    const formattedData = res.data.map(item => ({
      name: item.Brand?.name || 'Unknown',
      value: parseInt(item.totalQuantity) || 0
    }));
    setBrandStockData(formattedData);
  } catch (err) {
    console.error("Error fetching stock by brand:", err);
  }
};

const fetchStockByCategory = async () => {
  try {
    const res = await axios.get(`${API}/dashboard/stock-by-category`);
    const formattedData = res.data.map(item => ({
      name: item.Type?.name || 'Unknown',
      qty: parseInt(item.totalQuantity) || 0
    }));
    setCategoryData(formattedData);
  } catch (err) {
    console.error("Error fetching stock by category:", err);
  }
};

  const fetchRecentAdded = async () => {
    try {
      const res = await axios.get(`${API}/dashboard/recent-added`);
      setRecentlyAdded(res.data.slice(0, 5)); // Limit to 5 items
    } catch (err) {
      console.error("Error fetching recent added:", err);
    }
  };

  const fetchMonthlyStockMovement = async () => {
    try {
      const res = await axios.get(`${API}/dashboard/monthly-stock-movement`);
      setMonthlyStockMovement(res.data);
    } catch (err) {
      console.error("Error fetching monthly stock movement:", err);
    }
  };

  /* ---------------------- USE EFFECTS ------------------------ */

  useEffect(() => {
    fetchTopTyres();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchTyres(),
          fetchBrandSales(),
          fetchBrands(),
          fetchCardData(),
          fetchTypeSales(),
          fetchLowStock(),
          fetchOutOfStock(),
          fetchStockByBrand(),
          fetchStockByCategory(),
          fetchRecentAdded(),
          fetchMonthlyStockMovement()
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  /* ---------------------- PAGINATIONS ------------------------ */

  const rowsPerPage = 5;
  const totalPagesProd = Math.ceil(products.length / rowsPerPage);
  const [currentPageProd, setCurrentPageProd] = useState(1);
  const displayedProductsPage = products.slice(
    (currentPageProd - 1) * rowsPerPage,
    currentPageProd * rowsPerPage
  );

  const productsPerPageBrand = 5;
  const totalPagesBrand = Math.ceil(brandSales.length / productsPerPageBrand);
  const [currentPageBrand, setCurrentPageBrand] = useState(1);
  const displayedBrands = brandSales.slice(
    (currentPageBrand - 1) * productsPerPageBrand,
    currentPageBrand * productsPerPageBrand
  );

  /* ---------------------- CHART COLORS ------------------------ */

  const COLORS = ["#162570", "#0088FE", "#FFBB28", "#00C49F", "#FF8042"];

  // Calculate earnings data from monthly stock movement
  const earningsData = monthlyStockMovement.length > 0 ? [
    { name: "Stock In", value: monthlyStockMovement.reduce((sum, item) => sum + (item.stock_in || 0), 0) },
    { name: "Stock Out", value: monthlyStockMovement.reduce((sum, item) => sum + (item.stock_out || 0), 0) }
  ] : [
    { name: "Stock In", value: 0 },
    { name: "Stock Out", value: 0 }
  ];
  
  const totalSalesAmount = typeSales.reduce((sum, item) => sum + item.value, 0);
  /* ---------------------- RENDER UI ------------------------ */

  if (loading) {
    return (
      <div className="bg-white min-h-screen text-gray-800 p-4 flex justify-center items-center">
        <div className="text-xl">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-gray-800 p-4 space-y-6 rounded-2xl">

      {/* ---------------------- TOP STATS ------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`rounded-xl p-5 flex justify-between items-center shadow-md ${s.color}`}
            >
              <div>
                <p className="text-gray-600 text-sm font-bold">{s.title}</p>
                <h3 className="text-2xl font-bold mt-1">{s.value}</h3>
              </div>
              <div className="bg-white p-3 rounded-full shadow">{s.icon}</div>
            </div>
          ))}
        </div>

        {/* Brands Table */}
        <div className="bg-white p-3 rounded-xl shadow-lg min-h-[320px]">
          <div className="flex justify-between mb-3">
            <h3 className="text-md font-bold">All Brands</h3>
            <Link to="/brands" className="text-blue-600 text-sm">Show More</Link>
          </div>

          <table className="w-full text-sm">
            <thead className="text-gray-500 border-b">
              <tr>
                <th className="py-2">#</th>
                <th>Brand</th>
                <th>Popularity</th>
                <th>Sold Qty</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {displayedBrands.map((b, index) => (
                <tr key={b.id} className="border-b">
                  <td className="py-2">{(currentPageBrand - 1) * productsPerPageBrand + index + 1}</td>
                  <td className="font-medium">{b.name}</td>
                  <td>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-[#162570] h-2.5 rounded-full"
                        style={{ width: `${b.popularity}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{Math.round(b.popularity)}%</span>
                  </td>
                  <td className="text-center font-semibold">{b.totalSold}</td>
                  <td className="text-green-600 font-semibold">₹{b.totalRevenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between mt-4 text-sm">
            <p>
              Showing {(currentPageBrand - 1) * productsPerPageBrand + 1} to{" "}
              {Math.min(currentPageBrand * productsPerPageBrand, brands.length)} of {brands.length}
            </p>

            <div className="flex gap-2">
              <button onClick={() => setCurrentPageBrand((p) => Math.max(p - 1, 1))}
                className="px-2 py-1 rounded bg-gray-100">Prev</button>

              <span>{currentPageBrand} / {totalPagesBrand}</span>

              <button onClick={() => setCurrentPageBrand((p) => Math.min(p + 1, totalPagesBrand))}
                className="px-2 py-1 rounded bg-gray-100">Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------- CHARTS ROW ------------------------ */}
      <div className="grid grid-cols-12 gap-4">
        
        {/* Product Analytics */}
        <div className="col-span-12 lg:col-span-12 bg-white p-4 rounded-xl shadow">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md font-bold">Product Analytics</h3>

            <div className="flex gap-2">
              <select value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="border px-3 py-1 rounded">
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={i + 1}>{new Date(0, i).toLocaleString("en", { month: "long" })}</option>
                ))}
              </select>

              <select value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="border px-3 py-1 rounded">
                {Array.from({ length: 6 }).map((_, i) => {
                  const year = 2023 + i;
                  return <option key={year}>{year}</option>;
                })}
              </select>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={tyreData}>
              <XAxis dataKey="tyrename" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="stock_out" stroke="#FFBB28" strokeWidth={2} />
              <Line type="monotone" dataKey="stock_in" stroke="#0088FE" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Earnings */}
        <div className="col-span-12 md:col-span-6 lg:col-span-6 bg-white p-2 rounded-xl shadow">
          <h3 className="text-md font-bold mb-3">Sales by Type</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie 
                data={typeSales} 
                dataKey="value" 
                nameKey="name" 
                innerRadius={45} 
                outerRadius={75}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {typeSales.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [
                  `₹${value.toLocaleString()}`,
                  `${name} Sales`
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center text-xl font-bold mt-2">
            Total: ₹{totalSalesAmount.toLocaleString()}
          </div>
          <div className="text-center text-sm text-gray-600 mt-1">
            {typeSales.length} Categories
          </div>
        </div>

        {/* Market Growth */}
        <div className="col-span-12 md:col-span-6 lg:col-span-6 bg-white p-2 rounded-xl shadow">
          <h3 className="text-md font-bold mb-3">Monthly Stock Movement</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyStockMovement}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="stock_in" fill="#162570" radius={[6, 6, 0, 0]} />
              <Bar dataKey="stock_out" fill="#0088FE" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---------------------- NEW SECTIONS GRID ------------------------ */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Low Stock Tyres */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-md font-bold mb-2">Low Stock Tyres</h3>
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="py-2 px-2 text-left">Tyre</th>
                <th>Brand</th>
                <th>Stock</th>
                <th>Min</th>
              </tr>
            </thead>
            <tbody>
              {lowStockItems.slice(0, 5).map((l, index) => (
                <tr key={l.id} className="border-b">
                  <td className="py-2">{l.tyre_number}</td>
                  <td>{l.Brand?.name}</td>
                  <td className="text-red-600 font-bold">{l.quantity}</td>
                  <td>10</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Out of Stock */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-md font-bold mb-2 text-red-600">Out of Stock</h3>
          <ul className="text-sm">
            {outOfStockItems.slice(0, 5).map((tyre, i) => (
              <li key={tyre.id} className="py-2 border-b">{tyre.tyre_number} - {tyre.Brand?.name}</li>
            ))}
          </ul>
        </div>

        {/* Brand Stock Pie */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-md font-bold mb-2">Stock by Brand</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie 
                data={brandStockData} 
                dataKey="value" 
                nameKey="name" 
                outerRadius={90}
                label
              >
                {brandStockData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-md font-bold mb-2">Tyre Categories</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="qty" fill="#162570" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recently Added Tyres */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-md font-bold mb-2">Recently Added Tyres</h3>
          <ul className="text-sm">
            {recentlyAdded.map((item, i) => (
              <li key={item.id} className="border-b py-2 flex justify-between">
                <span>{item.tyre_number} - {item.Brand?.name}</span>
                <span className="text-green-600 font-semibold">+{item.quantity}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-md font-bold mb-2">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "Add Tyre", link: "/add-tyre" },
              { name: "Add Stock", link: "/stock/add" },
              { name: "View Stock", link: "/products" },
              { name: "Reports", link: "/reports" }
            ].map((btn, i) => (
              <Link
                key={i}
                to={btn.link}
                className="p-3 bg-blue-100 text-blue-700 rounded-xl text-center font-semibold hover:bg-blue-200"
              >
                {btn.name}
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* ---------------------- PRODUCT LIST TABLE ------------------------ */}

      <div className="bg-white p-4 rounded-xl shadow">
        <div className="flex justify-between mb-3">
          <h3 className="text-md font-bold">All Products</h3>
          <Link to="/products" className="text-blue-600">Show More</Link>
        </div>

        <table className="min-w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">Tyre No.</th>
              <th className="px-4 py-3 text-left">Brand</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Tubeless</th>
            </tr>
          </thead>

          <tbody>
            {displayedProductsPage.map((p, idx) => (
              <tr key={p.id} className={`border-b ${idx % 2 === 0 ? 'bg-gray-50' : ''}`}>
                <td className="px-4 py-3">{p.tyre_number}</td>
                <td className="px-4 py-3">{p.Brand?.name}</td>
                <td className="px-4 py-3">{p.Type?.name}</td>
                <td className="px-4 py-3 text-green-600">₹{p.price}</td>
                <td className="px-4 py-3">{p.quantity}</td>
                <td className="px-4 py-3">{p.tubeless ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between mt-4 text-sm">
          <p>
            Showing {(currentPageProd - 1) * rowsPerPage + 1} to{" "}
            {Math.min(currentPageProd * rowsPerPage, products.length)} of {products.length}
          </p>

          <div className="flex gap-2">
            <button onClick={() => setCurrentPageProd((p) => Math.max(p - 1, 1))}
              className="px-2 py-1 bg-gray-100 rounded">Prev</button>

            <span>{currentPageProd} / {totalPagesProd}</span>

            <button onClick={() => setCurrentPageProd((p) => Math.min(p + 1, totalPagesProd))}
              className="px-2 py-1 bg-gray-100 rounded">Next</button>
          </div>
        </div>
      </div>

    </div>
  );
}