import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import { useAuth } from "../contexts/AuthContext"

const ProfileEdit = () => {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    bio: user.bio || "",
    avatar: null,
    current_password: "",
    password: "",
    password_confirmation: "",
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleFileChange = (e) => {
    setFormData({ ...formData, avatar: e.target.files[0] })
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.name) {
      newErrors.name = "Le nom est requis"
    }

    if (!formData.email) {
      newErrors.email = "L'email est requis"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'email est invalide"
    }

    if (formData.password) {
      if (!formData.current_password) {
        newErrors.current_password = "Le mot de passe actuel est requis pour changer de mot de passe"
      }

      if (formData.password.length < 8) {
        newErrors.password = "Le mot de passe doit contenir au moins 8 caractères"
      }

      if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = "Les mots de passe ne correspondent pas"
      }
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = validate()
    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true)

      try {
        const data = new FormData()
        data.append("name", formData.name)
        data.append("email", formData.email)
        data.append("bio", formData.bio)

        if (formData.avatar) {
          data.append("avatar", formData.avatar)
        }

        if (formData.password) {
          data.append("current_password", formData.current_password)
          data.append("password", formData.password)
          data.append("password_confirmation", formData.password_confirmation)
        }

        const response = await api.post("/profile", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })

        updateUser(response.data.user)
        setMessage("Profil mis à jour avec succès")

        setTimeout(() => {
          navigate("/profile")
        }, 2000)
      } catch (error) {
        console.error("Erreur lors de la mise à jour du profil:", error)
        setErrors(
          error.response?.data?.errors || {
            general: "Impossible de mettre à jour le profil. Veuillez réessayer plus tard.",
          }
        )
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="profile-edit-container">
      <h2>Modifier le profil</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {errors.general && <div className="alert alert-danger">{errors.general}</div>}

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
          <label htmlFor="email">Email</label>
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
          <label htmlFor="bio">Biographie</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="form-control"
            rows="4"
          />
        </div>

        <div className="form-group">
          <label htmlFor="avatar">Avatar</label>
          <input
            type="file"
            id="avatar"
            name="avatar"
            onChange={handleFileChange}
            className="form-control"
            accept="image/*"
          />
          <small className="form-text text-muted">
            Formats acceptés: JPG, PNG, GIF. Taille maximale: 2 Mo.
          </small>
        </div>

        <h3 className="mt-4">Changer le mot de passe</h3>
        <p className="text-muted">Laissez vide si vous ne souhaitez pas changer de mot de passe</p>

        <div className="form-group">
          <label htmlFor="current_password">Mot de passe actuel</label>
          <input
            type="password"
            id="current_password"
            name="current_password"
            value={formData.current_password}
            onChange={handleChange}
            className={errors.current_password ? "form-control is-invalid" : "form-control"}
          />
          {errors.current_password && <div className="invalid-feedback">{errors.current_password}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Nouveau mot de passe</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? "form-control is-invalid" : "form-control"}
          />
          {errors.password && <div className="invalid-feedback">{errors.password}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="password_confirmation">Confirmer le nouveau mot de passe</label>
          <input
            type="password"
            id="password_confirmation"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            className={errors.password_confirmation ? "form-control is-invalid" : "form-control"}
          />
          {errors.password_confirmation && <div className="invalid-feedback">{errors.password_confirmation}</div>}
        </div>

        <div className="form-actions d-flex justify-content-between mt-4">
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/profile")}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProfileEdit
