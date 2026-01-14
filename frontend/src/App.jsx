import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ROLE_ID } from './utils/roles';

// --- COMPONENTS ---
// Lưu ý: Kiểm tra lại đường dẫn import Header/PrivateRoute nếu bạn để trong assets/components
import Header from './components/Header'; 
import PrivateRoute from './components/PrivateRoute';

// --- PAGES ---
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import JobDetail from './pages/JobDetail';
import Profile from './pages/Profile';
import CompanyList from './pages/CompanyList';
import AppliedJobs from './pages/AppliedJobs'; 
import CVBuilder from './pages/CVBuilder'; 
import CVPreview from './pages/CVPreview';

// --- IMPORT CÁC TRANG NHÀ TUYỂN DỤNG (MỚI) ---
import CompanyProfile from './pages/employer/CompanyProfile';
import JobManager from './pages/employer/JobManager';
import CandidateSearch from './pages/employer/CandidateSearch';
import PostJob from './pages/employer/PostJob';

function App() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <BrowserRouter>
      {/* Header luôn hiển thị */}
      <Header isAuthenticated={isAuthenticated} user={user} logout={logout} />

      <Routes>
        {/* ================= KHU VỰC CÔNG CỘNG (PUBLIC) ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/companies" element={<CompanyList />} />
        <Route path="/jobs/:id" element={<JobDetail />} />

        {/* Trang Login/Register */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/" /> : <Register />} 
        />

        {/* ================= KHU VỰC ĐĂNG NHẬP (PROTECTED) ================= */}
        
        {/* 1. Chung cho tất cả User đã đăng nhập (Chỉ để sửa tên, mật khẩu,...) */}
        <Route element={<PrivateRoute allowedRoles={[ROLE_ID.EMPLOYER, ROLE_ID.JOB_SEEKER, ROLE_ID.ADMIN]} />}>
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* 2. Dành riêng cho NHÀ TUYỂN DỤNG */}
        <Route element={<PrivateRoute allowedRoles={[ROLE_ID.EMPLOYER]} />}>
          <Route path="/employer/company" element={<CompanyProfile />} />
          <Route path="/employer/jobs" element={<JobManager />} />
          <Route path="/employer/post-job" element={<PostJob />} />
          <Route path="/employer/candidates" element={<CandidateSearch />} />
        </Route>

        {/* 3. Dành riêng cho ỨNG VIÊN */}
        <Route element={<PrivateRoute allowedRoles={[ROLE_ID.JOB_SEEKER]} />}>
          <Route path="/applied-jobs" element={<AppliedJobs />} />
          <Route path="/create-cv" element={<CVBuilder />} />
          <Route path="/preview" element={<CVPreview />} />
        </Route>

        {/* Route 404 */}
        <Route path="*" element={<div style={{textAlign: 'center', marginTop: '50px'}}>404 - Không tìm thấy trang</div>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;