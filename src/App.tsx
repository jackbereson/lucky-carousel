import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/login/LoginPage'
import Game1Page from './pages/game1/Game1Page'
import Game1RegisterPage from './pages/game1/Game1RegisterPage'
import Game1ResultsPage from './pages/game1/Game1ResultsPage'
import Game2AdminPage from './pages/game2/Game2AdminPage'
import Game2ProjectorPage from './pages/game2/Game2ProjectorPage'
import Game2RegisterPage from './pages/game2/Game2RegisterPage'
import Game2QuestionPage from './pages/game2/Game2QuestionPage'
import Game2HostPage from './pages/game2/Game2HostPage'
import Game3Page from './pages/game3/Game3Page'
import Game3ResultsPage from './pages/game3/Game3ResultsPage'
import AdminHub from './pages/admin/AdminHub'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Player & projector routes (public) */}
          <Route path="/game1/play/:sessionId" element={<Game1RegisterPage />} />
          <Route path="/game1/results/:sessionId" element={<Game1ResultsPage />} />
          <Route path="/game2/projector/:sessionId" element={<Game2ProjectorPage />} />
          <Route path="/game2/play/:sessionId" element={<Game2RegisterPage />} />
          <Route path="/game2/play/:sessionId/q" element={<Game2QuestionPage />} />
          <Route path="/game3/results" element={<Game3ResultsPage />} />

          {/* Protected admin routes */}
          <Route path="/admin" element={<ProtectedRoute><AdminHub /></ProtectedRoute>} />
          <Route path="/game1" element={<ProtectedRoute><Game1Page /></ProtectedRoute>} />
          <Route path="/game2/admin/:sessionId" element={<ProtectedRoute><Game2AdminPage /></ProtectedRoute>} />
          <Route path="/game2/host/:sessionId" element={<ProtectedRoute><Game2HostPage /></ProtectedRoute>} />
          <Route path="/game3" element={<ProtectedRoute><Game3Page /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
