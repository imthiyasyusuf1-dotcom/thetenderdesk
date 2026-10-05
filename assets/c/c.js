(function(){
var b=document.querySelector('.burger'),m=document.querySelector('.mnav');
if(b&&m){b.addEventListener('click',function(){var on=m.classList.toggle('on');b.setAttribute('aria-expanded',on);document.documentElement.classList.toggle('menu-on',on)});
m.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){m.classList.remove('on');document.documentElement.classList.remove('menu-on')})})}
var els=document.querySelectorAll('.rv');if(/qa/.test(location.search))els.forEach(function(e){e.classList.add('in')});
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});els.forEach(function(e){io.observe(e)})}else els.forEach(function(e){e.classList.add('in')});
document.querySelectorAll('form.f').forEach(function(f){f.addEventListener('submit',function(ev){ev.preventDefault();var d=new FormData(f),lines=[];d.forEach(function(v,k){if(v)lines.push(k.charAt(0).toUpperCase()+k.slice(1)+': '+v)});
var s=f.getAttribute('data-subject')||'New enquiry';location.href='mailto:hello@thetenderdesk.co.uk?subject='+encodeURIComponent(s)+'&body='+encodeURIComponent(lines.join('\n'));
var n=f.querySelector('.sent');if(n)n.hidden=false})});
})();
;(function(){var w=document.querySelector('.wa'),t=document.querySelector('.tick');if(!w||!t)return;function u(){var r=t.getBoundingClientRect();w.classList.toggle('hid',r.top<innerHeight&&r.bottom>innerHeight-90)}addEventListener('scroll',u,{passive:true});u()})();
