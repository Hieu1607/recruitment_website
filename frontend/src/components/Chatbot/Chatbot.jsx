import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Chatbot.css'; 

// --- IMPORTS SERVICES ---
import { ChatbotService } from '../../services/chatbot.service';
import companyService from '../../services/companyService';
import jobService from '../../services/jobService'; 
import profileService from '../../services/profileService'; 

import { ROLE_ID, isEmployer, isJobSeeker } from '../../utils/roles';

const Chatbot = () => {
  const location = useLocation(); 
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Xin chào! Tôi là trợ lý nghề nghiệp của riêng bạn. Tôi có thể giúp gì?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // --- STATE LƯU NGỮ CẢNH ---
  const [dataContext, setDataContext] = useState({
    profile: null,        
    company: null,        
    myJobs: [],           // QUAN TRỌNG: Chứa danh sách job đã apply
    currentJobView: null, 
    isLoaded: false
  });
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // --- HÀM LẤY ID TỪ URL ---
  const getContextFromUrl = () => {
    const path = location.pathname;
    const jobMatch = path.match(/^\/jobs\/(\d+)$/);
    if (jobMatch) return { type: 'JOB', id: parseInt(jobMatch[1]) };
    
    const companyMatch = path.match(/^\/companies\/(\d+)$/);
    if (companyMatch) return { type: 'COMPANY', id: parseInt(companyMatch[1]) };

    const candidateMatch = path.match(/^\/employer\/candidates\/(\d+)$/);
    if (candidateMatch) return { type: 'CANDIDATE', id: parseInt(candidateMatch[1]) };

    return { type: null, id: null };
  };

  // --- HÀM TẢI DỮ LIỆU ---
  useEffect(() => {
    const fetchContextData = async () => {
      if (isOpen && !dataContext.isLoaded) {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const urlContext = getContextFromUrl();

        try {
          console.log("🔄 Chatbot đang đọc hồ sơ của bạn...");
          let profile = null;
          let company = null;
          let myJobs = [];
          let currentJobView = null;

          // 1. NẾU LÀ NHÀ TUYỂN DỤNG
          if (isEmployer(user)) {
             const [pRes, cRes] = await Promise.all([
                 profileService.getMyProfile().catch(()=>null),
                 companyService.getMyCompany().catch(()=>null)
             ]);
             profile = pRes;
             company = cRes;
             if (company && company.id) {
                 const jobRes = await jobService.getMyCompanyJobs(company.id, 1, 5);
                 myJobs = jobRes.jobs || [];
             }
          } 
          
          // 2. NẾU LÀ ỨNG VIÊN (Phần bạn quan tâm)
          else if (isJobSeeker(user)) {
             // Lấy Profile
             profile = await profileService.getMyProfile().catch(() => null);

             // Lấy TOÀN BỘ danh sách việc đã Apply
             // API getAppliedJobs trả về list application
             myJobs = await jobService.getAppliedJobs().catch(() => []);
          }

          // 3. Nếu đang xem chi tiết 1 job
          if (urlContext.type === 'JOB') {
             currentJobView = await jobService.getJobById(urlContext.id).catch(() => null);
          }

          setDataContext({
              profile,
              company,
              myJobs, 
              currentJobView,
              isLoaded: true
          });
          
        } catch (error) {
          console.error("Lỗi tải dữ liệu:", error);
        }
      }
    };
    fetchContextData();
  }, [isOpen, dataContext.isLoaded, location.pathname]); 

  const handleSend = async () => {
    if (!input.trim()) return;

    const originalInput = input;
    const userMsg = { role: 'user', content: originalInput };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const context = getContextFromUrl();
      let response;

      let contextSummary = "";
      
      // ==========================================
      // LOGIC XỬ LÝ CHO ỨNG VIÊN (JOB SEEKER)
      // ==========================================
      if (isJobSeeker(user)) {
         if (dataContext.isLoaded) {
             // BƯỚC 1: Xử lý danh sách việc đã nộp
             // Chỉ lấy tối đa 15 việc gần nhất để tránh quá tải token, nhưng đủ để AI hiểu
             const appliedHistory = dataContext.myJobs
                .slice(0, 15) 
                .map((app, index) => {
                    // Tùy vào API của bạn trả về structure nào, ta map cho đúng
                    // Giả sử app có dạng { job: { title, salary }, status: 'pending' }
                    const jobTitle = app.job?.title || app.title || "Công việc ẩn";
                    const companyName = app.job?.company_name || app.company_name || "Công ty ẩn";
                    const status = app.status || "Đang chờ";
                    const salary = app.job?.salary || "Thỏa thuận";
                    return `${index + 1}. ${jobTitle} tại ${companyName} (Lương: ${salary}) - Trạng thái: ${status}`;
                })
                .join('\n');

             // BƯỚC 2: Tạo Prompt "Thần thánh"
             contextSummary = `
             [HỒ SƠ ỨNG VIÊN CỦA TÔI]:
             - Họ tên: ${dataContext.profile?.full_name || 'Bạn'}
             - Email: ${dataContext.profile?.email}
             
             [LỊCH SỬ ỨNG TUYỂN - HÃY DÙNG ĐỂ PHÂN TÍCH KỸ NĂNG CỦA TÔI]:
             ${appliedHistory ? appliedHistory : "Chưa có lịch sử ứng tuyển."}

             (Hãy dựa vào danh sách trên để biết tôi quan tâm đến lĩnh vực nào, mức lương mong muốn ra sao khi trả lời câu hỏi).
             `;
             
             // BƯỚC 3: Nếu đang xem Job cụ thể
             if (dataContext.currentJobView) {
                 const job = dataContext.currentJobView;
                 contextSummary += `
                 \n[NGỮ CẢNH HIỆN TẠI]:
                 Tôi đang xem công việc: "${job.title}" 
                 - Công ty: ${job.companyName}
                 - Mức lương: ${job.salary}
                 - Yêu cầu: ${job.description ? job.description.substring(0, 200) + "..." : "Xem chi tiết"}
                 `;
             }
         }

         // Gửi câu hỏi kèm toàn bộ dữ liệu nền
         const enrichedMessage = contextSummary + "\n\nCÂU HỎI CỦA TÔI: " + originalInput;
         console.log("JobSeeker Context sent:", enrichedMessage); 

         response = await ChatbotService.chatJobseeker(enrichedMessage);
      } 
      
      // ==========================================
      // LOGIC CHO NHÀ TUYỂN DỤNG (EMPLOYER)
      // ==========================================
      else if (isEmployer(user)) {
        // ... (Giữ nguyên logic Employer đã làm ở câu trước) ...
        let empSummary = "";
        if (dataContext.isLoaded) {
            empSummary = `[CONTEXT]: User: ${dataContext.profile?.full_name}. Cty: ${dataContext.company?.name}. Jobs: ${dataContext.myJobs.map(j=>j.title).join(', ')}`;
        }
        const companyId = dataContext.company?.id || user?.company_id;
        
        if (companyId) {
             response = await ChatbotService.chatEmployer(
                empSummary + "\nQuestion: " + originalInput, 
                companyId, 
                (context.type === 'JOB') ? context.id : null, 
                (context.type === 'CANDIDATE') ? context.id : null
             );
        } else {
             response = await ChatbotService.chatGuest(originalInput);
        }
      } 
      
      else {
         response = await ChatbotService.chatGuest(originalInput);
      }

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
          <div className="chat-header">
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <span>🤖</span>
              <span style={{fontWeight:'bold'}}>
                 {/* Tiêu đề thay đổi theo ngữ cảnh */}
                 {isJobSeeker(JSON.parse(localStorage.getItem('user'))) ? 'Cố vấn nghề nghiệp' : 'Trợ lý tuyển dụng'}
              </span>
            </div>
            <button onClick={() => setIsOpen(false)} className="close-btn">✕</button>
          </div>

          <div className="chat-body">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                {msg.content}
              </div>
            ))}
            {isLoading && <div className="message bot typing">Đang suy nghĩ...</div>}
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