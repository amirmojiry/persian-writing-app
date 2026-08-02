<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

final class AdminAuditLog extends Model
{
    use HasUuids;

    protected $fillable = [
        'actor_user_id', 'action', 'target_type', 'target_id', 'metadata', 'occurred_at',
    ];

    protected function casts(): array
    {
        return ['metadata' => 'array', 'occurred_at' => 'immutable_datetime'];
    }
}
