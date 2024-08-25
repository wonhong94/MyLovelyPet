import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import './Inspection.css';

// 모달 설정
Modal.setAppElement('#root');

const Inspection = () => {
  const [orders, setOrders] = useState(null); // 발주 내역 상태
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]); // 오늘 날짜로 초기화
  const [inspections, setInspections] = useState([]); // 검수 내역 상태
  const [modalIsOpen, setModalIsOpen] = useState(false); // 모달 상태
  const [inspectionData, setInspectionData] = useState(null); // 전송할 검수 데이터 상태

  const userIdx = localStorage.getItem('userIdx'); // 로컬 스토리지에서 userIdx 가져오기

  const fetchOrders = async (orderDate) => {
    try {
      const response = await axios.get(`/petShop/inspection/selectOrder/${userIdx}/${orderDate}`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders(null); // 에러가 발생하면 orders를 null로 설정
    }
  };

  useEffect(() => {
    fetchOrders(orderDate); // 컴포넌트가 로드될 때 및 날짜가 변경될 때 발주 내역을 가져옵니다.
  }, [orderDate]);

  const handleDateChange = (event) => {
    const newDate = event.target.value;
    setOrderDate(newDate); // 선택한 날짜를 상태에 저장합니다.
  };

  const handleInspectionChange = (itemIndex, field, value) => {
    const newInspections = inspections.map((inspect, index) =>
      index === itemIndex ? { ...inspect, [field]: value } : inspect
    );

    if (field === 'insCount') {
      const orderCount = orders.orderCount[itemIndex];
      const insCount = parseInt(value, 10);

      if (insCount === orderCount) {
        newInspections[itemIndex] = {
          ...newInspections[itemIndex],
          insDetail: '검수수량일치',
        };
      } else {
        newInspections[itemIndex] = {
          ...newInspections[itemIndex],
          insDetail: '검수수량부족',
        };
      }
    }

    setInspections(newInspections); // 검수 내역 상태를 업데이트합니다.
  };

  const addInspection = (itemIndex) => {
    if (!inspections[itemIndex]) {
      const newInspection = { 
        pdIdx: orders.pdIdx[itemIndex], 
        insCount: '', 
        insExDate: '', 
        insDetail: '', 
        insDate: orderDate // 발주된 날짜로 설정
      };
      const newInspections = [...inspections];
      newInspections[itemIndex] = newInspection;
      setInspections(newInspections); // 검수 항목을 추가합니다.
    }
  };

  const prepareInspectionData = () => {
    const data = {
      insCount: inspections.map(inspection => inspection.insCount),
      insDetail: inspections.map((inspection, index) =>
        inspection.insCount === orders.orderCount[index] ? '검수수량일치' : '검수수량부족'
      ),
      insExDate: inspections.map(inspection => inspection.insExDate),
      insDate: orderDate // 발주된 날짜로 설정
    };
    setInspectionData(data); // 전송할 검수 데이터를 상태에 저장합니다.
  };

  const handleSave = () => {
    prepareInspectionData(); // 데이터를 준비하고 모달을 엽니다.
    setModalIsOpen(true);
  };

  const confirmSave = async () => {
    try {
      const response = await axios.post(`/petShop/inspection/save/`, inspectionData); // 서버로 전송
      console.log('Inspection saved:', response.data);
      window.location.href = '/inspectionhistory'; // 검수 내역 페이지로 이동
    } catch (error) {
      console.error('Error saving inspection:', error);
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  return (
    <div className="inspection">
      <h2>검수하기</h2>
      <div className="date-selector">
        <label>발주날짜:</label>
        <input
          type="date"
          value={orderDate}
          onChange={handleDateChange} // 날짜 변경 시 핸들러 호출
        />
      </div>
      {orders ? (
        <>
          <div className="order-section">
            <table>
              <thead>
                <tr>
                  <th>상품 명</th>
                  <th>발주 수량</th>
                  <th>검수 수량</th>
                  <th>비고</th>
                </tr>
              </thead>
              <tbody>
                {orders.pdName.map((name, index) => (
                  <tr key={index}>
                    <td>{name}</td>
                    <td>{orders.orderCount[index]}</td>
                    <td>
                      <input
                        type="number"
                        value={inspections[index]?.insCount || ''}
                        onChange={e => handleInspectionChange(index, 'insCount', e.target.value)} // 검수 수량 변경 시 핸들러 호출
                        onFocus={() => addInspection(index)} // 포커스 시 검수 항목 추가
                      />
                    </td>
                    <td>
                      {inspections[index]?.insDetail || ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="save-button" onClick={handleSave}>저장하기</button>
        </>
      ) : (
        <p>검수 할 내역이 없습니다.</p>
      )}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="검수 완료"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>검수가 완료되었습니다</h2>
        <p>검수내역으로 넘어가시겠습니까?</p>
        <div className="modal-buttons">
          <button onClick={confirmSave}>YES</button>
          <button onClick={closeModal}>NO</button>
        </div>
      </Modal>
    </div>
  );
};

export default Inspection;