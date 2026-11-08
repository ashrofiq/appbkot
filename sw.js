/* Service worker AppBKot v1.5.52 */
var V="1.5.52",C="appbkot-"+V,PRE="appbkot-";
var ASET=["./","manifest.json","icon-192.png","icon-512.png"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(ASET)}).then(function(){return self.skipWaiting()}))});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x.indexOf(PRE)===0&&x!==C}).map(function(x){return caches.delete(x)}))}).then(function(){return self.clients.claim()}))});
function sig(r){return r?(r.headers.get("etag")||"")+"|"+(r.headers.get("last-modified")||"")+"|"+(r.headers.get("content-length")||""):""}
function kabar(){self.clients.matchAll({type:"window"}).then(function(a){a.forEach(function(c){c.postMessage({t:"upd"})})})}
// cache dulu (cepat), perbarui di belakang layar; jika ada versi baru, beri tahu halaman
function swr(req,key,notif){return caches.open(C).then(function(c){return c.match(key).then(function(hit){
  var net=fetch(req).then(function(r){if(r&&r.ok){var cp=r.clone();c.put(key,cp);if(notif&&hit&&sig(hit)!==sig(r))kabar()}return r}).catch(function(){return null});
  return hit||net.then(function(r){return r||c.match("./")})})})}
self.addEventListener("fetch",function(e){
  var q=e.request;if(q.method!=="GET")return;
  var u=new URL(q.url);
  if(u.origin===location.origin){
    if(q.mode==="navigate"){e.respondWith(swr(q,"./",true));return}
    e.respondWith(swr(q,q.url,false));return}
  if(u.hostname==="cdn.jsdelivr.net"){e.respondWith(caches.open(C).then(function(c){return c.match(q).then(function(h){return h||fetch(q).then(function(r){if(r&&(r.ok||r.type==="opaque"))c.put(q,r.clone());return r})})}));return}
});
