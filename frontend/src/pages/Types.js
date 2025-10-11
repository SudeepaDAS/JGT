import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import ENV from '../env';

export default function Types() {
  const [types, setTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '' });
  const [editingId, setEditingId] = useState(null);

  const API = ENV.API_URL;

  // Fetch all types
  const fetchTypes = async () => {
    try {
      const res = await axios.get(`${API}/types`);
      setTypes(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch types');
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  // Get type name by id and open modal for editing
  const getTypeById = async (id) => {
    try {
      const res = await axios.get(`${API}/types/${id}`);
      setForm({ name: res.data.name });
      setEditingId(id);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert('Error fetching type');
    }
  };

  // Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit Add or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API}/types/${editingId}`, { name: form.name });
      } else {
        await axios.post(`${API}/types`, { name: form.name });
      }
      setForm({ name: '' });
      setEditingId(null);
      setShowModal(false);
      fetchTypes();
    } catch (err) {
      console.error(err);
      alert('Error saving type');
    }
  };

  // Delete type
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this type?')) return;
    try {
      await axios.delete(`${API}/types/${id}`);
      fetchTypes();
    } catch (err) {
      console.error(err);
      alert('Error deleting type');
    }
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-MidnightBlue">Types</h2>
        <button
          onClick={() => { setShowModal(true); setEditingId(null); setForm({ name: '' }); }}
          className="text-white bg-[#162570] border border-MidnightBlue px-5 py-2 rounded-lg shadow-md 
                    hover:bg-white-700 hover:text-MidnightBlue hover:scale-105 transition-all duration-200 font-medium"
        >
          Add Type
        </button>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
          <thead className="bg-MidnightBlue text-white uppercase text-sm tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Type Name</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {types.map((type, idx) => (
              <tr key={type.id} className={`transition hover:bg-gray-100 ${idx % 2 === 0 ? 'bg-gray-50' : ''}`}>
                <td className="px-4 py-3 font-medium">{idx + 1}</td>
                <td className="px-4 py-3">{type.name}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => getTypeById(type.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 text-sm transition"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(type.id)}
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

      {/* Add/Update Type Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              {editingId ? 'Update Type' : 'Add Type'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Type Name"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-MidnightBlue"
                required
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100"
                  onClick={() => { setShowModal(false); setEditingId(null); setForm({ name: '' }); }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-white bg-[#162570] border border-MidnightBlue px-5 py-2 rounded-lg shadow-md 
                    hover:bg-white-700 hover:text-MidnightBlue hover:scale-105 transition-all duration-200 font-medium px-4 py-2 rounded"
                >
                  {editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}