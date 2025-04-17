<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Dans votre fichier de migration pour la table matches
Schema::create('matches', function (Blueprint $table) {
    $table->id();
    $table->foreignId('tournament_id')->constrained()->onDelete('cascade');
    $table->integer('round');
    $table->dateTime('match_date')->nullable();
    $table->enum('status', ['pending', 'in_progress', 'completed'])->default('pending');
    $table->timestamps();
});
    }

    public function down()
    {
        Schema::dropIfExists('matches');
    }
};