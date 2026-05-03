import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from '../components/LandingPage';
import CatalogProductList from '../components/catalog/CatalogProductList';
import ProductDetail from '../components/catalog/ProductDetail';
import ProductList from '../components/catalog/ProductList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/product-list" element={<ProductList />} />
        <Route path="/product-detail/:slug" element={<ProductDetail />} />
        <Route path="/catalogs/:catalogId" element={<CatalogProductList />} />
      </Routes>
    </Router>
  );
}

export default App;
