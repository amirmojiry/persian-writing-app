<?php

declare(strict_types=1);

return [
    'default' => env('CACHE_STORE', 'array'),
    'stores' => [
        'array' => ['driver' => 'array', 'serialize' => false],
        'database' => ['driver' => 'database', 'connection' => null, 'table' => 'cache', 'lock_connection' => null, 'lock_table' => null],
    ],
    'prefix' => env('CACHE_PREFIX', 'persian-writing-cache'),
];
