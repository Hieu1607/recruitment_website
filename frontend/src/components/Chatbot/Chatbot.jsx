import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';
import { ChatbotService } from '../../services/chatbot.service'; // Nhớ import service bạn đã tạo

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Xin chào! Mình là trợ lý JobCV. Mình có thể giúp gì cho bạn?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống cuối
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // 1. Hiện tin nhắn user
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // 2. Logic lấy user từ localStorage (sửa theo đúng cách lưu của bạn)
      const userStr = localStorage.getItem('user'); // Hoặc userInfo
      const user = userStr ? JSON.parse(userStr) : null;
      
      let response;
      
      // Giả lập logic gọi API (bạn dùng code service thật ở đây)
      // Đây là code ví dụ để test giao diện
      if (user?.role === 'employer') {
         response = await ChatbotService.chatEmployer(userMsg.content, user.companyId);
      } else if (user?.role === 'jobseeker') {
         response = await ChatbotService.chatJobseeker(userMsg.content);
      } else {
         response = await ChatbotService.chatGuest(userMsg.content);
      }

      // 3. Hiện tin nhắn bot
      if(response && response.success) {
          setMessages(prev => [...prev, { role: 'bot', content: response.data.answer }]);
      } else {
          setMessages(prev => [...prev, { role: 'bot', content: "Xin lỗi, hệ thống đang bận." }]);
      }

    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', content: 'Lỗi kết nối server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-wrapper">
      {/* Cửa sổ Chat (Chỉ hiện khi isOpen = true) */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chat-header">
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
               {/* Icon robot nhỏ */}
               <span>🤖</span> 
               <span>Trợ lý JobCV</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{background:'none', border:'none', color:'white', fontSize:'20px', cursor:'pointer'}}
            >
              ✕
            </button>
          </div>

          <div className="chat-body">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                {msg.content}
              </div>
            ))}
            {isLoading && <div className="message bot">Wait a sec...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-footer">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Nhập câu hỏi..."
              disabled={isLoading}
            />
            <button onClick={handleSend} disabled={isLoading}>Gửi</button>
          </div>
        </div>
      )}

      {/* Nút tròn để đóng/mở */}
      <button className="chatbot-toggler" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '⬇️' : '💬'}
      </button>
    </div>
  );
};

export default Chatbot;