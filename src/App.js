
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Home from './pages/Home';
import Orders from './pages/Orders';
import OrdersHistory from './pages/OrdersHistory';
import Stock from './pages/Stock';
import Inspection from './pages/Inspection';
import InspectionHistory from './pages/InspectionHistory';
import SignUp from './pages/Signup';
import Login from './pages/Login';
import SalesPage from './pages/SalesPage';
import CCTV from './pages/cctv';
import Alarm from './components/alarm';

// import ProductUpdate from './pages/ProductUpdate';
// import ProductDelete from '. /pages/ProductDelete';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import './App.css';
import ProductManagement from './pages/ProductManagement';

const AppContent = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {!isAuthPage && <Header />}
      {!isAuthPage && <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}
      {!isAuthPage && (
        <button className="toggle-sidebar-button" onClick={toggleSidebar}>
          {isSidebarOpen ? 'X' : '>'}
        </button>
      )}
      <div className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<Navigate to="/home" />} />
          
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
          <Route path="/ordershistory" element={<PrivateRoute><OrdersHistory /></PrivateRoute>} />
          <Route path="/stock" element={<PrivateRoute><Stock /></PrivateRoute>} />
          <Route path="/inspection" element={<PrivateRoute><Inspection /></PrivateRoute>} />
          <Route path="/inspectionhistory" element={<PrivateRoute><InspectionHistory /></PrivateRoute>} />
          <Route path="/productManagement" element={<PrivateRoute><ProductManagement /></PrivateRoute>} />
          <Route path="/salesPage" element={<PrivateRoute><SalesPage /></PrivateRoute>} />
          {/* <Route path="/productUpdate" element={<PrivateRoute><ProductUpdate /></PrivateRoute>} />
          <Route path="/productDelete" element={<PrivateRoute><ProductDelete /></PrivateRoute>} /> */}
          <Route path="/alarm" element={<PrivateRoute><Alarm /></PrivateRoute>} />
          <Route path="/cctv" element={<PrivateRoute><CCTV /></PrivateRoute>} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
