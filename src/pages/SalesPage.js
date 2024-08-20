// src/pages/SalesPage.js
import React from 'react';
import Sidebar from '../components/Sidebar';
import MonthlySalesChart from '../components/MonthlySalesChart';

import './SalesPage.css';

function SalesPage() {
  return (
    <div className="sales-page">
      <Sidebar />
      <div className="content">
        <MonthlySalesChart />
        
      </div>
    </div>
  );
}

export default SalesPage;
