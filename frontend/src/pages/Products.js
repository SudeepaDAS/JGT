import React, { useEffect, useState } from 'react';
import { FaMinus, FaTrash, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import ENV from '../env';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const filteredProducts = products.filter((p) => {
    if (!appliedSearch) return true;
    const term = appliedSearch.toLowerCase();
    return (
      p.tyre_number?.toLowerCase().includes(term) ||
      p.model?.toLowerCase().includes(term) ||
      p.Brand?.name?.toLowerCase().includes(term) ||
      p.Type?.name?.toLowerCase().includes(term)
    );
  });
  const [form, setForm] = useState({
    tyre_number: '',
    brandId: '',
    typeId: '',
    model: '',
    price: '',
    quantity: '',
    tubeless: true
  });

  const [brands, setBrands] = useState([]);
  const [types, setTypes] = useState([]);

  const API = ENV.API_URL;

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
        model: form.model,
        quantity: Number(form.quantity),
        price: Number(form.price),
        tubeless: form.tubeless
      };
      await axios.post(`${API}/tyres`, payload);
      setForm({ tyre_number: '', brandId: '', typeId: '', model: '', quantity: '', price: '', tubeless: true });
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
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-MidnightBlue mb-3 md:mb-0">Products</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-white bg-[#162570] border border-MidnightBlue px-5 py-2 rounded-lg shadow-md 
                    hover:bg-white-700 hover:text-MidnightBlue hover:scale-105 transition-all duration-200 font-medium px-4 py-2 rounded shadow"
        >
          <FaPlus /> Add Product
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2 mb-6 max-w-md">
        <input
          type="text"
          placeholder="Search size, brand, or model..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setAppliedSearch(searchQuery);
            }
          }}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#162570] bg-white shadow-sm"
        />
        <button
          onClick={() => setAppliedSearch(searchQuery)}
          className="text-white bg-[#162570] hover:bg-opacity-90 px-5 py-2 rounded-lg shadow-md transition font-medium"
        >
          Search
        </button>
        {appliedSearch && (
          <button
            onClick={() => {
              setSearchQuery('');
              setAppliedSearch('');
            }}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition bg-white"
          >
            Clear
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
          <thead className="bg-gray-100 text-white uppercase text-sm tracking-wider">
            <tr>
              <th className="px-4 py-3 border border-gray-300 text-left">Tyre Number</th>
              <th className="px-4 py-3 border border-gray-300 text-left">Brand</th>
              <th className="px-4 py-3 border border-gray-300 text-left">Model</th>
              <th className="px-4 py-3 border border-gray-300 text-left">Type</th>
              <th className="px-4 py-3 border border-gray-300 text-left">Price</th>
              <th className="px-4 py-3 border border-gray-300 text-left">Stock</th>
              <th className="px-4 py-3 border border-gray-300 text-left">Tubeless</th>
              <th className="px-4 py-3 border border-gray-300 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {filteredProducts.map((p, idx) => (
              <tr
                key={p.id}
                className={`transition hover:bg-gray-100 ${idx % 2 === 0 ? 'bg-gray-50' : ''
                  }`}
              >
                <td className="px-4 py-3 border border-gray-300 font-medium">{p.tyre_number}</td>
                <td className="px-4 py-3 border border-gray-300">{p.Brand?.name}</td>
                <td className="px-4 py-3 border border-gray-300">{p.model || '—'}</td>
                <td className="px-4 py-3 border border-gray-300">{p.Type?.name}</td>
                <td className="px-4 py-3 border border-gray-300 text-green-600 font-semibold">₹{p.price}</td>
                <td className="px-4 py-3 border border-gray-300 font-medium">{p.quantity}</td>
                <td className="px-4 py-3 border border-gray-300">{p.tubeless ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3 border border-gray-300">
                  <button
                    onClick={() => handleReduceStock(p)}
                    className="bg-yellow-400 text-white px-3 py-1 mx-1 rounded-md hover:bg-yellow-500 text-sm transition"
                  >
                    <FaMinus />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-sm transition"
                  >
                    <FaTrash />
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-MidnightBlue"
              />

              <input
                name="model"
                value={form.model}
                onChange={handleChange}
                placeholder="Model (e.g. ALNAC 4G)"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-MidnightBlue"
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
                  className="text-white bg-[#162570] border border-MidnightBlue px-5 py-2 rounded-lg shadow-md 
                    hover:bg-white-700 hover:text-MidnightBlue hover:scale-105 transition-all duration-200 font-medium px-4 py-2 rounded"
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
