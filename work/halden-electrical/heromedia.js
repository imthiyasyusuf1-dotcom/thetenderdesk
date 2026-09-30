/* Hero media slot. Put files in media/ and they appear automatically:
   hero-portrait.mp4 / .jpg (1080x1920, phones) and hero-landscape.mp4 / .jpg (1920x1080, desktop).
   If no file exists the slot stays hidden and the SVG/CSS scene shows on its own. */
(function(){
  document.querySelectorAll('.hero-media').forEach(function(box){
    if(box.dataset.on!=='1')return;
    var portrait=matchMedia('(max-aspect-ratio:1/1)').matches,d=box.dataset;
    var mp4=portrait?d.mp4Portrait:d.mp4Landscape,poster=portrait?d.posterPortrait:d.posterLandscape;
    var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    function still(){var i=new Image();i.alt='';i.decoding='async';i.onload=function(){box.appendChild(i);box.classList.add('ready')};i.src=poster}
    if(!mp4||reduce){still();return}
    (location.protocol==="file:"?Promise.reject():fetch(mp4,{method:"HEAD"})).then(function(r){
      if(!r.ok)throw 0;
      var v=document.createElement('video');v.muted=true;v.defaultMuted=true;v.loop=true;v.autoplay=true;v.playsInline=true;
      v.setAttribute('playsinline','');v.setAttribute('muted','');v.preload='auto';v.poster=poster;
      v.addEventListener('loadeddata',function(){box.classList.add('ready')},{once:true});
      v.src=mp4;box.appendChild(v);var pr=v.play();if(pr&&pr.catch)pr.catch(function(){});
    }).catch(still);
  });
})();
