<?php

namespace App\Http\Controllers;

use App\Models\Player;
use App\Models\Tournament;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PlayerController extends Controller
{
    public function index(Tournament $tournament)
    {
        $players = $tournament->players;
        return response()->json($players);
    }

    public function store(Request $request, Tournament $tournament)
    {
       
        if ($tournament->status !== 'open') {
            return response()->json(['message' => 'Les inscriptions pour ce tournoi ne sont pas ouvertes'], 400);
        }

       
        if ($tournament->players()->count() >= $tournament->max_players) {
            return response()->json(['message' => 'Le nombre maximum de joueurs est atteint'], 400);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'gamertag' => 'required|string|max:255',
        ]);

        $player = $tournament->players()->create([
            'name' => $request->name,
            'email' => $request->email,
            'gamertag' => $request->gamertag,
            'user_id' => $request->user()->id,
            'total_score' => 0,
            'wins' => 0,
            'losses' => 0,
        ]);

        return response()->json($player, 201);
    }

    public function show(Tournament $tournament, Player $player)
    {
        
        if ($player->tournament_id !== $tournament->id) {
            return response()->json(['message' => 'Joueur non trouvé dans ce tournoi'], 404);
        }

        $player->load('matches');
        return response()->json($player);
    }

    public function update(Request $request, Tournament $tournament, Player $player)
    {
        try {
            Log::info('Début de la mise à jour du joueur', [
                'tournament_id' => $tournament->id,
                'player_id' => $player->id,
                'request_data' => $request->all()
            ]);
            
            
            if ($player->tournament_id !== $tournament->id) {
                Log::warning('Joueur non trouvé dans ce tournoi', [
                    'tournament_id' => $tournament->id,
                    'player_id' => $player->id,
                    'player_tournament_id' => $player->tournament_id
                ]);
                return response()->json(['message' => 'Joueur non trouvé dans ce tournoi'], 404);
            }

           
            if ($request->user()->id !== $player->user_id && $request->user()->id !== $tournament->user_id) {
                Log::warning('Utilisateur non autorisé', [
                    'user_id' => $request->user()->id,
                    'player_user_id' => $player->user_id,
                    'tournament_user_id' => $tournament->user_id
                ]);
                return response()->json(['message' => 'Non autorisé'], 403);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'nullable|email',
                'gamertag' => 'required|string|max:255',
            ]);

           
            $player->name = $validated['name'];
            $player->email = $validated['email'];
            $player->gamertag = $validated['gamertag'];
            $player->save();

            Log::info('Joueur mis à jour avec succès', [
                'player_id' => $player->id,
                'updated_data' => $validated
            ]);

            return response()->json($player);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la mise à jour du joueur', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Erreur lors de la mise à jour du joueur: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(Request $request, Tournament $tournament, Player $player)
    {

        if ($player->tournament_id !== $tournament->id) {
            return response()->json(['message' => 'Joueur non trouvé dans ce tournoi'], 404);
        }

        if ($request->user()->id !== $player->user_id && $request->user()->id !== $tournament->user_id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $player->delete();

        return response()->json(['message' => 'Joueur supprimé avec succès']);
    }
    
    public function stats(Tournament $tournament, Player $player)
    {
        
        if ($player->tournament_id !== $tournament->id) {
            return response()->json(['message' => 'Joueur non trouvé dans ce tournoi'], 404);
        }
        
        $matches = $player->matches()->where('tournament_id', $tournament->id)->get();
        $matchCount = $matches->count();
        $winRate = $matchCount > 0 ? round(($player->wins / $matchCount) * 100, 2) : 0;
        
        return response()->json([
            'player' => $player,
            'match_count' => $matchCount,
            'win_rate' => $winRate,
            'rank' => $this->getPlayerRank($tournament, $player),
        ]);
    }
    
    private function getPlayerRank(Tournament $tournament, Player $player)
    {
        $players = $tournament->players()
            ->orderBy('wins', 'desc')
            ->orderBy('total_score', 'desc')
            ->get();
            
        $rank = 1;
        foreach ($players as $p) {
            if ($p->id === $player->id) {
                return $rank;
            }
            $rank++;
        }
        
        return null;
    }
}
