<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\OtpChallenge;
use App\Models\User;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

final class OtpService
{
    public const GENERIC_MESSAGE = 'If the address can receive mail, a code has been sent.';
    public const GENERIC_VERIFY_ERROR = 'The code is invalid or expired.';

    public function request(string $email, string $ip, string $device): void
    {
        $normalized = Str::lower(trim($email));
        $configuredCode = config('auth.otp_test_code');
        $code = is_string($configuredCode)
            ? $configuredCode
            : str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);

        DB::transaction(function () use ($normalized, $code, $ip, $device): void {
            OtpChallenge::query()
                ->where('normalized_email', $normalized)
                ->whereNull('consumed_at')
                ->update(['consumed_at' => now()]);

            OtpChallenge::query()->create([
                'normalized_email' => $normalized,
                'code_hash' => Hash::make($code),
                'expires_at' => now()->addMinutes((int) config('auth.otp_expiry_minutes', 5)),
                'attempts' => 0,
                'request_ip_hash' => hash('sha256', $ip),
                'device_hash' => hash('sha256', $device),
            ]);
        });

        Mail::raw(
            "Your Persian Writing verification code is {$code}. It expires in 5 minutes.",
            static fn (Message $message): Message => $message->to($normalized)->subject('Your verification code'),
        );
    }

    public function verify(string $email, string $code): ?User
    {
        $normalized = Str::lower(trim($email));

        return DB::transaction(function () use ($normalized, $code): ?User {
            /** @var OtpChallenge|null $challenge */
            $challenge = OtpChallenge::query()
                ->where('normalized_email', $normalized)
                ->whereNull('consumed_at')
                ->latest('created_at')
                ->lockForUpdate()
                ->first();

            if ($challenge === null || $challenge->expires_at->isPast() || $challenge->attempts >= 5) {
                if ($challenge !== null) {
                    $challenge->forceFill(['consumed_at' => now()])->save();
                }
                return null;
            }

            $challenge->increment('attempts');
            $challenge->refresh();
            if (! Hash::check($code, $challenge->code_hash)) {
                if ($challenge->attempts >= 5) {
                    $challenge->forceFill(['consumed_at' => now()])->save();
                }
                return null;
            }

            $challenge->forceFill(['consumed_at' => now()])->save();
            return User::query()->firstOrCreate(['email' => $normalized]);
        });
    }
}
