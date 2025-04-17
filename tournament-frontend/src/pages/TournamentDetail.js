import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import api from "../services/api"
import { useAuth } from "../contexts/AuthContext"

const TournamentDetail = () => {
  const { id } = useParams()
  const [tournament, setTournament] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await api.get(`/tournaments/${id}`)
        setTournament(response.data)
      } catch (error) {
        console.error("Erreur lors du chargement du tournoi:", error)
        setError("Impossible de charger les détails du tournoi. Veuillez réessayer plus tard.")
      } finally {
        setLoading(false)
      }
    }

    fetchTournament()
  }, [id])

  const handleDelete = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce tournoi ? Cette action est irréversible.")) {
      try {
        await api.delete(`/tournaments/${id}`)
        navigate("/tournaments")
      } catch (error) {
        console.error("Erreur lors de la suppression du tournoi:", error)
        setError("Impossible de supprimer le tournoi. Veuillez réessayer plus tard.")
      }
    }
  }

  if (loading) {
    return <div className="loading">Chargement des détails du tournoi...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  if (!tournament) {
    return <div className="not-found">Tournoi non trouvé.</div>
  }

  const isOwner = isAuthenticated && user && tournament.user_id === user.id

  return (
    <div className="tournament-detail-container">
      <div className="header">
        <h2>{tournament.name}</h2>
        <div className="status-badge-large">
          {tournament.status === "draft" && "Brouillon"}
          {tournament.status === "open" && "Inscriptions ouvertes"}
          {tournament.status === "in_progress" && "En cours"}
          {tournament.status === "completed" && "Terminé"}
        </div>
      </div>

      <div className="tournament-info">
        <div className="info-section">
          <h3>Informations générales</h3>
          <p>
            <strong>Jeu:</strong> {tournament.game}
          </p>
          <p>
            <strong>Organisateur:</strong> {tournament.user?.name || "Non spécifié"}
          </p>
          <p>
            <strong>Date de début:</strong> {new Date(tournament.start_date).toLocaleDateString()}
          </p>
          {tournament.end_date && (
            <p>
              <strong>Date de fin:</strong> {new Date(tournament.end_date).toLocaleDateString()}
            </p>
          )}
          <p>
            <strong>Nombre maximum de joueurs:</strong> {tournament.max_players}
          </p>
          <p>
            <strong>Joueurs inscrits:</strong> {tournament.players?.length || 0}
          </p>
        </div>

        <div className="info-section">
          <h3>Description</h3>
          <p>{tournament.description || "Aucune description disponible."}</p>
        </div>
      </div>

      <div className="tournament-actions">
        <div className="action-buttons">
          <Link to={`/tournaments/${tournament.id}/players`} className="btn btn-primary">
            Voir les joueurs
          </Link>
          <Link to={`/tournaments/${tournament.id}/matches`} className="btn btn-primary">
            Voir les matchs
          </Link>
          <Link to={`/tournaments/${tournament.id}/leaderboard`} className="btn btn-primary">
            Voir le classement
          </Link>

          {tournament.status === "open" && isAuthenticated && (
            <Link to={`/tournaments/${tournament.id}/players/create`} className="btn btn-success">
              S'inscrire au tournoi
            </Link>
          )}

          {isOwner && (
            <>
              <Link to={`/tournaments/${tournament.id}/edit`} className="btn btn-warning">
                Modifier le tournoi
              </Link>
              <button onClick={handleDelete} className="btn btn-danger">
                Supprimer le tournoi
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TournamentDetail