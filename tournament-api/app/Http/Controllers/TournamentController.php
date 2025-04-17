<?php

namespace App\Http\Controllers;

use App\Models\Tournament;
use Illuminate\Http\Request;

class TournamentController extends Controller
{
    public function index()
    {
        $tournaments = Tournament::with('user')->get();
        return response()->json($tournaments);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'game' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'max_players' => 'required|integer|min:2',
            'status' => 'required|in:draft,open,in_progress,completed',
        ]);

        $tournament = Tournament::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'description' => $request->description,
            'game' => $request->game,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'max_players' => $request->max_players,
            'status' => $request->status,
        ]);

        return response()->json($tournament, 201);
    }

    public function show(Tournament $tournament)
    {
        $tournament->load(['user', 'players', 'matches']);
        return response()->json($tournament);
    }

    public function update(Request $request, Tournament $tournament)
    {
        
        if ($request->user()->id !== $tournament->user_id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'game' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'max_players' => 'required|integer|min:2',
            'status' => 'required|in:draft,open,in_progress,completed',
        ]);

        $tournament->update($request->all());

        return response()->json($tournament);
    }

    public function destroy(Request $request, Tournament $tournament)
    {
      
        if ($request->user()->id !== $tournament->user_id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $tournament->delete();

        return response()->json(['message' => 'Tournoi supprimé avec succès']);
    }

    public function myTournaments(Request $request)
    {
        $tournaments = $request->user()->tournaments()->with('players')->get();
        return response()->json($tournaments);
    }
    
    public function leaderboard(Tournament $tournament)
    {
        $players = $tournament->players()
            ->orderBy('wins', 'desc')
            ->orderBy('total_score', 'desc')
            ->get();
            
        return response()->json($players);
    }
}