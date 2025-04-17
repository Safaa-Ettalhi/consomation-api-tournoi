"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import api from "../services/api"
import { useAuth } from "../contexts/AuthContext"

const PlayerList = () => {
  const { id } = useParams()
  const [tournament, setTournament] = useState(null)
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tournamentResponse, playersResponse] = await Promise.all([
          api.get(`/tournaments/${id}`),
          api.get(`/tournaments/${id}/players`),
        ])

        setTournament(tournamentResponse.data)
        setPlayers(playersResponse.data)
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
        setError("Impossible de charger les données. Veuillez réessayer plus tard.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleDeletePlayer = async (playerId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce joueur ? Cette action est irréversible.")) {
      try {
        await api.delete(`/tournaments/${id}/players/${playerId}`)
        setPlayers(players.filter((player) => player.id !== playerId))
      } catch (error) {
        console.error("Erreur lors de la suppression du joueur:", error)
        setError("Impossible de supprimer le joueur. Veuillez réessayer plus tard.")
      }
    }
  }

  if (loading) {
    return <div className="loading">Chargement des joueurs...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  if (!tournament) {
    return <div className="not-found">Tournoi non trouvé.</div>
  }

  const isOwner = isAuthenticated && user && tournament.user_id === user.id
  const canRegister = tournament.status === "open" && isAuthenticated
  const isRegistrationFull = players.length >= tournament.max_players

  return (
    <div className="player-list-container">
      <div className="header">
        <h2>Joueurs du tournoi: {tournament.name}</h2>
        <div className="header-actions">
          <Link to={`/tournaments/${id}`} className="btn btn-secondary">
            Retour au tournoi
          </Link>
          {canRegister && !isRegistrationFull && (
            <Link to={`/tournaments/${id}/players/create`} className="btn btn-primary">
              S'inscrire au tournoi
            </Link>
          )}
        </div>
      </div>

      <div className="registration-status">
        <p>
          <strong>Statut des inscriptions:</strong> {tournament.status === "open" ? "Ouvertes" : "Fermées"}
        </p>
        <p>
          <strong>Joueurs inscrits:</strong> {players.length} / {tournament.max_players}
        </p>
      </div>

      {players.length === 0 ? (
        <p>Aucun joueur inscrit à ce tournoi.</p>
      ) : (
        <div className="player-table-container">
          <table className="player-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Gamertag</th>
                <th>Email</th>
                {isOwner && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.id}>
                  <td>{player.name}</td>
                  <td>{player.gamertag}</td>
                  <td>{player.email || "-"}</td>
                  {isOwner && (
                    <td className="actions">
                      <Link to={`/tournaments/${id}/players/${player.id}/edit`} className="btn btn-sm btn-warning">
                        Modifier
                      </Link>
                      <button onClick={() => handleDeletePlayer(player.id)} className="btn btn-sm btn-danger">
                        Supprimer
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default PlayerList
