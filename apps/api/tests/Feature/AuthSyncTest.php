<?php

declare(strict_types=1);

use App\Models\OtpChallenge;
use App\Models\SyncedItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Sanctum\PersonalAccessToken;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    Mail::fake();
    RateLimiter::clear('unused');
    config()->set('auth.otp_test_code', '1234');
});

function requestCode(string $email = 'adult@example.com', string $device = 'device-1'): void
{
    test()->postJson('/api/v1/auth/otp/request', ['email' => $email, 'deviceId' => $device])
        ->assertAccepted()->assertExactJson(['message' => 'If the address can receive mail, a code has been sent.']);
}

function authenticate(string $email = 'adult@example.com'): string
{
    requestCode($email);
    return (string) test()->postJson('/api/v1/auth/otp/verify', [
        'email' => $email, 'code' => '1234', 'deviceId' => 'device-1', 'deviceName' => 'test desktop',
    ])->assertOk()->assertJsonPath('user.email', $email)->json('token');
}

it('stores a hashed short-lived OTP and issues a scoped Sanctum token', function (): void {
    requestCode();
    $challenge = OtpChallenge::query()->firstOrFail();
    expect($challenge->code_hash)->not->toBe('1234')->and(Hash::check('1234', $challenge->code_hash))->toBeTrue()->and($challenge->expires_at->diffInMinutes(now()))->toBeLessThanOrEqual(5);
    $token = $this->postJson('/api/v1/auth/otp/verify', ['email' => 'adult@example.com', 'code' => '1234', 'deviceId' => 'device-1'])->assertOk()->json('token');
    $this->withToken((string) $token)->getJson('/api/v1/me')->assertOk()->assertJsonPath('user.email', 'adult@example.com');
});

it('rejects expired, replayed and attempt-limited codes with a generic response', function (): void {
    requestCode();
    OtpChallenge::query()->update(['expires_at' => now()->subSecond()]);
    $this->postJson('/api/v1/auth/otp/verify', ['email' => 'adult@example.com', 'code' => '1234', 'deviceId' => 'device-1'])->assertUnprocessable()->assertJsonPath('message', 'The code is invalid or expired.');
    config()->set('auth.otp_test_code', '4321'); requestCode();
    for ($attempt = 0; $attempt < 5; $attempt++) $this->postJson('/api/v1/auth/otp/verify', ['email' => 'adult@example.com', 'code' => '0000', 'deviceId' => 'device-1'])->assertUnprocessable();
    $this->postJson('/api/v1/auth/otp/verify', ['email' => 'adult@example.com', 'code' => '4321', 'deviceId' => 'device-1'])->assertUnprocessable();
    config()->set('auth.otp_test_code', '1234'); requestCode('second@example.com', 'device-2');
    $payload = ['email' => 'second@example.com', 'code' => '1234', 'deviceId' => 'device-2'];
    $this->postJson('/api/v1/auth/otp/verify', $payload)->assertOk();
    $this->postJson('/api/v1/auth/otp/verify', $payload)->assertUnprocessable();
});

it('invalidates an older active code and keeps request responses enumeration resistant', function (): void {
    config()->set('auth.otp_test_code', '1111');
    $known = $this->postJson('/api/v1/auth/otp/request', ['email' => 'known@example.com', 'deviceId' => 'd1']);
    config()->set('auth.otp_test_code', '2222');
    $unknown = $this->postJson('/api/v1/auth/otp/request', ['email' => 'unknown@example.com', 'deviceId' => 'd2']);
    $this->postJson('/api/v1/auth/otp/request', ['email' => 'known@example.com', 'deviceId' => 'd1']);
    expect($known->json())->toBe($unknown->json());
    $this->postJson('/api/v1/auth/otp/verify', ['email' => 'known@example.com', 'code' => '1111', 'deviceId' => 'd1'])->assertUnprocessable();
    $this->postJson('/api/v1/auth/otp/verify', ['email' => 'known@example.com', 'code' => '2222', 'deviceId' => 'd1'])->assertOk();
});

it('logs out only the current token', function (): void {
    $token = authenticate();
    expect(PersonalAccessToken::query()->count())->toBe(1);
    $this->withToken($token)->postJson('/api/v1/auth/logout')->assertOk();
    expect(PersonalAccessToken::query()->count())->toBe(0);
});

it('accepts consented batches idempotently and blocks non-consented items', function (): void {
    $token = authenticate();
    $accepted = ['idempotencyKey' => '00000000-0000-4000-8000-000000000001', 'aggregateType' => 'session', 'aggregateId' => '00000000-0000-4000-8000-000000000002', 'operation' => 'upsert', 'payload' => ['status' => 'completed'], 'consentSnapshot' => ['accountSync' => true]];
    $blocked = [...$accepted, 'idempotencyKey' => '00000000-0000-4000-8000-000000000003', 'consentSnapshot' => ['accountSync' => false]];
    $this->withToken($token)->postJson('/api/v1/sync/batch', ['items' => [$accepted, $blocked]])->assertOk()->assertJsonPath('items.0.status', 'accepted')->assertJsonPath('items.1.status', 'blocked_privacy');
    $this->withToken($token)->postJson('/api/v1/sync/batch', ['items' => [$accepted]])->assertOk()->assertJsonPath('items.0.status', 'duplicate');
    expect(SyncedItem::query()->count())->toBe(1);
});
