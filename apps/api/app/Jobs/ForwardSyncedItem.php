<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\ForwardingConfig;
use App\Models\ForwardingDelivery;
use App\Models\SyncedItem;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

final class ForwardSyncedItem implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(
        public readonly string $configId,
        public readonly string $syncedItemId,
    ) {}

    public function handle(): void
    {
        $config = ForwardingConfig::query()->whereKey($this->configId)->firstOrFail();
        $item = SyncedItem::query()->whereKey($this->syncedItemId)->firstOrFail();
        $delivery = ForwardingDelivery::query()->firstOrCreate([
            'forwarding_config_id' => $config->getKey(),
            'synced_item_id' => $item->getKey(),
        ]);

        if (! $config->enabled || ! in_array($item->aggregate_type, $config->aggregate_types, true)) {
            $delivery->forceFill(['status' => 'disabled'])->save();
            return;
        }

        $consent = $item->consent_snapshot;
        $accountSync = ($consent['accountSync'] ?? false) === true;
        $analyticsConsent = ($consent['learningAnalytics'] ?? false) === true;
        $eligible = $accountSync && ($item->aggregate_type !== 'event' || $analyticsConsent);
        if (! $eligible) {
            $delivery->forceFill([
                'status' => 'blocked_privacy',
                'last_error' => 'Consent does not permit forwarding.',
            ])->save();
            return;
        }

        $attempt = $delivery->attempts + 1;
        try {
            $request = Http::acceptJson()->timeout(15);
            if ($config->secret !== null && $config->secret !== '') {
                $request = $request->withToken($config->secret);
            }
            $response = $request->post($config->endpoint_url, [
                'idempotencyKey' => $item->idempotency_key,
                'aggregateType' => $item->aggregate_type,
                'aggregateId' => $item->aggregate_id,
                'operation' => $item->operation,
                'payload' => $item->payload,
                'consentSnapshot' => $item->consent_snapshot,
            ]);

            if ($response->successful()) {
                $delivery->forceFill([
                    'status' => 'delivered',
                    'attempts' => $attempt,
                    'response_code' => $response->status(),
                    'last_error' => null,
                    'next_attempt_at' => null,
                    'delivered_at' => now(),
                ])->save();
                return;
            }
            throw new \RuntimeException('Forwarding endpoint returned HTTP '.$response->status().'.');
        } catch (\Throwable $error) {
            $failed = $attempt >= $config->max_attempts;
            $delaySeconds = $config->backoff_seconds * $attempt;
            $delivery->forceFill([
                'status' => $failed ? 'failed' : 'retry_scheduled',
                'attempts' => $attempt,
                'last_error' => $error->getMessage(),
                'next_attempt_at' => $failed ? null : now()->addSeconds($delaySeconds),
            ])->save();
            if (! $failed) {
                self::dispatch((string) $config->getKey(), (string) $item->getKey())
                    ->delay(now()->addSeconds($delaySeconds));
            }
        }
    }
}
