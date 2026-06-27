const cacheName = 'notes-cache-v1'
const cachesUrls = [
    '/notes/',
    '/notes/index.html',
    '/notes/script.js',
    '/notes/libs/idb.js',
    '/notes/libs/chartlib.js',
    '/notes/modules/chart.js',
    '/notes/modules/db.js',
    '/notes/style.css',
    '/notes/arrow_left.png',
    '/notes/attachment.png',
    '/notes/icon.png',
    '/notes/trash.png',

    '/notes/images/files_icons/3gpp@2x.png',
    '/notes/images/files_icons/aac@2x.png',
    '/notes/images/files_icons/aiff@2x.png',
    '/notes/images/files_icons/bmp@2x.png',
    '/notes/images/files_icons/bz2@2x.png',
    '/notes/images/files_icons/c@2x.png',
    '/notes/images/files_icons/compressed@2x.png',
    '/notes/images/files_icons/config@2x.png',
    '/notes/images/files_icons/cpp@2x.png',
    '/notes/images/files_icons/css@2x.png',
    '/notes/images/files_icons/diskimage@2x.png',
    '/notes/images/files_icons/doc@2x.png',
    '/notes/images/files_icons/empty@2x.png',
    '/notes/images/files_icons/flash@2x.png',
    '/notes/images/files_icons/folder@2x.png',
    '/notes/images/files_icons/gif@2x.png',
    '/notes/images/files_icons/gz@2x.png',
    '/notes/images/files_icons/h@2x.png',
    '/notes/images/files_icons/html@2x.png',
    '/notes/images/files_icons/ico@2x.png',
    '/notes/images/files_icons/image@2x.png',
    '/notes/images/files_icons/java@2x.png',
    '/notes/images/files_icons/jpeg@2x.png',
    '/notes/images/files_icons/js@2x.png',
    '/notes/images/files_icons/keynote@2x.png',
    '/notes/images/files_icons/log@2x.png',
    '/notes/images/files_icons/m@2x.png',
    '/notes/images/files_icons/m3u@2x.png',
    '/notes/images/files_icons/m4r@2x.png',
    '/notes/images/files_icons/mp2@2x.png',
    '/notes/images/files_icons/mp3@2x.png',
    '/notes/images/files_icons/mpeg@2x.png',
    '/notes/images/files_icons/numbers@2x.png',
    '/notes/images/files_icons/pages@2x.png',
    '/notes/images/files_icons/pdf@2x.png',
    '/notes/images/files_icons/png@2x.png',
    '/notes/images/files_icons/ppt@2x.png',
    '/notes/images/files_icons/rtf@2x.png',
    '/notes/images/files_icons/sound@2x.png',
    '/notes/images/files_icons/spreadsheet@2x.png',
    '/notes/images/files_icons/sqlite3@2x.png',
    '/notes/images/files_icons/tar@2x.png',
    '/notes/images/files_icons/tbz2@2x.png',
    '/notes/images/files_icons/text@2x.png',
    '/notes/images/files_icons/tgz@2x.png',
    '/notes/images/files_icons/tiff@2x.png',
    '/notes/images/files_icons/video@2x.png',
    '/notes/images/files_icons/wav@2x.png',
    '/notes/images/files_icons/xib@2x.png',
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