import { Link } from "react-router-dom"

const Home = () => {
  return (
    <div className="home-container">
      <h1>Bienvenue sur la plateforme de gestion de tournois de jeux vidéo</h1>
      <p>
        Organisez facilement vos tournois, inscrivez des joueurs, planifiez des matchs et suivez les scores en temps
        réel.
      </p>
      <div className="cta-buttons">
        <Link to="/tournaments" className="btn btn-primary">
          Voir les tournois
        </Link>
        <Link to="/register" className="btn btn-secondary">
          Créer un compte
        </Link>
      </div>
      <div className="features">
        <div className="feature">
          <h3>Créez des tournois</h3>
          <p>Définissez le nom, le jeu, les dates et le nombre maximum de participants.</p>
        </div>
        <div className="feature">
          <h3>Gérez les inscriptions</h3>
          <p>Inscrivez des joueurs et suivez la liste des participants.</p>
        </div>
        <div className="feature">
          <h3>Organisez les matchs</h3>
          <p>Créez des matchs, définissez les horaires et mettez à jour les scores.</p>
        </div>
        <div className="feature">
          <h3>Suivez les performances</h3>
          <p>Consultez les statistiques des joueurs et le classement des tournois.</p>
        </div>
      </div>
    </div>
  )
}

export default Home