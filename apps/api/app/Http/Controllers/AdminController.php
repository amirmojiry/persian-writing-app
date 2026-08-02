<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Jobs\BuildAdminExport;
use App\Models\AdminExport;
use App\Models\ForwardingConfig;
use App\Models\ForwardingDelivery;
use App\Models\SyncedItem;
use App\Models\User;
use App\Policies\AdminPolicy;
use App\Services\AdminAuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AdminController
{
    public function sessions(Request $request, AdminAuditService $audit): JsonResponse
    {
        $user = $this->authorize($request);
        $filters = $request->validate([
            'status' => ['nullable', 'string', 'max:40'],
            'profileId' => ['nullable', 'uuid'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'page' => ['nullable', 'integer', 'min:1'],
            'perPage' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);
        $query = SyncedItem::query()->where('aggregate_type', 'session')->latest();
        if (isset($filters['status'])) $query->where('payload->status', $filters['status']);
        if (isset($filters['profileId'])) $query->where('payload->profileId', $filters['profileId']);
        if (isset($filters['from'])) $query->where('created_at', '>=', $filters['from']);
        if (isset($filters['to'])) $query->where('created_at', '<=', $filters['to']);
        $page = $query->paginate((int) ($filters['perPage'] ?? 25));
        $audit->record($user, 'admin.sessions.list', 'session', null, ['filters' => $filters]);
        return response()->json($page);
    }

    public function session(Request $request, string $id, AdminAuditService $audit): JsonResponse
    {
        $user = $this->authorize($request);
        $item = SyncedItem::query()->where('aggregate_type', 'session')->where('aggregate_id', $id)->firstOrFail();
        $audit->record($user, 'admin.sessions.view', 'session', $id);
        return response()->json(['session' => $item]);
    }

    public function createExport(Request $request, AdminAuditService $audit): JsonResponse
    {
        $user = $this->authorize($request);
        $data = $request->validate([
            'format' => ['required', 'string', 'in:csv,json'],
            'filters' => ['nullable', 'array'],
            'filters.status' => ['nullable', 'string', 'max:40'],
            'filters.from' => ['nullable', 'date'],
            'filters.to' => ['nullable', 'date'],
        ]);
        $export = AdminExport::query()->create([
            'requested_by' => $user->getKey(), 'format' => $data['format'],
            'filters' => $data['filters'] ?? [], 'status' => 'pending',
        ]);
        BuildAdminExport::dispatch($export->getKey());
        $audit->record($user, 'admin.exports.create', 'admin_export', $export->getKey(), ['format' => $data['format']]);
        return response()->json(['export' => $export], 202);
    }

    public function export(Request $request, string $id, AdminAuditService $audit): JsonResponse
    {
        $user = $this->authorize($request);
        $export = AdminExport::query()->findOrFail($id);
        $audit->record($user, 'admin.exports.view', 'admin_export', $id);
        return response()->json(['export' => $export]);
    }

    public function forwarding(Request $request, AdminAuditService $audit): JsonResponse
    {
        $user = $this->authorize($request);
        $audit->record($user, 'admin.forwarding.list');
        return response()->json([
            'configs' => ForwardingConfig::query()->latest()->get(),
            'failures' => ForwardingDelivery::query()->whereIn('status', ['failed', 'retry_scheduled'])->latest()->limit(100)->get(),
        ]);
    }

    public function saveForwarding(Request $request, AdminAuditService $audit): JsonResponse
    {
        $user = $this->authorize($request);
        $data = $request->validate([
            'id' => ['nullable', 'uuid'], 'name' => ['required', 'string', 'max:100'],
            'endpointUrl' => ['required', 'url:http,https', 'max:2048'],
            'secret' => ['nullable', 'string', 'max:1000'], 'enabled' => ['required', 'boolean'],
            'aggregateTypes' => ['required', 'array', 'min:1'],
            'aggregateTypes.*' => ['string', 'in:profile,session,event'],
            'maxAttempts' => ['required', 'integer', 'min:1', 'max:10'],
            'backoffSeconds' => ['required', 'integer', 'min:5', 'max:3600'],
        ]);
        $config = isset($data['id']) ? ForwardingConfig::query()->findOrFail($data['id']) : new ForwardingConfig();
        $config->fill([
            'created_by' => $config->exists ? $config->created_by : $user->getKey(),
            'name' => $data['name'], 'endpoint_url' => $data['endpointUrl'],
            'enabled' => $data['enabled'], 'aggregate_types' => $data['aggregateTypes'],
            'max_attempts' => $data['maxAttempts'], 'backoff_seconds' => $data['backoffSeconds'],
        ]);
        if (array_key_exists('secret', $data) && $data['secret'] !== null) $config->secret = $data['secret'];
        $config->save();
        $audit->record($user, 'admin.forwarding.save', 'forwarding_config', $config->getKey(), ['enabled' => $config->enabled]);
        return response()->json(['config' => $config]);
    }

    private function authorize(Request $request): User
    {
        $user = $request->user();
        abort_unless($user instanceof User, 401);
        abort_unless((new AdminPolicy())->access($user), 403);
        return $user;
    }
}
