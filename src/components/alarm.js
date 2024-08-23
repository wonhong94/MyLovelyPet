// src/components/alarm.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './alarm.css'; // 필요에 따라 CSS 파일을 추가

const Alarm = () => {
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlarms = async () => {
      try {
        const response = await axios.get('/petShop/notice/findAll'); // API 엔드포인트 수정
        if (response.status === 200) {
          setAlarms(response.data); // 응답 데이터를 상태에 저장
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

    fetchAlarms(); // 알림 데이터 가져오기
  }, []); // 의존성 배열

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="alarm-container">
      <h2>알림 페이지</h2>
      {/* 알림 내용 추가 */}
      {alarms.length > 0 ? (
        <ul>
          {alarms.map((alarm, index) => (
            <li key={index}>{alarm.message}</li> // 각 알림 메시지를 리스트로 표시
          ))}
        </ul>
      ) : (
        <p>알림이 없습니다.</p>
      )}
    </div>
  );
};

export default Alarm;