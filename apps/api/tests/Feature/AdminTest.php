<?php

declare(strict_types=1);

use App\Jobs\BuildAdminExport;
use App\Jobs\ForwardSyncedItem;
use App\Models\AdminAuditLog;
use App\Models\AdminExport;
use App\Models\ForwardingConfig;
use App\Models\ForwardingDelivery;
use App\Models\SyncedItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

function adminUser(bool $administrator = true): User
{
    return User::query()->create([
        'email' => ($administrator ? 'admin' : 'user').'-'.fake()->uuid().'@example.com',
        'is_admin' => $administrator,
    ]);
}

function syncedSession(User $owner, array $consent = ['accountSync' => true]): SyncedItem
{
    return SyncedItem::query()->create([
        'user_id' => $owner->getKey(),
        'idempotency_key' => fake()->uuid(),
        'aggregate_type' => 'session',
        'aggregate_id' => fake()->uuid(),
        'operation' => 'upsert',
        'payload' => ['status' => 'completed', 'profileId' => fake()->uuid()],
        'consent_snapshot' => $consent,
    ]);
}

it('denies administration endpoints to every non-administrator', function (): void {
    $user = adminUser(false);
    Sanctum::actingAs($user, ['sync', 'admin']);

    $this->getJson('/api/v1/admin/sessions')->assertForbidden();
    $this->postJson('/api/v1/admin/exports', ['format' => 'json'])->assertForbidden();
    $this->getJson('/api/v1/admin/forwarding')->assertForbidden();

    expect(AdminAuditLog::query()->count())->toBe(0);
});

it('filters session records and audits list and detail access', function (): void {
    $admin = adminUser();
    $owner = adminUser(false);
    $session = syncedSession($owner);
    syncedSession($owner)->forceFill(['payload' => ['status' => 'active']])->save();
    Sanctum::actingAs($admin, ['admin']);

    $this->getJson('/api/v1/admin/sessions?status=completed')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.aggregate_id', $session->aggregate_id);

    $this->getJson('/api/v1/admin/sessions/'.$session->aggregate_id)
        ->assertOk()
        ->assertJsonPath('session.aggregate_id', $session->aggregate_id);

    expect(AdminAuditLog::query()->where('action', 'admin.sessions.list')->count())->toBe(1)
        ->and(AdminAuditLog::query()->where('action', 'admin.sessions.view')->count())->toBe(1);
});

it('queues large exports and builds deterministic CSV and JSON files outside the request', function (): void {
    Queue::fake();
    Storage::fake('local');
    $admin = adminUser();
    syncedSession(adminUser(false));
    Sanctum::actingAs($admin, ['admin']);

    $response = $this->postJson('/api/v1/admin/exports', ['format' => 'csv', 'filters' => ['status' => 'completed']])
        ->assertAccepted()
        ->assertJsonPath('export.status', 'pending');
    $exportId = (string) $response->json('export.id');

    Queue::assertPushed(BuildAdminExport::class, static fn (BuildAdminExport $job): bool => $job->exportId === $exportId);
    (new BuildAdminExport($exportId))->handle();

    $export = AdminExport::query()->findOrFail($exportId);
    expect($export->status)->toBe('completed')->and($export->record_count)->toBe(1);
    Storage::disk('local')->assertExists((string) $export->storage_path);
    expect(Storage::disk('local')->get((string) $export->storage_path))->toContain('session_id');
});

it('never forwards without consent and schedules bounded retries with visible failures', function (): void {
    Queue::fake();
    Http::fake(['https://receiver.example/*' => Http::response([], 503)]);
    $admin = adminUser();
    $owner = adminUser(false);
    $config = ForwardingConfig::query()->create([
        'created_by' => $admin->getKey(),
        'name' => 'Research endpoint',
        'endpoint_url' => 'https://receiver.example/events',
        'enabled' => true,
        'aggregate_types' => ['session', 'event'],
        'max_attempts' => 3,
        'backoff_seconds' => 30,
    ]);

    $blocked = syncedSession($owner, ['accountSync' => false]);
    (new ForwardSyncedItem($config->getKey(), $blocked->getKey()))->handle();
    Http::assertNothingSent();
    expect(ForwardingDelivery::query()->where('synced_item_id', $blocked->getKey())->value('status'))
        ->toBe('blocked_privacy');

    $eligible = syncedSession($owner, ['accountSync' => true]);
    (new ForwardSyncedItem($config->getKey(), $eligible->getKey()))->handle();
    $delivery = ForwardingDelivery::query()->where('synced_item_id', $eligible->getKey())->firstOrFail();
    expect($delivery->status)->toBe('retry_scheduled')
        ->and($delivery->attempts)->toBe(1)
        ->and($delivery->last_error)->toContain('503')
        ->and($delivery->next_attempt_at)->not->toBeNull();
    Queue::assertPushed(ForwardSyncedItem::class);
});

it('audits forwarding configuration changes without exposing its secret', function (): void {
    $admin = adminUser();
    Sanctum::actingAs($admin, ['admin']);

    $this->putJson('/api/v1/admin/forwarding', [
        'name' => 'School archive',
        'endpointUrl' => 'https://archive.example/import',
        'secret' => 'private-token',
        'enabled' => true,
        'aggregateTypes' => ['session'],
        'maxAttempts' => 5,
        'backoffSeconds' => 30,
    ])->assertOk()->assertJsonMissing(['secret' => 'private-token']);

    expect(AdminAuditLog::query()->where('action', 'admin.forwarding.save')->count())->toBe(1)
        ->and(ForwardingConfig::query()->firstOrFail()->secret)->toBe('private-token');
});
