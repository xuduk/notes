const cacheName = 'notes-cache-v3'
const cachesUrls = [
    '/notes/',
    '/notes/index.html',
    '/notes/script.js',
    '/notes/libs/idb.js',
    '/notes/libs/chartlib.js',
    '/notes/modules/chart.js',
    '/notes/modules/db.js',
    '/notes/jquery.js',
    '/notes/style.css',
    '/notes/font/stylesheet.css',
    '/notes/font/MarkerFelt-Wide.woff2',
    '/notes/font/MarkerFelt-Thin.woff2',

    '/notes/i18n/main.js',
    '/notes/i18n/en.json',
    '/notes/i18n/uk.json',

    '/notes/images/arrow_left.png',
    '/notes/images/attachment.png',
    '/notes/images/icon.png',
    '/notes/images/trash.png',

    '/notes/images/files_icons/css@2x.png',
    '/notes/images/files_icons/empty@2x.png',
    '/notes/images/files_icons/html@2x.png',
    '/notes/images/files_icons/java@2x.png',
    '/notes/images/files_icons/js@2x.png',
    '/notes/images/files_icons/pdf@2x.png',
    '/notes/images/files_icons/rtf@2x.png',
    '/notes/images/files_icons/sound@2x.png',
    '/notes/images/files_icons/sqlite3@2x.png',
    '/notes/images/files_icons/tar@2x.png',
    '/notes/images/files_icons/text@2x.png',
    '/notes/images/files_icons/video@2x.png',
    '/notes/images/files_icons/zip@2x.png'
]

self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(cacheName).then(cache => cache.addAll(cachesUrls))
    )
})

self.addEventListener("fetch", e => {
    e.respondWith(
        caches.match(e.request).then(res => res || fetch(e.request))
    )
})
