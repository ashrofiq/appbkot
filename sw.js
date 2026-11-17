/* Service worker appBK otm — cache cadangan agar aplikasi tetap terbuka saat sinyal lemah.
   Cache dipisah per aplikasi (nama cache berbeda) sehingga dua aplikasi bisa dipasang bersamaan. */
var CACHE="bk-otm-v1-5-92";
self.addEventListener("install",function(e){self.skipWaiting()});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k.indexOf("bk-otm-")===0&&k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener("fetch",function(e){
  var r=e.request;
  if(r.method!=="GET")return;
  var u=new URL(r.url);
  if(u.origin!==self.location.origin){                  /* hanya pustaka supabase.js yang disimpan, agar halaman bisa dibuka saat offline */
    if(/\/supabase(\.min)?\.js$/.test(u.pathname)&&r.destination==="script"){
      e.respondWith(caches.open(CACHE).then(function(c){return c.match(r).then(function(m){return m||fetch(r).then(function(res){c.put(r,res.clone());return res})})}))}
    return}                                              /* Supabase API & lainnya tidak disentuh */
  if(u.pathname.slice(-5)==="sw.js"||/\/sw[^\/]*\.js$/.test(u.pathname))return;
  if(r.mode==="navigate"){                              /* halaman utama: tampilkan dari cache lebih dulu (cepat), perbarui di belakang layar */
    e.respondWith(caches.open(CACHE).then(function(c){return c.match(r).then(function(old){
      var net=fetch(r).then(function(res){
        if(res&&res.status===200){
          var cp=res.clone();
          if(old){var a=old.headers,b=res.headers;
            if((a.get("etag")&&b.get("etag")&&a.get("etag")!==b.get("etag"))||(a.get("content-length")&&b.get("content-length")&&a.get("content-length")!==b.get("content-length"))){
              self.clients.matchAll().then(function(cs){cs.forEach(function(x){x.postMessage({t:"upd"})})})}}
          return c.put(r,cp).then(function(){return res},function(){return res})}
        return res}).catch(function(){return null});
      if(old){e.waitUntil(net);return old}
      return net.then(function(res){return res||Response.error()})})}));
    return}
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
