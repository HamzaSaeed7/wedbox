<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    {{-- Primary SEO --}}
    <title inertia>Wedbi — Cyprus Wedding Marketplace</title>
    <meta name="description" content="Wedbi is Cyprus's all-in-one wedding marketplace. Discover and book venues, vendors and complete wedding packages in one place — with the total cost upfront.">
    <meta name="keywords" content="Wedbi, Cyprus wedding, wedding marketplace, wedding vendors Cyprus, wedding venues Cyprus, destination wedding Cyprus, wedding planning">
    <meta name="author" content="Wedbi">
    <meta name="application-name" content="Wedbi">
    <meta name="theme-color" content="#79cdd0">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="{{ url()->current() }}">

    {{-- Open Graph --}}
    <meta property="og:site_name" content="Wedbi">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Wedbi — Cyprus Wedding Marketplace">
    <meta property="og:description" content="Plan your wedding in one click. Discover and book venues, vendors and complete packages across Cyprus — all in one place, with the total cost upfront.">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:image" content="https://wedbox-app-production-bucket.s3.ap-south-1.amazonaws.com/logos/wedbi.png">
    <meta property="og:locale" content="en_US">

    {{-- Twitter Card --}}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Wedbi — Cyprus Wedding Marketplace">
    <meta name="twitter:description" content="Plan your wedding in one click. Discover and book venues, vendors and complete packages across Cyprus — all in one place, with the total cost upfront.">
    <meta name="twitter:image" content="https://wedbox-app-production-bucket.s3.ap-south-1.amazonaws.com/logos/wedbi.png">

    {{-- Icons --}}
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="alternate icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/favicon.svg">

    {{-- Structured data --}}
    @php
        $wedbiLogo = 'https://wedbox-app-production-bucket.s3.ap-south-1.amazonaws.com/logos/wedbi.png';
        $structuredData = [
            '@context' => 'https://schema.org',
            '@graph' => [
                [
                    '@type' => 'Organization',
                    '@id' => url('/') . '/#organization',
                    'name' => 'Wedbi',
                    'url' => url('/'),
                    'logo' => $wedbiLogo,
                    'description' => "Cyprus's all-in-one wedding marketplace for venues, vendors and complete wedding packages.",
                ],
                [
                    '@type' => 'WebSite',
                    '@id' => url('/') . '/#website',
                    'name' => 'Wedbi',
                    'url' => url('/'),
                    'publisher' => ['@id' => url('/') . '/#organization'],
                    'potentialAction' => [
                        '@type' => 'SearchAction',
                        'target' => [
                            '@type' => 'EntryPoint',
                            'urlTemplate' => url('/search') . '?category={search_term_string}',
                        ],
                        'query-input' => 'required name=search_term_string',
                    ],
                ],
            ],
        ];
    @endphp
    <script type="application/ld+json">{!! json_encode($structuredData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}</script>

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body style="margin:0;padding:0">
    @inertia
</body>
</html>
