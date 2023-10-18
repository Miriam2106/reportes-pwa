console.log("SERVICEWORKER")

const STATIC = 'staticv1';
const STATIC_LIMIT = 15;
const INMUTABLE = 'inmutablev1';
const DYNAMIC = 'dynamicv1';
const DYNAMIC_LIMIT = 30

//Todos aquellos recursos propios de la aplicación
const APP_SHELL = [
    '/',
    '/index.html',
    'css/styles.css',
    'images/gatito.jpg',
    'js/app.js',
    'pages/offline.html'
]

// Todos aquellos recursos exteriores que nunca cambian
const APP_SHELL_INMUTABLE = [
    'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css'
]

self.addEventListener('install', (e) => {
    console.log("Instalado")
    //e.skipWaiting();
    const staticCache = caches.open(STATIC).then(cache => {
        cache.addAll(APP_SHELL);
    })
    const inmutableCache = caches.open(INMUTABLE).then(cache => {
        cache.addAll(APP_SHELL_INMUTABLE);
    })
    e.waitUntil(Promise.all([staticCache, inmutableCache]));
})

self.addEventListener('activate', (e) => {
    console.log("Activado")
})

/*
    Por medio de alguna estrategia de cache
    y el evento fetch
    mostrar en pantalla la página offline
    cuando se solicite el recurso page2.html
    y no haya internet
*/

self.addEventListener('fetch', (e) => {

    //4. Cache with network update 
    //Rendimiento crítico, si el rendimiento es bajo utilizar. Toda nuestra aplicación está un paso atrás

    if (e.request.url.includes('page2.html')) {
        e.respondWith(
            fetch(e.request).catch(() => {
                return caches.match('/pages/offline.html');
            })
        );
        return;
    }

    e.respondWith(
        fetch(e.request).then(res => {
            if (!res || !res.ok) throw Error('No encontrado');
            const resClone = res.clone();
            caches.open(DYNAMIC).then(cache => {
                cache.put(e.request, resClone);
            });

            return res;
        }).catch(err => {
            console.warn('Error:', err);
            return caches.match(e.request);
        })
    );

    //if(e.request.url.includes('1.jpg'))
    //e.respondWith(fetch('img/2.png'));
    //else e.respondWith(fetch(e.request));

    //3. Network with cache fallback
    // const source = fetch(e.request)
    // .then(res => {
    //     if (!res) throw Error('NotFound');
    //     // Checar si el recurso ya existe en algún cache
    //     caches.open(DYNAMIC).then(cache => {
    //         cache.put(e.request, res);
    //     });
    //     return res.clone();
    // }).catch(err => {
    //     return caches.match(e.request);
    // });
    // e.respondWith(source);

    //2. Cache with network fallback - si no encuentra en cache, busca en internet
    // const source = caches.match(e.request).then((res) =>{
    //     if(res) return res;
    //     return fetch(e.request).then(resFetch => {
    //         caches.open(DYNAMIC).then( cache => {
    //             cache.put(e.request, resFetch);
    //         });
    //         return resFetch.clone();
    //     })
    // })
    // e.respondWith(source);
    //1. Cache only, hace que la url haga match con
    //e.respondWith(caches.match(e.request));
})

// self.addEventListener('push', (e) =>{
//     console.log("Notificación push")
// })

// self.addEventListener('sync', (e) =>{
//     console.log("Sync event")
// })
