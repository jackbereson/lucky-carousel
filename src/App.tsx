import { BrowserRouter, Routes, Route } from 'react-router-dom'
import GamePage from './pages/GamePage'
import ResultsPage from './pages/ResultsPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GamePage />} />
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
