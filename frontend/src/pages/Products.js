import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    tyre_number: '',
    brandId: '',
    typeId: '',
    price: '',
    quantity: '',
    tubeless: true
  });

  const [brands, setBrands] = useState([]);
  const [types, setTypes] = useState([]);

  const API = 'http://localhost:5000/api';

  // Fetch tyres
  const fetchTyres = async () => {
    try {
      const res = await axios.get(`${API}/tyres`);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch brands and types
  const fetchBrandsAndTypes = async () => {
    try {
      const [bRes, tRes] = await Promise.all([
        axios.get(`${API}/brands`),
        axios.get(`${API}/types`)
      ]);
      setBrands(bRes.data);
      setTypes(tRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBrandsAndTypes();
    fetchTyres();
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  }

  // Add tyre
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        tyre_number: form.tyre_number,
        brandId: form.brandId,
        typeId: form.typeId,
        quantity: Number(form.quantity),
        price: Number(form.price),
        tubeless: form.tubeless
      };
      await axios.post(`${API}/tyres`, payload);
      setForm({ tyre_number: '', brandId: '', typeId: '', quantity: '', price: '', tubeless: true });
      setShowModal(false);
      fetchTyres();
    } catch (err) {
      console.error(err);
      alert('Error adding tyre');
    }
  };

  // Delete tyre
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tyre?')) return;
    try {
      await axios.delete(`${API}/tyres/${id}`);
      fetchTyres();
    } catch (err) {
      console.error(err);
      alert('Error deleting tyre');
    }
  };

  // Reduce stock
  const handleReduceStock = async (tyre) => {
    const qty = prompt('Enter qty to reduce from stock', '1');
    const number = Number(qty);
    if (isNaN(number)) return;
    try {
      await axios.put(`${API}/tyres/${tyre.id}`, {
        ...tyre,
        quantity: Math.max(0, tyre.quantity - number)
      });
      fetchTyres();
    } catch (err) {
      console.error(err);
      alert('Error updating stock');
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-bettlegreen mb-3 md:mb-0">Products</h2>
        <button
          onClick={() => setShowModal(true)}
          className="text-bettlegreen bg-white border border-bettlegreen px-5 py-2 rounded-lg shadow-md 
                    hover:bg-green-700 hover:text-white hover:scale-105 transition-all duration-200 font-medium"
        >
          Add Product
        </button>

      </div>

     <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
          <thead className="bg-bettlegreen text-white uppercase text-sm tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Tyre Number</th>
              <th className="px-4 py-3 text-left">Brand</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Tubeless</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {products.map((p, idx) => (
              <tr
                key={p.id}
                className={`transition hover:bg-gray-100 ${
                  idx % 2 === 0 ? 'bg-gray-50' : ''
                }`}
              >
                <td className="px-4 py-3 font-medium">{p.tyre_number}</td>
                <td className="px-4 py-3">{p.Brand?.name}</td>
                <td className="px-4 py-3">{p.Type?.name}</td>
                <td className="px-4 py-3 text-green-600 font-semibold">₹{p.price}</td>
                <td className="px-4 py-3 font-medium">{p.quantity}</td>
                <td className="px-4 py-3">{p.tubeless ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3 flex gap-2">
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
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Add Tyre</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <input
                name="tyre_number"
                value={form.tyre_number}
                onChange={handleChange}
                placeholder="Tyre Number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bettlegreen"
              />

              <select name="brandId" value={form.brandId} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="">Select Brand</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>

              <select name="typeId" value={form.typeId} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="">Select Type</option>
                {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>

              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                type="number"
                placeholder="Price"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                type="number"
                placeholder="Stock"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="tubeless"
                  checked={form.tubeless}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                Tubeless
              </label>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-bettlegreen text-gray-700 hover:bg-green-700"
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
