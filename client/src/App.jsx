import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthRedirect from './components/AuthRedirect';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/auth/LandingPage';
import Registration from './pages/auth/Registration';
import Login from './pages/auth/Login'; 
import Home from './pages/Home';
import Profile from './pages/profile/Profile';
import Settings from './pages/profile/Settings';

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
          </Route>
          <Route path="/home/profile" element={<Profile />} />

          <Route path='/home/profile/settings' element={<Settings />} />

        </Route>        

      </Routes>
    </Router>
  );
}

export default App;