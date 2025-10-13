import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Brands from './pages/Brands';
import Types from './pages/Types';
import SalesOrders from './pages/SalesOrders';
import PurchaseOrders from './pages/PurchaseOrders';

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path='products' element={<Products />} />
        <Route path='brands' element={<Brands />} />
        <Route path='types' element={<Types />} />
        <Route path='salesorders' element={<SalesOrders />} />
        <Route path='purchaseorders' element={<PurchaseOrders />} />
      </Route>
    </Routes>
  );
}