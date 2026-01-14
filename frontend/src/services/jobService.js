import api from './api';

const mapJobData = (apiJob) => {
  if (!apiJob) return {};
  return {
    id: apiJob.id || apiJob.id_cong_viec || Math.random().toString(),
    title: apiJob.title || apiJob.ten_cong_viec || "Công việc chưa có tên",
    
    // --- THÔNG TIN CÔNG TY ---
    companyId: apiJob.company_id || apiJob.id_cong_ty || null,
    companyName: apiJob.company_name || apiJob.ten_cong_ty || null,
    
    // 👇 THÊM DÒNG NÀY ĐỂ HỨNG LOGO TỪ API JOB (Nếu backend có gửi kèm)
    companyLogo: apiJob.company_logo || apiJob.logo || apiJob.company?.logo || null, 

    salary: apiJob.salary || apiJob.muc_luong || "Thỏa thuận",
    location: (apiJob.location || apiJob.dia_diem_lam_viec || "").toString(),
    // ... các trường khác giữ nguyên
    level: apiJob.level || "",
    deadline: apiJob.deadline || apiJob.thoi_han_tuyen_dung || "",
    description: apiJob.description || apiJob.mo_ta || "Chưa có mô tả chi tiết",
    createdAt: apiJob.created_at,
    updatedAt: apiJob.updated_at
  };
};

const jobService = {
  
  /* ========================================================================
     PHẦN 1: CANDIDATE (ỨNG VIÊN) & PUBLIC
     ======================================================================== */

  getJobs: async (keyword = '', location = 'all') => {
    try {
      const params = { limit: 10000 };
      if (keyword) { params.search = keyword; params.keyword = keyword; }
      if (location !== 'all') params.location = location;
      const response = await api.get('/v1/jobs', { params });
      const rawJobs = response.data.data || response.data.jobs || response.data || [];
      return Array.isArray(rawJobs) ? rawJobs.map(mapJobData) : [];
    } catch (error) {
      console.error("API Error:", error);
      return [];
    }
  },

  getSuggestions: async () => {
    try {
      const response = await api.get('/v1/jobs', { params: { limit: 5 } });
      const rawJobs = response.data.data || response.data || [];
      return {
        keywords: Array.isArray(rawJobs) ? rawJobs.map(j => j.title).filter(Boolean).slice(0, 5) : [],
        jobs: Array.isArray(rawJobs) ? rawJobs.slice(0, 3).map(mapJobData) : []
      };
    } catch {
      return { keywords: [], jobs: [] };
    }
  },

  getJobById: async (id) => {
    try {
      const response = await api.get(`/v1/jobs/${id}`);
      return mapJobData(response.data.data || response.data);
    } catch (error) {
      console.error("Lỗi lấy chi tiết job:", error);
      return null;
    }
  },

  applyJob: async (jobId, applicationData = {}) => {
    try {
      const numericJobId = parseInt(jobId, 10);
      let cvUrl = applicationData.cvUrl;

      if (typeof cvUrl === 'string' && cvUrl.endsWith('.pdf.pdf')) {
        console.warn("⚠️ Phát hiện đuôi file lỗi (.pdf.pdf), đang tự động sửa...");
        cvUrl = cvUrl.replace('.pdf.pdf', '.pdf');
      }

      const payload = {
        job_id: numericJobId,
        cv_url: cvUrl
      };

      console.log("🚀 Dữ liệu gửi đi (Cleaned):", payload);
      const response = await api.post('/v1/applications', payload);
      return response.data;

    } catch (error) {
      if (error.response?.data?.errors) {
        console.error("❌ CHI TIẾT LỖI VALIDATION:", JSON.stringify(error.response.data.errors, null, 2));
      } else if (error.response) {
        console.error("❌ Lỗi Server:", error.response.data);
      }
      throw error;
    }
  },

  getAppliedJobs: async () => {
    try {
      const response = await api.get('/v1/applications/my-applications'); 
      return response.data.data || []; 
    } catch (error) {
      return [];
    }
  },

  /* ========================================================================
     PHẦN 2: EMPLOYER (NHÀ TUYỂN DỤNG)
     ======================================================================== */

  // 1. Tạo tin tuyển dụng mới
  createJob: async (jobData) => {
    const response = await api.post('/v1/jobs', jobData);
    return response.data;
  },

  // 2. Cập nhật tin tuyển dụng
  updateJob: async (id, jobData) => {
    const response = await api.put(`/v1/jobs/${id}`, jobData);
    return response.data;
  },

  // 3. Xóa tin tuyển dụng
  deleteJob: async (id) => {
    const response = await api.delete(`/v1/jobs/${id}`);
    return response.data;
  },

  // 4. Lấy danh sách việc làm CỦA CÔNG TY (Có filter company_id) - Dùng cho Dashboard
  getMyCompanyJobs: async (companyId, page = 1, limit = 100) => {
    try {
        const params = { 
            company_id: companyId, 
            page: page, 
            limit: limit 
        };
        const response = await api.get('/v1/jobs', { params });
        
        const rawJobs = response.data.data || [];
        const jobs = Array.isArray(rawJobs) ? rawJobs.map(mapJobData) : [];
        
        return {
            jobs: jobs,
            pagination: response.data.pagination || {}
        };
    } catch (error) {
        console.error("Lỗi lấy danh sách job của công ty:", error);
        return { jobs: [], pagination: {} };
    }
  },

  /* ========================================================================
     PHẦN 3: QUẢN LÝ ỨNG VIÊN
     ======================================================================== */

  // 5. Lấy danh sách người đã nộp đơn
  getJobApplicants: async (jobId) => {
    try {
        const response = await api.get(`/v1/applications/job/${jobId}`);
        return response.data.data || response.data || [];
    } catch (error) {
        console.error("Lỗi lấy ứng viên:", error);
        return [];
    }
  },

  // 6. Cập nhật trạng thái ứng viên
  updateApplicationStatus: async (applicationId, status) => {
    const response = await api.put(`/v1/applications/${applicationId}`, { status });
    return response.data;
  },

  /* ========================================================================
     PHẦN 4: PUBLIC - VIEW COMPANY JOBS
     ======================================================================== */

  // 7. [MỚI] Lấy danh sách việc làm theo ID công ty (Dùng cho trang Chi tiết công ty)
  getJobsByCompanyId: async (companyId) => {
    try {
      const response = await api.get('/v1/jobs', { 
        params: { 
            company_id: companyId,
            limit: 50 // Giới hạn lấy 50 job hiển thị
        } 
      });
      const rawJobs = response.data.data || response.data || [];
      // Tái sử dụng mapJobData để đảm bảo dữ liệu chuẩn
      return Array.isArray(rawJobs) ? rawJobs.map(mapJobData) : [];
    } catch (error) {
      console.error("Lỗi lấy job theo company:", error);
      return [];
    }
  }
};

export default jobService;