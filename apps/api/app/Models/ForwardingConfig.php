<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $created_by
 * @property string $name
 * @property string $endpoint_url
 * @property string|null $secret
 * @property bool $enabled
 * @property array<int, string> $aggregate_types
 * @property int $max_attempts
 * @property int $backoff_seconds
 */
final class ForwardingConfig extends Model
{
    use HasUuids;

    protected $fillable = [
        'created_by', 'name', 'endpoint_url', 'secret', 'enabled',
        'aggregate_types', 'max_attempts', 'backoff_seconds',
    ];

    protected $hidden = ['secret'];

    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
            'aggregate_types' => 'array',
            'max_attempts' => 'integer',
            'backoff_seconds' => 'integer',
            'secret' => 'encrypted',
        ];
    }
}
