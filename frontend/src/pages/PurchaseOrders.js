import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import ENV from "../env";

const API = ENV.API_URL;

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [brands, setBrands] = useState([]);
  const [tyres, setTyres] = useState([]);
  const [types, setTypes] = useState([]);  // <-- New state for types
  const [form, setForm] = useState({
    id: "",
    brand_id: "",
    order_number: "",
    status: "Pending",
    items: [],
  });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchBrands();
    fetchTypes(); // Fetch types on mount
  }, []);

  // Fetch all purchase orders
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API}/purchaseorders`);
      setOrders(res.data || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  // Fetch brands
  const fetchBrands = async () => {
    try {
      const res = await axios.get(`${API}/brands`);
      setBrands(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch types
  const fetchTypes = async () => {
    try {
      const res = await axios.get(`${API}/types`); // Make sure you have this API endpoint
      setTypes(res.data || []);
    } catch (err) {
      console.error("Failed to fetch types:", err);
      setTypes([]);
    }
  };

  // Fetch tyres for selected brand
  const fetchTyres = async (brandId) => {
    if (!brandId) return setTyres([]);
    try {
      const res = await axios.get(`${API}/purchaseorders/tyres/${brandId}`);
      setTyres(res.data || []);
    } catch (err) {
      console.error(err);
      setTyres([]);
    }
  };

  // Handle brand selection
  const handleBrandChange = (e) => {
    const brandId = e.target.value;
    setForm({ ...form, brand_id: brandId, items: [] });
    fetchTyres(brandId);
  };

  // Add new item row
  const handleAddItem = () => {
    setForm({
      ...form,
      items: [
        ...form.items,
        { tyre_id: "", tyre_name: "", typeId: 0, qty: 1, price: 0, tubeless: true },
      ],
    });
  };

  // Update item field
  const handleItemChange = (index, field, value) => {
    const items = [...form.items];
    if (field === "qty" || field === "price" || field === "typeId") {
      value = Number(value);
    }
    items[index][field] = value;
    setForm({ ...form, items });
  };

  // Remove item row
  const handleRemoveItem = (index) => {
    const items = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items });
  };

  // Reset form
  const resetForm = () => {
    setForm({ id: "", brand_id: "", order_number: "", status: "Pending", items: [] });
    setEditing(false);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.brand_id || !form.order_number || form.items.length === 0) {
      alert("Fill brand, order number and at least one item");
      return;
    }

    // Ensure all items have tyre name and typeId
    for (let i of form.items) {
      if (!i.tyre_name) {
        alert("All items must have a Tyre selected or entered");
        return;
      }
      if (!i.typeId || i.typeId === 0) {
        alert("All items must have a valid Type selected");
        return;
      }
    }

    const payload = {
      brand_id: Number(form.brand_id),
      order_number: form.order_number,
      status: form.status,
      items: form.items.map((i) => ({
        tyre_id: i.tyre_id || null,
        tyre_name: i.tyre_name,
        qty: Number(i.qty),
        import_price: Number(i.price),
        typeId: Number(i.typeId),
        tubeless: i.tubeless ?? false,
      })),
    };

    try {
      if (editing) {
        await axios.put(`${API}/purchaseorders/${form.id}`, payload);
      } else {
        await axios.post(`${API}/purchaseorders`, payload);
      }
      setShowModal(false);
      fetchOrders();
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Failed to save Purchase Order");
    }
  };

  // Edit existing order
  const handleEdit = (order) => {
    setForm({
      id: order.id,
      brand_id: order.brand_id,
      order_number: order.order_number,
      status: order.status,
      items: (order.PurchaseOrderItems || []).map((i) => ({
        id: i.id,
        tyre_id: i.Tyre?.id,
        tyre_name: i.Tyre?.tyre_number || i.tyre_name,
        typeId: i.Tyre?.typeId || 0,
        qty: i.quantity,
        price: i.price,
        tubeless: i.Tyre?.tubeless ?? true,
      })),
    });
    setEditing(true);
    setShowModal(true);
    fetchTyres(order.brand_id);
  };

  // Delete order
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API}/purchaseorders/${id}`);
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert("Failed to delete Purchase Order");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Purchase Orders</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FaPlus className="mr-2" /> New PO
        </button>
      </div>

      {/* Orders Table */}
      <table className="w-full border-collapse border">
        <thead className="bg-gray-200">
          <tr>
            <th className="border px-3 py-2">ID</th>
            <th className="border px-3 py-2">Brand</th>
            <th className="border px-3 py-2">Order Number</th>
            <th className="border px-3 py-2">Status</th>
            <th className="border px-3 py-2">Items</th>
            <th className="border px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="border px-3 py-2 text-center">{o.id}</td>
              <td className="border px-3 py-2">{o.Brand?.name || "—"}</td>
              <td className="border px-3 py-2">{o.order_number}</td>
              <td className="border px-3 py-2 text-center">{o.status}</td>
              <td className="border px-3 py-2">
                {o.PurchaseOrderItems.map((i) => `${i.Tyre?.tyre_number || "-"} (${i.quantity})`).join(", ")}
              </td>
              <td className="border px-3 py-2 text-center">
                <button onClick={() => handleEdit(o)} className="text-blue-500 mr-3"><FaEdit /></button>
                <button onClick={() => handleDelete(o.id)} className="text-red-500"><FaTrash /></button>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center p-4">No orders found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md w-[700px] max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editing ? "Edit Purchase Order" : "Create Purchase Order"}
            </h3>
            <form onSubmit={handleSubmit}>
              {/* Brand */}
              <label className="block mb-2">Brand</label>
              <select
                value={form.brand_id}
                onChange={handleBrandChange}
                className="w-full border px-3 py-2 rounded mb-4"
                required
              >
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>

              {/* Order Number */}
              <label className="block mb-2">Order Number</label>
              <input
                type="text"
                value={form.order_number}
                onChange={(e) => setForm({ ...form, order_number: e.target.value })}
                className="w-full border px-3 py-2 rounded mb-4"
                required
              />

              {/* Items */}
              <h4 className="font-semibold mb-2">Items</h4>
              {form.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2 border p-2 rounded items-center flex-wrap">
                  {/* Tyre select / input */}
                  <input
                    list="tyres"
                    value={item.tyre_name}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleItemChange(idx, "tyre_name", val);

                      const selectedTyre = tyres.find((t) => t.tyre_number === val);
                      if (selectedTyre) {
                        handleItemChange(idx, "tyre_id", selectedTyre.id);
                        handleItemChange(idx, "typeId", selectedTyre.typeId);
                        handleItemChange(idx, "tubeless", selectedTyre.tubeless);
                        handleItemChange(idx, "price", selectedTyre.price);
                      } else {
                        handleItemChange(idx, "tyre_id", null);
                        handleItemChange(idx, "typeId", 0);
                      }
                    }}
                    placeholder="Select or type new tyre"
                    className="border px-2 py-1 flex-1 rounded"
                  />
                  <datalist id="tyres">
                    {tyres.map((t) => (
                      <option key={t.id} value={t.tyre_number} />
                    ))}
                  </datalist>

                  {/* Type dropdown */}
                  <select
                    value={item.typeId}
                    onChange={(e) => handleItemChange(idx, "typeId", e.target.value)}
                    className="w-36 border px-2 py-1 rounded"
                    disabled={!!item.tyre_id}
                    required
                  >
                    <option value={0}>Select Type</option>
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>

                  {/* Quantity */}
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                    className="w-20 border px-2 py-1 rounded"
                    required
                  />

                  {/* Price */}
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => handleItemChange(idx, "price", e.target.value)}
                    className="w-24 border px-2 py-1 rounded"
                    required
                  />

                  {/* Tubeless */}
                  <label className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={item.tubeless}
                      onChange={(e) => handleItemChange(idx, "tubeless", e.target.checked)}
                      disabled={!!item.tyre_id}
                    />
                    <span>Tubeless</span>
                  </label>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="text-red-600 hover:text-red-800 ml-2"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddItem}
                className="bg-green-600 text-white px-4 py-2 rounded mt-2"
              >
                <FaPlus /> Add Item
              </button>

              {/* Status */}
              <label className="block mt-4 mb-2">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border px-3 py-2 rounded mb-4"
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  {editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
