import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaTrash, FaEdit, FaChevronDown, FaChevronUp } from "react-icons/fa";
import ENV from "../env";

const API = ENV.API_URL;

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [brands, setBrands] = useState([]);
  const [types, setTypes] = useState([]);
  const [tyres, setTyres] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [editing, setEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    brand: "",
    status: "",
  });

  const [form, setForm] = useState({
    id: "",
    brand_id: "",
    order_number: "",
    status: "Pending",
    items: [],
  });

  useEffect(() => {
    fetchOrders();
    fetchBrands();
    fetchTypes();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API}/purchaseorders`);
      setOrders(res.data || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await axios.get(`${API}/brands`);
      setBrands(res.data || []);
    } catch (err) {
      console.error("Failed to fetch brands:", err);
    }
  };

  const fetchTypes = async () => {
    try {
      const res = await axios.get(`${API}/types`);
      setTypes(res.data || []);
    } catch (err) {
      console.error("Failed to fetch types:", err);
      setTypes([]);
    }
  };

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

  const handleBrandChange = (e) => {
    const brandId = e.target.value;
    setForm({ ...form, brand_id: brandId, items: [] });
    fetchTyres(brandId);
  };

  const handleAddItem = () => {
    setForm({
      ...form,
      items: [
        ...form.items,
        { tyre_id: "", tyre_name: "", typeId: 0, qty: 1, price: 0, tubeless: true },
      ],
    });
  };

  const handleItemChange = (index, field, value) => {
    const items = [...form.items];
    if (["qty", "price", "typeId"].includes(field)) {
      value = Number(value);
    }
    items[index][field] = value;
    setForm({ ...form, items });
  };

  const handleRemoveItem = (index) => {
    const items = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items });
  };

  const resetForm = () => {
    setForm({ id: "", brand_id: "", order_number: "", status: "Pending", items: [] });
    setEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.brand_id || !form.order_number || form.items.length === 0) {
      alert("Please fill all fields and add at least one item.");
      return;
    }

    for (let i of form.items) {
      if (!i.tyre_name) {
        alert("Each item must have a tyre name.");
        return;
      }
      if (!i.typeId || i.typeId === 0) {
        alert("Each item must have a valid type.");
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

  const filteredOrders = orders.filter((o) => {
    const matchSearch = o.order_number.toLowerCase().includes(filters.search.toLowerCase());
    const matchBrand = filters.brand ? o.brand_id === Number(filters.brand) : true;
    const matchStatus = filters.status ? o.status === filters.status : true;
    return matchSearch && matchBrand && matchStatus;
  });

  const getOrderTotal = (order) =>
    order.PurchaseOrderItems?.reduce(
      (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0),
      0
    ) || 0;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-[#162570]">Purchase Orders</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-[#162570] text-white px-5 py-2 rounded-lg shadow hover:scale-105 transition-all"
        >
          <FaPlus className="inline mr-2" /> New PO
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <input
          type="text"
          placeholder="Search Order Number"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <select
          value={filters.brand}
          onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Orders Table */}
      <table className="w-full border-collapse border">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="border px-3 py-2 text-left">Order #</th>
            <th className="border px-3 py-2 text-left">Brand</th>
            <th className="border px-3 py-2 text-center">Status</th>
            <th className="border px-3 py-2 text-right">Total ₹</th>
            <th className="border px-3 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((o) => {
            const isExpanded = expandedRow === o.id;
            const total = getOrderTotal(o);

            return (
              <React.Fragment key={o.id}>
                <tr className="hover:bg-gray-50 transition">
                  <td className="border px-3 py-2">{o.order_number}</td>
                  <td className="border px-3 py-2">{o.Brand?.name || "—"}</td>
                  <td className="border px-3 py-2 text-center">{o.status}</td>
                  <td className="border px-3 py-2 text-right">₹{total.toFixed(2)}</td>
                  <td className="border px-3 py-2 text-center space-x-3">
                    <button
                      onClick={() => setExpandedRow(isExpanded ? null : o.id)}
                      className="text-gray-600 hover:text-blue-600"
                    >
                      {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                    <button onClick={() => handleEdit(o)} className="text-blue-500 hover:text-blue-700">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(o.id)} className="text-red-500 hover:text-red-700">
                      <FaTrash />
                    </button>
                  </td>
                </tr>

               {expandedRow === o.id && (
                <tr className="bg-gray-50">
                  <td colSpan="6" className="p-2">
                    <div className="space-y-1">
                      {o.PurchaseOrderItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center bg-blue-50 text-blue-900 p-2 rounded-lg shadow-sm border"
                        >
                          <p className="w-1/5 font-semibold">
                            {item.Tyre?.tyre_number || item.tyre_name || "—"}
                          </p>
                          <p className="w-1/5 text-center font-semibold">
                            Type:{" "}
                            {item.Tyre?.Type?.name ||
                              types.find((t) => t.id === item.Tyre?.typeId)?.name ||
                              "—"}
                          </p>
                          <p className="w-1/5 text-center font-semibold">
                            Qty: {item.quantity}
                          </p>
                          <p className="w-1/5 text-right">
                            Import Price: ₹{Number(item.price || 0).toFixed(2)}
                          </p>
                          <p className="w-1/5 text-right font-bold">
                            Tubeless: {item.Tyre?.tubeless ? "Yes" : "No"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
              </React.Fragment>
            );
          })}

          {filteredOrders.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center p-4 text-gray-500">
                No purchase orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[800px] max-h-[90vh] overflow-y-auto shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-[#162570]">
              {editing ? "Edit Purchase Order" : "New Purchase Order"}
            </h3>
            <form onSubmit={handleSubmit}>
              <label className="block mb-2 font-medium">Brand</label>
              <select
                value={form.brand_id}
                onChange={handleBrandChange}
                className="w-full border px-3 py-2 rounded mb-3"
                required
              >
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>

              <label className="block mb-2 font-medium">Order Number</label>
              <input
                type="text"
                value={form.order_number}
                onChange={(e) => setForm({ ...form, order_number: e.target.value })}
                className="w-full border px-3 py-2 rounded mb-3"
                required
              />

              <h4 className="font-semibold mb-2">Items</h4>
              {form.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2 border p-2 rounded flex-wrap">
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

                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                    className="w-20 border px-2 py-1 rounded"
                    required
                  />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => handleItemChange(idx, "price", e.target.value)}
                    className="w-24 border px-2 py-1 rounded"
                    required
                  />

                  <label className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={item.tubeless}
                      onChange={(e) => handleItemChange(idx, "tubeless", e.target.checked)}
                      disabled={!!item.tyre_id}
                    />
                    <span>Tubeless</span>
                  </label>

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
                <FaPlus className="inline mr-2" /> Add Item
              </button>

              <label className="block mt-4 mb-2 font-medium">Status</label>
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
                <button type="submit" className="bg-[#162570] text-white px-4 py-2 rounded">
                  {editing ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
