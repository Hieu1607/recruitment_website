import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ROLE_ID } from './utils/roles';

// --- COMPONENTS ---
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';

// --- PAGES ---
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import JobDetail from './pages/JobDetail';
import Profile from './pages/Profile';
import CompanyList from './pages/CompanyList';
import AppliedJobs from './pages/AppliedJobs'; // <--- MỚI THÊM: Import trang đã ứng tuyển

function App() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <BrowserRouter>
      {/* Header luôn hiển thị, truyền props cần thiết */}
      <Header isAuthenticated={isAuthenticated} user={user} logout={logout} />

      <Routes>
        {/* ================= KHU VỰC CÔNG CỘNG (PUBLIC) ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/companies" element={<CompanyList />} />
        <Route path="/jobs/:id" element={<JobDetail />} />

        {/* Trang Login/Register: Nếu đã đăng nhập thì đá về Home */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/" /> : <Register />} 
        />

        {/* ================= KHU VỰC ĐĂNG NHẬP (PROTECTED) ================= */}
        
        {/* 1. Chung cho tất cả User đã đăng nhập (Admin, Employer, JobSeeker) */}
        <Route element={<PrivateRoute allowedRoles={[ROLE_ID.EMPLOYER, ROLE_ID.JOB_SEEKER, ROLE_ID.ADMIN]} />}>
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* 2. Dành riêng cho NHÀ TUYỂN DỤNG (Employer) */}
        <Route element={<PrivateRoute allowedRoles={[ROLE_ID.EMPLOYER]} />}>
          {/* Ví dụ: Trang đăng tin, quản lý CV ứng viên */}
          <Route path="/post-job" element={<div>Trang Đăng Tin Tuyển Dụng (Đang phát triển)</div>} />
          <Route path="/manage-candidates" element={<div>Trang Quản Lý Ứng Viên (Đang phát triển)</div>} />
        </Route>

        {/* 3. Dành riêng cho ỨNG VIÊN (Job Seeker) */}
        <Route element={<PrivateRoute allowedRoles={[ROLE_ID.JOB_SEEKER]} />}>
          {/* Trang xem lịch sử ứng tuyển */}
          <Route path="/applied-jobs" element={<AppliedJobs />} />
        </Route>

        {/* Route 404 (Nếu nhập linh tinh) */}
        <Route path="*" element={<div style={{textAlign: 'center', marginTop: '50px'}}>404 - Không tìm thấy trang</div>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;