<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\AdminExport;
use App\Models\SyncedItem;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

final class BuildAdminExport implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(public readonly string $exportId) {}

    public function handle(): void
    {
        $export = AdminExport::query()->whereKey($this->exportId)->firstOrFail();
        $export->forceFill(['status' => 'processing', 'last_error' => null])->save();

        try {
            $query = SyncedItem::query()->where('aggregate_type', 'session')->orderBy('created_at');
            $filters = $export->filters;
            if (isset($filters['status']) && is_string($filters['status'])) {
                $query->where('payload->status', $filters['status']);
            }
            if (isset($filters['from']) && is_string($filters['from'])) {
                $query->where('created_at', '>=', $filters['from']);
            }
            if (isset($filters['to']) && is_string($filters['to'])) {
                $query->where('created_at', '<=', $filters['to']);
            }

            $rows = $query->get()->map(static fn (SyncedItem $item): array => [
                'id' => (string) $item->getKey(),
                'user_id' => $item->user_id,
                'session_id' => $item->aggregate_id,
                'operation' => $item->operation,
                'payload' => $item->payload,
                'consent_snapshot' => $item->consent_snapshot,
                'created_at' => $item->created_at?->toISOString(),
            ]);
            $rowList = array_values($rows->all());

            $content = $export->format === 'csv'
                ? $this->csv($rowList)
                : json_encode($rowList, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
            $path = 'admin-exports/'.$export->getKey().'.'.$export->format;
            Storage::disk('local')->put($path, $content);
            $export->forceFill([
                'status' => 'completed',
                'storage_path' => $path,
                'record_count' => count($rowList),
                'completed_at' => now(),
            ])->save();
        } catch (\Throwable $error) {
            $export->forceFill(['status' => 'failed', 'last_error' => $error->getMessage()])->save();
            throw $error;
        }
    }

    /** @param list<array<string, mixed>> $rows */
    private function csv(array $rows): string
    {
        $stream = fopen('php://temp', 'r+');
        if ($stream === false) {
            throw new \RuntimeException('Unable to open export buffer.');
        }
        fputcsv($stream, ['id', 'user_id', 'session_id', 'operation', 'payload', 'consent_snapshot', 'created_at'], ',', '"', '');
        foreach ($rows as $row) {
            fputcsv($stream, [
                $row['id'],
                $row['user_id'],
                $row['session_id'],
                $row['operation'],
                json_encode($row['payload'], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
                json_encode($row['consent_snapshot'], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
                $row['created_at'],
            ], ',', '"', '');
        }
        rewind($stream);
        $content = stream_get_contents($stream);
        fclose($stream);
        return $content === false ? '' : $content;
    }
}
