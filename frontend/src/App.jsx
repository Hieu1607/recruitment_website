import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import JobDetail from './pages/JobDetail';
import Profile from './pages/Profile'; // Import trang Profile
import Header from './components/Header'; // Import Header
import { useAuth } from './context/AuthContext';

function App() {
  // Lấy state từ Context để truyền xuống Header
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <BrowserRouter>
      {/* Header đặt ở đây để hiển thị cố định ở mọi trang */}
      <Header isAuthenticated={isAuthenticated} user={user} logout={logout} />

      <Routes>
        <Route path="/" element={<Home />} />

        {/* Nếu đã đăng nhập thì đá về Home, chưa thì cho Login/Register */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" /> : <Register />}
        />

        <Route path="/jobs/:id" element={<JobDetail />} />

        {/* Route bảo vệ: Phải đăng nhập mới vào được Profile */}
        <Route 
          path="/profile" 
          element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;