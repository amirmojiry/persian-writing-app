<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->boolean('is_admin')->default(false)->index();
        });

        Schema::table('synced_items', function (Blueprint $table): void {
            $table->index(['aggregate_type', 'created_at']);
        });

        Schema::create('admin_audit_logs', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('actor_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('action', 80)->index();
            $table->string('target_type', 60)->nullable();
            $table->string('target_id')->nullable();
            $table->json('metadata');
            $table->timestamp('occurred_at')->index();
            $table->timestamps();
            $table->index(['actor_user_id', 'occurred_at']);
        });

        Schema::create('admin_exports', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('requested_by')->constrained('users')->cascadeOnDelete();
            $table->string('format', 10);
            $table->json('filters');
            $table->string('status', 20)->default('pending')->index();
            $table->string('storage_path')->nullable();
            $table->unsignedInteger('record_count')->default(0);
            $table->text('last_error')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('forwarding_configs', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('created_by')->constrained('users')->cascadeOnDelete();
            $table->string('name', 100);
            $table->string('endpoint_url', 2048);
            $table->text('secret')->nullable();
            $table->boolean('enabled')->default(false)->index();
            $table->json('aggregate_types');
            $table->unsignedTinyInteger('max_attempts')->default(5);
            $table->unsignedInteger('backoff_seconds')->default(30);
            $table->timestamps();
        });

        Schema::create('forwarding_deliveries', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('forwarding_config_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('synced_item_id')->constrained()->cascadeOnDelete();
            $table->string('status', 30)->default('pending')->index();
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->unsignedSmallInteger('response_code')->nullable();
            $table->text('last_error')->nullable();
            $table->timestamp('next_attempt_at')->nullable()->index();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
            $table->unique(['forwarding_config_id', 'synced_item_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('forwarding_deliveries');
        Schema::dropIfExists('forwarding_configs');
        Schema::dropIfExists('admin_exports');
        Schema::dropIfExists('admin_audit_logs');

        Schema::table('synced_items', function (Blueprint $table): void {
            $table->dropIndex(['aggregate_type', 'created_at']);
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('is_admin');
        });
    }
};
