<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Storage;

$bucket  = env('AWS_BUCKET');
$region  = env('AWS_DEFAULT_REGION');
$baseUrl = "https://{$bucket}.s3.{$region}.amazonaws.com";
$baseDir = __DIR__ . '/resources/Images/service images';
$folders = array_filter(glob($baseDir . '/*'), 'is_dir');

foreach ($folders as $folder) {
    $category = basename($folder);
    $images   = glob($folder . '/*.{jpg,jpeg,png,webp}', GLOB_BRACE);

    foreach ($images as $imagePath) {
        $filename = basename($imagePath);
        $s3Key    = "services/{$category}/{$filename}";

        echo "Uploading {$s3Key} ... ";

        Storage::disk('s3')->put($s3Key, file_get_contents($imagePath));

        echo "OK → {$baseUrl}/{$s3Key}\n";
    }
}

echo "\nDone! All images uploaded to S3.\n";
