<?php

declare(strict_types=1);

it('returns the API health status', function (): void {
    $this->getJson('/api/health')
        ->assertOk()
        ->assertExactJson([
            'status' => 'ok',
            'service' => 'persian-writing-api',
        ]);
});
