import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import "./PhoneNumberInput.css";
import { API_BASE_URL } from "../service/PetapiService";

function PhoneNumberInput() {
  const navigate = useNavigate();
  const location = useLocation();
  const [phoneNum, setPhoneNum] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // 경고 메시지 상태 추가

  const paymentKey = location.state?.paymentKey || "";

  const handlePhoneNumberChange = (e) => {
    setPhoneNum(e.target.value);
    setErrorMessage(""); // 입력 시 에러 메시지 초기화
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 휴대폰 번호가 11자리인지 확인
    if (phoneNum.length !== 11) {
      setErrorMessage("휴대폰 번호는 11자리여야 합니다."); // 에러 메시지 설정
      return; // 제출 중단
    }
    try {
      const response = await fetch(`${API_BASE_URL}/payment/sendPaymentList`, { // 백틱 사용
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phoneNum: phoneNum,
          paymentKey: paymentKey
        })
      });

      if (!response.ok) {
        const json = await response.json();
        navigate(`/fail?message=${json.message}&code=${json.code}`);
        return;
      }

      const json = await response.json();
      navigate(`/success?phoneNumber=${phoneNum}`);
      handleGoToMain();

    } catch (error) {
      navigate(`/fail?message=알 수 없는 에러가 발생했습니다.&code=500`);
    }
  };

  const handleGoToMain = async () => {
    const sessionId = localStorage.getItem("sessionId");

    if (sessionId) {
      try {
        await axios.delete(`${API_BASE_URL}/cart/deleteCart`, { // 백틱 사용
          params: { sessionId }
        });
        localStorage.removeItem("sessionId");
      } catch (error) {
        alert("장바구니 항목을 삭제하는 중 오류가 발생했습니다.");
        return;
      }
    }

    navigate('/');
  };

  return (
    <div className="input-container">
      <div className="top-half"></div>
      <div className="bottom-half"></div>

      <div className="center-text-box">
        <h2>휴대폰 번호 입력</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="phone-number"></label>
            <input
              type="text"
              id="phone-number"
              className="phone_inputText"
              value={phoneNum}
              onChange={handlePhoneNumberChange}
              required
              placeholder="번호를 입력하세요"
            />
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>} {/* 경고 메시지 표시 */}
          <button type="submit">
            확인
          </button>
        </form>
      </div>
    </div>
  );
}

export default PhoneNumberInput;
