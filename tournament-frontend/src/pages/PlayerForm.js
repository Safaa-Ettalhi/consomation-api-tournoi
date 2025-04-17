"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../services/api"

const PlayerForm = () => {
  const { tournamentId, playerId, id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!playerId

  // Déterminer l'ID du tournoi à utiliser (soit tournamentId, soit id)
  const tournamentIdToUse = tournamentId || id

  const [tournament, setTournament] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gamertag: "",
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`Fetching tournament with ID: ${tournamentIdToUse}`)
        const tournamentResponse = await api.get(`/tournaments/${tournamentIdToUse}`)
        setTournament(tournamentResponse.data)

        if (isEditing && playerId) {
          console.log(`Fetching player with ID: ${playerId} from tournament: ${tournamentIdToUse}`)
          const playerResponse = await api.get(`/tournaments/${tournamentIdToUse}/players/${playerId}`)
          const player = playerResponse.data

          setFormData({
            name: player.name,
            email: player.email || "",
            gamertag: player.gamertag,
          })
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
        setError(`Impossible de charger les données: ${error.response?.data?.message || error.message}`)
      } finally {
        setFetchLoading(false)
      }
    }

    fetchData()
  }, [tournamentIdToUse, playerId, isEditing])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.name) {
      newErrors.name = "Le nom est requis"
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'email est invalide"
    }

    if (!formData.gamertag) {
      newErrors.gamertag = "Le gamertag est requis"
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = validate()
    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      setLoading(true)
      try {
        console.log("Données du formulaire à envoyer:", formData)

        if (isEditing && playerId) {
          console.log(`Updating player ${playerId} in tournament ${tournamentIdToUse}`)
          const response = await api.put(`/tournaments/${tournamentIdToUse}/players/${playerId}`, formData)
          console.log("Réponse de mise à jour:", response.data)
        } else {
          console.log(`Creating new player in tournament ${tournamentIdToUse}`)
          await api.post(`/tournaments/${tournamentIdToUse}/players`, formData)
        }

        navigate(`/tournaments/${tournamentIdToUse}/players`)
      } catch (error) {
        console.error("Erreur lors de l'enregistrement du joueur:", error)
        setError(`Impossible d'enregistrer le joueur: ${error.response?.data?.message || error.message}`)
      } finally {
        setLoading(false)
      }
    }
  }

  if (fetchLoading) {
    return <div className="loading">Chargement des données...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  if (!tournament) {
    return <div className="not-found">Tournoi non trouvé.</div>
  }

  // Vérifier si les inscriptions sont ouvertes
  if (!isEditing && tournament.status !== "open") {
    return (
      <div className="error-message">
        Les inscriptions pour ce tournoi ne sont pas ouvertes.
        <div className="mt-3">
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Retour
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="player-form-container">
      <h2>{isEditing ? "Modifier le joueur" : "S'inscrire au tournoi"}</h2>
      <h3>{tournament.name}</h3>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nom</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? "form-control is-invalid" : "form-control"}
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email (optionnel)</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? "form-control is-invalid" : "form-control"}
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="gamertag">Gamertag</label>
          <input
            type="text"
            id="gamertag"
            name="gamertag"
            value={formData.gamertag}
            onChange={handleChange}
            className={errors.gamertag ? "form-control is-invalid" : "form-control"}
          />
          {errors.gamertag && <div className="invalid-feedback">{errors.gamertag}</div>}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Enregistrement..." : isEditing ? "Mettre à jour" : "S'inscrire"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PlayerForm
