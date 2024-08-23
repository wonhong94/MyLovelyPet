import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import FaceCapture from './facecapture'; // FaceCapture 컴포넌트 추가
import './SignUp.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    name: '',
    phone1: '010', // 전화번호 첫 번째 칸
    phone2: '',
    phone3: '',
    emailUser: '', // 이메일 사용자명
    emailDomain: 'naver.com', // 이메일 도메인 초기값
    customDomain: '', // 직접 입력 도메인
    businessNumber: '',
    businessStartDate: '',
    storeName: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [businessVerified, setBusinessVerified] = useState(false);
  const [showModal, setShowModal] = useState(false); // 모달 상태 추가
  const [faceImage, setFaceImage] = useState(null); // 얼굴 이미지 상태 추가
  const [passwordError, setPasswordError] = useState(''); // 비밀번호 오류 상태 추가
  const [passwordValid, setPasswordValid] = useState(''); // 비밀번호 조건 오류 상태 추가
  const [emailVerified, setEmailVerified] = useState(false); // 이메일 인증 상태
  const [verificationCode, setVerificationCode] = useState(''); // 사용자가 입력하는 인증 코드
  const [verificationModal, setVerificationModal] = useState(false); // 이메일 인증 모달 상태
  const [isCustomDomain, setIsCustomDomain] = useState(false); // 직접 입력 여부

  const navigate = useNavigate();
  const faceRecognitionButtonRef = useRef(null); // 안면 인식 버튼의 참조

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // 도메인 선택 시 "직접 입력"인 경우
    if (name === 'emailDomain') {
      setIsCustomDomain(value === '직접입력');
    }

    // 비밀번호 유효성 검사
    if (name === 'password') {
      const password = value;
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      const isValidLength = password.length >= 8 && password.length <= 16;
      const validConditions = [hasUpperCase || hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;

      if (!isValidLength || validConditions < 2) {
        setPasswordValid('비밀번호는 영문 대소문자, 숫자, 특수문자 중 2가지 이상을 포함하여 8자에서 16자로 입력해야 합니다.');
      } else {
        setPasswordValid('');
      }
    }

    // 비밀번호와 비밀번호 확인 일치 여부를 확인
    if (name === 'confirmPassword') {
      if (formData.password !== value) {
        setPasswordError('비밀번호가 일치하지 않습니다.');
      } else {
        setPasswordError('');
      }
    }
  };

  const verifyBusinessNumber = async () => {
    try {
      const requestData = {
        businesses: [
          {
            b_no: formData.businessNumber, // 문자열로 보냄
            start_dt: formData.businessStartDate.replace(/-/g, ''), // YYYY-MM-DD to YYYYMMDD
            p_nm: formData.name,
            p_nm2: "",
            b_nm: "",
            corp_no: "",
            b_sector: "",
            b_type: "",
            b_adr: ""
          }
        ]
      };

      const response = await axios.post('/petShop/user/business', requestData);

      const businessData = response.data.data[0];

      if (businessData.valid !== "02" && businessData.status.b_stt === "계속사업자") {
        alert('사업자 번호가 인증되었습니다.');
        setBusinessVerified(true);
      } else if (businessData.valid === "02") {
        alert('유효하지 않은 사업자 번호입니다. 다시 확인해주세요.');
        setBusinessVerified(false);
      } else if (businessData.status.b_stt !== "계속사업자") {
        alert('해당 사업자는 계속사업자가 아닙니다. 다시 확인해주세요.');
        setBusinessVerified(false);
      }
    } catch (error) {
      console.error('사업자 번호 인증 실패:', error);
      alert('사업자 번호 인증에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const handleEmailVerification = async () => {
    // 이메일 생성
    const email = `${formData.emailUser}@${isCustomDomain ? formData.customDomain : formData.emailDomain}`;
    
    try {
      // 이메일 인증 코드 요청
      await axios.get(`/petShop/user/sendEmailCode/${email}`);
      setVerificationModal(true); // 인증 모달 표시
    } catch (error) {
      console.error('이메일 인증 요청 실패:', error);
      alert('이메일 인증 요청에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const handleVerificationSubmit = async () => {
    // 이메일 생성
    const email = `${formData.emailUser}@${isCustomDomain ? formData.customDomain : formData.emailDomain}`;
  
    try {
      // 서버로 인증 코드 검증 요청
      const response = await axios.get(`/petShop/user/verifyEmailCode/${email}/${encodeURIComponent(String(verificationCode))}`);
  
      // 서버로부터 받은 응답을 콘솔에 출력
      console.log('서버 응답:', response.data);
  
      if (response.data === '성공')  {
        alert('이메일 인증이 완료되었습니다.');
        setEmailVerified('성공');
        setVerificationModal(false); // 모달 닫기
      } else if (response.data === '실패') {
        alert('인증 코드가 올바르지 않습니다. 다시 확인해 주세요.');
      }
    } catch (error) {
      console.error('이메일 인증 실패:', error);
      alert('이메일 인증에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailVerified) {
      alert('이메일을 인증해 주세요.');
      return;
    }

    if (!businessVerified) {
      alert('사업자 번호를 인증해 주세요.');
      return;
    }

    if (passwordError || passwordValid) {
      alert('비밀번호를 확인해 주세요.');
      return;
    }

    // 이메일 도메인 결정
    const email = `${formData.emailUser}@${isCustomDomain ? formData.customDomain : formData.emailDomain}`;

    const userData = {
      userPhone: `${formData.phone1}-${formData.phone2}-${formData.phone3}`,
      userEmail: email,
      userPw: formData.password,
      userBN: formData.businessNumber, // 문자열로 그대로 전송
      userName: formData.name,
      userStoreName: formData.storeName,
    };

    console.log("전송 데이터:", userData); // 데이터를 콘솔에 출력하여 확인

    try {
      const response = await axios.post('/petShop/user/userSave', userData);
      console.log('회원가입 성공:', response.data);

      if (faceImage) {
        // 얼굴 이미지가 있는 경우 서버로 전송 (사업자 번호를 경로에 포함)
        await axios.post(`/petShop/collectionFaceAdd/${encodeURIComponent(formData.businessNumber)}`, { image: faceImage });
        console.log("얼굴 이미지 전송 완료");
      }

      alert('회원가입이 성공적으로 완료되었습니다.');
      navigate('/login');
    } catch (error) {
      console.error('회원가입 실패:', error);

      if (error.response && error.response.data) {
        console.error('서버 응답:', error.response.data);
      }
      
      alert('회원가입에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const handleImageCapture = (image) => {
    setFaceImage(image); // 캡처된 얼굴 이미지를 상태로 저장
    setShowModal(false); // 얼굴 캡처 후 모달 닫기
  };

  const getModalPosition = () => {
    if (faceRecognitionButtonRef.current) {
      const buttonRect = faceRecognitionButtonRef.current.getBoundingClientRect();
      return {
        top: `${buttonRect.bottom + window.scrollY}px`,
        left: `${buttonRect.left + window.scrollX}px`
      };
    }
    return {};
  };

  return (
    <div className="signup-container">
      <h2>JOIN</h2>
      <div className="title-divider"></div>
      <h3>아래 회원가입 양식을 입력해주세요.</h3>
      <div className="title-divider"></div>
      <form onSubmit={handleSubmit} className="signup-form">
        <div className="signup-form-group">
          <label>이름 *</label>
          <div className="signup-input-wrapper">
            <input type="text" name="name" placeholder="이름" value={formData.name} onChange={handleChange} />
          </div>
        </div>
        <div className="input-divider"></div>

        <div className="signup-form-group">
          <label>사업등록 날짜 *</label>
          <div className="signup-input-wrapper">
            <input 
              type="date" 
              name="businessStartDate" 
              placeholder="YYYY-MM-DD" 
              value={formData.businessStartDate} 
              onChange={handleChange} 
              required 
              disabled={businessVerified} // 인증 후 비활성화
            />
            <small>사업등록 날짜를 입력하세요.</small>
          </div>
        </div>
        <div className="input-divider"></div>

        <div className="signup-form-group">
          <label>사업자 번호</label>
          <div className="signup-input-wrapper">
            <div className="input-row">
              <input 
                type="text" 
                name="businessNumber" 
                placeholder="사업자 번호" 
                value={formData.businessNumber} 
                onChange={handleChange} 
                disabled={businessVerified} // 인증 후 비활성화
              />
              <button 
                type="button" 
                onClick={verifyBusinessNumber} 
                disabled={businessVerified} // 인증 후 비활성화
                style={{ marginLeft: '10px' }}
              >
                인증
              </button>
            </div>
          </div>
        </div>
        <div className="input-divider"></div>

        <div className="signup-form-group">
          <label>이메일 *</label>
          <div className="signup-input-wrapper">
            <div className="input-row">
              <input
                type="text"
                name="emailUser"
                placeholder="user"
                value={formData.emailUser}
                onChange={handleChange}
                style={{ width: '120px' }} // 이메일 사용자명 입력 칸을 짧게 조정
              />
              @
              {isCustomDomain && (
                <input
                  type="text"
                  name="customDomain"
                  placeholder="직접 입력"
                  value={formData.customDomain}
                  onChange={handleChange}
                  style={{ width: '150px', marginLeft: '5px' }} // 도메인 직접 입력 칸을 짧게 조정
                />
              )}
              <select
                name="emailDomain"
                value={formData.emailDomain}
                onChange={handleChange}
                style={{ width: '150px', marginLeft: '5px' }} // 도메인 선택 칸을 짧게 조정
              >
                <option value="naver.com">naver.com</option>
                <option value="gmail.com">gmail.com</option>
                <option value="hanmail.net">hanmail.net</option>
                <option value="직접입력">직접입력</option>
              </select>
              <button type="button" onClick={handleEmailVerification} style={{ marginLeft: '10px' }}>
                인증
              </button>
            </div>
          </div>
        </div>
        <div className="input-divider"></div>

        <div className="signup-form-group">
          <label>비밀번호 *</label>
          <div className="signup-input-wrapper">
            <div className="password-container input-row">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                placeholder="Password" 
                value={formData.password} 
                onChange={handleChange} 
              />
              <span 
                className="toggle-password" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ marginLeft: '10px' }}
              >
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>
            {passwordValid && <small className="error-message">{passwordValid}</small>}
            <small>(영문 대소문자/숫자/특수문자 중 2가지 이상 조합, 8자~16자)</small>
          </div>
        </div>
        <div className="input-divider"></div>

        <div className="signup-form-group">
          <label>비밀번호 확인 *</label>
          <div className="signup-input-wrapper">
            <div className="password-container input-row">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                name="confirmPassword" 
                placeholder="Confirm Password" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
              />
              <span 
                className="toggle-password" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ marginLeft: '10px' }}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </span>
            </div>
            {passwordError && <small className="error-message">{passwordError}</small>}
          </div>
        </div>
        <div className="input-divider"></div>
        <div className="signup-form-group">
          <label>전화번호 *</label>
          <div className="signup-input-wrapper">
            <div className="phone-container input-row">
              <input
                type="text"
                name="phone1"
                placeholder="010"
                value={formData.phone1}
                onChange={handleChange}
                maxLength="3"
                style={{ width: '60px' }} // 전화번호 입력 칸을 짧게 조정
              />
              -
              <input
                type="text"
                name="phone2"
                placeholder="0000"
                value={formData.phone2}
                onChange={handleChange}
                maxLength="4"
                style={{ width: '80px', marginLeft: '5px' }} // 전화번호 입력 칸을 짧게 조정
              />
              -
              <input
                type="text"
                name="phone3"
                placeholder="0000"
                value={formData.phone3}
                onChange={handleChange}
                maxLength="4"
                style={{ width: '80px', marginLeft: '5px' }} // 전화번호 입력 칸을 짧게 조정
              />
            </div>
          </div>
        </div>
        <div className="input-divider"></div>

        <div className="signup-form-group">
          <label>매장명</label>
          <div className="signup-input-wrapper">
            <input type="text" name="storeName" placeholder="매장명" value={formData.storeName} onChange={handleChange} />
          </div>
        </div>
        <div className="input-divider"></div>

        <div className="signup-form-group">
          <label>안면 인식</label>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            ref={faceRecognitionButtonRef}
          >
            안면 인식
          </button>
        </div>

        <button type="submit">회원가입</button>
      </form>

      {/* 모달 창 */}
      {showModal && (
  <div className="modal modal-lower">
    <div className="modal-content">
      <span className="close" onClick={() => setShowModal(false)}>&times;</span>
      <FaceCapture onImageCapture={handleImageCapture} />
    </div>
  </div>
)}

      {/* 이메일 인증 모달 창 */}
      {verificationModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setVerificationModal(false)}>&times;</span>
            <h3>이메일 인증</h3>
            <p>이메일로 전송된 인증번호를 입력하세요.</p>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="인증번호 입력"
            />
            <button onClick={handleVerificationSubmit}>확인</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUp;
