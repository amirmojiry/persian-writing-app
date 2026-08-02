<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

final class OtpChallenge extends Model
{
    use HasUuids;

    protected $fillable = [
        'normalized_email', 'code_hash', 'expires_at', 'attempts', 'consumed_at',
        'request_ip_hash', 'device_hash',
    ];

    protected function casts(): array
    {
        return ['expires_at' => 'immutable_datetime', 'consumed_at' => 'immutable_datetime', 'attempts' => 'integer'];
    }
}
