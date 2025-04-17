import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const MatchForm = () => {
  const { id, matchId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!matchId;

  const [tournament, setTournament] = useState(null);
  const [players, setPlayers] = useState([]);
  const [formData, setFormData] = useState({
    round: 1,
    match_date: "",
    status: "pending",
    player_ids: [],
    scores: [],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      console.log(`Tentative de récupération des données - Tournoi ID: ${id}, Match ID: ${matchId}`);
      
      try {
        // Récupérer le tournoi
        console.log(`Récupération du tournoi ${id}...`);
        let tournamentResponse;
        try {
          tournamentResponse = await api.get(`/tournaments/${id}`);
          console.log('Tournoi récupéré avec succès:', tournamentResponse.data);
          setTournament(tournamentResponse.data);
        } catch (tournamentError) {
          console.error(`Erreur lors de la récupération du tournoi:`, tournamentError);
          console.error('Détails de l\'erreur:', tournamentError.response?.data);
          setError(`Impossible de charger le tournoi: ${tournamentError.response?.data?.message || tournamentError.message}`);
          setFetchLoading(false);
          return; // Arrêter l'exécution si le tournoi n'est pas trouvé
        }

        // Récupérer les joueurs
        console.log(`Récupération des joueurs du tournoi ${id}...`);
        let playersResponse;
        try {
          playersResponse = await api.get(`/tournaments/${id}/players`);
          console.log('Joueurs récupérés avec succès:', playersResponse.data);
          setPlayers(playersResponse.data);
        } catch (playersError) {
          console.error(`Erreur lors de la récupération des joueurs:`, playersError);
          console.error('Détails de l\'erreur:', playersError.response?.data);
          // Continuer même si les joueurs ne sont pas récupérés
        }

        // Si on est en mode édition, récupérer les données du match
        if (isEditing) {
          console.log(`Mode édition - Récupération du match ${matchId}...`);
          try {
            // Utiliser les nouveaux paramètres de route
            const matchResponse = await api.get(`/tournaments/${id}/matches/${matchId}`);
            console.log('Match récupéré avec succès:', matchResponse.data);
            const match = matchResponse.data;

            // Formater la date pour l'input datetime-local
            const formatDate = (dateString) => {
              if (!dateString) return "";
              const date = new Date(dateString);
              return date.toISOString().slice(0, 16);
            };

            const playerIds = match.players.map((player) => player.id);
            const scores = match.players.map((player) => ({
              player_id: player.id,
              score: player.pivot.score,
            }));

            setFormData({
              round: match.round,
              match_date: formatDate(match.match_date),
              status: match.status,
              player_ids: playerIds,
              scores: scores,
            });
          } catch (matchError) {
            console.error(`Erreur lors de la récupération du match:`, matchError);
            console.error('Détails de l\'erreur:', matchError.response?.data);
            setError(`Impossible de charger le match: ${matchError.response?.data?.message || matchError.message}`);
          }
        }
      } catch (error) {
        console.error("Erreur générale lors du chargement des données:", error);
        console.error('Détails de l\'erreur:', error.response?.data);
        setError(`Impossible de charger les données: ${error.response?.data?.message || error.message}`);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchData();
  }, [id, matchId, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePlayerSelection = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => Number.parseInt(option.value));
    setFormData({ ...formData, player_ids: selectedOptions });

    // Mettre à jour les scores si nécessaire
    const newScores = selectedOptions.map((playerId) => {
      const existingScore = formData.scores.find((s) => s.player_id === playerId);
      return existingScore || { player_id: playerId, score: 0 };
    });

    setFormData((prev) => ({ ...prev, scores: newScores }));
  };

  const handleScoreChange = (playerId, score) => {
    const newScores = formData.scores.map((s) =>
      s.player_id === playerId ? { ...s, score: Number.parseInt(score) } : s
    );

    setFormData({ ...formData, scores: newScores });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.round || formData.round < 1) {
      newErrors.round = "Le numéro de round doit être au moins 1";
    }

    if (!isEditing && formData.player_ids.length !== 2) {
      newErrors.player_ids = "Vous devez sélectionner exactement 2 joueurs";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Soumission du formulaire avec les données:", formData);

    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        if (isEditing) {
          console.log(`Mise à jour du match ${matchId}...`);
          // Utiliser les nouveaux paramètres de route
          const updateResponse = await api.put(`/tournaments/${id}/matches/${matchId}`, {
            round: formData.round,
            match_date: formData.match_date,
            status: formData.status,
          });
          console.log('Match mis à jour avec succès:', updateResponse.data);

          // Mettre à jour les scores
          console.log(`Mise à jour des scores du match ${matchId}...`);
          const scoresResponse = await api.put(`/tournaments/${id}/matches/${matchId}/scores`, {
            scores: formData.scores,
            status: formData.status,
          });
          console.log('Scores mis à jour avec succès:', scoresResponse.data);
        } else {
          // Créer un nouveau match
          console.log(`Création d'un nouveau match dans le tournoi ${id}...`);
          const createResponse = await api.post(`/tournaments/${id}/matches`, {
            round: formData.round,
            match_date: formData.match_date,
            status: formData.status,
            player_ids: formData.player_ids,
          });
          console.log('Match créé avec succès:', createResponse.data);
        }
        navigate(`/tournaments/${id}/matches`);
      } catch (error) {
        console.error("Erreur lors de l'enregistrement du match:", error);
        console.error('Détails de l\'erreur:', error.response?.data);
        setError(`Impossible d'enregistrer le match: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  if (fetchLoading) {
    return <div className="loading">Chargement des données...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
        <div className="mt-3">
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="error-message">
        Tournoi non trouvé.
        <div className="mt-3">
          <button onClick={() => navigate("/tournaments")} className="btn btn-primary">
            Retour à la liste des tournois
          </button>
        </div>
      </div>
    );
  }

  if (players.length < 2 && !isEditing) {
    return (
      <div className="error-message">
        Il faut au moins 2 joueurs inscrits pour créer un match.
        <div className="mt-3">
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="match-form-container">
      <h2>{isEditing ? "Modifier le match" : "Créer un match"}</h2>
      <h3>{tournament.name}</h3>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="round">Round</label>
          <input
            type="number"
            id="round"
            name="round"
            value={formData.round}
            onChange={handleChange}
            min="1"
            className={errors.round ? "form-control is-invalid" : "form-control"}
          />
          {errors.round && <div className="invalid-feedback">{errors.round}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="match_date">Date et heure du match (optionnel)</label>
          <input
            type="datetime-local"
            id="match_date"
            name="match_date"
            value={formData.match_date}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Statut</label>
          <select id="status" name="status" value={formData.status} onChange={handleChange} className="form-control">
            <option value="pending">En attente</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminé</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="player_ids">Joueurs</label>
          <select
            id="player_ids"
            name="player_ids"
            multiple
            value={formData.player_ids}
            onChange={handlePlayerSelection}
            className={errors.player_ids ? "form-control is-invalid" : "form-control"}
            size="5"
            disabled={isEditing}
          >
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name} ({player.gamertag})
              </option>
            ))}
          </select>
          {errors.player_ids && <div className="invalid-feedback">{errors.player_ids}</div>}
          <small className="form-text text-muted">
            {isEditing 
              ? "Les joueurs ne peuvent pas être modifiés après la création du match." 
              : "Sélectionnez exactement 2 joueurs (maintenez Ctrl pour sélectionner plusieurs joueurs)."}
          </small>
        </div>

        {formData.player_ids.length > 0 && (
          <div className="form-group">
            <label>Scores</label>
            <div className="scores-container">
              {formData.player_ids.map((playerId) => {
                const player = players.find((p) => p.id === playerId);
                const scoreData = formData.scores.find((s) => s.player_id === playerId) || { score: 0 };

                return player ? (
                  <div key={player.id} className="score-input">
                    <label>{player.gamertag}</label>
                    <input
                      type="number"
                      min="0"
                      value={scoreData.score}
                      onChange={(e) => handleScoreChange(player.id, e.target.value)}
                      className="form-control"
                    />
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Enregistrement..." : isEditing ? "Mettre à jour" : "Créer le match"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MatchForm;