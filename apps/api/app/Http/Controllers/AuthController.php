<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

final class AuthController
{
    public function requestOtp(Request $request, OtpService $service): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email:rfc', 'max:254'],
            'deviceId' => ['required', 'string', 'max:200'],
        ]);
        $email = Str::lower(trim((string) $data['email']));
        $device = (string) $data['deviceId'];
        $key = 'otp-send:'.hash('sha256', $email.'|'.$request->ip().'|'.$device);

        if (! RateLimiter::attempt($key, 3, static function () use ($service, $email, $request, $device): void {
            $service->request($email, (string) $request->ip(), $device);
        }, 300)) {
            return response()->json(['message' => OtpService::GENERIC_MESSAGE], 429);
        }

        return response()->json(['message' => OtpService::GENERIC_MESSAGE], 202);
    }

    public function verifyOtp(Request $request, OtpService $service): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email:rfc', 'max:254'],
            'code' => ['required', 'digits:4'],
            'deviceId' => ['required', 'string', 'max:200'],
            'deviceName' => ['nullable', 'string', 'max:100'],
        ]);
        $email = Str::lower(trim((string) $data['email']));
        $deviceId = (string) $data['deviceId'];
        $key = 'otp-verify:'.hash('sha256', $email.'|'.$request->ip().'|'.$deviceId);

        if (RateLimiter::tooManyAttempts($key, 10)) {
            return response()->json(['message' => OtpService::GENERIC_VERIFY_ERROR], 429);
        }
        RateLimiter::hit($key, 300);

        $user = $service->verify($email, (string) $data['code']);
        if ($user === null) {
            return response()->json(['message' => OtpService::GENERIC_VERIFY_ERROR], 422);
        }

        RateLimiter::clear($key);
        $token = $user->createToken((string) ($data['deviceName'] ?? 'desktop'), ['sync'])->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => ['id' => $user->getKey(), 'email' => $user->email],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        return response()->json(['user' => ['id' => $user?->getAuthIdentifier(), 'email' => $user?->email]]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();
        return response()->json(['message' => 'Signed out.']);
    }
}
