<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $format
 * @property array<string, mixed> $filters
 * @property string $status
 * @property string|null $storage_path
 * @property int $record_count
 * @property string|null $last_error
 * @property CarbonImmutable|null $completed_at
 */
final class AdminExport extends Model
{
    use HasUuids;

    protected $fillable = [
        'requested_by', 'format', 'filters', 'status', 'storage_path',
        'record_count', 'last_error', 'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'filters' => 'array',
            'completed_at' => 'immutable_datetime',
            'record_count' => 'integer',
        ];
    }
}
