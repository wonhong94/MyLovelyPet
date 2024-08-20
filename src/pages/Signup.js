import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    name: '',
    phonePrefix: '010',
    phone: '',
    email: '',
    businessNumber: '',
    storeName: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 서버에 보낼 데이터 형식
    const userData = {
      userPhone: `${formData.phonePrefix}-${formData.phone}`,
      userEmail: formData.email,
      userPw: formData.password,
      userBN: parseInt(formData.businessNumber, 10), // 사업자번호가 숫자로 변환됨을 확인
      userName: formData.name,
      userStoreName: formData.storeName
    };

    console.log("전송 데이터:", userData); // 디버깅용 로그

    try {
      const response = await axios.post('/petShop/user/userSave', userData);
      console.log('회원가입 성공:', response.data);
      alert('회원가입이 성공적으로 완료되었습니다.');
      navigate('/login'); // 회원가입 성공 시 로그인 페이지로 이동
    } catch (error) {
      console.error('회원가입 실패:', error);
      if (error.response && error.response.data) {
        console.error('서버 응답:', error.response.data);
      }
      alert('회원가입에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <div className="signup-container">
      <h2>JOIN</h2>
      <div className="title-divider"></div>
      <h3>아래 회원가입 양식을 입력해주세요.</h3>
      <div className="title-divider"></div>
      <form onSubmit={handleSubmit} className="signup-form">
        <div className="form-group">
          <label>이름 *</label>
          <div className="input-wrapper">
            <input type="text" name="name" placeholder="이름" value={formData.name} onChange={handleChange} />
          </div>
        </div>
        <div className="input-divider"></div>

        <div className="form-group">
          <label>이메일 *</label>
          <div className="input-wrapper">
            <input type="email" name="email" placeholder="user@domain.com" value={formData.email} onChange={handleChange} />
          </div>
        </div>
        <div className="input-divider"></div>

        <div className="form-group">
          <label>비밀번호 *</label>
          <div className="input-wrapper">
            <div className="password-container">
              <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
              <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>{showPassword ? '🙈' : '👁️'}</span>
            </div>
            <small>(영문 대소문자/숫자/특수문자 중 3가지 이상 조합, 8자~16자)</small>
          </div>
        </div>
        <div className="input-divider"></div>

        <div className="form-group">
          <label>비밀번호 확인 *</label>
          <div className="input-wrapper">
            <div className="password-container">
              <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} />
              <span className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? '🙈' : '👁️'}</span>
            </div>
          </div>
        </div>
        <div className="input-divider"></div>

        <div className="form-group">
          <label>휴대전화 *</label>
          <div className="input-wrapper">
            <div className="phone-container">
              <select name="phonePrefix" value={formData.phonePrefix} onChange={handleChange}>
                <option value="010">010</option>
                <option value="011">011</option>
                <option value="017">017</option>
              </select>
              <input type="text" name="phone" placeholder="0000-0000" value={formData.phone} onChange={handleChange} />
            </div>
            <small>휴대폰 번호를 입력하세요.</small>
          </div>
        </div>
        <div className="input-divider"></div>

        <div className="form-group">
          <label>사업자 번호</label>
          <div className="input-wrapper">
            <input type="text" name="businessNumber" placeholder="사업자 번호" value={formData.businessNumber} onChange={handleChange} />
          </div>
        </div>
        <div className="input-divider"></div>

        <div className="form-group">
          <label>매장명</label>
          <div className="input-wrapper">
            <input type="text" name="storeName" placeholder="매장명" value={formData.storeName} onChange={handleChange} />
          </div>
        </div>
        <div className="input-divider"></div>

        <button type="submit">회원가입</button>
      </form>
    </div>
  );
};

export default SignUp;
