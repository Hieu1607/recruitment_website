import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // 1. Hook để đọc URL
import './Chatbot.css'; 
import { ChatbotService } from '../../services/chatbot.service';
import { ROLE_ID } from '../../utils/roles';

const Chatbot = () => {
  const location = useLocation(); // Lấy thông tin URL hiện tại
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Xin chào! Tôi là trợ lý AI. Tôi có thể giúp gì cho bạn?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Tự cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // --- 2. HÀM TỰ ĐỘNG PHÁT HIỆN NGỮ CẢNH TỪ URL ---
  const getContextFromUrl = () => {
    const path = location.pathname; // Ví dụ: /jobs/5 hoặc /employer/candidates/10
    
    // A. Bắt ID công việc (Dành cho cả Employer và JobSeeker xem Job)
    // Regex: tìm chuỗi bắt đầu bằng /jobs/ theo sau là số
    const jobMatch = path.match(/^\/jobs\/(\d+)$/);
    if (jobMatch) {
        return { type: 'JOB', id: parseInt(jobMatch[1]) };
    }

    // B. Bắt ID công ty
    const companyMatch = path.match(/^\/companies\/(\d+)$/);
    if (companyMatch) {
        return { type: 'COMPANY', id: parseInt(companyMatch[1]) };
    }

    // C. Bắt ID ứng viên (Dành cho Employer xem hồ sơ)
    // Lưu ý: Sửa đường dẫn '/employer/candidates/' đúng với file App.js của bạn nếu khác
    const candidateMatch = path.match(/^\/employer\/candidates\/(\d+)$/); // Hoặc /applied-jobs/...
    if (candidateMatch) {
        return { type: 'CANDIDATE', id: parseInt(candidateMatch[1]) };
    }

    return { type: null, id: null };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Hiển thị tin nhắn user
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Lấy User từ LocalStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const roleId = user?.role_id; 

      // --- 3. LẤY NGỮ CẢNH TỰ ĐỘNG ---
      const context = getContextFromUrl();
      
      let response;

      // === TRƯỜNG HỢP 1: NHÀ TUYỂN DỤNG ===
      if (roleId === ROLE_ID.EMPLOYER) {
        const companyId = user.company_id || user.companyId;
        
        // Tự động điền ID vào hàm chatEmployer dựa trên trang đang đứng
        const jobId = (context.type === 'JOB') ? context.id : null;
        const appId = (context.type === 'CANDIDATE') ? context.id : null;

        if (companyId) {
             response = await ChatbotService.chatEmployer(
                userMsg.content, 
                companyId, 
                jobId, 
                appId
             );
        } else {
             response = await ChatbotService.chatGuest(userMsg.content);
        }
      } 
      
      // === TRƯỜNG HỢP 2: ỨNG VIÊN (Mẹo làm cho nó khôn hơn) ===
      else if (roleId === ROLE_ID.JOB_SEEKER) {
         // Vì API jobseeker hiện tại chỉ nhận 'question', ta dùng mẹo:
         // Nếu đang xem Job, ta nối thêm thông tin vào câu hỏi để AI biết ngữ cảnh
         let finalQuestion = userMsg.content;
         
         if (context.type === 'JOB') {
            finalQuestion += ` (Ngữ cảnh: Tôi đang xem Job ID ${context.id}, hãy tư vấn dựa trên đó)`;
         } else if (context.type === 'COMPANY') {
            finalQuestion += ` (Ngữ cảnh: Tôi đang xem Công ty ID ${context.id})`;
         }

         response = await ChatbotService.chatJobseeker(finalQuestion);
      } 
      
      // === TRƯỜNG HỢP 3: KHÁCH ===
      else {
         response = await ChatbotService.chatGuest(userMsg.content);
      }

      // Xử lý phản hồi
      if(response && (response.success || response.data)) {
         const answerText = response.data?.answer || response.answer || "Xin lỗi, tôi không có câu trả lời.";
         setMessages(prev => [...prev, { role: 'bot', content: answerText }]);
      } else {
         setMessages(prev => [...prev, { role: 'bot', content: "Hệ thống đang bận." }]);
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'bot', content: "Lỗi kết nối." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-wrapper">
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chat-header">
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <span>🤖</span>
              <span style={{fontWeight:'bold'}}>Trợ lý tuyển dụng</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="close-btn">✕</button>
          </div>

          {/* Body */}
          <div className="chat-body">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                {msg.content}
              </div>
            ))}
            {isLoading && <div className="message bot typing">Đang suy nghĩ...</div>}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <div className="chat-footer">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Nhập câu hỏi..."
              disabled={isLoading}
            />
            <button onClick={handleSend} disabled={isLoading}>➤</button>
          </div>
        </div>
      )}
      <button className="chatbot-toggler" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '⬇️' : '💬'}
      </button>
    </div>
  );
};

export default Chatbot;