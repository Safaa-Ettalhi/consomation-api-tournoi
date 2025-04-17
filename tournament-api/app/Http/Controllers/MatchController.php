<?php

namespace App\Http\Controllers;

use App\Models\Matche;
use App\Models\Player;
use App\Models\Tournament;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MatchController extends Controller
{
    public function index($tournamentId)
    {
        $tournament = Tournament::findOrFail($tournamentId);
        $matches = $tournament->matches()->with('players')->get();
        return response()->json($matches);
    }

    public function store(Request $request, $tournamentId)
    {
        $tournament = Tournament::findOrFail($tournamentId);

        
        if ($request->user()->id !== $tournament->user_id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'round' => 'required|integer|min:1',
            'match_date' => 'nullable|date',
            'status' => 'required|in:pending,in_progress,completed',
            'player_ids' => 'required|array|min:2|max:2',
            'player_ids.*' => 'required|exists:players,id',
        ]);

        
        $players = Player::whereIn('id', $request->player_ids)
            ->where('tournament_id', $tournament->id)
            ->get();

        if ($players->count() !== count($request->player_ids)) {
            return response()->json(['message' => 'Certains joueurs n\'appartiennent pas à ce tournoi'], 400);
        }

        try {
            DB::beginTransaction();
            
            
            $match = new Matche();
            $match->tournament_id = $tournament->id;
            $match->round = $request->round;
            $match->match_date = $request->match_date;
            $match->status = $request->status;
            $match->save();
            
            Log::info('Match créé', ['match_id' => $match->id, 'tournament_id' => $tournament->id]);

           
            foreach ($players as $player) {
                Log::info('Association de joueur au match', [
                    'match_id' => $match->id,
                    'player_id' => $player->id
                ]);
                
                $match->players()->attach($player->id, ['score' => 0]);
            }
            
            DB::commit();
            
            $match->load('players');
            return response()->json($match, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Erreur lors de la création du match', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['message' => 'Impossible d\'enregistrer le match: ' . $e->getMessage()], 500);
        }
    }

    public function show($tournamentId, $matchId)
    {
        Log::info('Tentative d\'affichage du match', [
            'tournament_id' => $tournamentId,
            'match_id' => $matchId
        ]);

        $tournament = Tournament::findOrFail($tournamentId);
        $match = Matche::findOrFail($matchId);
        
        
        if ($match->tournament_id !== $tournament->id) {
            Log::warning('Match non trouvé dans ce tournoi', [
                'tournament_id' => $tournament->id,
                'match_id' => $match->id,
                'match_tournament_id' => $match->tournament_id
            ]);
            return response()->json(['message' => 'Match non trouvé dans ce tournoi'], 404);
        }

        $match->load('players');
        return response()->json($match);
    }

    public function update(Request $request, $tournamentId, $matchId)
    {
        Log::info('Tentative de mise à jour du match', [
            'tournament_id' => $tournamentId,
            'match_id' => $matchId
        ]);

        $tournament = Tournament::findOrFail($tournamentId);
        $match = Matche::findOrFail($matchId);
        
       
        if ($match->tournament_id !== $tournament->id) {
            Log::warning('Match non trouvé dans ce tournoi', [
                'tournament_id' => $tournament->id,
                'match_id' => $match->id,
                'match_tournament_id' => $match->tournament_id
            ]);
            return response()->json(['message' => 'Match non trouvé dans ce tournoi'], 404);
        }

       
        if ($request->user()->id !== $tournament->user_id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'round' => 'required|integer|min:1',
            'match_date' => 'nullable|date',
            'status' => 'required|in:pending,in_progress,completed',
        ]);

        $match->update($request->all());
        
        Log::info('Match mis à jour avec succès', [
            'match_id' => $match->id,
            'tournament_id' => $tournament->id
        ]);

        return response()->json($match);
    }

    public function destroy(Request $request, $tournamentId, $matchId)
    {
        $tournament = Tournament::findOrFail($tournamentId);
        $match = Matche::findOrFail($matchId);
        
        
        if ($match->tournament_id !== $tournament->id) {
            return response()->json(['message' => 'Match non trouvé dans ce tournoi'], 404);
        }

        
        if ($request->user()->id !== $tournament->user_id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $match->delete();
        
        Log::info('Match supprimé avec succès', [
            'match_id' => $matchId,
            'tournament_id' => $tournamentId
        ]);

        return response()->json(['message' => 'Match supprimé avec succès']);
    }

    public function updateScores(Request $request, $tournamentId, $matchId)
    {
        $tournament = Tournament::findOrFail($tournamentId);
        $match = Matche::findOrFail($matchId);
        
        // Vérifier si le match appartient au tournoi
        if ($match->tournament_id !== $tournament->id) {
            return response()->json(['message' => 'Match non trouvé dans ce tournoi'], 404);
        }

        if ($request->user()->id !== $tournament->user_id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'scores' => 'required|array',
            'scores.*.player_id' => 'required|exists:players,id',
            'scores.*.score' => 'required|integer|min:0',
        ]);

        DB::beginTransaction();
        
        try {
           
            $playerIds = collect($request->scores)->pluck('player_id')->toArray();
            $players = Player::whereIn('id', $playerIds)->get();
            
            
            foreach ($playerIds as $playerId) {
                $playerInMatch = $match->players()->where('players.id', $playerId)->exists();
                
                if (!$playerInMatch) {
                    DB::rollBack();
                    return response()->json(['message' => 'Un des joueurs n\'est pas dans ce match'], 400);
                }
            }
           
            $winner = null;
            $maxScore = -1;
            
            foreach ($request->scores as $scoreData) {
                $playerId = $scoreData['player_id'];
                $score = $scoreData['score'];
                
               
                $match->players()->updateExistingPivot($playerId, [
                    'score' => $score
                ]);
                
              
                if ($score > $maxScore) {
                    $maxScore = $score;
                    $winner = $players->firstWhere('id', $playerId);
                }
            }
            
          
            if ($request->status === 'completed') {
                $match->update(['status' => 'completed']);
              
                foreach ($players as $player) {
                    $isWinner = $winner && $player->id === $winner->id;
                    
              
                    $playerScore = $match->players()
                        ->where('players.id', $player->id)
                        ->first()
                        ->pivot
                        ->score;
                   
                    $player->total_score = ($player->total_score ?? 0) + $playerScore;
                    
                    if ($isWinner) {
                        $player->wins = ($player->wins ?? 0) + 1;
                    } else {
                        $player->losses = ($player->losses ?? 0) + 1;
                    }
                    
                    $player->save();
                }
            }
            
            DB::commit();
            
            Log::info('Scores mis à jour avec succès', [
                'match_id' => $match->id,
                'tournament_id' => $tournament->id
            ]);
            
            $match->load('players');
            return response()->json($match);
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Erreur lors de la mise à jour des scores', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['message' => 'Erreur lors de la mise à jour des scores: ' . $e->getMessage()], 500);
        }
    }
}