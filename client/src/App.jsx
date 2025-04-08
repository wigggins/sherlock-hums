import { BrowserRouter, Routes, Route, Outlet } from "react-router";
import { WebSocketProvider } from './context/WebSocketContext';
import { Home } from './pages/Home';
import { Lobby } from './pages/Lobby';
import { SongSubmission } from './pages/SongSubmission';
import './App.css'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/session/:sessionId"
            element={
              <WebSocketProvider>
                <Outlet />
              </WebSocketProvider>
            }
          >
            <Route path="lobby" element={<Lobby />} />
            <Route path="submission" element={<SongSubmission />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
