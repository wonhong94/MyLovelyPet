// src/components/alarm.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './alarm.css'; // CSS 파일 추가

const Alarm = () => {
  const [noticeList, setNoticeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlarms = async () => {
      try {
        const response = await axios.get('/petShop/notice/findAll');
        if (response.status === 200) {
          setNoticeList(response.data);
        } else {
          throw new Error('알림을 가져오는 데 실패했습니다.');
        }
      } catch (err) {
        setError('알림 데이터를 가져오는 데 실패했습니다.');
        console.error('Alarm fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlarms();
  }, []);

  
  if (error) return <div>{error}</div>;

  return (
    <div className="alarm-container">
      <h2>알림 페이지</h2>
      {noticeList.length > 0 ? (
        <div className="alarm-list">
          {noticeList.map((item, index) => (
            <div key={index} className="alarm-card">
              <p className="alarm-date">{new Date(item.createdAt).toLocaleString()}</p>
              <p className="alarm-body">{item.body}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>알림이 없습니다.</p>
      )}
    </div>
  );
};

export default Alarm;
