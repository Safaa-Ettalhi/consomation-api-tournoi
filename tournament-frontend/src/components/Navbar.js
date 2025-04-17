"use client"

import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useState } from "react"

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [avatarError, setAvatarError] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const handleAvatarError = () => {
    console.error("Erreur de chargement de l'avatar dans la navbar:", user.avatar)
    setAvatarError(true)
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Tournois Gaming</Link>
      </div>
      <div className="navbar-menu">
        <Link to="/tournaments">Tournois</Link>
        {isAuthenticated ? (
          <>
            <Link to="/tournaments/create">Créer un tournoi</Link>
            <div className="dropdown">
              <span className="user-info">
                {user.avatar && !avatarError ? (
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                    className="avatar-small"
                    onError={handleAvatarError}
                  />
                ) : (
                  <span className="avatar-placeholder-small">{user.name.charAt(0)}</span>
                )}
                {user.name} ▼
              </span>
              <div className="dropdown-content">
                <Link to="/profile">Mon profil</Link>
                <Link to="/my-tournaments">Mes tournois</Link>
                <button onClick={handleLogout} className="dropdown-item">
                  Déconnexion
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <Link to="/login">Connexion</Link>
            <Link to="/register">Inscription</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
