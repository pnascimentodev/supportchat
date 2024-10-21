import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaCircle, FaUserCircle } from 'react-icons/fa';
import './App.css';

const App = () => {
  const [message, setMessage] = useState('');
  const [chatId] = useState(Date.now().toString());
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatBoxRef = useRef(null);

 
  useEffect(() => {
    document.getElementById('message-input').focus();
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { user: message };
    setChatHistory((prev) => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/chat', {
        message,
        chatId,
      });

      const botMessages = response.data.response.split('\n').map((line) => ({ bot: line }));

      setChatHistory((prev) => [...prev, ...botMessages]);
    } catch (error) {
      console.error('Erro ao enviar a mensagem:', error);
      const errorMessage = { bot: 'Desculpe, houve um erro ao enviar sua mensagem.' };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="chat-container">
      <h1>Chat</h1>
      <div className="agent-status">
        <FaCircle className="online-icon" /> Priscila está online!
      </div>
      <div className="chat-box" ref={chatBoxRef}>
        {chatHistory.map((entry, index) => (
          <div key={index} className={entry.user ? 'user-message' : 'bot-message'}>
            {entry.user ? entry.user : (
              <div className="bot-message-content">
                <FaUserCircle className="bot-icon" />
                <span>{entry.bot}</span>
              </div>
            )}
          </div>
        ))}
        {loading && <div className="loading-message">Aguarde, pensando...</div>}
      </div>
      <div className="input-container">
        <input
          id="message-input"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite sua mensagem..."
        />
        <button onClick={handleSendMessage}>Enviar</button>
      </div>
    </div>
  );
};

export default App;
