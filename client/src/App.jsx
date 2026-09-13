import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/auth/LandingPage';
import Registration from './pages/auth/Registration';
import Login from './pages/auth/Login';

import Home from './pages/Home';
import Profile from './pages/profile/Profile';
import Settings from './pages/profile/Settings';
import Manage from './pages/profile/Manage';
import PersonalInformation from './pages/profile/PersonalInformation';
import EmailAndPassword from './pages/profile/EmailAndPassword';
import Social from './pages/profile/Social';
import UserProfile from './pages/UserProfile';
import ChatMessage from './pages/ChatMessage';

function App() {
  return (
    <Router>
      <Routes>

        {/* Public routes */}
        <Route path="/" element={<Navigate to="/landingpage" replace />} />

        <Route path="/landingpage">
          <Route index element={<LandingPage />} />
          <Route path="signup" element={<Registration />} />
          <Route path="login" element={<Login />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>

          {/* Home */}
          <Route path="/home" element={<Home />}>

            {/* ONLY people's profiles go inside Home */}
            <Route path="profile/:uid" element={<UserProfile />}>
              <Route path="chatMessage" element={<ChatMessage />} />
            </Route>

          </Route>

          {/* Independent profile page */}
          <Route
            path="/home/profile"
            element={<Profile />}
          />

          {/* Independent settings page */}
          <Route
            path="/home/settings"
            element={<Settings />}
          >
            <Route path="manage" element={<Manage />}>
              <Route path="personal" element={<PersonalInformation />} />
              <Route path="security" element={<EmailAndPassword />} />
              <Route path="social" element={<Social />} />
            </Route>
            
            {/* <Route path="language" element={<Language />} />
            <Route path="theme" element={<Theme />} /> */}

          </Route>


        </Route>

      </Routes>
    </Router>
  );
}

export default App;