import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Registration from './pages/Registration'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'

function App() {

  return (
    <>
      <Router>
        <Routes>
          {/* Redirects the root path (/) automatically to /landingpage */}
          <Route path="/" element={<Navigate to="/landingpage" replace />} />

          {/* Your standard clean routes */}
          <Route path='/landingpage' element={<LandingPage/>}></Route>

          <Route path="/landingpage/signup" element={<Registration />} />
          <Route path="/landingpage/login" element={<Login />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
