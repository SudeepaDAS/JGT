import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import ENV from '../env';

const API = ENV.API_URL;

export default function SalesOrders() {
  const [orders, setOrders] = useState([]);
  const [tyres, setTyres] = useState([]);
  const [form, setForm] = useState({
    order_number: '',
    customer_name: '',
    contact_number: '',
    status: 'Pending',
    items: [],
  });
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState([]);

  // Filters
  const [searchOrder, setSearchOrder] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchItem, setSearchItem] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [minTotal, setMinTotal] = useState('');
  const [maxTotal, setMaxTotal] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchTyres();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API}/salesorders`);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTyres = async () => {
    try {
      const res = await axios.get(`${API}/tyres`);
      setTyres(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API}/salesorders/${editingId}`, form);
      } else {
        await axios.post(`${API}/salesorders`, form);
      }
      setShowModal(false);
      setForm({ order_number: '', customer_name: '', contact_number: '', status: 'Pending', items: [] });
      setEditingId(null);
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Something went wrong');
    }
  };

  const handleEdit = (order) => {
    setForm({
      order_number: order.order_number,
      customer_name: order.customer_name,
      contact_number: order.contact_number,
      status: order.status,
      items: order.SalesOrderItems.map((i) => ({
        tyreId: i.tyreId,
        quantity: i.quantity,
        price: i.price,
      })),
    });
    setEditingId(order.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await axios.delete(`${API}/salesorders/${id}`);
        fetchOrders();
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.error || 'Delete failed');
      }
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...form.items];
    updatedItems[index][field] = field === 'price' || field === 'quantity' ? Number(value) : value;
    setForm({ ...form, items: updatedItems });
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { tyreId: '', quantity: 1, price: 0 }] });
  };

  const removeItem = (index) => {
    const updatedItems = [...form.items];
    updatedItems.splice(index, 1);
    setForm({ ...form, items: updatedItems });
  };

  const toggleExpand = (id) => {
    setExpandedOrders((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const orderMatch = order.order_number.toLowerCase().includes(searchOrder.toLowerCase());
    const customerMatch = order.customer_name.toLowerCase().includes(searchCustomer.toLowerCase());
    const itemMatch = order.SalesOrderItems.some((item) =>
      item.Tyre.tyre_number.toLowerCase().includes(searchItem.toLowerCase())
    );
    const statusMatch = filterStatus ? order.status === filterStatus : true;
    const minMatch = minTotal ? order.total_amount >= Number(minTotal) : true;
    const maxMatch = maxTotal ? order.total_amount <= Number(maxTotal) : true;

    const orderDate = new Date(order.createdAt);
    const fromMatch = dateFrom ? orderDate >= new Date(dateFrom) : true;
    const toMatch = dateTo ? orderDate <= new Date(dateTo) : true;

    return orderMatch && customerMatch && itemMatch && statusMatch && minMatch && maxMatch && fromMatch && toMatch;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Sales Orders</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-white bg-[#162570] border border-MidnightBlue px-5 py-2 rounded-lg shadow-md 
                    hover:bg-white-700 hover:text-MidnightBlue hover:scale-105 transition-all duration-200 font-medium px-4 py-2 rounded shadow"
        >
          <FaPlus /> Add Order
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-8 gap-3 mb-4">
        <input
          type="text"
          placeholder="Search Order #"
          value={searchOrder}
          onChange={(e) => setSearchOrder(e.target.value)}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <input
          type="text"
          placeholder="Search Customer"
          value={searchCustomer}
          onChange={(e) => setSearchCustomer(e.target.value)}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <input
          type="text"
          placeholder="Search Item"
          value={searchItem}
          onChange={(e) => setSearchItem(e.target.value)}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <input
          type="number"
          placeholder="Min Total ₹"
          value={minTotal}
          onChange={(e) => setMinTotal(e.target.value)}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <input
          type="number"
          placeholder="Max Total ₹"
          value={maxTotal}
          onChange={(e) => setMaxTotal(e.target.value)}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <input
          type="date"
          placeholder="From Date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <input
          type="date"
          placeholder="To Date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Order #</th>
              <th className="p-2 text-left">Customer</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Total ₹</th>
              <th className="p-2 text-left">Created At</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrders.includes(order.id);
              return (
                <React.Fragment key={order.id}>
                  <tr className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => toggleExpand(order.id)}>
                    <td className="p-2">{order.order_number}</td>
                    <td className="p-2">{order.customer_name}</td>
                    <td className={`p-2 font-medium ${order.status === 'Pending' ? 'text-yellow-600' : order.status === 'Completed' ? 'text-green-600' : 'text-red-600'}`}>
                      {order.status}
                    </td>
                    <td className="p-2 font-semibold">₹{order.total_amount}</td>
                    <td className="p-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-2 flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(order); }} className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(order.id); }} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                      <span>{isExpanded ? <FaChevronUp /> : <FaChevronDown />}</span>
                    </td>
                  </tr>
                 {isExpanded && (
                    <tr className="bg-gray-50">
                        <td colSpan="6" className="p-2">
                        <div className="space-y-1">
                            {order.SalesOrderItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex justify-between items-center bg-blue-50 text-blue-900 p-2 rounded-lg shadow-sm border"
                            >
                                <p className="w-1/6 font-semibold">{item.Tyre.tyre_number}</p>
                                <p className="w-1/4 text-center font-semibold">Qty: {item.quantity}</p>
                                <p className="w-1/4 text-right">Import Price: ₹{item.price}</p>
                                <p className="w-1/4 text-right font-bold">Sale Price: ₹{item.total_price}</p>
                            </div>
                            ))}
                        </div>
                        </td>
                    </tr>
                    )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit Order' : 'Add Order'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Customer Name"
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                required
                className="p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <input
                type="text"
                placeholder="Contact Number"
                value={form.contact_number}
                onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
                className="p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                {!editingId && <option value="Pending">Pending</option>}
                <option value="Completed">Completed</option>
                {editingId && <option value="Cancelled">Cancelled</option>}
              </select>

              <div className="border p-3 rounded space-y-2">
                <h4 className="font-semibold mb-2">Items</h4>
                {form.items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <select
                      value={item.tyreId}
                      onChange={(e) => handleItemChange(index, 'tyreId', e.target.value)}
                      required
                      className="flex-1 p-1 border rounded"
                    >
                      <option value="">Select Tyre</option>
                      {tyres.map((t) => (
                        <option key={t.id} value={t.id}>{t.tyre_number}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      required
                      className="w-16 p-1 border rounded"
                    />
                    <input
                      type="number"
                      min="0"
                      value={item.price || ''}
                      onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                      required
                      placeholder="Price"
                      className="w-24 p-1 border rounded"
                    />
                    <button type="button" onClick={() => removeItem(index)} className="text-red-600 font-bold">✕</button>
                  </div>
                ))}
                <button type="button" onClick={addItem} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                  Add Item
                </button>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
                <button type="submit" className="text-white bg-[#162570] border border-MidnightBlue px-5 py-2 rounded-lg shadow-md 
                    hover:bg-white-700 hover:text-MidnightBlue hover:scale-105 transition-all duration-200 font-medium px-4 py-2 rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
