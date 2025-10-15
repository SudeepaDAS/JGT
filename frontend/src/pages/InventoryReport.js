import React, { useEffect, useState } from "react";
import axios from "axios";
import ENV from "../env"; // your global config

const API = ENV.API_URL;

export default function InventoryReport() {
  const [report, setReport] = useState([]);
  const [brands, setBrands] = useState([]);
  const [types, setTypes] = useState([]);
  const [filters, setFilters] = useState({
    brandId: "",
    typeId: "",
    tubeless: "",
    minQty: "",
    maxQty: "",
  });
  const [totals, setTotals] = useState({ totalQty: 0, totalValue: 0 });
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, totalPages: 1 });

  // Fetch filter data
  useEffect(() => {
    axios.get(`${API}/brands`).then((res) => setBrands(res.data));
    axios.get(`${API}/types`).then((res) => setTypes(res.data));
  }, []);

  // Fetch report data
  const fetchReport = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, pageSize: pagination.pageSize };

      if (filters.brandId) params.brandId = filters.brandId;
      if (filters.typeId) params.typeId = filters.typeId;
      if (filters.tubeless) params.tubeless = filters.tubeless;
      if (filters.minQty) params.minQty = filters.minQty;
      if (filters.maxQty) params.maxQty = filters.maxQty;

      const res = await axios.get(`${API}/inventory-report`, { params });
      setReport(res.data.data || []);
      setTotals(res.data.totals || { totalQty: 0, totalValue: 0 });
      setPagination(res.data.pagination || { page: 1, pageSize: 10, totalPages: 1 });
    } catch (err) {
      console.error("Error fetching report:", err);
      alert("Failed to load inventory report!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchReport(1);
  };

  const handleRefresh = () => {
    setFilters({ brandId: "", typeId: "", tubeless: "", minQty: "", maxQty: "" });
    fetchReport(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchReport(newPage);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">📦 Inventory Report</h2>

      {/* Filter Section */}
      <form
        onSubmit={handleSearch}
        className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded-lg mb-6 shadow-sm" style={{"margin-bottom": "2px"}}
      >
        <select
          name="brandId"
          value={filters.brandId}
          onChange={handleFilterChange}
          className="border p-2 rounded w-48"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          name="typeId"
          value={filters.typeId}
          onChange={handleFilterChange}
          className="border p-2 rounded w-48"
        >
          <option value="">All Types</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <select
          name="tubeless"
          value={filters.tubeless}
          onChange={handleFilterChange}
          className="border p-2 rounded w-48"
        >
          <option value="">All Tyres</option>
          <option value="true">Tubeless</option>
          <option value="false">With Tube</option>
        </select>

        <input
          type="number"
          name="minQty"
          placeholder="Min Qty"
          value={filters.minQty}
          onChange={handleFilterChange}
          className="border p-2 rounded w-24"
        />
        <input
          type="number"
          name="maxQty"
          placeholder="Max Qty"
          value={filters.maxQty}
          onChange={handleFilterChange}
          className="border p-2 rounded w-24"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Apply Filters
        </button>

      {/* Refresh / Reset Button */}
        <button
        type="button"
        onClick={() => {
            // ✅ Reset all filters including minQty and maxQty
            setFilters({
            brandId: "",
            typeId: "",
            tubeless: "",
            minQty: "",
            maxQty: "",
            });

            // ✅ Fetch report without filters
            const fetchAllReport = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${API}/inventory-report`);
                setReport(res.data.data || []);
                setTotals(res.data.totals || { totalQty: 0, totalValue: 0 });
                setPagination(res.data.pagination || { page: 1, pageSize: 10, totalPages: 1 });
            } catch (err) {
                console.error(err);
                alert("Failed to refresh report!");
            } finally {
                setLoading(false);
            }
            };

            fetchAllReport();
        }}
        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
        Refresh
        </button>
      </form>

      {/* Table Section */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="bg-white border rounded-lg shadow-md" style={{width:"98%",margin:"0 auto"}}>
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="py-2 px-3 text-left">#</th>
                <th className="py-2 px-3 text-left">Tyre Number</th>
                <th className="py-2 px-3 text-left">Brand</th>
                <th className="py-2 px-3 text-left">Type</th>
                <th className="py-2 px-3 text-right">Quantity</th>
                <th className="py-2 px-3 text-right">Price</th>
                <th className="py-2 px-3 text-right">Stock Value</th>
                <th className="py-2 px-3 text-center">Tubeless</th>
              </tr>
            </thead>
            <tbody>
              {report.length > 0 ? (
                report.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="py-2 px-3">{index + 1}</td>
                    <td className="py-2 px-3">{item.tyreNumber}</td>
                    <td className="py-2 px-3">{item.brand}</td>
                    <td className="py-2 px-3">{item.type}</td>
                    <td className="py-2 px-3 text-right">{item.quantity}</td>
                    <td className="py-2 px-3 text-right">₹{item.price}</td>
                    <td className="py-2 px-3 text-right font-semibold">
                      ₹{item.stockValue.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {item.tubeless ? "✅" : "❌"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-gray-500">
                    No data found.
                  </td>
                </tr>
              )}
            </tbody>

            {report.length > 0 && (
              <tfoot className="bg-gray-100 font-semibold">
                <tr>
                  <td colSpan="1" className="py-2 px-3 text-right">Totals:</td>
                  <td colSpan="3" className="py-2 px-3 text-right"></td>
                  <td className="py-2 px-3 text-right">{totals.totalQty}</td>
                  <td></td>
                  <td className="py-2 px-3 text-right">
                    ₹{totals.totalValue.toLocaleString()}
                  </td>
                  <td colSpan="1" className="py-2 px-3 text-right"></td>
                </tr>
              </tfoot>
            )}
          </table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
