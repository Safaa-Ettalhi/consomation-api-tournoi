<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    
    public function show(Request $request)
    {
        try {
            $user = $request->user();
            $user->load(['tournaments', 'players']);
            
            
            if ($user->avatar) {
                $user->avatar = $this->getAbsoluteUrl($user->avatar);
            }
            
            return response()->json($user);
        } catch (\Exception $e) {
            Log::error('Erreur lors du chargement du profil: ' . $e->getMessage());
            return response()->json(['message' => 'Impossible de charger le profil: ' . $e->getMessage()], 500);
        }
    }

  
    public function update(Request $request)
    {
        try {
            Log::info('Début de la mise à jour du profil', [
                'user_id' => $request->user()->id,
                'request_data' => $request->except(['password', 'current_password', 'password_confirmation'])
            ]);
            
            $user = $request->user();
            
            
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
                'bio' => 'nullable|string|max:1000',
                'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'current_password' => 'nullable|required_with:password|string',
                'password' => 'nullable|string|min:8|confirmed',
            ]);
            
            
            if ($request->filled('password')) {
                if (!Hash::check($request->current_password, $user->password)) {
                    return response()->json([
                        'message' => 'Le mot de passe actuel est incorrect.',
                        'errors' => ['current_password' => ['Le mot de passe actuel est incorrect.']]
                    ], 422);
                }
                
                $user->password = Hash::make($request->password);
            }
            
           
            $user->name = $validated['name'];
            $user->email = $validated['email'];
            $user->bio = $request->bio;
            
            
            if ($request->hasFile('avatar')) {
                Log::info('Upload d\'avatar détecté', [
                    'original_name' => $request->file('avatar')->getClientOriginalName(),
                    'mime_type' => $request->file('avatar')->getMimeType(),
                    'size' => $request->file('avatar')->getSize()
                ]);
                
                try {
                   
                    if ($user->avatar) {
                        $oldAvatarPath = str_replace('/storage/', 'public/', $user->avatar);
                        Log::info('Tentative de suppression de l\'ancien avatar', ['path' => $oldAvatarPath]);
                        if (Storage::exists($oldAvatarPath)) {
                            Storage::delete($oldAvatarPath);
                            Log::info('Ancien avatar supprimé avec succès');
                        } else {
                            Log::warning('L\'ancien avatar n\'existe pas', ['path' => $oldAvatarPath]);
                        }
                    }
                    
                   
                    $path = $request->file('avatar')->store('public/avatars');
                    
                   
                    $publicUrl = str_replace('public/', '/storage/', $path);
                    $user->avatar = $publicUrl;
                    
                    Log::info('Avatar enregistré avec succès', [
                        'path' => $path, 
                        'public_url' => $publicUrl,
                        'file_exists' => Storage::exists($path)
                    ]);
                } catch (\Exception $e) {
                    Log::error('Erreur lors du traitement de l\'avatar', [
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }
            }
            
            $user->save();
            
           
            if ($user->avatar) {
                $user->avatar = $this->getAbsoluteUrl($user->avatar);
            }
            
            Log::info('Profil mis à jour avec succès', [
                'user_id' => $user->id,
                'avatar_url' => $user->avatar
            ]);
            
            return response()->json([
                'message' => 'Profil mis à jour avec succès',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la mise à jour du profil: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Impossible de mettre à jour le profil: ' . $e->getMessage()], 500);
        }
    }

  
    public function stats(Request $request)
    {
        try {
            $user = $request->user();
            
            
            $tournamentsCreated = $user->tournaments()->count();
            $tournamentsCompleted = $user->tournaments()->where('status', 'completed')->count();
            
            
            $hasStatsColumns = Schema::hasColumns('players', ['wins', 'total_score', 'losses']);
            
            
            $players = $user->players;
            $totalMatches = 0;
            $totalWins = 0;
            $totalScore = 0;
            
            foreach ($players as $player) {
               
                if (method_exists($player, 'matches')) {
                    $playerMatches = $player->matches()->count();
                    $totalMatches += $playerMatches;
                }
                
                
                if ($hasStatsColumns) {
                    $totalWins += $player->wins ?? 0;
                    $totalScore += $player->total_score ?? 0;
                } else {
                   
                    if (method_exists($player, 'matches')) {
                        foreach ($player->matches as $match) {
                            $playerScore = $match->pivot->score ?? 0;
                            $totalScore += $playerScore;
                            
                            
                            $isWin = false;
                            $otherPlayers = $match->players()->where('players.id', '!=', $player->id)->get();
                            foreach ($otherPlayers as $opponent) {
                                if (($playerScore > ($opponent->pivot->score ?? 0)) && $match->status === 'completed') {
                                    $isWin = true;
                                }
                            }
                            
                            if ($isWin) {
                                $totalWins++;
                            }
                        }
                    }
                }
            }
            
            return response()->json([
                'tournaments_created' => $tournamentsCreated,
                'tournaments_completed' => $tournamentsCompleted,
                'total_matches' => $totalMatches,
                'total_wins' => $totalWins,
                'total_score' => $totalScore,
                'win_rate' => $totalMatches > 0 ? round(($totalWins / $totalMatches) * 100, 2) : 0,
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors du chargement des statistiques: ' . $e->getMessage());
            return response()->json(['message' => 'Impossible de charger les statistiques: ' . $e->getMessage()], 500);
        }
    }
    
  
    private function getAbsoluteUrl($url)
    {
      
        if (filter_var($url, FILTER_VALIDATE_URL)) {
            return $url;
        }
        
       
        if (strpos($url, '/storage') === 0) {
            $baseUrl = config('app.url');
            if (empty($baseUrl)) {
                $baseUrl = url('/');
            }
            
           
            if (substr($baseUrl, -1) === '/' && substr($url, 0, 1) === '/') {
                $url = substr($url, 1);
            }
            
            return $baseUrl . $url;
        }
        
        return $url;
    }
}
