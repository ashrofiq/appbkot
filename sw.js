/* Service worker appBK otm — cache cadangan agar aplikasi tetap terbuka saat sinyal lemah.
   Cache dipisah per aplikasi (nama cache berbeda) sehingga dua aplikasi bisa dipasang bersamaan. */
var CACHE="bk-otm-v1";
self.addEventListener("install",function(e){self.skipWaiting()});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k.indexOf("bk-otm-")===0&&k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener("fetch",function(e){
  var r=e.request;
  if(r.method!=="GET")return;
  var u=new URL(r.url);
  if(u.origin!==self.location.origin)return;            /* Supabase & CDN tidak disentuh */
  if(u.pathname.slice(-5)==="sw.js"||/\/sw[^\/]*\.js$/.test(u.pathname))return;
  e.respondWith(
    fetch(r).then(function(res){
      if(res&&res.status===200){
        var cp=res.clone();
        caches.open(CACHE).then(function(c){
          if(r.mode==="navigate"){
            c.match(r).then(function(old){
              if(old&&old.headers.get("content-length")&&cp.headers.get("content-length")&&old.headers.get("content-length")!==cp.headers.get("content-length")){
                self.clients.matchAll().then(function(cs){cs.forEach(function(x){x.postMessage({t:"upd"})})})}
            }).catch(function(){})}
          c.put(r,cp)}).catch(function(){})}
      return res}).catch(function(){return caches.match(r).then(function(m){return m||Response.error()})}))});
