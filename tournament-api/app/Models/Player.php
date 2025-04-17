<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Player extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'gamertag',
        'tournament_id',
        'user_id',
        'total_score',
        'wins',
        'losses',
    ];

    public function tournament()
    {
        return $this->belongsTo(Tournament::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function matches()
    {
        return $this->belongsToMany(Matche::class, 'match_player')
            ->withPivot('score')
            ->withTimestamps();
    }
}