<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AdminAuditLog;
use App\Models\User;

final class AdminAuditService
{
    /** @param array<string, mixed> $metadata */
    public function record(User $actor, string $action, ?string $targetType = null, ?string $targetId = null, array $metadata = []): AdminAuditLog
    {
        return AdminAuditLog::query()->create([
            'actor_user_id' => $actor->getKey(),
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'metadata' => $metadata,
            'occurred_at' => now(),
        ]);
    }
}
