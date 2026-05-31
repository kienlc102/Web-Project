import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import LandingPage from '../components/LandingPage';
import ProductList from '../components/catalog/ProductList';
import ProductDetail from '../components/catalog/ProductDetail';
import CatalogProductList from '../components/catalog/CatalogProductList';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/product-list" element={<ProductList />} />
          <Route path="/product-detail/:slug" element={<ProductDetail />} />
          <Route path="/catalogs/:catalogId" element={<CatalogProductList />} />
          
          {/* Auth routes - redirect to home if already logged in */}
          <Route
            path="/login"
            element={
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            }
          />
          <Route
            path="/register"
            element={
              <ProtectedRoute requireAuth={false}>
                <Register />
              </ProtectedRoute>
            }
          />
          
          {/* Protected routes - require authentication */}
          {/* Add your protected routes here */}
          {/* Example:
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
