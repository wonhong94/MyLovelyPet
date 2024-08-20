import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './Orders.css';
import axios from 'axios';

// 모달 설정
Modal.setAppElement('#root');

const Orders = () => {
  const [stockData, setStockData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [totalOrderQuantity, setTotalOrderQuantity] = useState(0);

  // 서버에서 재고 데이터를 가져오는 함수
  const fetchStockData = async () => {
    const token = localStorage.getItem('authToken'); // 로컬 스토리지에서 토큰 가져오기

    try {
      const response = await axios.get('/petShop/orders/selectStock', {
        headers: {
          'Authorization': `Bearer ${token}` // 요청 헤더에 토큰 포함
        }
      });
      setStockData(response.data);
      setOrders(response.data.flat().map(product => ({ ...product, orderCount: 0 })));
    } catch (error) {
      console.error('Failed to fetch stock data:', error.message);
      setError('데이터를 불러오는데 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, []);

  const handleOrderQuantityChange = (id, value) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.product.pdIdx === id ? { ...order, orderCount: value } : order
      )
    );
  };

  const handleOrderSubmit = async () => {
    const token = localStorage.getItem('authToken'); // 로컬 스토리지에서 토큰 가져오기
    const lastOrderDate = localStorage.getItem('lastOrderDate'); // 마지막 발주 날짜 가져오기
    const today = new Date().toISOString().split('T')[0];

    // 하루에 한 번만 발주할 수 있도록 확인
    if (lastOrderDate === today) {
      alert('하루에 한 번만 발주할 수 있습니다.');
      return;
    }

    const filteredOrders = orders.filter(order => order.orderCount > 0);
    if (filteredOrders.length === 0) {
      alert('발주 수량이 1 이상인 상품이 없습니다.');
      return;
    }
    const totalOrderQuantity = filteredOrders.reduce((total, order) => total + order.orderCount, 0);
    setTotalOrderQuantity(totalOrderQuantity);

    const orderData = {
      orderDate: today,
      pdIdx: filteredOrders.map(order => order.product.pdIdx),
      pdName: filteredOrders.map(order => order.product.pdName),
      ctgNum2: filteredOrders.map(order => order.product.category.ctgNum2),
      stCount: filteredOrders.map(order => order.stCount),
      orderCount: filteredOrders.map(order => order.orderCount),
    };

    console.log('Saving order data to server:', orderData); // 디버깅 로그 추가

    try {
      await axios.post('/petShop/orders/save', orderData, {
        headers: {
          'Authorization': `Bearer ${token}` // 요청 헤더에 토큰 포함
        }
      });
      localStorage.setItem('lastOrderDate', today); // 발주가 성공적으로 이루어지면 발주 날짜를 저장
      setModalIsOpen(true);
      setOrders(orders.map(order => ({ ...order, orderCount: 0 })));
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const categories = ['공통', '강아지', '고양이'];

  return (
    <div className="orders">
      <h2>발주 신청</h2>
      {categories.map((category, catIndex) => (
        <div key={catIndex} className="category-section">
          <h3>{category}</h3>
          <table className='ordertable'>
            <thead>
              <tr>
                <th>상품 명</th>
                <th>상품 카테고리</th>
                <th>보유 수량</th>
                <th>최소수량</th>
                <th>발주 수량</th>
              </tr>
            </thead>
            <tbody>
              {stockData
                .flat()
                .filter(stock => stock.product.category.ctgNum1 === category)
                .map((stock, index) => (
                  <tr key={stock.product.pdIdx || index}>
                    <td>{stock.product.pdName}</td>
                    <td>{stock.product.category.ctgNum2}</td>
                    <td>{stock.stCount}</td>
                    <td>{stock.product.pdLimit}</td>
                    <td>
                      <input
                        type="number"
                        value={orders.find(order => order.product.pdIdx === stock.product.pdIdx)?.orderCount || 0}
                        onChange={e => handleOrderQuantityChange(stock.product.pdIdx, parseInt(e.target.value, 10))}
                        min="0"
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ))}
      <button onClick={handleOrderSubmit}>발주하기</button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Order Confirmation"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>발주가 완료되었습니다.</h2>
        <p>총 발주 수량: {totalOrderQuantity}개</p>
        <p>발주내역페이지로 넘어가겠습니까?</p>
        <button onClick={() => { window.location.href = '/ordershistory'; }}>Yes</button>
        <button onClick={() => { window.location.href = '/home'; }}>No</button>
      </Modal>
    </div>
  );
};

export default Orders;
