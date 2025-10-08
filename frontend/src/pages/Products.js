import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', brand: '', size: '', price: '', stock: '' });

  useEffect(() => {
    const raw = localStorage.getItem('tyre_products');
    if (raw) setProducts(JSON.parse(raw));
    else {
      const seed = [
        { id: uuidv4(), name: 'All-Season 205/55R16', brand: 'GripMax', size: '205/55R16', price: 4500, stock: 20 },
        { id: uuidv4(), name: 'Mud-Terrain 235/75R15', brand: 'RockRoad', size: '235/75R15', price: 7500, stock: 8 },
      ];
      setProducts(seed);
      localStorage.setItem('tyre_products', JSON.stringify(seed));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tyre_products', JSON.stringify(products));
  }, [products]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleAdd(e) {
    e.preventDefault();
    const newP = { id: uuidv4(), name: form.name || 'Unnamed Tyre', brand: form.brand || '-', size: form.size || '-', price: Number(form.price) || 0, stock: Number(form.stock) || 0 };
    setProducts([newP, ...products]);
    setForm({ name: '', brand: '', size: '', price: '', stock: '' });
    setShowModal(false);
  }

  function handleDelete(id) {
    if (!confirm('Delete this product?')) return;
    setProducts(products.filter(p => p.id !== id));
  }

  function handleReduceStock(p) {
    const qty = prompt('Enter qty to reduce from stock', '1');
    const qn = Number(qty);
    if (!isNaN(qn)) {
      setProducts(products.map(x => x.id === p.id ? { ...x, stock: Math.max(0, x.stock - qn) } : x));
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-bettlegreen mb-3 md:mb-0">Products</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-bettlegreen text-gray-700 px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
          <thead className="bg-bettlegreen text-white">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold">Name</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Brand</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Size</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Price</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Stock</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-2">{p.name}</td>
                <td className="px-4 py-2">{p.brand}</td>
                <td className="px-4 py-2">{p.size}</td>
                <td className="px-4 py-2">₹{p.price}</td>
                <td className="px-4 py-2">{p.stock}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => handleReduceStock(p)}
                    className="bg-yellow-400 text-white px-3 py-1 rounded-md hover:bg-yellow-500 text-sm transition"
                  >
                    Reduce
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-sm transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Add Product</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Name"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bettlegreen"
              />
              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="Brand"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bettlegreen"
              />
              <input
                name="size"
                value={form.size}
                onChange={handleChange}
                placeholder="Size"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bettlegreen"
              />
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                type="number"
                placeholder="Price"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bettlegreen"
              />
              <input
                name="stock"
                value={form.stock}
                onChange={handleChange}
                type="number"
                placeholder="Stock"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bettlegreen"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-bettlegreen text-gray-700 hover:bg-green-700 transition"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
