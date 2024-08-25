import React, { useEffect, useRef, useState } from 'react';
import './QRCodeScanner.css'
import jsQR from 'jsqr';
import Swal from 'sweetalert2';
import axios from 'axios';

const QRCodeScanner = ({ sessionId, onCartUpdated }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const isScanningRef = useRef(false); // 스캔 상태를 관리하는 useRef
    const [lastScannedCode, setLastScannedCode] = useState('');
    const scanInterval = 2000;

    useEffect(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        const scanQRCode = () => {
            if (video.readyState === video.HAVE_ENOUGH_DATA && !isScanningRef.current) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "dontInvert",
                });

                if (code) {
                    const qrCodeText = code.data.trim();

                    // 직전 QR 코드와 비교하여 중복 스캔 방지
                    // if (qrCodeText === lastScannedCode) {
                    //     console.log("Duplicate QR Code scanned: ", qrCodeText);
                    //     return; // 중복된 코드이므로 무시
                    // }

                    // 스캔 중 상태를 동기적으로 처리
                    isScanningRef.current = true;
                    setLastScannedCode(qrCodeText);

                    // 비디오 일시 정지
                    // video.pause();

                    axios.post('/api/petShop/cart/addCart', {
                        qrCodeText: qrCodeText,
                        sessionId: sessionId
                    }, {
                        headers: {
                            'Content-Type': 'application/json; charset=UTF-8'
                        },
                        withCredentials: true
                    })
                        .then(response => {
                            // alert(response.data.message);
                            Swal.fire({
                                title: '상품 추가 성공',
                                text: '상품이 성공적으로 추가되었습니다.',
                                icon: 'success',
                                confirmButtonText: '확인'
                            });
                            onCartUpdated();
                        })
                        .catch(error => {
                            // alert('Error: ' + error.message);
                            Swal.fire({
                                title: '상품 추가 실패',
                                text: '등록되지않은 상품이에요. 다시 확인해주세요',
                                icon: 'error',
                                confirmButtonText: '확인'
                            });
                        })
                        .finally(() => {
                            // 이 부분에서 스캔 상태를 해제하고 비디오를 재개
                            setTimeout(() => {
                                isScanningRef.current = false; // 스캔 완료 후 다시 스캔 가능
                                // setLastScannedCode('');
                                video.play().catch(err => console.error("Video play error: ", err)); // 비디오 재개
                            }, scanInterval);
                        });
                }
            }

            // requestAnimationFrame을 통해 다음 스캔을 준비
            requestAnimationFrame(scanQRCode);
        };

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    frameRate: { ideal: 30, max: 60 } // 프레임 레이트를 30~60fps로 설정
                }
            })
                .then(stream => {
                    video.srcObject = stream;
                    video.setAttribute("playsinline", true); // iOS에서 전체 화면 모드 방지

                    video.onloadedmetadata = () => {
                        video.play().catch(error => {
                            console.error('Error trying to play video:', error);
                        });
                    };

                    scanQRCode(); // 스캔 시작
                })
                .catch(err => {
                    console.error('Error accessing camera: ', err);
                    // alert('Error accessing camera: ' + err.message);
                    Swal.fire({
                        title: '카메라 오류',
                        text: '카메라 동작에 문제가 있어요.',
                        icon: 'error',
                        confirmButtonText: '확인'
                    });
                });
        } else {
            alert('Sorry, your browser does not support getUserMedia');
        }

    }, [sessionId, onCartUpdated, scanInterval]);

    return (
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: 'auto' }}>
            <video id="video" ref={videoRef} className="video" playsInline></video>
            <canvas id="canvas" ref={canvasRef} className="canvas"></canvas>
        </div>
    );
};

export default QRCodeScanner;
