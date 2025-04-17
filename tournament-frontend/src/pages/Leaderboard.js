import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import api from "../services/api"

const Leaderboard = () => {
  const { id } = useParams()
  const [tournament, setTournament] = useState(null)
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tournamentResponse, leaderboardResponse] = await Promise.all([
          api.get(`/tournaments/${id}`),
          api.get(`/tournaments/${id}/leaderboard`),
        ])

        setTournament(tournamentResponse.data)
        setPlayers(leaderboardResponse.data)
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
        setError("Impossible de charger les données. Veuillez réessayer plus tard.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) {
    return <div className="loading">Chargement du classement...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  if (!tournament) {
    return <div className="not-found">Tournoi non trouvé.</div>
  }

  return (
    <div className="leaderboard-container">
      <div className="header">
        <h2>Classement du tournoi: {tournament.name}</h2>
        <div className="header-actions">
          <Link to={`/tournaments/${id}`} className="btn btn-secondary">
            Retour au tournoi
          </Link>
        </div>
      </div>

      {players.length === 0 ? (
        <p>Aucun joueur inscrit à ce tournoi.</p>
      ) : (
        <div className="leaderboard-table-container">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rang</th>
                <th>Joueur</th>
                <th>Victoires</th>
                <th>Défaites</th>
                <th>Score total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr key={player.id} className={index < 3 ? "top-rank" : ""}>
                  <td className="rank">
                    {index === 0 && <span className="medal gold">1</span>}
                    {index === 1 && <span className="medal silver">2</span>}
                    {index === 2 && <span className="medal bronze">3</span>}
                    {index > 2 && index + 1}
                  </td>
                  <td>{player.gamertag}</td>
                  <td>{player.wins}</td>
                  <td>{player.losses}</td>
                  <td>{player.total_score}</td>
                  <td>
                    <Link
                      to={`/tournaments/${id}/players/${player.id}/stats`}
                      className="btn btn-sm btn-info"
                    >
                      Statistiques
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Leaderboard