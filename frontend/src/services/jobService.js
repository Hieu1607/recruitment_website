import api from './api';

const mapJobData = (apiJob) => {
  if (!apiJob) return {};
  return {
    id: apiJob.id || apiJob.id_cong_viec || Math.random().toString(),
    title: apiJob.title || apiJob.ten_cong_viec || "Công việc chưa có tên",
    companyId: apiJob.company_id || apiJob.id_cong_ty || null,
    companyName: apiJob.company_name || apiJob.ten_cong_ty || null,
    salary: apiJob.salary || apiJob.muc_luong || "Thỏa thuận",
    location: (apiJob.location || apiJob.dia_diem_lam_viec || "").toString(),
    level: apiJob.level || "",
    deadline: apiJob.deadline || apiJob.thoi_han_tuyen_dung || "",
    companyType: apiJob.company_type || apiJob.loai_hinh_hoat_dong || "",
    description: apiJob.description || apiJob.mo_ta || "Chưa có mô tả chi tiết",
    requirements: apiJob.requirements || apiJob.yeu_cau || "Chưa có yêu cầu cụ thể",
    benefits: apiJob.benefits || apiJob.quyen_loi || "Chưa có thông tin quyền lợi"
  };
};

const jobService = {
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

  /* ================== APPLY JOB (FIXED & CLEANED) ================== */
  applyJob: async (jobId, applicationData = {}) => {
    try {
      const numericJobId = parseInt(jobId, 10);
      let cvUrl = applicationData.cvUrl;

      // 1. Sửa lỗi đuôi file bị lặp (.pdf.pdf -> .pdf)
      if (typeof cvUrl === 'string' && cvUrl.endsWith('.pdf.pdf')) {
        console.warn("⚠️ Phát hiện đuôi file lỗi (.pdf.pdf), đang tự động sửa...");
        cvUrl = cvUrl.replace('.pdf.pdf', '.pdf');
      }

      // 2. Tạo payload gửi đi
      const payload = {
        job_id: numericJobId,
        cv_url: cvUrl
      };

      console.log("🚀 Dữ liệu gửi đi (Cleaned):", payload);

      const response = await api.post('/v1/applications', payload);
      return response.data;

    } catch (error) {
      // 3. IN CHI TIẾT LỖI RA CONSOLE (QUAN TRỌNG)
      if (error.response?.data?.errors) {
        // Chuyển object lỗi thành chuỗi dễ đọc
        console.error("❌ CHI TIẾT LỖI VALIDATION (Copy dòng dưới gửi tôi):");
        console.error(JSON.stringify(error.response.data.errors, null, 2));
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
  }
};

export default jobService;