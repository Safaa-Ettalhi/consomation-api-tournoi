<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('players', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('tournament_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('gamertag');
            $table->integer('total_score')->default(0);
            $table->integer('wins')->default(0);
            $table->integer('losses')->default(0);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('players');
    }
};