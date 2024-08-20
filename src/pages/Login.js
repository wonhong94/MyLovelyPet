import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getToken, messaging } from '../config/firebase';  // FCM 관련 함수 및 객체 가져오기
import './Login.css';
import logo from '../assets/new_image_with_white_background_with_text.png';

const Login = () => {
  const [formData, setFormData] = useState({ id: '', password: '' });
  const { setAuth } = useAuth();
  const navigate = useNavigate();

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
      localStorage.setItem('authToken', token);

      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      console.log('Decoded payload:', payload);

      const subField = payload.sub;
      const userIdxMatch = subField.match(/userIdx=(\d+)/);
      const userIdx = userIdxMatch ? userIdxMatch[1] : null;

      if (userIdx) {
        localStorage.setItem('userIdx', userIdx);
        const fcmToken = await getFCMToken();
        if (fcmToken) {
          await sendTokenToServer(fcmToken, userIdx);
        }
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

  const getFCMToken = async () => {
    try {
      const fcmToken = await getToken(messaging, { vapidKey: 'BL6KXyECokYZsyngJgzfbs6l1K4vtAZvX3nflXYSUCyDyVVPWt0GjFXZAw_WDduO4k0BmlDb609czGUAQLHEs_A' });
      if (fcmToken) {
        console.log('FCM Token:', fcmToken);
        return fcmToken;
      } else {
        console.log('No registration token available. Request permission to generate one.');
        return null;
      }
    } catch (err) {
      console.error('An error occurred while retrieving token. ', err);
      return null;
    }
  };

  const sendTokenToServer = async (token, userIdx) => {
    try {
      await axios.post('/api/save-fcm-token', {
        token,
        userIdx,
      });
      console.log('FCM 토큰이 서버에 성공적으로 전송되었습니다.');
    } catch (err) {
      console.error('FCM 토큰 서버 전송 중 오류 발생:', err);
    }
  };

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  return (
    <div className="login-container">
      <img src={logo} alt="MY LOVELY PET Logo" className="login-logo" />
      <h2>로그인</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="input-divider"></div>
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
        <div className="input-divider"></div>
        <button type="submit" className="login-button">Login</button>
        <button onClick={handleSignUpClick} className="signup-button">Sign Up</button>
        <div className="secure-connection">Secure connection <span className="secure-icon">🔒</span></div>
      </form>
    </div>
  );
};

export default Login;
