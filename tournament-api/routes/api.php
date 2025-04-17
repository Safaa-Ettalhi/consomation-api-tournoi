<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\TournamentController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\MatchController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

// Routes publiques
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {
    // Authentification
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Profil utilisateur
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile', [ProfileController::class, 'update']);
    Route::get('/profile/stats', [ProfileController::class, 'stats']);
    
    // Tournois
    Route::get('/tournaments', [TournamentController::class, 'index']);
    Route::post('/tournaments', [TournamentController::class, 'store']);
    Route::get('/tournaments/{tournament}', [TournamentController::class, 'show']);
    Route::put('/tournaments/{tournament}', [TournamentController::class, 'update']);
    Route::delete('/tournaments/{tournament}', [TournamentController::class, 'destroy']);
    Route::get('/my-tournaments', [TournamentController::class, 'myTournaments']);
    Route::get('/tournaments/{tournament}/leaderboard', [TournamentController::class, 'leaderboard']);
    
    // Joueurs
    Route::get('/tournaments/{tournament}/players', [PlayerController::class, 'index']);
    Route::post('/tournaments/{tournament}/players', [PlayerController::class, 'store']);
    Route::get('/tournaments/{tournament}/players/{player}', [PlayerController::class, 'show']);
    Route::put('/tournaments/{tournament}/players/{player}', [PlayerController::class, 'update']);
    Route::delete('/tournaments/{tournament}/players/{player}', [PlayerController::class, 'destroy']);
    Route::get('/tournaments/{tournament}/players/{player}/stats', [PlayerController::class, 'stats']);
    
   

    // Matchs
Route::get('/tournaments/{tournamentId}/matches', [MatchController::class, 'index']);
Route::post('/tournaments/{tournamentId}/matches', [MatchController::class, 'store']);
Route::get('/tournaments/{tournamentId}/matches/{matchId}', [MatchController::class, 'show']);
Route::put('/tournaments/{tournamentId}/matches/{matchId}', [MatchController::class, 'update']);
Route::delete('/tournaments/{tournamentId}/matches/{matchId}', [MatchController::class, 'destroy']);
Route::put('/tournaments/{tournamentId}/matches/{matchId}/scores', [MatchController::class, 'updateScores']);
});