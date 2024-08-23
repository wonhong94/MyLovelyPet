import React, { useState, useEffect, useRef } from 'react';
import { getGeminiResponse } from '../api'; // 이 파일이 `getGeminiResponse` 함수를 포함하는 파일이어야 합니다.
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);
  const [quickRepliesVisible, setQuickRepliesVisible] = useState(true);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    // 챗봇이 처음 로드될 때 인사말 추가
    const initialMessage = "안녕하세요! MY LOVELY PET에 오신 것을 환영합니다. 무엇을 도와드릴까요? 😊";
    setMessages([{ text: initialMessage, sender: 'bot' }]);
  }, []);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text) => {
    const newMessages = [...messages, { text, sender: 'user' }];
    setMessages(newMessages);
    setError(null);
    setQuickRepliesVisible(false); // 메시지가 전송되면 퀵 리플라이 버튼을 숨김

    try {
      const botResponse = await getGeminiResponse(text);
      setMessages(prevMessages => [...prevMessages, { text: botResponse, sender: 'bot' }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('메시지 전송 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  const handleQuickReply = (text) => {
    sendMessage(text);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="chatbot">
      <div className="chat-window" ref={chatWindowRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <span className="sender-icon">{msg.sender === 'user' ? '👤' : '🐶'}</span>
            <span className="message-text">{msg.text}</span>
          </div>
        ))}
        {quickRepliesVisible && (
          <div className="quick-replies">
            <button onClick={() => handleQuickReply('제품 카테고리를 보여줘')}>제품 카테고리를 보여줘</button><br />
            <button onClick={() => handleQuickReply('매장에 물품이 뭐가 있어?')}>매장에 물품이 뭐가 있어?</button><br />
          </div>
        )}
      </div>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className="chat-input"
        />
        <button type="submit" className="chat-submit">전송</button>
      </form>
    </div>
  );
};

export default Chatbot;
