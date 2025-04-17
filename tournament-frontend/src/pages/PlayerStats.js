import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import api from "../services/api"

const PlayerStats = () => {
  const { tournamentId, playerId } = useParams()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get(`/tournaments/${tournamentId}/players/${playerId}/stats`)
        setStats(response.data)
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error)
        setError("Impossible de charger les statistiques. Veuillez réessayer plus tard.")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [tournamentId, playerId])

  if (loading) {
    return <div className="loading">Chargement des statistiques...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  if (!stats) {
    return <div className="not-found">Joueur non trouvé.</div>
  }

  const { player, match_count, win_rate, rank } = stats

  return (
    <div className="player-stats-container">
      <div className="header">
        <h2>Statistiques de {player.gamertag}</h2>
        <div className="header-actions">
          <Link to={`/tournaments/${tournamentId}/players`} className="btn btn-secondary">
            Retour aux joueurs
          </Link>
          <Link to={`/tournaments/${tournamentId}/leaderboard`} className="btn btn-secondary">
            Voir le classement
          </Link>
        </div>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-value">{rank}</div>
          <div className="stat-label">Classement</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{player.wins}</div>
          <div className="stat-label">Victoires</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{player.losses}</div>
          <div className="stat-label">Défaites</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{match_count}</div>
          <div className="stat-label">Matchs joués</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{win_rate}%</div>
          <div className="stat-label">Taux de victoire</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{player.total_score}</div>
          <div className="stat-label">Score total</div>
        </div>
      </div>

      <div className="player-info">
        <h3>Informations du joueur</h3>
        <p><strong>Nom:</strong> {player.name}</p>
        {player.email && <p><strong>Email:</strong> {player.email}</p>}
        <p><strong>Gamertag:</strong> {player.gamertag}</p>
      </div>
    </div>
  )
}

export default PlayerStats