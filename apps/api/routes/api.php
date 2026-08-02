<?php

declare(strict_types=1);

use App\Http\Controllers\AuthController;
use App\Http\Controllers\SyncController;
use Illuminate\Support\Facades\Route;

Route::get('/health', static fn (): array => [
    'status' => 'ok',
    'service' => 'persian-writing-api',
]);

Route::prefix('v1')->group(function (): void {
    Route::post('/auth/otp/request', [AuthController::class, 'requestOtp']);
    Route::post('/auth/otp/verify', [AuthController::class, 'verifyOtp']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/sync/batch', [SyncController::class, 'batch'])->middleware('abilities:sync');
    });
});
