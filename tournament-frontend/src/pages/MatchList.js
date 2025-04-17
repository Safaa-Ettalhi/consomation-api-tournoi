"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import api from "../services/api"
import { useAuth } from "../contexts/AuthContext"

const MatchList = () => {
  const { id } = useParams()
  const [tournament, setTournament] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tournamentResponse, matchesResponse] = await Promise.all([
          api.get(`/tournaments/${id}`),
          api.get(`/tournaments/${id}/matches`),
        ])

        setTournament(tournamentResponse.data)
        setMatches(matchesResponse.data)
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
        setError("Impossible de charger les données. Veuillez réessayer plus tard.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleDeleteMatch = async (matchId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce match ? Cette action est irréversible.")) {
      try {
        await api.delete(`/tournaments/${id}/matches/${matchId}`)
        setMatches(matches.filter((match) => match.id !== matchId))
      } catch (error) {
        console.error("Erreur lors de la suppression du match:", error)
        setError("Impossible de supprimer le match. Veuillez réessayer plus tard.")
      }
    }
  }

  if (loading) {
    return <div className="loading">Chargement des matchs...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  if (!tournament) {
    return <div className="not-found">Tournoi non trouvé.</div>
  }

  const isOwner = isAuthenticated && user && tournament.user_id === user.id
  const canCreateMatch = isOwner && tournament.status !== "draft" && tournament.status !== "completed"

  return (
    <div className="match-list-container">
      <div className="header">
        <h2>Matchs du tournoi: {tournament.name}</h2>
        <div className="header-actions">
          <Link to={`/tournaments/${id}`} className="btn btn-secondary">
            Retour au tournoi
          </Link>
          {canCreateMatch && (
            <Link to={`/tournaments/${id}/matches/create`} className="btn btn-primary">
              Créer un match
            </Link>
          )}
        </div>
      </div>

      {matches.length === 0 ? (
        <p>Aucun match créé pour ce tournoi.</p>
      ) : (
        <div className="match-grid">
          {matches.map((match) => (
            <div key={match.id} className="match-card">
              <div className="match-header">
                <h3>
                  Match #{match.id} - Round {match.round}
                </h3>
                <div className={`status-badge ${match.status}`}>
                  {match.status === "pending" && "En attente"}
                  {match.status === "in_progress" && "En cours"}
                  {match.status === "completed" && "Terminé"}
                </div>
              </div>

              <div className="match-date">
                {match.match_date ? (
                  <p>Date: {new Date(match.match_date).toLocaleString()}</p>
                ) : (
                  <p>Date: Non programmé</p>
                )}
              </div>

              <div className="match-players">
                <h4>Joueurs</h4>
                {match.players && match.players.length > 0 ? (
                  <div className="players-container">
                    {match.players.map((player) => (
                      <div key={player.id} className="player-score">
                        <span className="player-name">{player.gamertag}</span>
                        <span className="player-score-value">Score: {player.pivot.score}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Aucun joueur assigné</p>
                )}
              </div>

              {isOwner && (
                <div className="match-actions">
                  <Link to={`/tournaments/${id}/matches/${match.id}/edit`} className="btn btn-sm btn-warning">
                    Modifier
                  </Link>
                  <button onClick={() => handleDeleteMatch(match.id)} className="btn btn-sm btn-danger">
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MatchList
