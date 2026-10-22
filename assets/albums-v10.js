/* Render photography albums from data/albums.js. No server, build tools, or database needed. */
(function(){
  'use strict';
  const albums = Array.isArray(window.PHOTO_ALBUMS) ? window.PHOTO_ALBUMS : [];
  const byId = (id) => document.getElementById(id);
  const E = (tag,cls,text) => {
    const e=document.createElement(tag);
    if(cls)e.className=cls;
    if(text!==undefined)e.textContent=text;
    return e;
  };
  const amount = n => n===1 ? '1 photograph' : `${n} photographs`;
  const validate = () => albums.filter(a=>a && a.id && a.title && Array.isArray(a.photos) && a.photos.length && a.photos[0].src);
  const ready = validate();
  function albumCard(album,one){
    const link=E('a','album-card'+(one?' album-card-featured':''));
    link.id='album-'+album.id;
    link.href='album.html?album='+encodeURIComponent(album.id);
    link.setAttribute('aria-label','Open photo album: '+album.title);
    const cover=E('div','album-cover');
    const pic=E('img'); pic.src=album.cover || album.photos[0].src;
    pic.alt=album.coverAlt || album.photos[0].alt || album.title;
    pic.loading='lazy';pic.decoding='async'; cover.append(pic);
    const copy=E('div','album-card-copy');
    copy.append(E('span','album-kind',album.category||'Photography'),E('h3','',album.title));
    if(album.description)copy.append(E('p','',album.description));
    copy.append(E('span','album-count',amount(album.photos.length)),E('span','album-enter','View album ↗'));
    link.append(cover,copy);return link;
  }
  function renderIndex(){
    const list=byId('album-list');if(!list)return;
    ready.forEach(a=>list.appendChild(albumCard(a,ready.length===1)));
    if(!ready.length)list.append(E('p','album-not-found','Photo collections will be added here.'));
  }
  function renderDetail(){
    const grid=byId('album-photos');if(!grid)return;
    const name=new URLSearchParams(location.search).get('album');
    const a=ready.find(x=>x.id===name) || (!name?ready[0]:null);
    if(!a){
      byId('album-title').textContent='Album not found';
      byId('album-description').textContent='Return to Beyond Research to choose an available album.';
      grid.append(E('p','album-not-found','This album is not available.'));
      return;
    }
    document.title=a.title+' | Beyond Research | Kunyang Wang';
    byId('album-title').textContent=a.title;
    byId('album-description').textContent=a.description||'';
    byId('album-category').textContent=a.category||'Photography';
    byId('album-count').textContent=amount(a.photos.length);
    let active=0, previousFocus=null, touchStart=null;
    const box=byId('photo-lightbox');
    const viewer=byId('lightbox-image');
    const label=byId('lightbox-title');
    const note=byId('lightbox-caption');
    const counter=byId('lightbox-counter');
    const prev=byId('lightbox-prev'),next=byId('lightbox-next'),close=byId('lightbox-close');
    function update(){
      const p=a.photos[active];
      viewer.src=p.src; viewer.alt=p.alt || p.title || 'Photograph';
      label.textContent=p.title || a.title;
      const where=[p.location,p.year].filter(Boolean).join(' · ');
      note.textContent=where || '© Kunyang Wang';
      counter.textContent=`${active+1} / ${a.photos.length}`;
      prev.hidden=next.hidden=a.photos.length<=1;
    }
    function open(i){active=i;previousFocus=document.activeElement;update();box.classList.add('is-open');box.setAttribute('aria-hidden','false');document.body.classList.add('lightbox-open');close.focus()}
    function shut(){box.classList.remove('is-open');box.setAttribute('aria-hidden','true');document.body.classList.remove('lightbox-open');viewer.removeAttribute('src'); if(previousFocus&&previousFocus.focus)previousFocus.focus()}
    function move(delta){active=(active+delta+a.photos.length)%a.photos.length;update()}
    a.photos.forEach((p,i)=>{
      const item=E('button','album-photo');item.type='button';item.setAttribute('aria-label','Enlarge '+(p.title||'photograph')+', '+(i+1)+' of '+a.photos.length);
      const img=E('img','album-image');img.src=p.thumb||p.src;img.alt=p.alt||p.title||'Photograph';img.loading=i<2?'eager':'lazy';img.decoding='async';
      img.addEventListener('load',()=>{if(img.naturalWidth<img.naturalHeight)item.classList.add('portrait')});
      const cap=E('div','album-photo-meta');cap.append(E('strong','',p.title||'Untitled'));
      const meta=[p.location,p.year].filter(Boolean).join(' · ');if(meta)cap.append(E('small','',meta));
      item.append(img,cap);item.addEventListener('click',()=>open(i));grid.append(item);
    });
    close.addEventListener('click',shut);
    prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
    box.addEventListener('click',e=>{if(e.target===box)shut()});
    document.addEventListener('keydown',e=>{
      if(!box.classList.contains('is-open'))return;
      if(e.key==='Escape')shut();
      if(e.key==='ArrowRight'&&a.photos.length>1)move(1);
      if(e.key==='ArrowLeft'&&a.photos.length>1)move(-1);
      if(e.key==='Tab'){
        const possible=[close,prev,next].filter(x=>!x.hidden);
        const ix=possible.indexOf(document.activeElement);
        if(e.shiftKey && ix===0){e.preventDefault();possible[possible.length-1].focus()}
        else if(!e.shiftKey && ix===possible.length-1){e.preventDefault();possible[0].focus()}
      }
    });
    box.addEventListener('touchstart',e=>{touchStart=e.changedTouches[0].screenX},{passive:true});
    box.addEventListener('touchend',e=>{
      if(touchStart===null)return;
      const delta=e.changedTouches[0].screenX-touchStart;touchStart=null;
      if(Math.abs(delta)>55&&a.photos.length>1)move(delta<0?1:-1);
    },{passive:true});
  }
  renderIndex();renderDetail();
})();
