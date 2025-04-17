import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import TournamentList from "./pages/TournamentList"
import TournamentDetail from "./pages/TournamentDetail"
import TournamentForm from "./pages/TournamentForm"
import PlayerList from "./pages/PlayerList"
import PlayerForm from "./pages/PlayerForm"
import MatchList from "./pages/MatchList"
import MatchForm from "./pages/MatchForm"
import Profile from "./pages/Profile"
import ProfileEdit from "./pages/ProfileEdit"
import Leaderboard from "./pages/Leaderboard"
import PlayerStats from "./pages/PlayerStats"
import "./App.css"

// Route protégée qui vérifie si l'utilisateur est connecté
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  return isAuthenticated ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/tournaments" element={<TournamentList />} />
              <Route path="/tournaments/:id" element={<TournamentDetail />} />
              <Route
                path="/tournaments/create"
                element={
                  <PrivateRoute>
                    <TournamentForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tournaments/:id/edit"
                element={
                  <PrivateRoute>
                    <TournamentForm />
                  </PrivateRoute>
                }
              />
              <Route path="/tournaments/:id/players" element={<PlayerList />} />
              <Route
                path="/tournaments/:id/players/create"
                element={
                  <PrivateRoute>
                    <PlayerForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tournaments/:tournamentId/players/:playerId/edit"
                element={
                  <PrivateRoute>
                    <PlayerForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tournaments/:tournamentId/players/:playerId/stats"
                element={<PlayerStats />}
              />
              <Route path="/tournaments/:id/matches" element={<MatchList />} />
              <Route
                path="/tournaments/:id/matches/create"
                element={
                  <PrivateRoute>
                    <MatchForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tournaments/:id/matches/:matchId/edit"
                element={
                  <PrivateRoute>
                    <MatchForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile/edit"
                element={
                  <PrivateRoute>
                    <ProfileEdit />
                  </PrivateRoute>
                }
              />
              <Route path="/tournaments/:id/leaderboard" element={<Leaderboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App