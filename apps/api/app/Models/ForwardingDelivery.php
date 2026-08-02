<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $status
 * @property int $attempts
 * @property int|null $response_code
 * @property string|null $last_error
 * @property CarbonImmutable|null $next_attempt_at
 * @property CarbonImmutable|null $delivered_at
 */
final class ForwardingDelivery extends Model
{
    use HasUuids;

    protected $fillable = [
        'forwarding_config_id', 'synced_item_id', 'status', 'attempts',
        'response_code', 'last_error', 'next_attempt_at', 'delivered_at',
    ];

    protected function casts(): array
    {
        return [
            'attempts' => 'integer',
            'response_code' => 'integer',
            'next_attempt_at' => 'immutable_datetime',
            'delivered_at' => 'immutable_datetime',
        ];
    }
}
