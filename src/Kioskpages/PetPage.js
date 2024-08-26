import React, { useContext, useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import { FaRegTrashAlt } from "react-icons/fa";
import './PetPage.css';
import QRCodeScanner from '../Kioskcomponents/QRCodeScanner';
import Swal from 'sweetalert2';
import { debounce } from 'lodash';

const PetPage = () => {
  const { items, setItems, allCart, setAllCart } = useContext(UserContext);
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();
  const [pendingUpdates, setPendingUpdates] = useState([]);

  const getSessionId = useCallback(() => {
    if (typeof window !== 'undefined') {
      let sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        sessionId = generateUUID();
        localStorage.setItem("sessionId", sessionId);
      }
      return sessionId;
    }
    return null;
  }, []);

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const fetchCartList = useCallback(async () => {
    try {
      const sessionId = getSessionId();
      const response = await axios.get('/api/petShop/cart/cartList', {
        params: { sessionId }
      });

      if (response.status !== 200) {
        throw new Error(`Network response was not ok: ${response.statusText} (${response.status})`);
      }
      const data = response.data;
      setAllCart(data);
      setItems(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [getSessionId, setAllCart, setItems]);

  useEffect(() => {
    fetchCartList();
  }, [fetchCartList]);

  const totalPriceMemo = useMemo(() => {
    return items.reduce((sum, item) => sum + item.pdPrice * item.cartCount, 0);
  }, [items]);

  useEffect(() => {
    setTotalPrice(totalPriceMemo);
  }, [totalPriceMemo]);

  const debouncedUpdateCartOnServer = useCallback(
    debounce((sessionId, pdIdx, cartCount) => {
      axios.put('/api/petShop/cart/updateCart', [
        {
          sessionId,
          pdIdx,
          cartCount
        }
      ]).catch(error => {
        console.error('Error updating cart on server:', error);
        Swal.fire({
          title: '수량 변경 오류',
          text: '수량 변경에 실패했습니다. 다시 시도해 주세요.',
          icon: 'error',
          confirmButtonText: '확인'
        });
        // alert('장바구니를 업데이트하는 중 오류가 발생했습니다. 다시 시도해 주세요.');
      });
    }, 300), []
  );

  const handleRemoveItem = useCallback(async (pdIdx) => {
    const sessionId = getSessionId();

    const updatedItems = items.filter(item => item.pdIdx !== pdIdx);
    setAllCart(updatedItems);
    setItems(updatedItems);

    setPendingUpdates(prev => prev.filter(update => update.pdIdx !== pdIdx));

    try {
      await axios.delete('/api/petShop/cart/deleteCartItem', {
        params: { sessionId, pdIdx }
      });
      Swal.fire({
        title: '상품 삭제',
        text: '상품 삭제에 성공했습니다.',
        icon: 'success',
        confirmButtonText: '확인'
      });
    } catch (error) {
      console.error('Error removing item from the server:', error);
      Swal.fire({
        title: '수량 삭제 오류',
        text: '수량 삭제에 실패했습니다. 다시 시도해 주세요.',
        icon: 'error',
        confirmButtonText: '확인'
      });
      // alert('서버에서 항목을 삭제하는 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  }, [getSessionId, items]);

  const handlecartCountChange = useCallback((pdIdx, delta) => {
    const updatedItems = items.map(item =>
      item.pdIdx === pdIdx ? { ...item, cartCount: Math.max(1, item.cartCount + delta) } : item
    );

    setAllCart(updatedItems);
    setItems(updatedItems);

    const updatedItem = updatedItems.find(item => item.pdIdx === pdIdx);
    if (updatedItem) {
      setPendingUpdates(prev => {
        const existingUpdate = prev.find(update => update.pdIdx === pdIdx);
        if (existingUpdate) {
          return prev.map(update =>
            update.pdIdx === pdIdx ? { ...update, cartCount: updatedItem.cartCount } : update
          );
        }
        return [...prev, { sessionId: getSessionId(), pdIdx, cartCount: updatedItem.cartCount }];
      });

      debouncedUpdateCartOnServer(getSessionId(), pdIdx, updatedItem.cartCount);
    }
  }, [items, debouncedUpdateCartOnServer, getSessionId]);

  const handlePayment = useCallback(async () => {
    if (pendingUpdates.length > 0) {
      try {
        await axios.put('/api/petShop/cart/updateCart', pendingUpdates);
        setPendingUpdates([]);
        navigate('/payment/checkout');
      } catch (error) {
        console.error('Error updating cart on server:', error);
        Swal.fire({
          title: '장바구니 업데이트 오류',
          text: '장바구니 업데이트에 실패했습니다. 다시 시도해 주세요.',
          icon: 'error',
          confirmButtonText: '확인'
        });
        // alert('장바구니를 업데이트하는 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    } else {
      navigate('/payment/checkout');
    }
  }, [pendingUpdates, navigate]);

  const sessionId = getSessionId();

  return (
    <div className="PetPage-Container">
      <div className="PetPage-TopHalf">
        <QRCodeScanner sessionId={sessionId} onCartUpdated={fetchCartList} />
      </div>
      <div className="PetPage-BottomHalf">
        <div className="table-container">
          <table className="data-table">
            <tbody>
              {allCart.map(item => (
                <tr key={item.pdIdx}>
                  <td>{item.pdName}</td>
                  <td className="kiosk-button">
                    <button
                      onClick={() => handlecartCountChange(item.pdIdx, -1)}
                      className="cartCount-button"
                    ><span className="minus-sign">-</span></button>
                    {item.cartCount}
                    <button
                      onClick={() => handlecartCountChange(item.pdIdx, 1)}
                      className="Kiosk-cartCount-button"
                    >+</button>
                  </td>
                  <td>{(item.pdPrice * item.cartCount).toLocaleString()}원</td>
                  <td><button onClick={() => handleRemoveItem(item.pdIdx)} className='Trash_Button'><FaRegTrashAlt /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="summary">
          <p className='Pet-total'>총 금액: {totalPrice.toLocaleString()}원</p>
        </div>
        <button className="PetPage_button" onClick={handlePayment} disabled={totalPrice <= 0}>결제하기</button>
      </div>
      <div className="petPage-center-text-bar">
        상품을 스캔 해 주세요
      </div>
    </div>
  );
};

export default PetPage;
