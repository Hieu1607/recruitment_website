import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
// --- 1. THÊM IMPORT NÀY ---
import JobDetail from './pages/JobDetail'; 
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login />}
        />

        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" /> : <Register />}
        />
        <Route path="/jobs/:id" element={<JobDetail />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;