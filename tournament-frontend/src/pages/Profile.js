"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"
import { useAuth } from "../contexts/AuthContext"

const Profile = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [avatarError, setAvatarError] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/profile/stats")
        setStats(response.data)
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error)
        setError("Impossible de charger les statistiques. Veuillez réessayer plus tard.")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const handleAvatarError = () => {
    console.error("Erreur de chargement de l'avatar:", user.avatar)
    setAvatarError(true)
  }

  if (loading) {
    return <div className="loading">Chargement du profil...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.avatar && !avatarError ? (
            <>
              <img
                src={user.avatar || "/placeholder.svg"}
                alt={user.name}
                className="avatar-large"
                onError={handleAvatarError}
              />
              <div className="avatar-debug">
                <small className="text-muted">URL: {user.avatar}</small>
              </div>
            </>
          ) : (
            <div className="avatar-placeholder">{user.name.charAt(0)}</div>
          )}
        </div>
        <div className="profile-info">
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          {user.bio && <p className="bio">{user.bio}</p>}
          <Link to="/profile/edit" className="btn btn-primary">
            Modifier le profil
          </Link>
        </div>
      </div>

      <div className="profile-stats">
        <h3>Statistiques</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.tournaments_created}</div>
            <div className="stat-label">Tournois créés</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.tournaments_completed}</div>
            <div className="stat-label">Tournois terminés</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.total_matches}</div>
            <div className="stat-label">Matchs joués</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.total_wins}</div>
            <div className="stat-label">Victoires</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.win_rate}%</div>
            <div className="stat-label">Taux de victoire</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.total_score}</div>
            <div className="stat-label">Score total</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
