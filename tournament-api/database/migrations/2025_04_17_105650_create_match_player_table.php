<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {Schema::create('match_player', function (Blueprint $table) {
        $table->id();
    $table->foreignId('matche_id')->constrained('matches')->onDelete('cascade'); 
    // OU $table->foreignId('match_id')->constrained('matches')->onDelete('cascade');
    $table->foreignId('player_id')->constrained()->onDelete('cascade');
    $table->integer('score')->default(0);
    $table->timestamps();
});

    }

    public function down()
    {
        Schema::dropIfExists('match_player');
    }
};