import api from './api';

// --- HELPER: MAP DỮ LIỆU ---
const mapJobData = (apiJob) => {
  if (!apiJob) return {};
  return {
    id: apiJob.id || apiJob.id_cong_viec || Math.random().toString(),
    title: apiJob.title || apiJob.ten_cong_viec || "Công việc chưa có tên",
    
    // --- KHU VỰC SỬA QUAN TRỌNG ---
    companyId: apiJob.company_id || apiJob.id_cong_ty || null,
    // SỬA: Để null nếu không có tên (để Component CompanyName tự gọi API)
    // KHÔNG được để text mặc định kiểu "Công ty #123" ở đây
    companyName: apiJob.company_name || apiJob.ten_cong_ty || null, 
    companyLogo: apiJob.company_logo || apiJob.logo || apiJob.company?.logo || null, 
    // -----------------------------

    salary: apiJob.salary || apiJob.muc_luong || "Thỏa thuận",
    location: (apiJob.location || apiJob.dia_diem_lam_viec || "").toString(),
    level: apiJob.level || "",
    deadline: apiJob.deadline || apiJob.thoi_han_tuyen_dung || "",
    companyType: apiJob.company_type || apiJob.loai_hinh_hoat_dong || "",
    
    description: apiJob.description || apiJob.mo_ta || "Chưa có mô tả chi tiết",
    requirements: apiJob.requirements || apiJob.yeu_cau || "Chưa có yêu cầu cụ thể",
    benefits: apiJob.benefits || apiJob.quyen_loi || "Chưa có thông tin quyền lợi",
    
    createdAt: apiJob.created_at,
    updatedAt: apiJob.updated_at
  };
};

const jobService = {
  // --- PHẦN 1: CANDIDATE ---
  getJobs: async (keyword = '', location = 'all') => {
    try {
      const params = { limit: 10000 };
      if (keyword) { params.search = keyword; } 
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
      return null;
    }
  },

  applyJob: async (jobId, applicationData = {}) => {
    try {
      const numericJobId = parseInt(jobId, 10);
      let cvUrl = applicationData.cvUrl;
      if (typeof cvUrl === 'string' && cvUrl.endsWith('.pdf.pdf')) {
        cvUrl = cvUrl.replace('.pdf.pdf', '.pdf');
      }
      const payload = { job_id: numericJobId, cv_url: cvUrl };
      const response = await api.post('/v1/applications', payload);
      return response.data;
    } catch (error) {
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

  // --- PHẦN 2: EMPLOYER ---
  createJob: async (jobData) => {
    const response = await api.post('/v1/jobs', jobData);
    return response.data;
  },

  updateJob: async (id, jobData) => {
    const response = await api.put(`/v1/jobs/${id}`, jobData);
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await api.delete(`/v1/jobs/${id}`);
    return response.data;
  },

  getMyCompanyJobs: async (companyId, page = 1, limit = 100) => {
    try {
        const params = { company_id: companyId, page: page, limit: limit };
        const response = await api.get('/v1/jobs', { params });
        const rawJobs = response.data.data || [];
        return {
            jobs: Array.isArray(rawJobs) ? rawJobs.map(mapJobData) : [],
            pagination: response.data.pagination || {}
        };
    } catch (error) {
        return { jobs: [], pagination: {} };
    }
  },

  // --- PHẦN 3: QUẢN LÝ ỨNG VIÊN ---
  getJobApplicants: async (jobId) => {
    try {
        const response = await api.get(`/v1/applications/job/${jobId}`);
        return response.data.data || response.data || [];
    } catch (error) {
        return [];
    }
  },

  updateApplicationStatus: async (applicationId, status) => {
    const response = await api.put(`/v1/applications/${applicationId}`, { status });
    return response.data;
  },

  // --- PHẦN 4: PUBLIC VIEW COMPANY ---
  getJobsByCompanyId: async (companyId) => {
    try {
      const response = await api.get('/v1/jobs', { params: { company_id: companyId, limit: 50 } });
      const rawJobs = response.data.data || response.data || [];
      return Array.isArray(rawJobs) ? rawJobs.map(mapJobData) : [];
    } catch (error) {
      return [];
    }
  }
};

export default jobService;