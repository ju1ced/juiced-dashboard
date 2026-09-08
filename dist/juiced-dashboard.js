/*! Juiced Dashboard 0.1.0 | MIT License | https://github.com/ju1ced/juiced-dashboard */
function s(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}var Ie=new Set(["unavailable","unknown"]);function p(t){return t==null||Ie.has(t)}function l(t,e){return!e||!t?null:t.states?.[e]||null}function y(t,e){let r=Number(t);return Number.isFinite(r)?r.toFixed(e??1).replace(".",","):null}function h(t,e){let r=y(t,e);return r===null?null:`${r}\xB0`}var ze={off:"Uit",heat:"Verwarmen",cool:"Koelen",heat_cool:"Auto",auto:"Auto",fan_only:"Ventilator",dry:"Droog"};function pe(t){let e=String(t??"").replace(/_/g," ");return e?e.charAt(0).toUpperCase()+e.slice(1):""}function k(t){return t&&(ze[t]||pe(t))||"Onbekend"}function me(t){if(!t)return null;let e=t.attributes?.current_position;return typeof e=="number"&&Number.isFinite(e)?Math.round(e):t.state==="open"?100:t.state==="closed"?0:null}function ge(t){let e=me(t);return e===null?"\u2014":`${e}%`}function E(t,e,r){if(t)return t;let i=e?.attributes?.friendly_name;return typeof i=="string"&&i?i:r||""}function fe(t){let e=[],r=i=>{typeof i=="string"&&i.includes(".")&&e.push(i)};return r(t?.temperature),r(t?.humidity),r(t?.media_player),r(t?.climate),(t?.lights||[]).forEach(i=>r(i?.entity)),(t?.covers||[]).forEach(i=>r(i?.entity)),(t?.awnings||[]).forEach(i=>r(i?.entity)),e}function he(t){let e=new Set;return(t?.rooms||[]).forEach(r=>{fe(r).forEach(i=>e.add(i))}),[...e]}function ye(t,e,r){if(!t||!e)return!0;let i=t.states||{},o=e.states||{};for(let a of r){let n=i[a],c=o[a];if(!n||!c){if(n!==c)return!0;continue}if(n.state!==c.state||n.last_updated!==c.last_updated)return!0}return!1}function Q(t,e){let r=[],i=l(t,e?.temperature);if(i&&!p(i.state)){let a=h(i.state,1);a&&r.push(a)}let o=l(t,e?.humidity);if(o&&!p(o.state)){let a=y(o.state,0);a&&r.push(`${a}%`)}return r.length?r.join(" \xB7 "):e?.idle_text||"Rustig"}function A(t,e){return(e?.lights||[]).filter(r=>l(t,r?.entity)?.state==="on").length}function ve(t,e){let r=A(t,e);return r<=0?null:r===1?"1 lamp aan":`${r} lampen aan`}function Je(t){return!!((t?.lights||[]).length||(t?.covers||[]).length||(t?.awnings||[]).length||t?.media_player||t?.climate)}function v(t,e,r,i,o){!t||!i||t.callService(e,r,{entity_id:i,...o||{}})}function H(t,e){v(t,"light","toggle",e)}function T(t,e){v(t,"cover","open_cover",e)}function $(t,e){v(t,"cover","close_cover",e)}function D(t,e){v(t,"cover","stop_cover",e)}function M(t,e,r){v(t,"climate","set_hvac_mode",e,{hvac_mode:r})}var be=20;function I(t,e,r,i){let a=r!==""&&r!==null&&r!==void 0?Number(r):NaN,n=Number.isFinite(a)?a:be,c=Math.round((n+i)*10)/10;v(t,"climate","set_temperature",e,{temperature:c})}function z(t,e){v(t,"media_player","media_play_pause",e)}function J(t,e){let r=e.lights||[];return r.length?`<div class="jrc-section"><h4>Verlichting</h4>${r.map(o=>{let a=l(t,o.entity),n=a?.state==="on",c=E(o.name,a,o.entity),d=p(a?.state);return`
        <div class="jrc-lightrow${n?" on":""}">
          <span class="jrc-lrow-ic">${xe}</span>
          <span class="jrc-lrow-text">
            <span class="jrc-lrow-name">${s(c)}</span>
            <span class="jrc-lrow-sub">${d?"Niet beschikbaar":n?"Aan":"Uit"}</span>
          </span>
          <button class="jrc-toggle${n?" on":""}" data-action="toggle-light"
            data-entity="${s(o.entity)}" ${d?"disabled":""}
            aria-label="${s(c)} omschakelen"><i></i></button>
        </div>`}).join("")}</div>`:""}function _(t,e,r,i){let o=e[r]||[];if(!o.length)return"";let a=o.map(n=>{let c=l(t,n.entity),d=E(n.name,c,n.entity);return`
        <div class="jrc-coverrow">
          <span class="jrc-cr-name">${s(d)}</span>
          <span class="jrc-cr-pos">${ge(c)}</span>
          <span class="jrc-cr-btns">
            <button data-action="cover-open" data-entity="${s(n.entity)}" aria-label="Omhoog">${Ke}</button>
            <button data-action="cover-stop" data-entity="${s(n.entity)}" aria-label="Stop">${Pe}</button>
            <button data-action="cover-close" data-entity="${s(n.entity)}" aria-label="Omlaag">${Ne}</button>
          </span>
        </div>`}).join("");return`<div class="jrc-section"><h4>${s(i)}</h4>${a}</div>`}function V(t,e){if(!e.media_player)return"";let r=l(t,e.media_player),i=E(null,r,e.media_player),o=r?.attributes?.media_title,a=typeof o=="string"&&o?o:p(r?.state)?"Niet beschikbaar":"Uit",n=r?.state==="playing";return`
    <div class="jrc-section">
      <h4>Media</h4>
      <div class="jrc-media">
        <span class="jrc-media-ic">${qe}</span>
        <span class="jrc-media-text">
          <span class="jrc-media-name">${s(i)}</span>
          <span class="jrc-media-sub">${s(a)}</span>
        </span>
        <button class="jrc-media-btn${n?" on":""}" data-action="media-toggle"
          data-entity="${s(e.media_player)}" aria-label="Afspelen/pauzeren">${Ue}</button>
      </div>
    </div>`}function O(t,e){if(!e.climate)return"";let r=l(t,e.climate),i=E(null,r,e.climate),o=r?.attributes?.hvac_modes,a=Array.isArray(o)?o.filter(w=>typeof w=="string"):[],n=r?.state,c=h(r?.attributes?.current_temperature,1),d=r?.attributes?.temperature,m=h(d,1)||"\u2014",g=Number(r?.attributes?.target_temp_step),x=Number.isFinite(g)&&g>0?g:.5,le=a.map(w=>`
      <button class="jrc-pill${w===n?" on":""}" data-action="climate-mode"
        data-entity="${s(e.climate)}" data-mode="${s(w)}">${s(k(w))}</button>`).join(""),ue=typeof d=="string"||typeof d=="number"?String(d):"";return`
    <div class="jrc-section">
      <h4>Klimaat</h4>
      <div class="jrc-kv"><span>${s(i)}</span><span class="ok">${s(k(n))}</span></div>
      ${le?`<div class="jrc-pillrow">${le}</div>`:""}
      <div class="jrc-stepper">
        <button data-action="climate-step" data-entity="${s(e.climate)}"
          data-target="${ue}" data-step="${-x}" aria-label="Kouder">\u2212</button>
        <div class="jrc-stepper-mid">
          <div class="v">${s(m)}</div>
          <div class="l">doel${c?` \xB7 nu ${s(c)}`:""}</div>
        </div>
        <button data-action="climate-step" data-entity="${s(e.climate)}"
          data-target="${ue}" data-step="${x}" aria-label="Warmer">+</button>
      </div>
    </div>`}var Ve=typeof HTMLElement>"u"?class{}:HTMLElement,L=class extends Ve{_config=null;_hass=null;_entityIds=[];_openRoomIndex=null;_built=!1;constructor(){super(),this.attachShadow({mode:"open"}),this._onClick=this._onClick.bind(this),this._onKeydown=this._onKeydown.bind(this),this._onDocKeydown=this._onDocKeydown.bind(this)}get root(){return this.shadowRoot}static getStubConfig(){return{type:"custom:juiced-dashboard-room-card",title:"Kamers",subtitle:"Tik een kamer om lichten, rolluiken, luifels, radio of airco direct te bedienen",rooms:[{name:"Bureau",icon:"mdi:desk",temperature:"sensor.bureau_temperature",humidity:"sensor.bureau_humidity",lights:[{entity:"light.bureau_spellenruimte",name:"Bureau & spellenruimte"},{entity:"light.bureau_spellentafel",name:"Spellentafel"}],awnings:[{entity:"cover.luifel_bureau",name:"Luifel bureau"}],media_player:"media_player.kantoor",climate:"climate.daikin_bureau"}]}}setConfig(e){if(!e||typeof e!="object")throw new Error("juiced-dashboard-room-card: invalid configuration.");if(!Array.isArray(e.rooms))throw new Error("juiced-dashboard-room-card: `rooms` must be a list.");e.rooms.forEach((r,i)=>{if(!r||typeof r!="object")throw new Error(`juiced-dashboard-room-card: room at index ${i} must be an object.`);if(!r.name)throw new Error(`juiced-dashboard-room-card: room at index ${i} is missing \`name\`.`)}),this._config=e,this._entityIds=he(e),this._openRoomIndex=null,this._built=!1,this._renderShell(),this._renderList(),this._built=!0}set hass(e){let r=this._hass;this._hass=e,this._config&&(this._built&&r&&!ye(r,e,this._entityIds)||(this._renderList(),this._openRoomIndex!==null&&this._renderPopup()))}get hass(){return this._hass}getCardSize(){return 1+Math.ceil((this._config?.rooms?.length||0)/2)}connectedCallback(){this.root.addEventListener("click",this._onClick),this.root.addEventListener("keydown",this._onKeydown)}disconnectedCallback(){this.root.removeEventListener("click",this._onClick),this.root.removeEventListener("keydown",this._onKeydown),typeof document<"u"&&document.removeEventListener("keydown",this._onDocKeydown)}_renderShell(){let e=this._config||{};this.root.innerHTML=`
      <style>${Ge}</style>
      <ha-card class="jrc-shell">
        ${e.title||e.subtitle?`<div class="jrc-head">
                ${e.title?`<h2 class="jrc-title">${s(e.title)}</h2>`:""}
                ${e.subtitle?`<p class="jrc-subtitle">${s(e.subtitle)}</p>`:""}
              </div>`:""}
        <div class="jrc-list" id="list"></div>
      </ha-card>
      <div class="jrc-backdrop" id="backdrop" data-action="close-backdrop">
        <div class="jrc-popup" role="dialog" aria-modal="true" aria-labelledby="popup-name">
          <div class="jrc-popup-head">
            <span class="jrc-room-ic" id="popup-icon"></span>
            <div class="jrc-popup-heading">
              <h3 id="popup-name"></h3>
              <div class="jrc-popup-sub" id="popup-sub"></div>
            </div>
            <button class="jrc-close" data-action="close" aria-label="Sluiten">${Be}</button>
          </div>
          <div class="jrc-popup-body" id="popup-body"></div>
        </div>
      </div>`}_renderList(){let e=this.root.getElementById("list");if(!e)return;let r=this._hass,i=this._config?.rooms||[];e.innerHTML=i.map((o,a)=>this._roomRowHtml(o,a,r)).join("")}_roomRowHtml(e,r,i){let o=Q(i,e),a=ve(i,e),n=(e.lights||[])[0],c=n?l(i,n.entity)?.state==="on":!1;return`
      <div class="jrc-row" role="button" tabindex="0" data-action="open-room" data-room="${r}">
        <span class="jrc-row-ic">${C(e.icon)}</span>
        <span class="jrc-row-text">
          <span class="jrc-row-name">${s(e.name)}</span>
          <span class="jrc-row-stat">${s(o)}</span>
        </span>
        ${a?`<span class="jrc-flag">${s(a)}</span>`:""}
        ${n?`<button class="jrc-quick${c?" on":""}" data-action="toggle-light"
                 data-entity="${s(n.entity)}"
                 aria-label="Licht ${s(e.name)} omschakelen" title="Licht omschakelen">${xe}</button>`:`<span class="jrc-chev">${Oe}</span>`}
      </div>`}_openRoom(e){if(!(this._config?.rooms||[])[e])return;this._openRoomIndex=e,this._renderPopup(),this.root.getElementById("backdrop")?.classList.add("show"),typeof document<"u"&&document.addEventListener("keydown",this._onDocKeydown)}_closePopup(){this._openRoomIndex=null,this.root.getElementById("backdrop")?.classList.remove("show"),typeof document<"u"&&document.removeEventListener("keydown",this._onDocKeydown)}_renderPopup(){let e=(this._config?.rooms||[])[this._openRoomIndex];if(!e)return;let r=this._hass,i=this.root.getElementById("popup-icon");i&&(i.innerHTML=C(e.icon));let o=this.root.getElementById("popup-name");o&&(o.textContent=e.name);let a=this.root.getElementById("popup-sub");a&&(a.textContent=Q(r,e));let n=[J(r,e),_(r,e,"covers","Rolluiken"),_(r,e,"awnings","Luifels"),V(r,e),O(r,e)].filter(Boolean).join(""),c=this.root.getElementById("popup-body");c&&(c.innerHTML=n||'<p class="jrc-empty">Geen snelbediening geconfigureerd voor deze kamer.</p>')}_onClick(e){let i=e.target?.closest("[data-action]");if(!i)return;let o=i.dataset.action,a=this._hass;if(o==="open-room"){this._openRoom(Number(i.dataset.room));return}if(o==="close"||o==="close-backdrop"){if(o==="close-backdrop"&&e.target!==i)return;this._closePopup();return}if(o==="toggle-light"){e.stopPropagation(),H(a,i.dataset.entity);return}if(o==="cover-open"){T(a,i.dataset.entity);return}if(o==="cover-close"){$(a,i.dataset.entity);return}if(o==="cover-stop"){D(a,i.dataset.entity);return}if(o==="media-toggle"){z(a,i.dataset.entity);return}if(o==="climate-mode"){M(a,i.dataset.entity,i.dataset.mode);return}if(o==="climate-step"){I(a,i.dataset.entity,i.dataset.target,Number(i.dataset.step));return}}_onKeydown(e){if(e.key!=="Enter"&&e.key!==" ")return;let i=e.target?.closest('[data-action="open-room"]');i&&(e.preventDefault(),this._openRoom(Number(i.dataset.room)))}_onDocKeydown(e){e.key==="Escape"&&this._closePopup()}},xe='<svg viewBox="0 0 24 24" width="16" height="16"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.4 10.9c.5.5.9 1.2 1 2h4.8c.1-.8.5-1.5 1-2A6 6 0 0 0 12 3z"/></g></svg>',Oe='<svg viewBox="0 0 24 24" width="15" height="15"><polyline points="9 6 15 12 9 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',Be='<svg viewBox="0 0 24 24" width="15" height="15"><g stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></g></svg>',Ke='<svg viewBox="0 0 24 24" width="14" height="14"><polyline points="6 15 12 9 18 15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',Ne='<svg viewBox="0 0 24 24" width="14" height="14"><polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',Pe='<svg viewBox="0 0 24 24" width="14" height="14"><rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor"/></svg>',qe='<svg viewBox="0 0 24 24" width="18" height="18"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="3"/><circle cx="12" cy="8.2" r="2.4"/><circle cx="12" cy="16.5" r="1.1"/></g></svg>',Ue='<svg viewBox="0 0 24 24" width="13" height="13"><polygon points="6 4 20 12 6 20" fill="currentColor"/></svg>',Fe='<svg viewBox="0 0 24 24" width="17" height="17"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/></g></svg>';function C(t){return typeof t=="string"&&t.startsWith("mdi:")?`<ha-icon icon="${s(t)}"></ha-icon>`:Fe}var Ge=`
  :host { display: block; }
  * { box-sizing: border-box; }
  ha-card.jrc-shell {
    background: var(--juiced-surface-raised, var(--ha-card-background, var(--card-background-color, #fff)));
    border-radius: var(--juiced-radius-lg, var(--ha-card-border-radius, 16px));
    overflow: hidden;
  }
  .jrc-head { padding: 16px 18px 4px; }
  .jrc-title {
    margin: 0; font-size: 16px; font-weight: 700;
    color: var(--juiced-text-primary, var(--primary-text-color));
  }
  .jrc-subtitle {
    margin: 3px 0 0; font-size: 12.5px;
    color: var(--juiced-text-muted, var(--secondary-text-color));
  }
  .jrc-list { display: flex; flex-direction: column; }
  .jrc-row {
    display: flex; align-items: center; gap: 13px; padding: 13px 18px;
    border-top: 1px solid var(--juiced-border-subtle, var(--divider-color));
    cursor: pointer; -webkit-tap-highlight-color: transparent;
  }
  .jrc-list .jrc-row:first-child { border-top: 0; }
  .jrc-row:hover, .jrc-row:focus-visible {
    background: var(--juiced-surface-elevated, var(--secondary-background-color, rgba(0,0,0,.03)));
  }
  .jrc-row:focus-visible { outline: 2px solid var(--juiced-brand-primary, var(--primary-color)); outline-offset: -2px; }
  .jrc-row-ic {
    width: 36px; height: 36px; border-radius: 11px; flex: none;
    background: var(--juiced-surface-elevated, var(--secondary-background-color, rgba(0,0,0,.05)));
    color: var(--juiced-brand-primary, var(--primary-color));
    display: flex; align-items: center; justify-content: center;
  }
  .jrc-row-ic ha-icon { --mdc-icon-size: 18px; }
  .jrc-row-text { display: flex; flex-direction: column; line-height: 1.3; min-width: 0; }
  .jrc-row-name {
    font-weight: 700; font-size: 13.5px;
    color: var(--juiced-text-primary, var(--primary-text-color));
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jrc-row-stat { font-size: 11.5px; color: var(--juiced-text-muted, var(--secondary-text-color)); margin-top: 1px; }
  .jrc-flag {
    margin-left: auto; font-size: 10.5px; font-weight: 600; flex: none;
    color: var(--juiced-brand-accent, var(--state-icon-active-color, #b26a00));
    background: var(--juiced-chip-active, rgba(178,106,0,.14));
    padding: 4px 8px; border-radius: 999px;
  }
  .jrc-chev { margin-left: auto; color: var(--juiced-text-muted, var(--secondary-text-color)); flex: none; display:flex; }
  .jrc-quick {
    margin-left: auto; flex: none; width: 32px; height: 32px; border-radius: 10px;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, var(--secondary-background-color, transparent));
    color: var(--juiced-text-muted, var(--secondary-text-color));
    display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0;
  }
  .jrc-quick.on {
    background: var(--juiced-chip-active, rgba(178,106,0,.14));
    color: var(--juiced-brand-accent, var(--state-icon-active-color, #b26a00));
    border-color: transparent;
  }

  .jrc-backdrop {
    position: fixed; inset: 0; z-index: 500; display: none;
    align-items: flex-end; justify-content: center;
    background: rgba(10,12,16,.5);
  }
  .jrc-backdrop.show { display: flex; }
  @media (min-width: 720px) { .jrc-backdrop { align-items: center; padding: 24px; } }
  .jrc-popup {
    width: 100%; max-width: 440px; max-height: 86vh; overflow-y: auto;
    background: var(--juiced-surface-raised, var(--card-background-color, #fff));
    border-radius: 22px 22px 0 0;
    box-shadow: 0 -12px 40px rgba(0,0,0,.28);
  }
  @media (min-width: 720px) { .jrc-popup { border-radius: var(--juiced-radius-lg, 20px); } }
  .jrc-popup-head {
    display: flex; align-items: center; gap: 12px; padding: 18px 20px 14px;
    position: sticky; top: 0; background: inherit;
    border-bottom: 1px solid var(--juiced-border-subtle, var(--divider-color));
  }
  .jrc-room-ic {
    width: 38px; height: 38px; border-radius: 12px; flex: none;
    background: var(--juiced-surface-elevated, var(--secondary-background-color, rgba(0,0,0,.05)));
    color: var(--juiced-brand-primary, var(--primary-color));
    display: flex; align-items: center; justify-content: center;
  }
  .jrc-room-ic ha-icon { --mdc-icon-size: 19px; }
  .jrc-popup-heading h3 {
    margin: 0; font-size: 15.5px; font-weight: 800;
    color: var(--juiced-text-primary, var(--primary-text-color));
  }
  .jrc-popup-sub { font-size: 11.5px; color: var(--juiced-text-muted, var(--secondary-text-color)); margin-top: 1px; }
  .jrc-close {
    margin-left: auto; width: 32px; height: 32px; border-radius: 999px; flex: none;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, transparent);
    color: var(--juiced-text-muted, var(--secondary-text-color));
    display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0;
  }
  .jrc-popup-body { padding: 4px 20px 18px; }
  .jrc-section { padding: 14px 0; border-top: 1px solid var(--juiced-border-subtle, var(--divider-color)); }
  .jrc-popup-body .jrc-section:first-child { border-top: 0; }
  .jrc-section h4 {
    margin: 0 0 8px; font-size: 11.5px; font-weight: 700; letter-spacing: .4px; text-transform: uppercase;
    color: var(--juiced-text-muted, var(--secondary-text-color));
  }
  .jrc-empty { color: var(--juiced-text-muted, var(--secondary-text-color)); font-size: 12.5px; padding: 10px 0; }

  .jrc-lightrow { display: flex; align-items: center; gap: 11px; padding: 8px 0; }
  .jrc-lrow-ic {
    width: 32px; height: 32px; border-radius: 9px; flex: none;
    background: var(--juiced-surface-elevated, var(--secondary-background-color, rgba(0,0,0,.05)));
    color: var(--juiced-text-muted, var(--secondary-text-color));
    display: flex; align-items: center; justify-content: center;
  }
  .jrc-lightrow.on .jrc-lrow-ic {
    background: var(--juiced-chip-active, rgba(178,106,0,.14));
    color: var(--juiced-brand-accent, var(--state-icon-active-color, #b26a00));
  }
  .jrc-lrow-text { display: flex; flex-direction: column; line-height: 1.25; }
  .jrc-lrow-name { font-weight: 600; font-size: 13px; color: var(--juiced-text-primary, var(--primary-text-color)); }
  .jrc-lrow-sub { font-size: 11px; color: var(--juiced-text-muted, var(--secondary-text-color)); }
  .jrc-toggle {
    margin-left: auto; width: 40px; height: 24px; border-radius: 99px; position: relative; flex: none; cursor: pointer;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, var(--secondary-background-color, transparent));
  }
  .jrc-toggle i {
    position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 99px;
    background: var(--juiced-surface-raised, #fff); box-shadow: 0 1px 3px rgba(0,0,0,.3); transition: left .15s ease;
  }
  .jrc-toggle.on { background: var(--juiced-brand-primary, var(--primary-color)); border-color: transparent; }
  .jrc-toggle.on i { left: 18px; background: var(--juiced-text-inverse, #fff); }
  .jrc-toggle:disabled { opacity: .5; cursor: default; }

  .jrc-coverrow { display: flex; align-items: center; gap: 10px; padding: 7px 0; }
  .jrc-cr-name { font-size: 13px; font-weight: 600; flex: 1; color: var(--juiced-text-primary, var(--primary-text-color)); }
  .jrc-cr-pos { font-size: 12px; color: var(--juiced-text-muted, var(--secondary-text-color)); width: 34px; text-align: right; }
  .jrc-cr-btns { display: flex; gap: 4px; }
  .jrc-cr-btns button {
    width: 28px; height: 28px; border-radius: 8px; cursor: pointer; padding: 0;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, var(--secondary-background-color, transparent));
    color: var(--juiced-text-secondary, var(--primary-text-color));
    display: flex; align-items: center; justify-content: center;
  }

  .jrc-media { display: flex; align-items: center; gap: 12px; }
  .jrc-media-ic {
    width: 40px; height: 40px; border-radius: 12px; flex: none; color: #fff;
    background: linear-gradient(155deg, var(--juiced-brand-primary, var(--primary-color)), var(--juiced-brand-secondary, var(--accent-color, #7ee787)));
    display: flex; align-items: center; justify-content: center;
  }
  .jrc-media-text { display: flex; flex-direction: column; line-height: 1.25; min-width: 0; }
  .jrc-media-name { font-weight: 700; font-size: 13px; color: var(--juiced-text-primary, var(--primary-text-color)); }
  .jrc-media-sub {
    font-size: 11.5px; color: var(--juiced-text-muted, var(--secondary-text-color));
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jrc-media-btn {
    margin-left: auto; width: 34px; height: 34px; border-radius: 999px; flex: none; cursor: pointer; padding: 0;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, transparent);
    color: var(--juiced-text-secondary, var(--primary-text-color));
    display: flex; align-items: center; justify-content: center;
  }
  .jrc-media-btn.on { background: var(--juiced-brand-primary, var(--primary-color)); color: #fff; border-color: transparent; }

  .jrc-kv { display: flex; justify-content: space-between; font-size: 13px; padding-bottom: 10px; }
  .jrc-kv span:first-child { color: var(--juiced-text-secondary, var(--primary-text-color)); }
  .jrc-kv .ok { font-weight: 700; color: var(--juiced-status-ok, var(--state-active-color, #2e7d43)); }
  .jrc-pillrow { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
  .jrc-pill {
    border-radius: 999px; padding: 8px 12px; font-size: 12px; font-weight: 600; cursor: pointer;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, var(--secondary-background-color, transparent));
    color: var(--juiced-text-secondary, var(--primary-text-color));
  }
  .jrc-pill.on { background: var(--juiced-brand-primary, var(--primary-color)); color: #fff; border-color: transparent; }
  .jrc-stepper { display: flex; align-items: center; justify-content: center; gap: 18px; }
  .jrc-stepper button {
    width: 34px; height: 34px; border-radius: 999px; font-size: 16px; cursor: pointer; padding: 0;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, var(--secondary-background-color, transparent));
    color: var(--juiced-text-primary, var(--primary-text-color));
  }
  .jrc-stepper-mid { text-align: center; }
  .jrc-stepper-mid .v { font-size: 26px; font-weight: 800; color: var(--juiced-text-primary, var(--primary-text-color)); }
  .jrc-stepper-mid .l { font-size: 11px; color: var(--juiced-text-muted, var(--secondary-text-color)); }
`;function W(){typeof customElements<"u"&&(customElements.get("juiced-dashboard-room-card")||customElements.define("juiced-dashboard-room-card",L)),typeof window<"u"&&(window.customCards=window.customCards||[],window.customCards.some(t=>t.type==="juiced-dashboard-room-card")||window.customCards.push({type:"juiced-dashboard-room-card",name:"Juiced Dashboard Room Card",description:"Tik een kamer, krijg een popup met enkel wat daar bedienbaar is \u2014 lichten, rolluiken, luifels, radio, airco.",preview:!1,documentationURL:"https://github.com/ju1ced/juiced-dashboard"}))}var S=1,Y=["home","rooms","energy","domains","more"],Z=["home","rooms"],X=["system","light","dark"];function ee(){return{type:"custom:juiced-dashboard",schema_version:1,general:{title:"Juiced Dashboard",start_view:"home",theme_mode:"system"},today:{waste_entities:[]},quick_actions:[],security:{cameras:[]},rooms:[]}}function b(t){return typeof t=="object"&&t!==null}function R(t,e){return typeof t=="string"&&t?t:e}function u(t){return typeof t=="string"&&t?t:void 0}function Qe(t,e){return typeof t=="string"&&Z.includes(t)?t:e}function We(t,e){return typeof t=="string"&&X.includes(t)?t:e}var _e=0;function Ye(){return _e+=1,`room-${Date.now().toString(36)}-${_e}`}function Ze(t){let e=ee().general;return b(t)?{title:R(t.title,e.title),start_view:Qe(t.start_view,e.start_view),theme_mode:We(t.theme_mode,e.theme_mode)}:e}function Xe(t){if(!b(t))return null;let e=u(t.name);return e?{key:R(t.key,Ye()),name:e,icon:u(t.icon),temperature_entity:u(t.temperature_entity),humidity_entity:u(t.humidity_entity),light_entity:u(t.light_entity),cover_entity:u(t.cover_entity),awning_entity:u(t.awning_entity),media_player_entity:u(t.media_player_entity),climate_entity:u(t.climate_entity)}:null}function et(t){return Array.isArray(t)?t.filter(e=>typeof e=="string"&&e.length>0):[]}function tt(t){return b(t)?{weather_entity:u(t.weather_entity),battery_soc_entity:u(t.battery_soc_entity),battery_charge_entity:u(t.battery_charge_entity),battery_discharge_entity:u(t.battery_discharge_entity),solar_power_entity:u(t.solar_power_entity),home_consumption_entity:u(t.home_consumption_entity),monthly_peak_entity:u(t.monthly_peak_entity),waste_entities:et(t.waste_entities)}:{waste_entities:[]}}var je=0;function rt(){return je+=1,`action-${Date.now().toString(36)}-${je}`}function it(t){if(!b(t))return null;let e=u(t.entity),r=u(t.service);return!e||!r?null:{key:R(t.key,rt()),label:R(t.label,e),icon:u(t.icon),entity:e,service:r}}function ot(t){if(!Array.isArray(t))return[];let e=[];for(let r of t){let i=it(r);i&&e.push(i)}return e}var we=0;function at(){return we+=1,`camera-${Date.now().toString(36)}-${we}`}function nt(t){if(!b(t))return null;let e=u(t.name),r=u(t.camera_entity);return!e||!r?null:{key:R(t.key,at()),name:e,camera_entity:r,privacy_entity:u(t.privacy_entity),privacy_service:u(t.privacy_service)}}function st(t){if(!Array.isArray(t))return[];let e=[];for(let r of t){let i=nt(r);i&&e.push(i)}return e}function ct(t){return b(t)?{alarm_entity:u(t.alarm_entity),cameras:st(t.cameras)}:{cameras:[]}}function dt(t){if(!Array.isArray(t))return[];let e=[];for(let r of t){let i=Xe(r);i&&e.push(i)}return e}function j(t){let e=b(t)?t:{};return{type:"custom:juiced-dashboard",schema_version:1,general:Ze(e.general),today:tt(e.today),quick_actions:ot(e.quick_actions),security:ct(e.security),rooms:dt(e.rooms)}}function B(t){return{name:t.name,icon:t.icon,temperature:t.temperature_entity,humidity:t.humidity_entity,lights:t.light_entity?[{entity:t.light_entity}]:[],covers:t.cover_entity?[{entity:t.cover_entity}]:[],awnings:t.awning_entity?[{entity:t.awning_entity}]:[],media_player:t.media_player_entity,climate:t.climate_entity}}var lt=typeof HTMLElement>"u"?class{}:HTMLElement,ut={home:{title:"Home",icon:"mdi:home"},rooms:{title:"Kamers",icon:"mdi:floor-plan"},energy:{title:"Energie",icon:"mdi:lightning-bolt"},domains:{title:"Domeinen",icon:"mdi:view-grid-outline"},more:{title:"Meer",icon:"mdi:dots-horizontal-circle-outline"}};function ke(t){return`room-${t}`}function pt(t,e){let r=ut[t];return{title:r.title,path:t,icon:r.icon,subview:!1,strategy:{type:"custom:juiced-dashboard-view",view:t,general:e.general,today:e.today,quick_actions:e.quick_actions,security:e.security,rooms:e.rooms}}}function mt(t,e){return{title:t.name,path:ke(t.key),icon:t.icon||"mdi:sofa-outline",subview:!0,back_path:"rooms",strategy:{type:"custom:juiced-dashboard-view",view:"room",general:e.general,room:t}}}var K=class extends lt{static getCreateSuggestions(){return{title:"Juiced Dashboard",icon:"mdi:home-assistant"}}static getConfigElement(){return document.createElement("juiced-dashboard-strategy-editor")}static async generate(e){let r=j(e),i=[r.general.start_view,...Y.filter(o=>o!==r.general.start_view)];return{title:r.general.title,views:[...i.map(o=>pt(o,r)),...r.rooms.map(o=>mt(o,r))]}}};function te(){if(typeof customElements>"u"||typeof window>"u")return;let t="ll-strategy-dashboard-juiced-dashboard";customElements.get(t)||customElements.define(t,K),window.customStrategies??=[],window.customStrategies.some(e=>e.type==="juiced-dashboard"&&e.strategyType==="dashboard")||window.customStrategies.push({type:"juiced-dashboard",strategyType:"dashboard",name:"Juiced Dashboard",description:"Kia-ge\xEFnspireerd, GUI-geconfigureerd dashboard: Home, Kamers, Energie, Domeinen en Meer.",documentationURL:"https://github.com/ju1ced/juiced-dashboard"})}var gt=typeof HTMLElement>"u"?class{}:HTMLElement,ft='<svg viewBox="0 0 24 24" width="16" height="16"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',ht=new Set(["on","open","armed_home","armed_away","armed_night","playing","heat","cool"]);function yt(t){return t.split(".")[0]??""}var N=class extends gt{_config=null;_hass=null;constructor(){super(),this.attachShadow({mode:"open"}),this._onClick=this._onClick.bind(this)}get root(){return this.shadowRoot}static getStubConfig(){return{type:"custom:juiced-dashboard-quick-actions",actions:[]}}setConfig(e){if(!e||typeof e!="object")throw new Error("juiced-dashboard-quick-actions: invalid configuration.");this._config=e,this._render()}set hass(e){this._hass=e,this._render()}get hass(){return this._hass}getCardSize(){return 1}connectedCallback(){this.root.addEventListener("click",this._onClick)}disconnectedCallback(){this.root.removeEventListener("click",this._onClick)}_onClick(e){let i=e.target?.closest("[data-entity]");if(!i||!this._hass)return;let o=i.dataset.entity,a=i.dataset.service;!o||!a||this._hass.callService(yt(o),a,{entity_id:o})}_render(){if(!this._config)return;let e=this._config.actions??[],r=this._hass;if(e.length===0){this.root.innerHTML=`<style>${Ce}</style>`;return}let i=e.map(o=>{let a=l(r,o.entity),n=p(a?.state);return`
          <button class="jqa-chip${!!(a&&ht.has(a.state))?" on":""}" data-entity="${s(o.entity)}" data-service="${s(o.service)}" ${n?"disabled":""}>
            <span class="jqa-ic">${ft}</span>
            <span class="jqa-label">${s(o.label)}</span>
          </button>`}).join("");this.root.innerHTML=`<style>${Ce}</style><div class="jqa-row">${i}</div>`}},Ce=`
  :host { display: block; }
  * { box-sizing: border-box; }
  .jqa-row { display: flex; gap: 10px; flex-wrap: wrap; }
  .jqa-chip {
    display: flex; align-items: center; gap: 9px; border-radius: 999px; cursor: pointer;
    padding: 10px 16px 10px 12px; font: 600 13px/1 inherit;
    background: var(--juiced-surface-raised, var(--card-background-color, #fff));
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    color: var(--juiced-text-primary, var(--primary-text-color));
    box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,.08));
  }
  .jqa-chip:disabled { opacity: .5; cursor: default; }
  .jqa-ic {
    width: 28px; height: 28px; border-radius: 9px; flex: none;
    background: var(--juiced-surface-elevated, var(--secondary-background-color, rgba(0,0,0,.05)));
    color: var(--juiced-text-muted, var(--secondary-text-color));
    display: flex; align-items: center; justify-content: center;
  }
  .jqa-chip.on .jqa-ic {
    background: var(--juiced-chip-active, rgba(178,106,0,.14));
    color: var(--juiced-brand-accent, var(--state-icon-active-color, #b26a00));
  }
`;function re(){typeof customElements>"u"||(customElements.get("juiced-dashboard-quick-actions")||customElements.define("juiced-dashboard-quick-actions",N),typeof window<"u"&&(window.customCards=window.customCards||[],window.customCards.some(t=>t.type==="juiced-dashboard-quick-actions")||window.customCards.push({type:"juiced-dashboard-quick-actions",name:"Juiced Dashboard \u2014 Snelacties",description:"Een kleine, gecureerde rij kruis-kamer acties (alarm, garagepoort, ...).",preview:!1,documentationURL:"https://github.com/ju1ced/juiced-dashboard"})))}var vt=typeof HTMLElement>"u"?class{}:HTMLElement;function bt(t,e){let r=[],i=l(t,e.temperature);if(i&&!p(i.state)){let n=h(i.state,1);n&&r.push(`<div class="jrd-tile"><div class="jrd-tile-value">${s(n)}</div><div class="jrd-tile-label">Temperatuur</div></div>`)}let o=l(t,e.humidity);if(o&&!p(o.state)){let n=y(o.state,0);n&&r.push(`<div class="jrd-tile"><div class="jrd-tile-value">${s(n)}<span class="jrd-tile-unit">%</span></div><div class="jrd-tile-label">Vochtigheid</div></div>`)}let a=e.lights||[];if(a.length>0){let n=A(t,e);r.push(`<div class="jrd-tile"><div class="jrd-tile-value">${n}<span class="jrd-tile-unit">/${a.length}</span></div><div class="jrd-tile-label">Lampen aan</div></div>`)}if(e.climate){let n=l(t,e.climate);if(n&&!p(n.state)){let c=h(n.attributes?.temperature,1);r.push(`<div class="jrd-tile"><div class="jrd-tile-value">${s(k(n.state))}</div><div class="jrd-tile-label">Klimaat${c?` \xB7 doel ${s(c)}`:""}</div></div>`)}}return r.length?`<div class="jrd-overview">${r.join("")}</div>`:""}var P=class extends vt{_config=null;_hass=null;constructor(){super(),this.attachShadow({mode:"open"}),this._onClick=this._onClick.bind(this)}get root(){return this.shadowRoot}static getStubConfig(){return{type:"custom:juiced-dashboard-room-detail-card",room:{name:"Bureau",icon:"mdi:desk"}}}setConfig(e){if(!e||typeof e!="object")throw new Error("juiced-dashboard-room-detail-card: invalid configuration.");this._config=e,this._render()}set hass(e){this._hass=e,this._render()}get hass(){return this._hass}getCardSize(){return 5}connectedCallback(){this.root.addEventListener("click",this._onClick)}disconnectedCallback(){this.root.removeEventListener("click",this._onClick)}_render(){if(!this._config)return;let e=this._config.room,r=this._hass,i=bt(r,e),o=[O(r,e),J(r,e),_(r,e,"covers","Rolluiken"),_(r,e,"awnings","Luifels"),V(r,e)].filter(Boolean).join(""),a=i||o?`${i}${o}`:'<p class="jrd-empty">Geen bediening of sensoren geconfigureerd voor deze kamer.</p>';this.root.innerHTML=`
      <style>${xt}</style>
      <ha-card class="jrd-shell">
        <div class="jrd-hero">
          <span class="jrd-hero-ic">${C(e.icon)}</span>
          <h2 class="jrd-hero-name">${s(e.name)}</h2>
        </div>
        <div class="jrd-body">${a}</div>
      </ha-card>`}_onClick(e){let i=e.target?.closest("[data-action]");if(!i)return;let o=i.dataset.action,a=this._hass;if(o==="toggle-light"){H(a,i.dataset.entity);return}if(o==="cover-open"){T(a,i.dataset.entity);return}if(o==="cover-close"){$(a,i.dataset.entity);return}if(o==="cover-stop"){D(a,i.dataset.entity);return}if(o==="media-toggle"){z(a,i.dataset.entity);return}if(o==="climate-mode"){M(a,i.dataset.entity,i.dataset.mode);return}if(o==="climate-step"){I(a,i.dataset.entity,i.dataset.target,Number(i.dataset.step));return}}},xt=`
  :host { display: block; }
  * { box-sizing: border-box; }
  ha-card.jrd-shell {
    background: var(--juiced-surface-raised, var(--ha-card-background, var(--card-background-color, #fff)));
    border-radius: var(--juiced-radius-lg, var(--ha-card-border-radius, 16px));
    overflow: hidden;
  }

  .jrd-hero { display: flex; align-items: center; gap: 13px; padding: 18px 20px 14px; }
  .jrd-hero-ic {
    width: 44px; height: 44px; border-radius: 13px; flex: none;
    background: var(--juiced-surface-elevated, var(--secondary-background-color, rgba(0,0,0,.05)));
    color: var(--juiced-brand-primary, var(--primary-color));
    display: flex; align-items: center; justify-content: center;
  }
  .jrd-hero-ic ha-icon { --mdc-icon-size: 22px; }
  .jrd-hero-name { margin: 0; font-size: 19px; font-weight: 800; color: var(--juiced-text-primary, var(--primary-text-color)); }

  .jrd-body { padding: 0 20px 18px; }
  .jrd-empty { color: var(--juiced-text-muted, var(--secondary-text-color)); font-size: 12.5px; padding: 10px 0; }

  .jrd-overview {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 10px;
    padding-bottom: 14px; border-bottom: 1px solid var(--juiced-border-subtle, var(--divider-color)); margin-bottom: 4px;
  }
  .jrd-tile {
    background: var(--juiced-surface-elevated, var(--secondary-background-color, rgba(0,0,0,.04)));
    border-radius: 12px; padding: 10px 12px;
  }
  .jrd-tile-value { font-size: 15px; font-weight: 800; color: var(--juiced-text-primary, var(--primary-text-color)); }
  .jrd-tile-unit { font-size: 11px; font-weight: 600; color: var(--juiced-text-muted, var(--secondary-text-color)); }
  .jrd-tile-label { font-size: 10.5px; color: var(--juiced-text-muted, var(--secondary-text-color)); margin-top: 2px; line-height: 1.3; }

  .jrd-body .jrc-section { padding: 14px 0; border-top: 1px solid var(--juiced-border-subtle, var(--divider-color)); }
  .jrd-body .jrc-section:first-of-type { border-top: 0; padding-top: 0; }
  .jrd-body .jrc-section h4 {
    margin: 0 0 8px; font-size: 11.5px; font-weight: 700; letter-spacing: .4px; text-transform: uppercase;
    color: var(--juiced-text-muted, var(--secondary-text-color));
  }

  .jrd-body .jrc-lightrow { display: flex; align-items: center; gap: 11px; padding: 8px 0; }
  .jrd-body .jrc-lrow-ic {
    width: 32px; height: 32px; border-radius: 9px; flex: none;
    background: var(--juiced-surface-elevated, var(--secondary-background-color, rgba(0,0,0,.05)));
    color: var(--juiced-text-muted, var(--secondary-text-color));
    display: flex; align-items: center; justify-content: center;
  }
  .jrd-body .jrc-lightrow.on .jrc-lrow-ic {
    background: var(--juiced-chip-active, rgba(178,106,0,.14));
    color: var(--juiced-brand-accent, var(--state-icon-active-color, #b26a00));
  }
  .jrd-body .jrc-lrow-text { display: flex; flex-direction: column; line-height: 1.25; }
  .jrd-body .jrc-lrow-name { font-weight: 600; font-size: 13px; color: var(--juiced-text-primary, var(--primary-text-color)); }
  .jrd-body .jrc-lrow-sub { font-size: 11px; color: var(--juiced-text-muted, var(--secondary-text-color)); }
  .jrd-body .jrc-toggle {
    margin-left: auto; width: 40px; height: 24px; border-radius: 99px; position: relative; flex: none; cursor: pointer;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, var(--secondary-background-color, transparent));
  }
  .jrd-body .jrc-toggle i {
    position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 99px;
    background: var(--juiced-surface-raised, #fff); box-shadow: 0 1px 3px rgba(0,0,0,.3); transition: left .15s ease;
  }
  .jrd-body .jrc-toggle.on { background: var(--juiced-brand-primary, var(--primary-color)); border-color: transparent; }
  .jrd-body .jrc-toggle.on i { left: 18px; background: var(--juiced-text-inverse, #fff); }
  .jrd-body .jrc-toggle:disabled { opacity: .5; cursor: default; }

  .jrd-body .jrc-coverrow { display: flex; align-items: center; gap: 10px; padding: 7px 0; }
  .jrd-body .jrc-cr-name { font-size: 13px; font-weight: 600; flex: 1; color: var(--juiced-text-primary, var(--primary-text-color)); }
  .jrd-body .jrc-cr-pos { font-size: 12px; color: var(--juiced-text-muted, var(--secondary-text-color)); width: 34px; text-align: right; }
  .jrd-body .jrc-cr-btns { display: flex; gap: 4px; }
  .jrd-body .jrc-cr-btns button {
    width: 28px; height: 28px; border-radius: 8px; cursor: pointer; padding: 0;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, var(--secondary-background-color, transparent));
    color: var(--juiced-text-secondary, var(--primary-text-color));
    display: flex; align-items: center; justify-content: center;
  }

  .jrd-body .jrc-media { display: flex; align-items: center; gap: 12px; }
  .jrd-body .jrc-media-ic {
    width: 40px; height: 40px; border-radius: 12px; flex: none; color: #fff;
    background: linear-gradient(155deg, var(--juiced-brand-primary, var(--primary-color)), var(--juiced-brand-secondary, var(--accent-color, #7ee787)));
    display: flex; align-items: center; justify-content: center;
  }
  .jrd-body .jrc-media-text { display: flex; flex-direction: column; line-height: 1.25; min-width: 0; }
  .jrd-body .jrc-media-name { font-weight: 700; font-size: 13px; color: var(--juiced-text-primary, var(--primary-text-color)); }
  .jrd-body .jrc-media-sub {
    font-size: 11.5px; color: var(--juiced-text-muted, var(--secondary-text-color));
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jrd-body .jrc-media-btn {
    margin-left: auto; width: 34px; height: 34px; border-radius: 999px; flex: none; cursor: pointer; padding: 0;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, transparent);
    color: var(--juiced-text-secondary, var(--primary-text-color));
    display: flex; align-items: center; justify-content: center;
  }
  .jrd-body .jrc-media-btn.on { background: var(--juiced-brand-primary, var(--primary-color)); color: #fff; border-color: transparent; }

  .jrd-body .jrc-kv { display: flex; justify-content: space-between; font-size: 13px; padding-bottom: 10px; }
  .jrd-body .jrc-kv span:first-child { color: var(--juiced-text-secondary, var(--primary-text-color)); }
  .jrd-body .jrc-kv .ok { font-weight: 700; color: var(--juiced-status-ok, var(--state-active-color, #2e7d43)); }
  .jrd-body .jrc-pillrow { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
  .jrd-body .jrc-pill {
    border-radius: 999px; padding: 8px 12px; font-size: 12px; font-weight: 600; cursor: pointer;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, var(--secondary-background-color, transparent));
    color: var(--juiced-text-secondary, var(--primary-text-color));
  }
  .jrd-body .jrc-pill.on { background: var(--juiced-brand-primary, var(--primary-color)); color: #fff; border-color: transparent; }
  .jrd-body .jrc-stepper { display: flex; align-items: center; justify-content: center; gap: 18px; }
  .jrd-body .jrc-stepper button {
    width: 34px; height: 34px; border-radius: 999px; font-size: 16px; cursor: pointer; padding: 0;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, var(--secondary-background-color, transparent));
    color: var(--juiced-text-primary, var(--primary-text-color));
  }
  .jrd-body .jrc-stepper-mid { text-align: center; }
  .jrd-body .jrc-stepper-mid .v { font-size: 26px; font-weight: 800; color: var(--juiced-text-primary, var(--primary-text-color)); }
  .jrd-body .jrc-stepper-mid .l { font-size: 11px; color: var(--juiced-text-muted, var(--secondary-text-color)); }
`;function ie(){typeof customElements>"u"||(customElements.get("juiced-dashboard-room-detail-card")||customElements.define("juiced-dashboard-room-detail-card",P),typeof window<"u"&&(window.customCards=window.customCards||[],window.customCards.some(t=>t.type==="juiced-dashboard-room-detail-card")||window.customCards.push({type:"juiced-dashboard-room-detail-card",name:"Juiced Dashboard \u2014 Kamerdetail",description:"Volledige kamerpagina: overzicht, klimaat, verlichting, rolluiken/luifels en media.",preview:!1,documentationURL:"https://github.com/ju1ced/juiced-dashboard"})))}var _t=typeof HTMLElement>"u"?class{}:HTMLElement,jt={disarmed:"Uitgeschakeld",armed_home:"Ingeschakeld (thuis)",armed_away:"Ingeschakeld (afwezig)",armed_night:"Ingeschakeld (nacht)",arming:"Wordt ingeschakeld\u2026",pending:"In afwachting\u2026",triggered:"Alarm!"},wt=6e3,q=class extends _t{_config=null;_hass=null;_cameraIndex=0;_timer=null;constructor(){super(),this.attachShadow({mode:"open"}),this._onClick=this._onClick.bind(this)}get root(){return this.shadowRoot}static getStubConfig(){return{type:"custom:juiced-dashboard-security-card",security:{alarm_entity:"alarm_control_panel.huis",cameras:[]}}}setConfig(e){if(!e||typeof e!="object")throw new Error("juiced-dashboard-security-card: invalid configuration.");this._config=e,this._cameraIndex=0,this._render()}set hass(e){this._hass=e,this._render()}get hass(){return this._hass}getCardSize(){return 3}connectedCallback(){this.root.addEventListener("click",this._onClick),this._startTimer()}disconnectedCallback(){this.root.removeEventListener("click",this._onClick),this._stopTimer()}_startTimer(){this._stopTimer(),!((this._config?.security.cameras??[]).length<=1)&&(typeof window<"u"&&window.matchMedia?.("(prefers-reduced-motion: reduce)").matches||(this._timer=setInterval(()=>{let r=this._config?.security.cameras.length??0;r!==0&&(this._cameraIndex=(this._cameraIndex+1)%r,this._render())},wt)))}_stopTimer(){this._timer!==null&&(clearInterval(this._timer),this._timer=null)}_onClick(e){let r=e.target?.closest("[data-action]");if(!r||!this._hass||!this._config)return;let i=r.dataset.action;if(i==="alarm"){let a=r.dataset.service,n=this._config.security.alarm_entity;a&&n&&this._hass.callService("alarm_control_panel",a,{entity_id:n});return}let o=this._config.security.cameras;if(i==="camera-select"){let a=Number(r.dataset.index);Number.isFinite(a)&&(this._cameraIndex=a,this._startTimer(),this._render());return}if(i==="camera-prev"||i==="camera-next"){if(o.length===0)return;let a=i==="camera-prev"?-1:1;this._cameraIndex=(this._cameraIndex+a+o.length)%o.length,this._startTimer(),this._render();return}if(i==="privacy-toggle"){let a=r.dataset.entity,n=r.dataset.service||"toggle";a&&this._hass.callService(a.split(".")[0]??"",n,{entity_id:a});return}}_render(){if(!this._config)return;let e=this._config.security,r=this._alarmHtml(e.alarm_entity),i=this._cameraHtml(e.cameras??[]);if(!r&&!i){this.root.innerHTML=`<style>${Ee}</style>`;return}this.root.innerHTML=`<style>${Ee}</style><ha-card class="jsc-shell">${r}${i}</ha-card>`}_alarmHtml(e){if(!e)return"";let r=l(this._hass,e);if(!r||p(r.state))return"";let i=jt[r.state]||r.state;return`
      <div class="jsc-alarm">
        <div class="jsc-alarm-text">
          <span class="jsc-alarm-label">Alarm</span>
          <span class="jsc-alarm-status${r.state.startsWith("armed")||r.state==="triggered"?" on":""}">${s(i)}</span>
        </div>
        <div class="jsc-alarm-btns">
          <button data-action="alarm" data-service="alarm_disarm">Uit</button>
          <button data-action="alarm" data-service="alarm_arm_home">Thuis</button>
          <button data-action="alarm" data-service="alarm_arm_away">Afwezig</button>
        </div>
      </div>`}_cameraHtml(e){if(e.length===0)return"";let r=Math.min(this._cameraIndex,e.length-1),i=e[r];if(!i)return"";let a=l(this._hass,i.camera_entity)?.attributes?.entity_picture,n=e.map((c,d)=>d===r?"":this._cameraRowHtml(c,d)).filter(Boolean).join("");return`
      <div class="jsc-cam">
        <div class="jsc-cam-head">
          <span>${s(i.name)} &middot; ${r+1} van ${e.length}</span>
          ${e.length>1?`<span class="jsc-cam-nav">
                  <button data-action="camera-prev" aria-label="Vorige camera">&lsaquo;</button>
                  <button data-action="camera-next" aria-label="Volgende camera">&rsaquo;</button>
                </span>`:""}
        </div>
        <div class="jsc-cam-stage">
          ${typeof a=="string"&&a?`<img src="${s(a)}" alt="${s(i.name)}">`:'<div class="jsc-cam-empty">Geen beeld beschikbaar</div>'}
        </div>
        ${n?`<div class="jsc-cam-list">${n}</div>`:""}
      </div>`}_cameraRowHtml(e,r){let o=(e.privacy_entity?l(this._hass,e.privacy_entity):null)?.state==="on";return`
      <button class="jsc-cam-item" data-action="camera-select" data-index="${r}">
        <span>${s(e.name)}</span>
        ${e.privacy_entity?`<span class="jsc-privacy${o?" on":""}" data-action="privacy-toggle"
                 data-entity="${s(e.privacy_entity)}" data-service="${s(e.privacy_service||"toggle")}">
                 ${o?"Privacy aan":"Privacy uit"}
               </span>`:""}
      </button>`}},Ee=`
  :host { display: block; }
  * { box-sizing: border-box; }
  ha-card.jsc-shell {
    background: var(--juiced-surface-raised, var(--ha-card-background, var(--card-background-color, #fff)));
    border-radius: var(--juiced-radius-lg, var(--ha-card-border-radius, 16px));
    overflow: hidden;
  }

  .jsc-alarm { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 18px; flex-wrap: wrap; }
  .jsc-alarm-text { display: flex; flex-direction: column; gap: 2px; }
  .jsc-alarm-label { font-size: 11px; text-transform: uppercase; letter-spacing: .4px; color: var(--juiced-text-muted, var(--secondary-text-color)); }
  .jsc-alarm-status { font-size: 14px; font-weight: 700; color: var(--juiced-status-ok, var(--state-active-color, #2e7d43)); }
  .jsc-alarm-status.on { color: var(--juiced-status-critical, var(--error-color, #c62828)); }
  .jsc-alarm-btns { display: flex; gap: 6px; }
  .jsc-alarm-btns button {
    border-radius: 999px; padding: 8px 14px; font: 600 12.5px/1 inherit; cursor: pointer;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, var(--secondary-background-color, transparent));
    color: var(--juiced-text-primary, var(--primary-text-color));
  }

  .jsc-cam { border-top: 1px solid var(--juiced-border-subtle, var(--divider-color)); }
  .jsc-cam-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px 10px; font-size: 12px; color: var(--juiced-text-muted, var(--secondary-text-color)); }
  .jsc-cam-nav { display: flex; gap: 6px; }
  .jsc-cam-nav button {
    width: 26px; height: 26px; border-radius: 999px; cursor: pointer; padding: 0; font-size: 15px; line-height: 1;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, transparent); color: var(--juiced-text-secondary, var(--primary-text-color));
  }
  .jsc-cam-stage {
    margin: 0 14px 12px; border-radius: 12px; overflow: hidden; aspect-ratio: 16/9;
    background: var(--juiced-surface-elevated, #0c1b28); display: flex; align-items: center; justify-content: center;
  }
  .jsc-cam-stage img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .jsc-cam-empty { color: var(--juiced-text-muted, var(--secondary-text-color)); font-size: 12px; }
  .jsc-cam-list { display: flex; flex-direction: column; padding: 0 14px 12px; gap: 6px; }
  .jsc-cam-item {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    border-radius: 10px; padding: 8px 10px; cursor: pointer; font: 600 12.5px/1 inherit;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, transparent); color: var(--juiced-text-primary, var(--primary-text-color));
  }
  .jsc-privacy { font-size: 10.5px; font-weight: 600; color: var(--juiced-text-muted, var(--secondary-text-color)); }
  .jsc-privacy.on { color: var(--juiced-brand-accent, var(--state-icon-active-color, #b26a00)); }
`;function oe(){typeof customElements>"u"||(customElements.get("juiced-dashboard-security-card")||customElements.define("juiced-dashboard-security-card",q),typeof window<"u"&&(window.customCards=window.customCards||[],window.customCards.some(t=>t.type==="juiced-dashboard-security-card")||window.customCards.push({type:"juiced-dashboard-security-card",name:"Juiced Dashboard \u2014 Security",description:"Alarmbediening en een doorbladerbare camerastrook, privacy enkel bij camera's die dat effectief hebben.",preview:!1,documentationURL:"https://github.com/ju1ced/juiced-dashboard"})))}var kt=typeof HTMLElement>"u"?class{}:HTMLElement,Ct=[{key:"battery_soc_entity",label:"Thuisbatterij SoC"},{key:"battery_charge_entity",label:"Batterij laden"},{key:"battery_discharge_entity",label:"Batterij ontladen"},{key:"solar_power_entity",label:"Zonnepanelen opbrengst"},{key:"home_consumption_entity",label:"Huisverbruik"},{key:"monthly_peak_entity",label:"Maandelijkse vermogenspiek"}];function Et(t,e){let i=l(t,e)?.attributes?.unit_of_measurement;return typeof i=="string"?i:""}function St(t){return{"clear-night":"Helder",cloudy:"Bewolkt",exceptional:"Uitzonderlijk",fog:"Mist",hail:"Hagel",lightning:"Onweer","lightning-rainy":"Onweer met regen",partlycloudy:"Half bewolkt",pouring:"Zware regen",rainy:"Regenachtig",snowy:"Sneeuw","snowy-rainy":"Natte sneeuw",sunny:"Zonnig",windy:"Winderig","windy-variant":"Winderig"}[t]||t}var U=class extends kt{_config=null;_hass=null;constructor(){super(),this.attachShadow({mode:"open"})}get root(){return this.shadowRoot}static getStubConfig(){return{type:"custom:juiced-dashboard-today-card",today:{weather_entity:"weather.thuis",waste_entities:[]}}}setConfig(e){if(!e||typeof e!="object")throw new Error("juiced-dashboard-today-card: invalid configuration.");this._config=e,this._render()}set hass(e){this._hass=e,this._render()}get hass(){return this._hass}getCardSize(){return 3}_render(){if(!this._config)return;let e=this._config.today??{waste_entities:[]},r=this._hass,i=this._weatherHtml(r,e.weather_entity),o=this._energyHtml(r,e),a=this._wasteHtml(r,e.waste_entities??[]);this.root.innerHTML=`
      <style>${Rt}</style>
      <ha-card class="jtc-shell">
        ${i}
        ${o}
        ${a}
      </ha-card>`}_weatherHtml(e,r){let i=l(e,r);if(!r||!i||p(i.state))return"";let o=h(i.attributes?.temperature,1);return`
      <div class="jtc-weather">
        <div>
          <div class="jtc-weather-cond">${s(St(i.state))}</div>
          <div class="jtc-weather-loc">Thuis &middot; nu</div>
        </div>
        ${o?`<div class="jtc-weather-temp">${s(o)}</div>`:""}
      </div>`}_energyHtml(e,r){let i=Ct.map(o=>{let a=r[o.key],n=l(e,a);if(!a||!n||p(n.state))return"";let c=y(n.state,1);if(c===null)return"";let d=Et(e,a);return`
        <div class="jtc-tile">
          <div class="jtc-tile-value">${s(c)}${d?` <span class="jtc-tile-unit">${s(d)}</span>`:""}</div>
          <div class="jtc-tile-label">${s(o.label)}</div>
        </div>`}).join("");return i?`<div class="jtc-energy">${i}</div>`:""}_wasteHtml(e,r){let i=r.map(o=>{let a=l(e,o);if(!a||p(a.state))return"";let n=a.attributes?.friendly_name;return`
          <div class="jtc-waste-chip">
            <div class="jtc-waste-name">${s(typeof n=="string"&&n?n:o)}</div>
            <div class="jtc-waste-value">${s(a.state)}</div>
          </div>`}).filter(Boolean).join("");return i?`
      <div class="jtc-waste">
        <h4>Afvalophaling</h4>
        <div class="jtc-waste-row">${i}</div>
      </div>`:""}},Rt=`
  :host { display: block; }
  * { box-sizing: border-box; }
  ha-card.jtc-shell {
    background: var(--juiced-surface-raised, var(--ha-card-background, var(--card-background-color, #fff)));
    border-radius: var(--juiced-radius-lg, var(--ha-card-border-radius, 16px));
    padding: 18px 20px;
    display: flex; flex-direction: column; gap: 4px;
  }
  .jtc-weather { display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; }
  .jtc-weather-cond { font-size: 15px; font-weight: 700; color: var(--juiced-text-primary, var(--primary-text-color)); }
  .jtc-weather-loc { font-size: 12px; color: var(--juiced-text-muted, var(--secondary-text-color)); margin-top: 2px; }
  .jtc-weather-temp { font-size: 30px; font-weight: 800; color: var(--juiced-text-primary, var(--primary-text-color)); }

  .jtc-energy {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
    padding: 14px 0; border-top: 1px solid var(--juiced-border-subtle, var(--divider-color));
  }
  .jtc-tile-value { font-size: 15px; font-weight: 800; color: var(--juiced-text-primary, var(--primary-text-color)); }
  .jtc-tile-unit { font-size: 11px; font-weight: 600; color: var(--juiced-text-muted, var(--secondary-text-color)); }
  .jtc-tile-label { font-size: 10.5px; color: var(--juiced-text-muted, var(--secondary-text-color)); margin-top: 2px; line-height: 1.3; }

  .jtc-waste { padding-top: 14px; border-top: 1px solid var(--juiced-border-subtle, var(--divider-color)); }
  .jtc-waste h4 {
    margin: 0 0 10px; font-size: 11.5px; font-weight: 700; letter-spacing: .4px; text-transform: uppercase;
    color: var(--juiced-text-muted, var(--secondary-text-color));
  }
  .jtc-waste-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; }
  .jtc-waste-chip { background: var(--juiced-surface-elevated, var(--secondary-background-color, rgba(0,0,0,.04))); border-radius: 12px; padding: 10px; }
  .jtc-waste-name { font-size: 11.5px; font-weight: 700; color: var(--juiced-text-primary, var(--primary-text-color)); }
  .jtc-waste-value { font-size: 10.5px; color: var(--juiced-text-muted, var(--secondary-text-color)); margin-top: 2px; }

  @media (max-width: 480px) { .jtc-energy { grid-template-columns: repeat(2, 1fr); } }
`;function ae(){typeof customElements>"u"||(customElements.get("juiced-dashboard-today-card")||customElements.define("juiced-dashboard-today-card",U),typeof window<"u"&&(window.customCards=window.customCards||[],window.customCards.some(t=>t.type==="juiced-dashboard-today-card")||window.customCards.push({type:"juiced-dashboard-today-card",name:"Juiced Dashboard \u2014 Vandaag",description:"Weer, energie-KPI's en afvalophaling in \xE9\xE9n rustige kaart.",preview:!1,documentationURL:"https://github.com/ju1ced/juiced-dashboard"})))}var Lt=typeof HTMLElement>"u"?class{}:HTMLElement;function se(t,e){return{type:"markdown",...e?{title:e}:{},content:t}}var Se="Kamers",At="Tik een kamer om lichten, rolluiken, luifels, radio of airco direct te bedienen";function Ht(t){return t?!!(t.weather_entity||t.battery_soc_entity||t.battery_charge_entity||t.battery_discharge_entity||t.solar_power_entity||t.home_consumption_entity||t.monthly_peak_entity||(t.waste_entities??[]).length>0):!1}function Tt(t){if(Ht(t))return{type:"grid",cards:[{type:"custom:juiced-dashboard-today-card",today:t}]}}function $t(t){if(!(!t||t.length===0))return{type:"grid",cards:[{type:"custom:juiced-dashboard-quick-actions",actions:t}]}}function Dt(t){return t?!!(t.alarm_entity||(t.cameras??[]).length>0):!1}function Mt(t){if(Dt(t))return{type:"grid",cards:[{type:"custom:juiced-dashboard-security-card",security:t}]}}function Re(t){return t.length===0?{type:"grid",cards:[se("Voeg kamers toe via **Dashboard bewerken \u2192 instellingen**.",Se)]}:{type:"grid",cards:[{type:"custom:juiced-dashboard-room-card",title:Se,subtitle:At,rooms:t.map(B)}]}}function It(t){return t?[{type:"grid",cards:[{type:"custom:juiced-dashboard-room-detail-card",room:B(t)}]}]:[{type:"grid",cards:[se("Deze kamerconfiguratie ontbreekt.","Kamer")]}]}function ne(t,e){return[{type:"grid",cards:[se(e,t)]}]}function Le(t){let e;switch(t.view){case"home":e=[Tt(t.today),Mt(t.security),$t(t.quick_actions),Re(t.rooms??[])].filter(r=>!!r);break;case"rooms":e=[Re(t.rooms??[])];break;case"room":e=It(t.room);break;case"energy":e=ne("Energie","Energie-overzicht volgt in een volgende stap.");break;case"domains":e=ne("Domeinen","Specialistische domeinen (Kia, tuin, robotstofzuiger, zwembad) volgen in een volgende stap.");break;default:e=ne("Meer","Instellingen en geschiedenis volgen in een volgende stap.");break}return{type:"sections",max_columns:2,dense_section_placement:!0,sections:e}}var F=class extends Lt{static async generate(e){return Le(e)}};function ce(){if(ae(),re(),oe(),ie(),typeof customElements>"u")return;let t="ll-strategy-view-juiced-dashboard-view";customElements.get(t)||customElements.define(t,F)}var zt=typeof HTMLElement>"u"?class{}:HTMLElement,Ae=[{key:"temperature_entity",label:"Temperatuursensor",domain:"sensor"},{key:"humidity_entity",label:"Vochtigheidssensor",domain:"sensor"},{key:"light_entity",label:"Licht",domain:"light"},{key:"cover_entity",label:"Rolluik",domain:"cover"},{key:"awning_entity",label:"Luifel",domain:"cover"},{key:"media_player_entity",label:"Mediaspeler",domain:"media_player"},{key:"climate_entity",label:"Klimaat",domain:"climate"}],He=0,Te=0,$e=0,De=[{key:"weather_entity",label:"Weerbron",domain:"weather"},{key:"battery_soc_entity",label:"Thuisbatterij SoC",domain:"sensor"},{key:"battery_charge_entity",label:"Batterij laden",domain:"sensor"},{key:"battery_discharge_entity",label:"Batterij ontladen",domain:"sensor"},{key:"solar_power_entity",label:"Zonnepanelen opbrengst",domain:"sensor"},{key:"home_consumption_entity",label:"Huisverbruik",domain:"sensor"},{key:"monthly_peak_entity",label:"Maandelijkse vermogenspiek",domain:"sensor"}];function f(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}var G=class extends zt{_config;_hass=null;constructor(){super(),this.attachShadow({mode:"open"}),this._config=j(void 0),this._onInput=this._onInput.bind(this),this._onClick=this._onClick.bind(this),this._onSelectorChange=this._onSelectorChange.bind(this)}get root(){return this.shadowRoot}setConfig(e){this._config=j(e),this._render()}set hass(e){this._hass=e,this.root.querySelectorAll("ha-selector").forEach(r=>{r.hass=e})}get hass(){return this._hass}connectedCallback(){this.root.addEventListener("input",this._onInput),this.root.addEventListener("click",this._onClick),this.root.addEventListener("value-changed",this._onSelectorChange)}disconnectedCallback(){this.root.removeEventListener("input",this._onInput),this.root.removeEventListener("click",this._onClick),this.root.removeEventListener("value-changed",this._onSelectorChange)}_emit(){this.dispatchEvent(new CustomEvent("config-changed",{bubbles:!0,composed:!0,detail:{config:this._config}}))}_updateGeneral(e,r){this._config={...this._config,general:{...this._config.general,[e]:r}},this._emit()}_updateRoom(e,r){this._config={...this._config,rooms:this._config.rooms.map(i=>i.key===e?{...i,...r}:i)},this._emit()}_addRoom(){He+=1;let e={key:`room-${Date.now().toString(36)}-${He}`,name:"Nieuwe kamer"};this._config={...this._config,rooms:[...this._config.rooms,e]},this._emit(),this._render()}_removeRoom(e){this._config={...this._config,rooms:this._config.rooms.filter(r=>r.key!==e)},this._emit(),this._render()}_updateToday(e){this._config={...this._config,today:{...this._config.today,...e}},this._emit()}_updateAction(e,r){this._config={...this._config,quick_actions:this._config.quick_actions.map(i=>i.key===e?{...i,...r}:i)},this._emit()}_addAction(){Te+=1;let e={key:`action-${Date.now().toString(36)}-${Te}`,label:"Nieuwe actie",entity:"",service:"toggle"};this._config={...this._config,quick_actions:[...this._config.quick_actions,e]},this._emit(),this._render()}_removeAction(e){this._config={...this._config,quick_actions:this._config.quick_actions.filter(r=>r.key!==e)},this._emit(),this._render()}_updateSecurity(e){this._config={...this._config,security:{...this._config.security,...e}},this._emit()}_updateCamera(e,r){this._config={...this._config,security:{...this._config.security,cameras:this._config.security.cameras.map(i=>i.key===e?{...i,...r}:i)}},this._emit()}_addCamera(){$e+=1;let e={key:`camera-${Date.now().toString(36)}-${$e}`,name:"Nieuwe camera",camera_entity:""};this._config={...this._config,security:{...this._config.security,cameras:[...this._config.security.cameras,e]}},this._emit(),this._render()}_removeCamera(e){this._config={...this._config,security:{...this._config.security,cameras:this._config.security.cameras.filter(r=>r.key!==e)}},this._emit(),this._render()}_onInput(e){let r=e.target;if(!r)return;let i=r.dataset.field;if(!i)return;if(r.dataset.scope==="general"){i==="title"&&this._updateGeneral("title",r.value),i==="start_view"&&this._updateGeneral("start_view",r.value),i==="theme_mode"&&this._updateGeneral("theme_mode",r.value);return}if(r.dataset.scope==="action"){let a=r.dataset.actionKey;if(!a)return;i==="label"&&this._updateAction(a,{label:r.value}),i==="icon"&&this._updateAction(a,{icon:r.value||void 0}),i==="service"&&this._updateAction(a,{service:r.value});return}if(r.dataset.scope==="camera"){let a=r.dataset.cameraKey;if(!a)return;i==="name"&&this._updateCamera(a,{name:r.value}),i==="privacy_service"&&this._updateCamera(a,{privacy_service:r.value||void 0});return}let o=r.dataset.room;o&&(i==="name"&&this._updateRoom(o,{name:r.value}),i==="icon"&&this._updateRoom(o,{icon:r.value||void 0}))}_onSelectorChange(e){let r=e.target;if(!r||r.tagName.toLowerCase()!=="ha-selector")return;e.stopPropagation();let i=r.dataset.field,o=r.dataset.scope;if(!i)return;if(o==="today"){if(i==="waste_entities"){let d=Array.isArray(e.detail?.value)?e.detail.value.filter(m=>typeof m=="string"):[];this._updateToday({waste_entities:d});return}let c=typeof e.detail?.value=="string"?e.detail.value:void 0;this._updateToday({[i]:c});return}if(o==="action"){let c=r.dataset.actionKey;if(!c)return;let d=typeof e.detail?.value=="string"?e.detail.value:"";this._updateAction(c,{entity:d});return}if(o==="security"){let c=typeof e.detail?.value=="string"?e.detail.value:void 0;this._updateSecurity({alarm_entity:c});return}if(o==="camera"){let c=r.dataset.cameraKey;if(!c)return;let d=typeof e.detail?.value=="string"?e.detail.value:void 0;i==="camera_entity"&&this._updateCamera(c,{camera_entity:d??""}),i==="privacy_entity"&&this._updateCamera(c,{privacy_entity:d});return}let a=r.dataset.room;if(!a)return;let n=typeof e.detail?.value=="string"?e.detail.value:void 0;this._updateRoom(a,{[i]:n})}_onClick(e){let r=e.target?.closest("[data-action]");r&&(r.dataset.action==="add-room"&&this._addRoom(),r.dataset.action==="remove-room"&&r.dataset.room&&this._removeRoom(r.dataset.room),r.dataset.action==="add-action"&&this._addAction(),r.dataset.action==="remove-action"&&r.dataset.actionKey&&this._removeAction(r.dataset.actionKey),r.dataset.action==="add-camera"&&this._addCamera(),r.dataset.action==="remove-camera"&&r.dataset.cameraKey&&this._removeCamera(r.dataset.cameraKey))}_render(){let e=this._config;this.root.innerHTML=`
      <style>${Jt}</style>
      <div class="jde-section">
        <h3>Algemeen</h3>
        <label>Titel
          <input type="text" data-scope="general" data-field="title" value="${f(e.general.title)}">
        </label>
        <label>Startpagina
          <select data-scope="general" data-field="start_view">
            <option value="home" ${e.general.start_view==="home"?"selected":""}>Home</option>
            <option value="rooms" ${e.general.start_view==="rooms"?"selected":""}>Kamers</option>
          </select>
        </label>
        <label>Thema
          <select data-scope="general" data-field="theme_mode">
            <option value="system" ${e.general.theme_mode==="system"?"selected":""}>Systeem</option>
            <option value="light" ${e.general.theme_mode==="light"?"selected":""}>Licht</option>
            <option value="dark" ${e.general.theme_mode==="dark"?"selected":""}>Donker</option>
          </select>
        </label>
      </div>

      <div class="jde-section">
        <h3>Vandaag</h3>
        ${De.map(r=>`
          <label>${f(r.label)}
            <ha-selector data-scope="today" data-field="${r.key}"></ha-selector>
          </label>`).join("")}
        <label>Afvalbronnen
          <ha-selector data-scope="today" data-field="waste_entities"></ha-selector>
        </label>
      </div>

      <div class="jde-section">
        <h3>Security</h3>
        <label>Alarm
          <ha-selector data-scope="security" data-field="alarm_entity"></ha-selector>
        </label>
        <div class="jde-section-head">
          <h4>Camera's</h4>
          <button type="button" data-action="add-camera">+ Camera toevoegen</button>
        </div>
        ${e.security.cameras.length===0?`<p class="jde-empty">Nog geen camera's geconfigureerd.</p>`:e.security.cameras.map(r=>this._cameraHtml(r)).join("")}
      </div>

      <div class="jde-section">
        <div class="jde-section-head">
          <h3>Snelacties</h3>
          <button type="button" data-action="add-action">+ Actie toevoegen</button>
        </div>
        ${e.quick_actions.length===0?'<p class="jde-empty">Nog geen snelacties geconfigureerd.</p>':e.quick_actions.map(r=>this._actionHtml(r)).join("")}
      </div>

      <div class="jde-section">
        <div class="jde-section-head">
          <h3>Kamers</h3>
          <button type="button" data-action="add-room">+ Kamer toevoegen</button>
        </div>
        ${e.rooms.length===0?'<p class="jde-empty">Nog geen kamers geconfigureerd.</p>':e.rooms.map(r=>this._roomHtml(r)).join("")}
      </div>`,this.root.querySelectorAll("ha-selector").forEach(r=>{let i=r,o=i.dataset.scope,a=i.dataset.field;if(!a)return;if(o==="today"){if(a==="waste_entities")i.selector={entity:{multiple:!0}},i.value=e.today.waste_entities??[];else{let m=De.find(g=>g.key===a);i.selector={entity:m?.domain?{domain:m.domain}:{}},i.value=e.today[a]??""}this._hass&&(i.hass=this._hass);return}if(o==="action"){let m=i.dataset.actionKey,g=e.quick_actions.find(x=>x.key===m);if(!g)return;i.selector={entity:{}},i.value=g.entity??"",this._hass&&(i.hass=this._hass);return}if(o==="security"){i.selector={entity:{domain:"alarm_control_panel"}},i.value=e.security.alarm_entity??"",this._hass&&(i.hass=this._hass);return}if(o==="camera"){let m=i.dataset.cameraKey,g=e.security.cameras.find(x=>x.key===m);if(!g)return;a==="camera_entity"?(i.selector={entity:{domain:"camera"}},i.value=g.camera_entity??""):(i.selector={entity:{}},i.value=g.privacy_entity??""),this._hass&&(i.hass=this._hass);return}let n=i.dataset.room;if(!n)return;let c=e.rooms.find(m=>m.key===n),d=Ae.find(m=>m.key===a);!c||!d||(i.selector={entity:d.domain?{domain:d.domain}:{}},i.value=c[d.key]??"",this._hass&&(i.hass=this._hass))})}_actionHtml(e){return`
      <div class="jde-room">
        <div class="jde-room-head">
          <input type="text" data-scope="action" data-action-key="${e.key}" data-field="label" value="${f(e.label)}" placeholder="Label">
          <button type="button" data-action="remove-action" data-action-key="${e.key}" aria-label="Actie verwijderen">&times;</button>
        </div>
        <label>Icoon
          <input type="text" data-scope="action" data-action-key="${e.key}" data-field="icon" value="${f(e.icon??"")}" placeholder="mdi:lightning-bolt">
        </label>
        <label>Entiteit
          <ha-selector data-scope="action" data-action-key="${e.key}" data-field="entity"></ha-selector>
        </label>
        <label>Service (bv. toggle, turn_on, alarm_arm_home)
          <input type="text" data-scope="action" data-action-key="${e.key}" data-field="service" value="${f(e.service)}" placeholder="toggle">
        </label>
      </div>`}_cameraHtml(e){return`
      <div class="jde-room">
        <div class="jde-room-head">
          <input type="text" data-scope="camera" data-camera-key="${e.key}" data-field="name" value="${f(e.name)}" placeholder="Cameranaam">
          <button type="button" data-action="remove-camera" data-camera-key="${e.key}" aria-label="Camera verwijderen">&times;</button>
        </div>
        <label>Camera
          <ha-selector data-scope="camera" data-camera-key="${e.key}" data-field="camera_entity"></ha-selector>
        </label>
        <label>Privacyschakelaar (optioneel \u2014 enkel deze camera toont dan een privacylabel)
          <ha-selector data-scope="camera" data-camera-key="${e.key}" data-field="privacy_entity"></ha-selector>
        </label>
        ${e.privacy_entity?`<label>Privacy-service (bv. toggle)
                 <input type="text" data-scope="camera" data-camera-key="${e.key}" data-field="privacy_service" value="${f(e.privacy_service??"")}" placeholder="toggle">
               </label>`:""}
      </div>`}_roomHtml(e){return`
      <div class="jde-room">
        <div class="jde-room-head">
          <input type="text" data-room="${e.key}" data-field="name" value="${f(e.name)}" placeholder="Kamernaam">
          <button type="button" data-action="remove-room" data-room="${e.key}" aria-label="Kamer verwijderen">&times;</button>
        </div>
        <label>Icoon
          <input type="text" data-room="${e.key}" data-field="icon" value="${f(e.icon??"")}" placeholder="mdi:sofa">
        </label>
        ${Ae.map(r=>`
          <label>${f(r.label)}
            <ha-selector data-room="${e.key}" data-field="${r.key}"></ha-selector>
          </label>`).join("")}
      </div>`}},Jt=`
  :host { display: block; font-family: var(--paper-font-body1_-_font-family, inherit); color: var(--primary-text-color); }
  .jde-section { padding: 16px 0; border-bottom: 1px solid var(--divider-color, #e0e0e0); }
  .jde-section:last-child { border-bottom: 0; }
  .jde-section h3 { margin: 0 0 12px; font-size: 15px; font-weight: 600; }
  .jde-section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .jde-section-head h3, .jde-section-head h4 { margin: 0; font-size: 13px; font-weight: 600; }
  .jde-section-head { margin-top: 16px; }
  .jde-section-head button, .jde-room-head button {
    border: 1px solid var(--divider-color, #e0e0e0); background: var(--card-background-color, transparent);
    color: var(--primary-text-color); border-radius: 8px; padding: 6px 12px; cursor: pointer;
  }
  label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; }
  input[type="text"], select {
    padding: 8px 10px; border-radius: 8px; border: 1px solid var(--divider-color, #ccc);
    background: var(--card-background-color, #fff); color: var(--primary-text-color); font-size: 14px;
  }
  .jde-empty { color: var(--secondary-text-color); font-size: 13px; }
  .jde-room { border: 1px solid var(--divider-color, #e0e0e0); border-radius: 12px; padding: 12px; margin-bottom: 12px; }
  .jde-room-head { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
  .jde-room-head input { flex: 1; font-weight: 600; }
  .jde-room-head button { width: 32px; height: 32px; padding: 0; flex: none; }
`;function de(){typeof customElements>"u"||customElements.get("juiced-dashboard-strategy-editor")||customElements.define("juiced-dashboard-strategy-editor",G)}var Me=Object.freeze({name:"Juiced Dashboard",version:"0.1.0"});typeof window<"u"&&(W(),de(),ce(),te(),window.__JUICED_DASHBOARD_BUILD__=Me,console.info("%c JUICED DASHBOARD %c "+Me.version,"color: #081018; background: #5cc8ff; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;","color: #5cc8ff; background: #0f1115; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;"));export{S as CONFIG_SCHEMA_VERSION,be as DEFAULT_CLIMATE_TARGET,N as JuicedDashboardQuickActions,L as JuicedDashboardRoomCard,P as JuicedDashboardRoomDetailCard,q as JuicedDashboardSecurityCard,K as JuicedDashboardStrategy,G as JuicedDashboardStrategyEditor,U as JuicedDashboardTodayCard,F as JuicedDashboardViewStrategy,Z as START_VIEWS,X as THEME_MODES,Y as VIEW_PATHS,Me as buildInfo,Le as buildView,$ as closeCover,he as collectEntityIds,j as compileConfig,B as compileRoomForCard,me as coverPosition,ge as coverPositionLabel,ee as createDefaultConfig,E as displayName,l as entityState,s as escapeHtml,y as formatNumber,h as formatTemp,ye as hasRelevantChange,pe as humanize,k as hvacModeLabel,p as isUnavailable,T as openCover,de as registerJuicedDashboardEditor,re as registerJuicedDashboardQuickActions,W as registerJuicedDashboardRoomCard,ie as registerJuicedDashboardRoomDetailCard,oe as registerJuicedDashboardSecurityCard,te as registerJuicedDashboardStrategy,ae as registerJuicedDashboardTodayCard,ce as registerJuicedDashboardViewStrategy,fe as roomEntityIds,ve as roomFlag,Je as roomHasControls,C as roomIconSvg,A as roomLightsOn,ke as roomPath,O as roomSectionClimate,_ as roomSectionCovers,J as roomSectionLights,V as roomSectionMedia,Q as roomStatLine,M as setHvacMode,I as stepClimateTarget,D as stopCover,H as toggleLight,z as toggleMediaPlayPause};
