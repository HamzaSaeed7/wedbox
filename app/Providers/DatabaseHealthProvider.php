<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class DatabaseHealthProvider extends ServiceProvider
{
    public function boot(): void
    {
        $cacheFile = sys_get_temp_dir() . '/wedbox_db_health';
        $cacheTtl  = 600; // 10 minutes

        if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTtl) {
            $dbUp = (int) file_get_contents($cacheFile) === 1;
        } else {
            $host = config('database.connections.mysql.host', '127.0.0.1');
            $port = (int) config('database.connections.mysql.port', 3306);
            $s    = @fsockopen($host, $port, $errno, $errstr, 0.3);
            $dbUp = $s !== false;
            if ($s) fclose($s);
            @file_put_contents($cacheFile, $dbUp ? '1' : '0');
        }

        if (!$dbUp) {
            config([
                'database.default'                       => 'sqlite',
                'database.connections.sqlite.database'   => ':memory:',
            ]);
            $this->app['db']->purge('mysql');
            $this->app['db']->setDefaultConnection('sqlite');
        }
    }
}
