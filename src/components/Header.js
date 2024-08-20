
// src/components/Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // useAuth 훅 사용
import './Header.css';
import logo from '../assets/logo.png'; // 로고 이미지 경로 수정
import { FaBell } from "react-icons/fa";

const Header = () => {
  const { auth, clearAuth } = useAuth(); // 인증 상태와 clearAuth 함수 가져오기
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const handleBellClick = () => {
    navigate('/alarm'); // 알림 페이지로 이동
  };

  return (
    <div className="header">
      <div className="header-left">
        <Link to="/home" className="logo-link">
          <img src={logo} alt="MY LOVELY PET Logo" className="logo-image" />
        </Link>
      </div>
      <div className="header-right">
      <button className="bell-button" onClick={handleBellClick} aria-label="알림">
          <FaBell className='Bell' />
        </button>
        {auth && (
          <button className="header-button" onClick={handleLogout}>Log Out</button>
        )}
      </div>
    </div>
  );
};

export default Header;