
if ('serviceWorker' in navigator) 
{
    navigator.serviceWorker
        .register('/service_worker.js')
        .then(() => console.log('Service Worker Registered'))
}

window.addEventListener('beforeinstallprompt', e => 
{
    console.log(`'beforeinstallprompt' event was fired.`)
})
