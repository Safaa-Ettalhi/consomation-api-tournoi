import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../services/api"

const TournamentForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    game: "",
    start_date: "",
    end_date: "",
    max_players: 16,
    status: "draft",
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(isEditing)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTournament = async () => {
      if (isEditing) {
        try {
          const response = await api.get(`/tournaments/${id}`)
          const tournament = response.data

          // Formater les dates pour l'input date
          const formatDate = (dateString) => {
            if (!dateString) return ""
            const date = new Date(dateString)
            return date.toISOString().split("T")[0]
          }

          setFormData({
            name: tournament.name,
            description: tournament.description || "",
            game: tournament.game,
            start_date: formatDate(tournament.start_date),
            end_date: formatDate(tournament.end_date) || "",
            max_players: tournament.max_players,
            status: tournament.status,
          })
        } catch (error) {
          console.error("Erreur lors du chargement du tournoi:", error)
          setError("Impossible de charger les détails du tournoi. Veuillez réessayer plus tard.")
        } finally {
          setFetchLoading(false)
        }
      }
    }

    fetchTournament()
  }, [id, isEditing])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.name) {
      newErrors.name = "Le nom du tournoi est requis"
    }

    if (!formData.game) {
      newErrors.game = "Le nom du jeu est requis"
    }

    if (!formData.start_date) {
      newErrors.start_date = "La date de début est requise"
    }

    if (formData.end_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      newErrors.end_date = "La date de fin doit être postérieure à la date de début"
    }

    if (!formData.max_players || formData.max_players < 2) {
      newErrors.max_players = "Le nombre maximum de joueurs doit être d'au moins 2"
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
        if (isEditing) {
          await api.put(`/tournaments/${id}`, formData)
        } else {
          await api.post("/tournaments", formData)
        }
        navigate("/tournaments")
      } catch (error) {
        console.error("Erreur lors de l'enregistrement du tournoi:", error)
        setError("Impossible d'enregistrer le tournoi. Veuillez réessayer plus tard.")
      } finally {
        setLoading(false)
      }
    }
  }

  if (fetchLoading) {
    return <div className="loading">Chargement des données du tournoi...</div>
  }

  return (
    <div className="tournament-form-container">
      <h2>{isEditing ? "Modifier le tournoi" : "Créer un nouveau tournoi"}</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nom du tournoi</label>
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
          <label htmlFor="game">Jeu</label>
          <input
            type="text"
            id="game"
            name="game"
            value={formData.game}
            onChange={handleChange}
            className={errors.game ? "form-control is-invalid" : "form-control"}
          />
          {errors.game && <div className="invalid-feedback">{errors.game}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-control"
            rows="4"
          />
        </div>

        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="start_date">Date de début</label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className={errors.start_date ? "form-control is-invalid" : "form-control"}
            />
            {errors.start_date && <div className="invalid-feedback">{errors.start_date}</div>}
          </div>

          <div className="form-group col-md-6">
            <label htmlFor="end_date">Date de fin (optionnelle)</label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className={errors.end_date ? "form-control is-invalid" : "form-control"}
            />
            {errors.end_date && <div className="invalid-feedback">{errors.end_date}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="max_players">Nombre maximum de joueurs</label>
            <input
              type="number"
              id="max_players"
              name="max_players"
              value={formData.max_players}
              onChange={handleChange}
              min="2"
              className={errors.max_players ? "form-control is-invalid" : "form-control"}
            />
            {errors.max_players && <div className="invalid-feedback">{errors.max_players}</div>}
          </div>

          <div className="form-group col-md-6">
            <label htmlFor="status">Statut</label>
            <select id="status" name="status" value={formData.status} onChange={handleChange} className="form-control">
              <option value="draft">Brouillon</option>
              <option value="open">Inscriptions ouvertes</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminé</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Enregistrement..." : isEditing ? "Mettre à jour" : "Créer le tournoi"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default TournamentForm