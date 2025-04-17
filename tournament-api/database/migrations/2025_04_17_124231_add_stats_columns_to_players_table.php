<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('players', function (Blueprint $table) {
            if (!Schema::hasColumn('players', 'total_score')) {
                $table->integer('total_score')->default(0);
            }
            if (!Schema::hasColumn('players', 'wins')) {
                $table->integer('wins')->default(0);
            }
            if (!Schema::hasColumn('players', 'losses')) {
                $table->integer('losses')->default(0);
            }
        });
    }

    public function down()
    {
        Schema::table('players', function (Blueprint $table) {
            $table->dropColumn(['total_score', 'wins', 'losses']);
        });
    }
};