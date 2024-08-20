import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DailySalesList.css';

function DailySalesList() {
  const [dailySales, setDailySales] = useState([]);

  useEffect(() => {
    axios.get('/petShop/revenue/monthSales')
      .then(response => {
        // 응답에서 revenues를 추출하여 dailySales로 설정
        if (response.data && Array.isArray(response.data.revenues)) {
          setDailySales(response.data.revenues);
        } else {
          console.error('Unexpected data format:', response.data);
        }
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className="daily-sales">
      <h3>일일 매출</h3>
      <ul>
        {dailySales.map((sale, index) => (
          <li key={index}>
            {sale.rvDate} - {sale.rvTotalPrice.toLocaleString()}원
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DailySalesList;
