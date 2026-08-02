<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $user_id
 * @property string $idempotency_key
 * @property string $aggregate_type
 * @property string $aggregate_id
 * @property string $operation
 * @property array<string, mixed> $payload
 * @property array<string, mixed> $consent_snapshot
 */
final class SyncedItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id', 'idempotency_key', 'aggregate_type', 'aggregate_id',
        'operation', 'payload', 'consent_snapshot',
    ];

    protected function casts(): array
    {
        return ['payload' => 'array', 'consent_snapshot' => 'array'];
    }
}
