import React, { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import { FaRegTrashAlt } from "react-icons/fa";
import './PetPage.css';
import QRCodeScanner from '../Kioskcomponents/QRCodeScanner';
import { API_BASE_URL } from '../service/PetapiService'; // API_BASE_URL import

const PetPage = () => {
  const { items, setItems, allCart, setAllCart } = useContext(UserContext);
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();
  const [pendingUpdates, setPendingUpdates] = useState([]);

  const getSessionId = () => {
    if (typeof window !== 'undefined') {
      let sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        sessionId = generateUUID();
        localStorage.setItem("sessionId", sessionId);
      }
      return sessionId;
    }
    return null;
  };

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const fetchCartList = async () => {
    try {
      const sessionId = getSessionId(); // 고유 식별자 가져오기
      const response = await axios.get('/petShop/cart/cartList', { 
        params: { sessionId } // 고유 식별자를 서버로 전달
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
  };

  useEffect(() => {
    console.log(sessionId);
    fetchCartList();
  }, [setItems, setAllCart]);

  useEffect(() => {
    const total = items.reduce((sum, item) => sum + item.pdPrice * item.cartCount, 0);
    setTotalPrice(total);
  }, [items]);

  const handleRemoveItem = async (pdIdx) => {
    const sessionId = getSessionId(); // 세션 ID를 가져옵니다.

    // 클라이언트 상태에서 아이템을 먼저 제거
    const updatedItems = items.filter(item => item.pdIdx !== pdIdx);
    setAllCart(updatedItems);
    setItems(updatedItems);

    // 대기 중인 업데이트 목록에서 해당 항목 제거
    setPendingUpdates(prev => prev.filter(update => update.pdIdx !== pdIdx));

    try {
      // 서버에 삭제 요청
      await axios.delete('api/petShop/cart/deleteCartItem', {
        params: { sessionId, pdIdx }  // sessionId와 pdIdx를 서버에 전달
      });

      console.log(`Item with pdIdx ${pdIdx} has been removed from the server.`);
    } catch (error) {
      console.error('Error removing item from the server:', error);
      alert('서버에서 항목을 삭제하는 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  const handlecartCountChange = (pdIdx, delta) => {
    // 클라이언트 상태 즉시 업데이트
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

      // 서버에 비동기로 업데이트 요청을 보냅니다.
      axios.put('api/petShop/cart/updateCart', [
        {
          sessionId: getSessionId(),
          pdIdx: updatedItem.pdIdx,
          cartCount: updatedItem.cartCount
        }
      ])
        .catch(error => {
          console.error('Error updating cart on server:', error);
          alert('장바구니를 업데이트하는 중 오류가 발생했습니다. 다시 시도해 주세요.');
        });
    }
  };

  const handlePayment = async () => {
    if (pendingUpdates.length > 0) {
      try {
        await axios.put('api/petShop/cart/updateCart', pendingUpdates);
        setPendingUpdates([]); // Clear the pending updates after successful update
        navigate('/payment/checkout');
      } catch (error) {
        console.error('Error updating cart on server:', error);
        alert('장바구니를 업데이트하는 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    } else {
      navigate('/payment/checkout');
    }
  };

  const sessionId = getSessionId();

    // 랜덤 아이템 추가 함수
    const handleAddRandomItem = () => {
      const randomIndex = Math.floor(Math.random() * 100); // 예시로 1~100까지의 인덱스
      const randomPrice = Math.floor(Math.random() * 4000) + 1; // 1~4000 사이의 랜덤 가격
      const newItem = {
        pdIdx: `random-${randomIndex}`, // 고유 인덱스
        pdName: `상품${randomIndex + 1}`, // 상품 이름
        pdPrice: randomPrice,
        cartCount: 1 // 기본 수량 1로 설정
      };
  
      // 상태 업데이트
      const updatedItems = [...items, newItem];
      setAllCart(updatedItems);
      setItems(updatedItems);
    };

  return (
    <Container>
      <TopHalf className="Top-Main">
        <QRCodeScanner sessionId={sessionId} onCartUpdated={fetchCartList} />
      </TopHalf>
      <BottomHalf className="Bottom-Main">
        <div className="table-container">
          <table className="data-table">
            <tbody>
              {allCart.map(item => (
                <tr key={item.pdIdx} className="tr_table">
                  <td>{item.pdName}</td>
                  <td className="kiosk-button">
                    <button
                      onClick={() => handlecartCountChange(item.pdIdx, -1)}
                      className="Kiosk-cartCount-button"
                    ><span className="minus-sign">-</span></button>
                    {item.cartCount}
                    <button
                      onClick={() => handlecartCountChange(item.pdIdx, 1)}
                      className="Kiosk-cartCount-button"
                    >+</button>
                  </td>
                  <td>{(item.pdPrice * item.cartCount).toLocaleString()}원</td>
                  <td>
                    <button onClick={() => handleRemoveItem(item.pdIdx)} className='Trash_Button'>
                      <FaRegTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="summary">
          <p className='Pet-total'>총 금액: {totalPrice.toLocaleString()}원</p>
        </div>
        <button className="PetPage_button" onClick={handleAddRandomItem}>
          랜덤 아이템 추가
        </button>
        <button className="PetPage_button" onClick={handlePayment} disabled={totalPrice <= 0}>
          결제하기
        </button>
      </BottomHalf>
      <div className="petPage-center-text-bar">
        상품의 QR코드를 스캔 해 주세요
      </div>
    </Container>
  );
};

export default PetPage;

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
`;

const TopHalf = styled.div`
  width: 100%;
  height: 50%;
  background-color: #FFFFFF; /* 위쪽 절반의 배경색 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const BottomHalf = styled.div`
  width: 100%;
  height: 50%;
  background-color: #FFECA0; /* 아래쪽 절반의 배경색 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
`;