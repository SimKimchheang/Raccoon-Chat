import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Registration from './pages/Registration';
import Login from './pages/Login'; 
import Home from './pages/Home';
import Profile from './pages/Profile';
import AuthRedirect from './components/AuthRedirect';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/landingpage" replace />} />

        {/* Parent Route */}
        <Route path="/landingpage">
          <Route index element={<LandingPage />} />
          <Route path="signup" element={<Registration />} />
          <Route path="login" element={<Login />} />
        </Route>
        
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />}>
            <Route path="profile" element={<Profile />} />
          </Route>

        </Route>        

      </Routes>
    </Router>
  );
}

export default App;