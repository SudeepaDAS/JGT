import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ENV from '../env';
import { LineChart, Line, XAxis, YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
} from "recharts";
import { FaUsers, FaBox, FaDollarSign, FaUndo } from "react-icons/fa";

export default function Dashboard() {
  const stats = [
  {
    title: "Total Products",
    value: 200,
    change: "", // Optional: Add change % if you track historical data
    color: "bg-purple-100",
    icon: <FaBox className="text-purple-600" size={24} />,
  },
  {
    title: "Total Stock Value",
    value: `₹280028`,
    change: "",
    color: "bg-blue-100",
    icon: <FaBox className="text-blue-600" size={24} />,
  },
  {
    title: "Total Sales This Month",
    value: `₹101110`,
    change: "",
    color: "bg-green-100",
    icon: <FaDollarSign className="text-green-600" size={24} />,
  },
  {
    title: "Low Stock Items",
    value: 10,
    change: "",
    color: "bg-red-100",
    icon: <FaUndo className="text-red-600" size={24} />,
  },
];

  const ordersData = [
    { tyrename: "TYR-0001", stock_in: 20, stock_out: 25 },
    { tyrename: "TYR-0002", stock_in: 30, stock_out: 40 },
    { tyrename: "TYR-0003", stock_in: 60, stock_out: 55 },
    { tyrename: "TYR-0004", stock_in: 50, stock_out: 65 },
    { tyrename: "TYR-0005", stock_in: 70, stock_out: 60 },    
  ];

  const earningsData = [
    { name: "Offline", value: 200 },
    { name: "Online", value: 150 },
    { name: "Trade", value: 100 },
  ];
  const COLORS = ["#FFBB28", "#0088FE", "#FF8042"];

  const growthData = [
    { year: "2017", sales: 15 },
    { year: "2018", sales: 25 },
    { year: "2019", sales: 35 },
    { year: "2020", sales: 45 },
    { year: "2021", sales: 32 },
    { year: "2022", sales: 38 },
    { year: "2023", sales: 50 },
  ];

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [currentPageProd, setCurrentPageProd] = useState(1);
  const rowsPerPage = 5;
  const API = ENV.API_URL;
  const fetchTyres = async () => {
    try {
      const res = await axios.get(`${API}/tyres`);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
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

  useEffect(() => {
    fetchTyres();
    fetchBrands();
  }, []);
  const totalPagesProd = Math.ceil(products.length / rowsPerPage);

  const displayedProductsPage = products.slice(
    (currentPageProd - 1) * rowsPerPage,
    currentPageProd * rowsPerPage
  );
  const [currentPageBrand, setCurrentPageBrand] = useState(1);
  const productsPerPageBrand = 5;
  const totalPages = Math.ceil(brands.length / productsPerPageBrand);
  const displayedBrands = brands.slice(
    (currentPageBrand - 1) * productsPerPageBrand,
    currentPageBrand * productsPerPageBrand
  );
  const [selectedRange, setSelectedRange] = useState(new Date().getMonth() + 1);
  return (
    <div className="bg-white min-h-screen text-gray-800 p-4 space-y-4 rounded-2xl shadow-lg">
      {/* Top Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left - 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`rounded-xl p-5 flex justify-between items-center shadow-md hover:shadow-lg transition-all ${s.color}`}
            >
              <div>
                <p className="text-gray-600 text-sm font-bold">{s.title}</p>
                <h3 className="text-2xl font-bold mt-1">{s.value}</h3>
                <p
                  className={`text-xs mt-1 ${s.change.startsWith("-")
                      ? "text-red-500"
                      : "text-green-500"
                    }`}
                >
                  {s.change}
                </p>
              </div>
              <div className="bg-white p-3 rounded-full shadow">{s.icon}</div>
            </div>
          ))}
        </div>

        {/* Right - Total Products Table */}
        <div className="bg-white p-2 rounded-xl shadow-lg flex flex-col justify-between min-h-[320px]">
          <div>
            <div className="flex justify-between items-center mb-3">
      <h3 className="text-md font-bold">All Brands</h3>
      <Link
        to="/brands" 
        className="text-blue-600 hover:underline text-sm font-medium"
      >
        Show More
      </Link>
    </div>
            <table className="w-full text-sm">
              <thead className="text-gray-500 border-b">
                <tr>
                  <th className="py-2 px-2 text-left">#</th>
                  <th className="text-left">Brand Name</th>
                  <th className="text-left">Popularity</th>
                  <th className="text-left">Sales</th>
                </tr>
              </thead>
              <tbody>
                {displayedBrands.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="py-2 px-2">{p.id}</td>
                    <td>{p.name}</td>
                    <td>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-[#162570] h-2.5 rounded-full"
                          style={{ width: `${p.popularity}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className='px-4'>10</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
            <p>
              Showing {(currentPageBrand - 1) * rowsPerPage + 1} to{' '}
              {Math.min(currentPageBrand * rowsPerPage, brands.length)} of {brands.length} results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPageBrand((p) => Math.max(p - 1, 1))}
                className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
              >
                Prev
              </button>
              <span className="px-2">
                {currentPageBrand} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPageBrand((p) => Math.min(p + 1, totalPages))
                }
                className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2 - Charts */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-12 lg:col-span-6 bg-white p-4 rounded-xl shadow-lg flex flex-col">
      <div className="flex justify-between items-center mb-3 w-full">
        <h3 className="text-md font-bold text-gray-800">Product Analytics</h3>

        <div className="flex items-center gap-3">
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            className="border border-gray-300 rounded-lg text-sm px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={1}>January</option>
            <option value={2}>February</option>
            <option value={3}>March</option>
            <option value={4}>April</option>
            <option value={5}>May</option>
            <option value={6}>June</option>
            <option value={7}>July</option>
            <option value={8}>August</option>
            <option value={9}>September</option>
            <option value={10}>October</option>
            <option value={11}>November</option>
            <option value={12}>December</option>
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={ordersData}>
          <XAxis dataKey="tyrename" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="stock_out" stroke="#FFBB28" strokeWidth={2} />
          <Line type="monotone" dataKey="stock_in" stroke="#0088FE" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>

        {/* Earnings - col-span 2 */}
        <div className="col-span-12 md:col-span-6 lg:col-span-2 bg-white p-2 rounded-xl shadow-lg flex flex-col items-center">
          <h3 className="text-md font-bold mb-3 self-start">Earnings</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={earningsData}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={3}
              >
                {earningsData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center text-xl font-bold mt-2">$452</div>
        </div>

        {/* Market Growth - col-span 4 */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-white p-2 rounded-xl shadow-lg flex flex-col items-center">
          <h3 className="text-md font-bold mb-3 self-start">Market Growth</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#162570" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>


      {/* Row 3 - Orders List */}
      <div className="bg-white p-4 rounded-2xl shadow-md max-h-[400px] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
      <h3 className="text-md font-bold">All Products</h3>
      <Link
        to="/products" // Replace with your target route
        className="text-blue-600 hover:underline text-sm font-medium"
      >
        Show More
      </Link>
    </div>
        <table className="min-w-full bg-white rounded-xl overflow-hidden">
          <thead className="bg-gray-100 text-white uppercase text-sm tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Tyre Number</th>
              <th className="px-4 py-3 text-left">Brand</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Tubeless</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {displayedProductsPage.map((p, idx) => (
              <tr
                key={p.id}
                className={`transition hover:bg-gray-100 ${idx % 2 === 0 ? 'bg-gray-50' : ''
                  }`}
              >
                <td className="px-4 py-3 font-medium">{p.tyre_number}</td>
                <td className="px-4 py-3">{p.Brand?.name}</td>
                <td className="px-4 py-3">{p.Type?.name}</td>
                <td className="px-4 py-3 text-green-600 font-semibold">₹{p.price}</td>
                <td className="px-4 py-3 font-medium">{p.quantity}</td>
                <td className="px-4 py-3">{p.tubeless ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
          <p>
            Showing {(currentPageProd - 1) * rowsPerPage + 1} to{' '}
            {Math.min(currentPageProd * rowsPerPage, products.length)} of {products.length} results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPageProd((p) => Math.max(p - 1, 1))}
              className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
            >
              Prev
            </button>
            <span className="px-2">
              {currentPageProd} / {totalPagesProd}
            </span>
            <button
              onClick={() =>
                setCurrentPageProd((p) => Math.min(p + 1, totalPagesProd))
              }
              className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}