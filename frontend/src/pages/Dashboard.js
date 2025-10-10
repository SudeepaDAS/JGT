import React from 'react';
import { FaBoxes, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import ENV from '../env';

export default function Dashboard() {
  const stats = [
    { title: 'Total Products', value: 120, icon: <FaBoxes className="text-white" />, color: 'bg-green-500' },
    { title: 'Stock Available', value: 540, icon: <FaCheckCircle className="text-white" />, color: 'bg-blue-500' },
    { title: 'Low Stock Items', value: 8, icon: <FaExclamationTriangle className="text-white" />, color: 'bg-red-500' },
  ];

  const recentSales = [
    { id: 1, product: 'Tyre A', quantity: 10, status: 'Delivered' },
    { id: 2, product: 'Tyre B', quantity: 5, status: 'Pending' },
    { id: 3, product: 'Tyre C', quantity: 2, status: 'Low Stock' },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-bettlegreen mb-6">Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((s) => (
          <div key={s.title} className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-lg transition">
            <div className={`p-3 rounded-full ${s.color} mr-4 flex items-center justify-center`}>
              {s.icon}
            </div>
            <div>
              <div className="text-gray-500 font-medium">{s.title}</div>
              <div className="text-xl font-bold text-gray-900">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Activity</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase">Product</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recentSales.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-2">{sale.product}</td>
                <td className="px-4 py-2">{sale.quantity}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      sale.status === 'Delivered'
                        ? 'bg-green-100 text-green-700'
                        : sale.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {sale.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Optional: Quick Add Product */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Add Product</h3>
        <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Product Name"
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bettlegreen"
          />
          <input
            type="number"
            placeholder="Quantity"
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bettlegreen"
          />
          <button className="bg-bettlegreen text-gray-700 px-4 py-2 rounded-md hover:bg-green-700 transition">
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
}
