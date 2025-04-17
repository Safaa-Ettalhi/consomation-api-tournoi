<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Vérifier si la colonne match_id existe
        if (Schema::hasColumn('match_player', 'match_id')) {
            // Renommer la colonne match_id en matche_id
            Schema::table('match_player', function (Blueprint $table) {
                $table->renameColumn('match_id', 'matche_id');
            });
        } 
        // Si ni matche_id ni match_id n'existent, créer matche_id
        else if (!Schema::hasColumn('match_player', 'matche_id')) {
            Schema::table('match_player', function (Blueprint $table) {
                $table->foreignId('matche_id')->after('id')->constrained('matches')->onDelete('cascade');
            });
        }
    }

    public function down()
    {
        if (Schema::hasColumn('match_player', 'matche_id')) {
            Schema::table('match_player', function (Blueprint $table) {
                $table->renameColumn('matche_id', 'match_id');
            });
        }
    }
};
