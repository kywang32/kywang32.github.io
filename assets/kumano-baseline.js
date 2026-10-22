/* Chapter baseline layout: per-column widths are solved analytically so each
   column has the same total height, while every photograph keeps its native ratio.
   Works for arbitrary photo groups: edit data-wide/data-tablet/data-mobile only. */
(() => {
  'use strict';
  const gaps = { wide:18, tablet:13, mobile:14 };
  function getGroups(wall, width) {
    const mode = width < 600 ? 'mobile' : (width < 900 ? 'tablet' : 'wide');
    return {mode, groups: wall.dataset[mode].split('|').map(s=>s.split(',').map(Number))};
  }
  function buildPhoto(index) {
    const info = window.KUMANO_PHOTOS[index];
    if (!info) throw new Error(`Invalid photo index ${index}`);
    const button=document.createElement('button');
    button.type='button'; button.className='photo';
    button.setAttribute('aria-label', `Open photograph ${info.number} of 14`);
    const image=document.createElement('img');
    image.src=info.thumb; image.alt=info.alt; image.loading='lazy';
    image.width=info.width; image.height=info.height;
    const cap=document.createElement('span'); cap.className='photocap';
    cap.textContent=`Frame ${info.number} / 14`;
    button.append(image,cap);
    button.addEventListener('click',()=>window.Kumano.openPhoto(index));
    return button;
  }
  function layout(wall) {
    const width=wall.clientWidth;
    if (!width) return;
    const {mode,groups}=getGroups(wall,width);
    if (wall.dataset.lastWidth===String(width) && wall.dataset.lastMode===mode) return;
    wall.dataset.lastWidth=String(width);wall.dataset.lastMode=mode;
    wall.replaceChildren();
    const gap=gaps[mode];
    const colSpecs=groups.map(ids=>({ids, inverseRatioSum: ids.reduce((s,i)=>s+1/window.KUMANO_PHOTOS[i].ratio,0)}));
    if (mode==='mobile') {
      for(const spec of colSpecs) {
        const col=document.createElement('div'); col.className='baseline-column';col.style.width='100%';
        spec.ids.forEach(i=>col.append(buildPhoto(i)));wall.append(col);
      }
      return;
    }
    const sumRecip=colSpecs.reduce((s,spec)=>s+1/spec.inverseRatioSum,0);
    const extra=colSpecs.reduce((s,spec)=>s+((spec.ids.length-1)*gap)/spec.inverseRatioSum,0);
    const targetHeight=(width-(groups.length-1)*gap+extra)/sumRecip;
    for(const spec of colSpecs) {
      const colWidth=(targetHeight-(spec.ids.length-1)*gap)/spec.inverseRatioSum;
      const col=document.createElement('div'); col.className='baseline-column';
      col.style.width=colWidth.toFixed(4)+'px';
      spec.ids.forEach(i=>col.append(buildPhoto(i)));
      wall.append(col);
    }
  }
  const walls=Array.from(document.querySelectorAll('.baseline-wall'));
  if (!walls.length) return;
  walls.forEach(w=>layout(w));
  let frame=0;
  window.addEventListener('resize',()=>{
    cancelAnimationFrame(frame);
    frame=requestAnimationFrame(()=>walls.forEach(w=>layout(w)));
  }, {passive:true});
})();
