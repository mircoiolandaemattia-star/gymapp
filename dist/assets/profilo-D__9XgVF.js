import{c as a,U as h,n as u}from"./index-CiGC_1cT.js";import{T as C,C as f}from"./target-CY27nRLE.js";import{C as g}from"./chevron-right-OzsFB5Of.js";/**
 * @license lucide v1.27.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=[["path",{d:"m16 17 5-5-5-5"}],["path",{d:"M21 12H9"}],["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"}]];/**
 * @license lucide v1.27.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=[["path",{d:"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"}],["circle",{cx:"12",cy:"12",r:"3"}]];function y(){const e=document.createElement("section");e.className="page profilo-page";const c=document.createElement("div");c.className="page-header",c.innerHTML=`
    <h1 class="page-title">Profilo</h1>
    <p class="page-subtitle">Le tue impostazioni</p>
  `,e.appendChild(c);const s=document.createElement("div");s.className="avatar",s.appendChild(a(h,40,1.5)),e.appendChild(s);const o=document.createElement("h2");o.className="profile-name",o.textContent="Mario Rossi",e.appendChild(o);const m=[{icon:C,label:"Obiettivi"},{icon:f,label:"Storico Allenamenti"},{icon:x,label:"Impostazioni"}],l=document.createElement("div");l.className="profile-menu",m.forEach(r=>{const n=document.createElement("div");n.className="card menu-item",n.appendChild(a(r.icon,20,2));const i=document.createElement("span");i.style.cssText="flex:1;font-size:0.875rem",i.textContent=r.label,n.appendChild(i);const d=a(g,16,2);d.style.cssText="color:var(--text-muted);flex-shrink:0",n.appendChild(d),l.appendChild(n)}),e.appendChild(l);const t=document.createElement("button");t.className="btn btn-error btn-full",t.style.cssText="margin-top:var(--space-2xl);width:100%;display:inline-flex;align-items:center;justify-content:center;gap:var(--space-sm)",t.appendChild(a(v,18,2));const p=document.createElement("span");return p.textContent="Esci",t.appendChild(p),t.addEventListener("click",()=>u("/login")),e.appendChild(t),e}export{y as default,y as render};
