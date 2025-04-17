import { createContext, useState, useContext, useEffect } from "react"
import api from "../services/api"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const checkAuth = async () => {
      if (token) {
        try {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`
          const response = await api.get("/user")
          setUser(response.data)
        } catch (error) {
          console.error("Erreur d'authentification:", error)
          logout()
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [token])

  const register = async (userData) => {
    try {
      setError(null)
      const response = await api.post("/register", userData)
      const { user, token } = response.data

      setUser(user)
      setToken(token)
      localStorage.setItem("token", token)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`

      return user
    } catch (error) {
      setError(error.response?.data?.message || "Erreur lors de l'inscription")
      throw error
    }
  }

  const login = async (credentials) => {
    try {
      setError(null)
      const response = await api.post("/login", credentials)
      const { user, token } = response.data

      setUser(user)
      setToken(token)
      localStorage.setItem("token", token)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`

      return user
    } catch (error) {
      setError(error.response?.data?.message || "Identifiants incorrects")
      throw error
    }
  }

  const logout = async () => {
    try {
      if (token) {
        await api.post("/logout")
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem("token")
      delete api.defaults.headers.common["Authorization"]
    }
  }
  
  const updateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}