import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"
import { useAuth } from "../contexts/AuthContext"

const TournamentList = () => {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all") // 'all', 'my', 'open', 'in_progress', 'completed'

  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        let response

        if (filter === "my" && isAuthenticated) {
          response = await api.get("/my-tournaments")
        } else {
          response = await api.get("/tournaments")
        }

        let filteredTournaments = response.data

        if (filter === "open") {
          filteredTournaments = filteredTournaments.filter((t) => t.status === "open")
        } else if (filter === "in_progress") {
          filteredTournaments = filteredTournaments.filter((t) => t.status === "in_progress")
        } else if (filter === "completed") {
          filteredTournaments = filteredTournaments.filter((t) => t.status === "completed")
        }

        setTournaments(filteredTournaments)
      } catch (error) {
        console.error("Erreur lors du chargement des tournois:", error)
        setError("Impossible de charger les tournois. Veuillez réessayer plus tard.")
      } finally {
        setLoading(false)
      }
    }

    fetchTournaments()
  }, [filter, isAuthenticated, user])

  if (loading) {
    return <div className="loading">Chargement des tournois...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  return (
    <div className="tournament-list-container">
      <div className="header">
        <h2>Liste des tournois</h2>
        {isAuthenticated && (
          <Link to="/tournaments/create" className="btn btn-primary">
            Créer un tournoi
          </Link>
        )}
      </div>

      <div className="filters">
        <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
          Tous
        </button>
        {isAuthenticated && (
          <button className={`filter-btn ${filter === "my" ? "active" : ""}`} onClick={() => setFilter("my")}>
            Mes tournois
          </button>
        )}
        <button className={`filter-btn ${filter === "open" ? "active" : ""}`} onClick={() => setFilter("open")}>
          Inscriptions ouvertes
        </button>
        <button
          className={`filter-btn ${filter === "in_progress" ? "active" : ""}`}
          onClick={() => setFilter("in_progress")}
        >
          En cours
        </button>
        <button
          className={`filter-btn ${filter === "completed" ? "active" : ""}`}
          onClick={() => setFilter("completed")}
        >
          Terminés
        </button>
      </div>

      {tournaments.length === 0 ? (
        <p>Aucun tournoi trouvé.</p>
      ) : (
        <div className="tournament-grid">
          {tournaments.map((tournament) => (
            <div key={tournament.id} className="tournament-card">
              <h3>{tournament.name}</h3>
              <p className="game">Jeu: {tournament.game}</p>
              <p className="date">Date: {new Date(tournament.start_date).toLocaleDateString()}</p>
              <p className="status">
                Statut:
                <span className={`status-badge ${tournament.status}`}>
                  {tournament.status === "draft" && "Brouillon"}
                  {tournament.status === "open" && "Inscriptions ouvertes"}
                  {tournament.status === "in_progress" && "En cours"}
                  {tournament.status === "completed" && "Terminé"}
                </span>
              </p>
              <div className="tournament-actions">
                <Link to={`/tournaments/${tournament.id}`} className="btn btn-sm btn-info">
                  Détails
                </Link>
                <Link to={`/tournaments/${tournament.id}/players`} className="btn btn-sm btn-secondary">
                  Joueurs
                </Link>
                <Link to={`/tournaments/${tournament.id}/matches`} className="btn btn-sm btn-secondary">
                  Matchs
                </Link>
                <Link to={`/tournaments/${tournament.id}/leaderboard`} className="btn btn-sm btn-secondary">
                  Classement
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TournamentList