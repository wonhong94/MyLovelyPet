import React, { useEffect, useState } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import './App.css';
import MainPage from './Kioskpages/MainPage';
import PetPage from './Kioskpages/PetPage';
import PetHeader from './Kioskcomponents/PetHeader';
import PetFooter from './Kioskcomponents/PetFooter';
import { SuccessPage } from './Kioskpages/payment/Success';
import { CheckoutPage } from './Kioskpages/payment/CheckoutPage';
import { FailPage } from './Kioskpages/payment/Fail';
import PhoneNumberInput from './Kioskpages/PhoneNumberInput';
import Chatbot from './Kioskpages/Chatbot';

const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

const KioskRoutes = () => {
  const [tossPayments, setTossPayments] = useState(null);
  const location = useLocation();

  useEffect(() => {
    loadTossPayments(clientKey).then(tp => setTossPayments(tp));
  }, []);

  const showFooter = !location.pathname.includes('/success') && location.pathname !== '/';

  return (
    <>
      <PetHeader />
      <div style={{ minHeight: 'calc(100vh - 100px)' }}>
        <Routes>
          <Route path="/kioskHome" element={<MainPage />} />
          <Route path="/petPage" element={<PetPage />} />
          <Route path="/payment/checkout" element={<CheckoutPage tossPayments={tossPayments} />} />
          <Route path="/payment/success" element={<SuccessPage />} />
          <Route path="/fail" element={<FailPage />} />
          <Route path="/phone-number-input" element={<PhoneNumberInput />} />
          <Route path="/chat" element={<Chatbot />} />
          <Route path="/" element={<Navigate to="/kioskHome" />} />
        </Routes>
      </div>
      {showFooter && <PetFooter />}
    </>
  );
};

export default KioskRoutes;
