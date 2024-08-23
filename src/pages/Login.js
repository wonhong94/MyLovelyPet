import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FaceCapture from './facecapture'; // FaceCapture 컴포넌트 임포트
import './Login.css';
import logo from '../assets/new_image_with_white_background_with_text.png';

const Login = () => {
  const [formData, setFormData] = useState({ id: '', password: '' });
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [faceImage, setFaceImage] = useState(null); // 얼굴 이미지 상태 추가
  const [startCapture, setStartCapture] = useState(false); // 캡처 시작 여부 상태 추가

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('로그인 데이터:', formData);

    try {
      const response = await axios.post('/petShop/authenticate', {
        userEmail: formData.id,
        userPw: formData.password,
      });

      console.log('서버 응답:', response);
      const { token } = response.data;
      if (!token) {
        throw new Error('서버에서 유효한 토큰을 받지 못했습니다.');
      }

      localStorage.setItem('authToken', token);

      const userIdx = extractUserIdxFromToken(token);
      if (userIdx) {
        localStorage.setItem('userIdx', userIdx);
      } else {
        console.error('userIdx가 페이로드에 없습니다.');
      }

      setAuth(token);
      navigate('/home');
    } catch (error) {
      console.error('로그인 실패:', error);
      alert('로그인에 실패했습니다.');
    }
  };

  const handleFaceLogin = () => {
    setStartCapture(true); // 얼굴 인식 로그인을 위해 캡처 시작
  };

  useEffect(() => {
    if (faceImage) {
      (async () => {
        try {
          const response = await axios.post(`/petShop/compareFace`, { image: faceImage });

          console.log('서버 응답:', response);
          const { token } = response.data;
          if (!token) {
            throw new Error('서버에서 유효한 토큰을 받지 못했습니다.');
          }

          localStorage.setItem('authToken', token);

          const userIdx = extractUserIdxFromToken(token);
          if (userIdx) {
            localStorage.setItem('userIdx', userIdx);
          } else {
            console.error('userIdx가 페이로드에 없습니다.');
          }

          setAuth(token);
          navigate('/home');
        } catch (error) {
          console.error('얼굴 인식 로그인 실패:', error);
          alert('얼굴 인식 로그인에 실패했습니다.');
        }
      })();
    }
  }, [faceImage]);

  const extractUserIdxFromToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      console.log('Decoded payload:', payload);

      const subField = payload.sub || '';
      const userIdxMatch = subField.match(/userIdx=(\d+)/);
      return userIdxMatch ? userIdxMatch[1] : null;
    } catch (err) {
      console.error('JWT 디코딩 실패:', err);
      alert('로그인 중 문제가 발생했습니다. 다시 시도해 주세요.');
      return null;
    }
  };

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  const handleImageCapture = (image) => {
    setFaceImage(image); // 캡처된 얼굴 이미지를 상태로 저장
  };

  return (
    <div className="login-container">
      <img src={logo} alt="MY LOVELY PET Logo" className="login-logo" />
     
      <div className="login-content">
        <div className="face-capture-container">
          <FaceCapture onImageCapture={handleImageCapture} startCapture={startCapture} />
          <button type="button" className="face-login-button" onClick={handleFaceLogin}>얼굴 인식 로그인</button>
        </div>
        <div className="vertical-divider"></div> {/* 세로 구분선 추가 */}
        <div className="login-form-container">
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <input
                type="email"
                name="id"
                placeholder="Email"
                value={formData.id}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="PASSWORD"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="login-button">로그인</button>
            <button type="button" onClick={handleSignUpClick} className="signup-button">회원가입</button>
            
            <div className="secure-connection">Secure connection <span className="secure-icon">🔒</span></div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
