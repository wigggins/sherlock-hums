import { BrowserRouter, Routes, Route, Outlet } from "react-router";
import { WebSocketProvider } from './context/WebSocketContext';
import { PlayerProvider } from "./context/PlayerContext";
import { UserProvider } from "./context/UserContext";
import { SessionListener } from './components/SessionListener/SessionListener';
import { Home } from './pages/Home';
import { Lobby } from './pages/Lobby';
import { SongSubmission } from './pages/SongSubmission';
import './App.css'
import { RoundGuess } from "./pages/RoundGuess";

function App() {
  return (
    <>
    <UserProvider>
      <BrowserRouter>
        <Routes>
        
          <Route path="/" element={<Home />} />
          <Route
            path="/session/:sessionId"
            element={
              <WebSocketProvider> 
                <PlayerProvider>
                  <SessionListener />
                  <Outlet />
                </PlayerProvider>
              </WebSocketProvider>
            }
          >
            <Route path="lobby" element={<Lobby />} />
            <Route path="submission" element={<SongSubmission />} />
            <Route path="round/:roundId" element={<RoundGuess />} />
          </Route>
          
        </Routes>
      </BrowserRouter>
      </UserProvider>
    </>
  )
}

export default App
