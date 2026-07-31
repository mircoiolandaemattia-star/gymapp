import{m as c}from"./data-CTjmEaFb.js";import{c as o}from"./index-CiGC_1cT.js";import{F as E}from"./flame-Dl4AQRx6.js";/**
 * @license lucide v1.27.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=[["circle",{cx:"12",cy:"12",r:"10"}],["circle",{cx:"12",cy:"12",r:"1"}]];/**
 * @license lucide v1.27.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=[["path",{d:"M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"}]];/**
 * @license lucide v1.27.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const H=[["path",{d:"M2 22 16 8"}],["path",{d:"M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"}],["path",{d:"M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"}],["path",{d:"M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"}],["path",{d:"M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"}],["path",{d:"M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"}],["path",{d:"M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"}],["path",{d:"M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"}]];function x(){const s=document.createElement("section");s.className="page dieta-page";const p=document.createElement("div");p.className="page-header",p.innerHTML=`
    <h1 class="page-title">Dieta</h1>
    <p class="page-subtitle">Piano alimentare</p>
  `,s.appendChild(p);const L=c.reduce((a,e)=>a+e.cal,0),M=c.reduce((a,e)=>a+e.protein,0),b=c.reduce((a,e)=>a+e.carbs,0),f=c.reduce((a,e)=>a+e.fat,0),t=document.createElement("div");t.className="diet-summary-grid";const n=document.createElement("div");n.className="diet-summary-card";const u=o(E,20,2);u.classList.add("color-accent"),n.appendChild(u),n.innerHTML+='<span class="stat-label">Calorie</span><span class="stat-value">'+L+"</span>",t.appendChild(n);const l=document.createElement("div");l.className="diet-summary-card";const C=o(N,20,2);C.classList.add("color-info"),l.appendChild(C),l.innerHTML+='<span class="stat-label">Proteine</span><span class="stat-value">'+M+"g</span>",t.appendChild(l);const d=document.createElement("div");d.className="diet-summary-card";const v=o(H,20,2);v.classList.add("color-warning"),d.appendChild(v),d.innerHTML+='<span class="stat-label">Carbs</span><span class="stat-value">'+b+"g</span>",t.appendChild(d);const r=document.createElement("div");r.className="diet-summary-card";const g=o(y,20,2);g.classList.add("color-info"),r.appendChild(g),r.innerHTML+='<span class="stat-label">Grassi</span><span class="stat-value">'+f+"g</span>",t.appendChild(r),s.appendChild(t);const i=document.createElement("div");return i.className="meal-list",c.forEach(a=>{const e=document.createElement("div");e.className="card meal-item",e.innerHTML=`<h3 class="card-title">${a.name}</h3>`;const m=document.createElement("p");m.className="card-subtitle",m.textContent=`${a.cal} cal`,e.appendChild(m);const h=document.createElement("div");h.className="meal-macro",h.innerHTML=`<span style="color:var(--info)">P ${a.protein}g</span><span style="color:var(--warning)">C ${a.carbs}g</span><span style="color:var(--info)">G ${a.fat}g</span>`,e.appendChild(h),i.appendChild(e)}),s.appendChild(i),s}export{x as default,x as render};
