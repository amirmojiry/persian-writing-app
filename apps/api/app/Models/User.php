<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

/** @property string $email @property bool $is_admin */
final class User extends Authenticatable
{
    use HasApiTokens;
    use HasUuids;

    protected $fillable = ['email', 'is_admin'];
    protected $hidden = [];

    protected function casts(): array
    {
        return ['is_admin' => 'boolean'];
    }
}
