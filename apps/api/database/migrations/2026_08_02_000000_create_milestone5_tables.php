<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('email')->unique();
            $table->timestamps();
        });

        Schema::create('otp_challenges', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('normalized_email')->index();
            $table->string('code_hash');
            $table->timestamp('expires_at')->index();
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('consumed_at')->nullable()->index();
            $table->string('request_ip_hash', 64);
            $table->string('device_hash', 64);
            $table->timestamps();
            $table->index(['normalized_email', 'consumed_at', 'created_at']);
        });

        Schema::create('personal_access_tokens', function (Blueprint $table): void {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamps();
        });

        Schema::create('synced_items', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->uuid('idempotency_key');
            $table->string('aggregate_type', 40);
            $table->uuid('aggregate_id');
            $table->string('operation', 20);
            $table->json('payload');
            $table->json('consent_snapshot');
            $table->timestamps();
            $table->unique(['user_id', 'idempotency_key']);
            $table->index(['user_id', 'aggregate_type', 'aggregate_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('synced_items');
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('otp_challenges');
        Schema::dropIfExists('users');
    }
};
