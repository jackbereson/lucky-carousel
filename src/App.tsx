import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
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
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/game1" element={<Game1Page />} />
        <Route path="/game1/play/:sessionId" element={<Game1RegisterPage />} />
        <Route path="/game1/results/:sessionId" element={<Game1ResultsPage />} />
        <Route path="/game2/admin/:sessionId" element={<Game2AdminPage />} />
        <Route path="/game2/host/:sessionId" element={<Game2HostPage />} />
        <Route path="/game2/projector/:sessionId" element={<Game2ProjectorPage />} />
        <Route path="/game2/play/:sessionId" element={<Game2RegisterPage />} />
        <Route path="/game2/play/:sessionId/q" element={<Game2QuestionPage />} />
        <Route path="/game3" element={<Game3Page />} />
        <Route path="/game3/results" element={<Game3ResultsPage />} />
        <Route path="/admin" element={<AdminHub />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
