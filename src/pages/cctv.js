import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './cctv.css'; // 기존 CSS 파일 임포트

const StreamViewer = () => {
    const [streamUrl, setStreamUrl] = useState(null);
    const [motionData, setMotionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStreamUrl = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get('/petShop/stream', {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.status === 200) {
                    console.log('Stream URL from response:', response.data);
                    setStreamUrl(response.data);
                } else {
                    throw new Error('응답 오류');
                }
            } catch (err) {
                setError('스트림 URL을 가져오는 데 실패했습니다.');
                console.error('Stream fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        const fetchMotionData = async () => {
            try {
                const response = await axios.get('/petShop/motion', {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.status === 200) {
                    console.log('Motion data from response:', response.data);
                    setMotionData(response.data);
                } else {
                    throw new Error('응답 오류');
                }
            } catch (err) {
                setError('모션 데이터를 가져오는 데 실패했습니다.');
                console.error('Motion fetch error:', err);
            }
        };

        fetchStreamUrl(); // 스트림 URL 한 번 가져오기
        fetchMotionData(); // 초기 모션 데이터 가져오기

        const intervalId = setInterval(fetchMotionData, 15000);

        return () => clearInterval(intervalId);
    }, []); // 의존성 배열

    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>{error}</div>;

    // motionData가 "O"일 때 빨간색 그림자 설정
    const shadowStyle = motionData === "O" ? 'shadow-red' : 'shadow-normal';

    return (
        <div className={`cctv-container ${shadowStyle}`}>
            {streamUrl ? (
                <img
                    src={streamUrl}
                    alt="Live Stream"
                    className="cctv-video" // 기존 비디오 스타일 클래스 사용
                />
            ) : (
                <div>스트림이 없습니다</div>
            )}
            {motionData && (
                <div>

                </div>
            )}
        </div>
    );
};

export default StreamViewer;
