import React from "react";
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
  Legend,
} from "recharts";
import {
  FaUsers,
  FaBox,
  FaDollarSign,
  FaUndo,
} from "react-icons/fa";

export default function Dashboard() {
  // ---- Hardcoded data ----
  const stats = [
    {
      title: "Total Users",
      value: "89,935",
      change: "+1.01% This week",
      color: "bg-yellow-100",
      icon: <FaUsers className="text-yellow-600" size={24} />,
    },
    {
      title: "Total Products",
      value: "23,283",
      change: "+1.01% This week",
      color: "bg-purple-100",
      icon: <FaBox className="text-purple-600" size={24} />,
    },
    {
      title: "Total Sales",
      value: "46,827",
      change: "-0.91% This week",
      color: "bg-blue-100",
      icon: <FaDollarSign className="text-blue-600" size={24} />,
    },
    {
      title: "Total Refunded",
      value: "$124,854",
      change: "+1.01% This week",
      color: "bg-pink-100",
      icon: <FaUndo className="text-pink-600" size={24} />,
    },
  ];

  const ordersData = [
    { month: "Jan", online: 20, offline: 25 },
    { month: "Feb", online: 30, offline: 40 },
    { month: "Mar", online: 60, offline: 55 },
    { month: "Apr", online: 50, offline: 65 },
    { month: "May", online: 70, offline: 60 },
    { month: "Jun", online: 65, offline: 75 },
    { month: "Jul", online: 85, offline: 80 },
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

  const productData = [
    { id: 1, name: "Home Decore Range", popularity: 99, sales: "99%" },
    { id: 2, name: "Disney Princess Dress", popularity: 82, sales: "82%" },
    { id: 3, name: "Bathroom Essentials", popularity: 75, sales: "75%" },
    { id: 4, name: "Jeans", popularity: 72, sales: "72%" },
    { id: 5, name: "Kurta wear", popularity: 69, sales: "69%" },
  ];

  const orderList = [
    {
      id: "#12594",
      date: "Oct 15, 2024",
      customer: "Frank Murlo",
      location: "312 S Wilmette Ave",
      amount: "$847.69",
      status: "New Order",
    },
    {
      id: "#12490",
      date: "Jan 04, 2024",
      customer: "Thomas Bleri",
      location: "Lathrop Ave, Harvey",
      amount: "$477.14",
      status: "On Delivery",
    },
  ];

  // ---- UI ----
  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {stats.map((s, i) => (
          <div
            key={i}
            className={`rounded-2xl shadow-sm p-5 ${s.color} flex items-center justify-between`}
          >
            <div>
              <h2 className="text-gray-600 text-sm font-semibold">{s.title}</h2>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
              <p
                className={`text-xs mt-1 ${
                  s.change.startsWith("-") ? "text-red-500" : "text-green-500"
                }`}
              >
                {s.change}
              </p>
            </div>
            <div className="p-3 rounded-full bg-white shadow-sm">{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Analytics */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Orders Analytics</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={ordersData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="offline"
                stroke="#FFBB28"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="online"
                stroke="#0088FE"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Earnings Pie */}
        <div className="bg-white p-5 rounded-2xl shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Earnings</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={earningsData}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {earningsData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center text-2xl font-bold mt-2">$452</div>
        </div>

        {/* Market Growth */}
        <div className="bg-white p-5 rounded-2xl shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Market Growth</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#162570" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Total Products Table */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Total Products</h3>
          <table className="w-full text-sm">
            <thead className="text-gray-500 border-b">
              <tr>
                <th className="text-left py-2">#</th>
                <th className="text-left">Product Name</th>
                <th className="text-left">Popularity</th>
                <th className="text-left">Sales</th>
              </tr>
            </thead>
            <tbody>
              {productData.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="py-2">{p.id}</td>
                  <td>{p.name}</td>
                  <td>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{ width: `${p.popularity}%` }}
                      ></div>
                    </div>
                  </td>
                  <td>{p.sales}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Orders List */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Orders List</h3>
          <table className="w-full text-sm">
            <thead className="text-gray-500 border-b">
              <tr>
                <th className="py-2 text-left">#</th>
                <th className="text-left">Date</th>
                <th className="text-left">Customer Name</th>
                <th className="text-left">Location</th>
                <th className="text-left">Amount</th>
                <th className="text-left">Status Order</th>
              </tr>
            </thead>
            <tbody>
              {orderList.map((o, i) => (
                <tr key={i} className="border-b">
                  <td className="py-2">{o.id}</td>
                  <td>{o.date}</td>
                  <td>{o.customer}</td>
                  <td>{o.location}</td>
                  <td>{o.amount}</td>
                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        o.status === "New Order"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}