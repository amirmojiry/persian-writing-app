<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\SyncedItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class SyncController
{
    public function batch(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'max:100'],
            'items.*.idempotencyKey' => ['required', 'uuid'],
            'items.*.aggregateType' => ['required', 'string', 'in:profile,session,event'],
            'items.*.aggregateId' => ['required', 'uuid'],
            'items.*.operation' => ['required', 'string', 'in:upsert,delete'],
            'items.*.payload' => ['present', 'array'],
            'items.*.consentSnapshot' => ['required', 'array'],
            'items.*.consentSnapshot.accountSync' => ['required', 'boolean'],
        ]);

        $userId = (string) $request->user()?->getAuthIdentifier();
        $outcomes = [];

        /** @var array<string, mixed> $item */
        foreach ($validated['items'] as $item) {
            $key = (string) $item['idempotencyKey'];
            $consent = (array) $item['consentSnapshot'];
            if (($consent['accountSync'] ?? false) !== true) {
                $outcomes[] = ['idempotencyKey' => $key, 'status' => 'blocked_privacy'];
                continue;
            }

            $existing = SyncedItem::query()
                ->where('user_id', $userId)
                ->where('idempotency_key', $key)
                ->exists();

            if (! $existing) {
                SyncedItem::query()->create([
                    'user_id' => $userId,
                    'idempotency_key' => $key,
                    'aggregate_type' => (string) $item['aggregateType'],
                    'aggregate_id' => (string) $item['aggregateId'],
                    'operation' => (string) $item['operation'],
                    'payload' => (array) $item['payload'],
                    'consent_snapshot' => $consent,
                ]);
            }

            $outcomes[] = ['idempotencyKey' => $key, 'status' => $existing ? 'duplicate' : 'accepted'];
        }

        return response()->json(['items' => $outcomes]);
    }
}
