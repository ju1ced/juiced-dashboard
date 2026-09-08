/*! Juiced Dashboard 0.1.0 | MIT License | https://github.com/ju1ced/juiced-dashboard */
var ye=["buiten","gelijkvloers","boven"],Ke={buiten:"Buiten",gelijkvloers:"Gelijkvloers",boven:"Boven"};function s(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}var Pe=new Set(["unavailable","unknown"]);function g(t){return t==null||Pe.has(t)}function u(t,e){return!e||!t?null:t.states?.[e]||null}function v(t,e){let i=Number(t);return Number.isFinite(i)?i.toFixed(e??1).replace(".",","):null}function h(t,e){let i=v(t,e);return i===null?null:`${i}\xB0`}var qe={off:"Uit",heat:"Verwarmen",cool:"Koelen",heat_cool:"Auto",auto:"Auto",fan_only:"Ventilator",dry:"Droog"};function ve(t){let e=String(t??"").replace(/_/g," ");return e?e.charAt(0).toUpperCase()+e.slice(1):""}function E(t){return t&&(qe[t]||ve(t))||"Onbekend"}function be(t){if(!t)return null;let e=t.attributes?.current_position;return typeof e=="number"&&Number.isFinite(e)?Math.round(e):t.state==="open"?100:t.state==="closed"?0:null}function xe(t){let e=be(t);return e===null?"\u2014":`${e}%`}function S(t,e,i){if(t)return t;let r=e?.attributes?.friendly_name;return typeof r=="string"&&r?r:i||""}function _e(t){let e=[],i=r=>{typeof r=="string"&&r.includes(".")&&e.push(r)};return i(t?.temperature),i(t?.humidity),i(t?.media_player),i(t?.climate),(t?.lights||[]).forEach(r=>i(r?.entity)),(t?.covers||[]).forEach(r=>i(r?.entity)),(t?.awnings||[]).forEach(r=>i(r?.entity)),e}function je(t){let e=new Set;return(t?.rooms||[]).forEach(i=>{_e(i).forEach(r=>e.add(r))}),[...e]}function we(t,e,i){if(!t||!e)return!0;let r=t.states||{},o=e.states||{};for(let a of i){let n=r[a],d=o[a];if(!n||!d){if(n!==d)return!0;continue}if(n.state!==d.state||n.last_updated!==d.last_updated)return!0}return!1}function X(t,e){let i=[],r=u(t,e?.temperature);if(r&&!g(r.state)){let a=h(r.state,1);a&&i.push(a)}let o=u(t,e?.humidity);if(o&&!g(o.state)){let a=v(o.state,0);a&&i.push(`${a}%`)}return i.length?i.join(" \xB7 "):e?.idle_text||"Rustig"}function D(t,e){return(e?.lights||[]).filter(i=>u(t,i?.entity)?.state==="on").length}function ke(t,e){let i=D(t,e);return i<=0?null:i===1?"1 lamp aan":`${i} lampen aan`}function Ue(t){return!!((t?.lights||[]).length||(t?.covers||[]).length||(t?.awnings||[]).length||t?.media_player||t?.climate)}function b(t,e,i,r,o){!t||!r||t.callService(e,i,{entity_id:r,...o||{}})}function M(t,e){b(t,"light","toggle",e)}function z(t,e){b(t,"cover","open_cover",e)}function I(t,e){b(t,"cover","close_cover",e)}function O(t,e){b(t,"cover","stop_cover",e)}function J(t,e,i){b(t,"climate","set_hvac_mode",e,{hvac_mode:i})}var Ce=20;function N(t,e,i,r){let a=i!==""&&i!==null&&i!==void 0?Number(i):NaN,n=Number.isFinite(a)?a:Ce,d=Math.round((n+r)*10)/10;b(t,"climate","set_temperature",e,{temperature:d})}function V(t,e){b(t,"media_player","media_play_pause",e)}function B(t,e){let i=e.lights||[];return i.length?`<div class="jrc-section"><h4>Verlichting</h4>${i.map(o=>{let a=u(t,o.entity),n=a?.state==="on",d=S(o.name,a,o.entity),c=g(a?.state);return`
        <div class="jrc-lightrow${n?" on":""}">
          <span class="jrc-lrow-ic">${Fe}</span>
          <span class="jrc-lrow-text">
            <span class="jrc-lrow-name">${s(d)}</span>
            <span class="jrc-lrow-sub">${c?"Niet beschikbaar":n?"Aan":"Uit"}</span>
          </span>
          <button class="jrc-toggle${n?" on":""}" data-action="toggle-light"
            data-entity="${s(o.entity)}" ${c?"disabled":""}
            aria-label="${s(d)} omschakelen"><i></i></button>
        </div>`}).join("")}</div>`:""}function j(t,e,i,r){let o=e[i]||[];if(!o.length)return"";let a=o.map(n=>{let d=u(t,n.entity),c=S(n.name,d,n.entity);return`
        <div class="jrc-coverrow">
          <span class="jrc-cr-name">${s(c)}</span>
          <span class="jrc-cr-pos">${xe(d)}</span>
          <span class="jrc-cr-btns">
            <button data-action="cover-open" data-entity="${s(n.entity)}" aria-label="Omhoog">${Ze}</button>
            <button data-action="cover-stop" data-entity="${s(n.entity)}" aria-label="Stop">${Xe}</button>
            <button data-action="cover-close" data-entity="${s(n.entity)}" aria-label="Omlaag">${Ye}</button>
          </span>
        </div>`}).join("");return`<div class="jrc-section"><h4>${s(r)}</h4>${a}</div>`}function K(t,e){if(!e.media_player)return"";let i=u(t,e.media_player),r=S(null,i,e.media_player),o=i?.attributes?.media_title,a=typeof o=="string"&&o?o:g(i?.state)?"Niet beschikbaar":"Uit",n=i?.state==="playing";return`
    <div class="jrc-section">
      <h4>Media</h4>
      <div class="jrc-media">
        <span class="jrc-media-ic">${et}</span>
        <span class="jrc-media-text">
          <span class="jrc-media-name">${s(r)}</span>
          <span class="jrc-media-sub">${s(a)}</span>
        </span>
        <button class="jrc-media-btn${n?" on":""}" data-action="media-toggle"
          data-entity="${s(e.media_player)}" aria-label="Afspelen/pauzeren">${tt}</button>
      </div>
    </div>`}function P(t,e){if(!e.climate)return"";let i=u(t,e.climate),r=S(null,i,e.climate),o=i?.attributes?.hvac_modes,a=Array.isArray(o)?o.filter(C=>typeof C=="string"):[],n=i?.state,d=h(i?.attributes?.current_temperature,1),c=i?.attributes?.temperature,l=h(c,1)||"\u2014",m=Number(i?.attributes?.target_temp_step),_=Number.isFinite(m)&&m>0?m:.5,fe=a.map(C=>`
      <button class="jrc-pill${C===n?" on":""}" data-action="climate-mode"
        data-entity="${s(e.climate)}" data-mode="${s(C)}">${s(E(C))}</button>`).join(""),he=typeof c=="string"||typeof c=="number"?String(c):"";return`
    <div class="jrc-section">
      <h4>Klimaat</h4>
      <div class="jrc-kv"><span>${s(r)}</span><span class="ok">${s(E(n))}</span></div>
      ${fe?`<div class="jrc-pillrow">${fe}</div>`:""}
      <div class="jrc-stepper">
        <button data-action="climate-step" data-entity="${s(e.climate)}"
          data-target="${he}" data-step="${-_}" aria-label="Kouder">\u2212</button>
        <div class="jrc-stepper-mid">
          <div class="v">${s(l)}</div>
          <div class="l">doel${d?` \xB7 nu ${s(d)}`:""}</div>
        </div>
        <button data-action="climate-step" data-entity="${s(e.climate)}"
          data-target="${he}" data-step="${_}" aria-label="Warmer">+</button>
      </div>
    </div>`}var Ge=typeof HTMLElement>"u"?class{}:HTMLElement,H=class extends Ge{_config=null;_hass=null;_entityIds=[];_openRoomIndex=null;_built=!1;constructor(){super(),this.attachShadow({mode:"open"}),this._onClick=this._onClick.bind(this),this._onKeydown=this._onKeydown.bind(this),this._onDocKeydown=this._onDocKeydown.bind(this)}get root(){return this.shadowRoot}static getStubConfig(){return{type:"custom:juiced-dashboard-room-card",title:"Kamers",subtitle:"Tik een kamer om lichten, rolluiken, luifels, radio of airco direct te bedienen",rooms:[{name:"Bureau",icon:"mdi:desk",temperature:"sensor.bureau_temperature",humidity:"sensor.bureau_humidity",lights:[{entity:"light.bureau_spellenruimte",name:"Bureau & spellenruimte"},{entity:"light.bureau_spellentafel",name:"Spellentafel"}],awnings:[{entity:"cover.luifel_bureau",name:"Luifel bureau"}],media_player:"media_player.kantoor",climate:"climate.daikin_bureau"}]}}setConfig(e){if(!e||typeof e!="object")throw new Error("juiced-dashboard-room-card: invalid configuration.");if(!Array.isArray(e.rooms))throw new Error("juiced-dashboard-room-card: `rooms` must be a list.");e.rooms.forEach((i,r)=>{if(!i||typeof i!="object")throw new Error(`juiced-dashboard-room-card: room at index ${r} must be an object.`);if(!i.name)throw new Error(`juiced-dashboard-room-card: room at index ${r} is missing \`name\`.`)}),this._config=e,this._entityIds=je(e),this._openRoomIndex=null,this._built=!1,this._renderShell(),this._renderList(),this._built=!0}set hass(e){let i=this._hass;this._hass=e,this._config&&(this._built&&i&&!we(i,e,this._entityIds)||(this._renderList(),this._openRoomIndex!==null&&this._renderPopup()))}get hass(){return this._hass}getCardSize(){return 1+Math.ceil((this._config?.rooms?.length||0)/2)}connectedCallback(){this.root.addEventListener("click",this._onClick),this.root.addEventListener("keydown",this._onKeydown)}disconnectedCallback(){this.root.removeEventListener("click",this._onClick),this.root.removeEventListener("keydown",this._onKeydown),typeof document<"u"&&document.removeEventListener("keydown",this._onDocKeydown)}_renderShell(){let e=this._config||{};this.root.innerHTML=`
      <style>${rt}</style>
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
            <button class="jrc-close" data-action="close" aria-label="Sluiten">${We}</button>
          </div>
          <div class="jrc-popup-body" id="popup-body"></div>
        </div>
      </div>`}_renderList(){let e=this.root.getElementById("list");if(!e)return;let i=this._hass,r=this._config?.rooms||[];if(!r.some(n=>n.zone)){e.innerHTML=`<div class="jrc-zone-grid">${r.map((n,d)=>this._roomRowHtml(n,d,i)).join("")}</div>`;return}let o=ye.map(n=>({label:Ke[n],indices:[]})),a={label:"Overige",indices:[]};r.forEach((n,d)=>{let c=ye.indexOf(n.zone??"");(c>=0?o[c]:a).indices.push(d)}),e.innerHTML=[...o,a].filter(n=>n.indices.length>0).map(n=>`
          <div class="jrc-zone">
            <h3 class="jrc-zone-title">${s(n.label)}</h3>
            <div class="jrc-zone-grid">${n.indices.map(d=>this._roomRowHtml(r[d],d,i)).join("")}</div>
          </div>`).join("")}_roomRowHtml(e,i,r){let o=X(r,e),a=ke(r,e);return`
      <div class="jrc-row" role="button" tabindex="0" data-action="open-room" data-room="${i}">
        <span class="jrc-row-ic">${R(e.icon)}</span>
        <span class="jrc-row-text">
          <span class="jrc-row-name">${s(e.name)}</span>
          <span class="jrc-row-stat">${s(o)}</span>
        </span>
        ${a?`<span class="jrc-flag">${s(a)}</span>`:""}
        <span class="jrc-chev">${Qe}</span>
      </div>`}_openRoom(e){if(!(this._config?.rooms||[])[e])return;this._openRoomIndex=e,this._renderPopup(),this.root.getElementById("backdrop")?.classList.add("show"),typeof document<"u"&&document.addEventListener("keydown",this._onDocKeydown)}_closePopup(){this._openRoomIndex=null,this.root.getElementById("backdrop")?.classList.remove("show"),typeof document<"u"&&document.removeEventListener("keydown",this._onDocKeydown)}_renderPopup(){let e=(this._config?.rooms||[])[this._openRoomIndex];if(!e)return;let i=this._hass,r=this.root.getElementById("popup-icon");r&&(r.innerHTML=R(e.icon));let o=this.root.getElementById("popup-name");o&&(o.textContent=e.name);let a=this.root.getElementById("popup-sub");a&&(a.textContent=X(i,e));let n=[B(i,e),j(i,e,"covers","Rolluiken"),j(i,e,"awnings","Luifels"),K(i,e),P(i,e)].filter(Boolean).join(""),d=this.root.getElementById("popup-body");d&&(d.innerHTML=n||'<p class="jrc-empty">Geen snelbediening geconfigureerd voor deze kamer.</p>')}_onClick(e){let r=e.target?.closest("[data-action]");if(!r)return;let o=r.dataset.action,a=this._hass;if(o==="open-room"){this._openRoom(Number(r.dataset.room));return}if(o==="close"||o==="close-backdrop"){if(o==="close-backdrop"&&e.target!==r)return;this._closePopup();return}if(o==="toggle-light"){e.stopPropagation(),M(a,r.dataset.entity);return}if(o==="cover-open"){z(a,r.dataset.entity);return}if(o==="cover-close"){I(a,r.dataset.entity);return}if(o==="cover-stop"){O(a,r.dataset.entity);return}if(o==="media-toggle"){V(a,r.dataset.entity);return}if(o==="climate-mode"){J(a,r.dataset.entity,r.dataset.mode);return}if(o==="climate-step"){N(a,r.dataset.entity,r.dataset.target,Number(r.dataset.step));return}}_onKeydown(e){if(e.key!=="Enter"&&e.key!==" ")return;let r=e.target?.closest('[data-action="open-room"]');r&&(e.preventDefault(),this._openRoom(Number(r.dataset.room)))}_onDocKeydown(e){e.key==="Escape"&&this._closePopup()}},Fe='<svg viewBox="0 0 24 24" width="16" height="16"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.4 10.9c.5.5.9 1.2 1 2h4.8c.1-.8.5-1.5 1-2A6 6 0 0 0 12 3z"/></g></svg>',Qe='<svg viewBox="0 0 24 24" width="15" height="15"><polyline points="9 6 15 12 9 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',We='<svg viewBox="0 0 24 24" width="15" height="15"><g stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></g></svg>',Ze='<svg viewBox="0 0 24 24" width="14" height="14"><polyline points="6 15 12 9 18 15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',Ye='<svg viewBox="0 0 24 24" width="14" height="14"><polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',Xe='<svg viewBox="0 0 24 24" width="14" height="14"><rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor"/></svg>',et='<svg viewBox="0 0 24 24" width="18" height="18"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="3"/><circle cx="12" cy="8.2" r="2.4"/><circle cx="12" cy="16.5" r="1.1"/></g></svg>',tt='<svg viewBox="0 0 24 24" width="13" height="13"><polygon points="6 4 20 12 6 20" fill="currentColor"/></svg>',it='<svg viewBox="0 0 24 24" width="17" height="17"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/></g></svg>';function R(t){return typeof t=="string"&&t.startsWith("mdi:")?`<ha-icon icon="${s(t)}"></ha-icon>`:it}var rt=`
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
  .jrc-list { display: flex; flex-direction: column; padding: 6px 18px 18px; gap: 16px; }
  .jrc-zone-title {
    margin: 0 0 8px; font-size: 11.5px; font-weight: 700; letter-spacing: .4px; text-transform: uppercase;
    color: var(--juiced-text-muted, var(--secondary-text-color));
  }
  .jrc-zone-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
  .jrc-row {
    display: flex; align-items: center; gap: 13px; padding: 13px 14px;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    border-radius: var(--juiced-radius-md, 14px);
    cursor: pointer; -webkit-tap-highlight-color: transparent;
  }
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
`;function ee(){typeof customElements<"u"&&(customElements.get("juiced-dashboard-room-card")||customElements.define("juiced-dashboard-room-card",H)),typeof window<"u"&&(window.customCards=window.customCards||[],window.customCards.some(t=>t.type==="juiced-dashboard-room-card")||window.customCards.push({type:"juiced-dashboard-room-card",name:"Juiced Dashboard Room Card",description:"Tik een kamer, krijg een popup met enkel wat daar bedienbaar is \u2014 lichten, rolluiken, luifels, radio, airco.",preview:!1,documentationURL:"https://github.com/ju1ced/juiced-dashboard"}))}var L=1,te=["home","rooms","energy","domains","more"],ie=["home","rooms"],re=["system","light","dark"],$=["buiten","gelijkvloers","boven"];function oe(){return{type:"custom:juiced-dashboard",schema_version:1,general:{title:"Juiced Dashboard",start_view:"home",theme_mode:"system",person_entities:[]},today:{waste_entities:[]},quick_actions:[],security:{cameras:[]},rooms:[]}}function x(t){return typeof t=="object"&&t!==null}function T(t,e){return typeof t=="string"&&t?t:e}function p(t){return typeof t=="string"&&t?t:void 0}function ot(t,e){return typeof t=="string"&&ie.includes(t)?t:e}function at(t,e){return typeof t=="string"&&re.includes(t)?t:e}function nt(t){return typeof t=="string"&&$.includes(t)?t:void 0}var Ee=0;function st(){return Ee+=1,`room-${Date.now().toString(36)}-${Ee}`}function ct(t){let e=oe().general;return x(t)?{title:T(t.title,e.title),start_view:ot(t.start_view,e.start_view),theme_mode:at(t.theme_mode,e.theme_mode),person_entities:A(t.person_entities)}:e}function dt(t){if(!x(t))return null;let e=p(t.name);return e?{key:T(t.key,st()),name:e,icon:p(t.icon),zone:nt(t.zone),temperature_entity:p(t.temperature_entity),humidity_entity:p(t.humidity_entity),light_entities:A(t.light_entities),cover_entities:A(t.cover_entities),awning_entities:A(t.awning_entities),media_player_entity:p(t.media_player_entity),climate_entity:p(t.climate_entity)}:null}function A(t){return Array.isArray(t)?t.filter(e=>typeof e=="string"&&e.length>0):[]}function lt(t){return x(t)?{weather_entity:p(t.weather_entity),battery_soc_entity:p(t.battery_soc_entity),battery_charge_entity:p(t.battery_charge_entity),battery_discharge_entity:p(t.battery_discharge_entity),solar_power_entity:p(t.solar_power_entity),home_consumption_entity:p(t.home_consumption_entity),monthly_peak_entity:p(t.monthly_peak_entity),waste_entities:A(t.waste_entities)}:{waste_entities:[]}}var Re=0;function ut(){return Re+=1,`action-${Date.now().toString(36)}-${Re}`}function pt(t){if(!x(t))return null;let e=p(t.entity),i=p(t.service);return!e||!i?null:{key:T(t.key,ut()),label:T(t.label,e),icon:p(t.icon),entity:e,service:i}}function mt(t){if(!Array.isArray(t))return[];let e=[];for(let i of t){let r=pt(i);r&&e.push(r)}return e}var Se=0;function gt(){return Se+=1,`camera-${Date.now().toString(36)}-${Se}`}function ft(t){if(!x(t))return null;let e=p(t.name),i=p(t.camera_entity);return!e||!i?null:{key:T(t.key,gt()),name:e,camera_entity:i,privacy_entity:p(t.privacy_entity),privacy_service:p(t.privacy_service)}}function ht(t){if(!Array.isArray(t))return[];let e=[];for(let i of t){let r=ft(i);r&&e.push(r)}return e}function yt(t){return x(t)?{alarm_entity:p(t.alarm_entity),cameras:ht(t.cameras)}:{cameras:[]}}function vt(t){if(!Array.isArray(t))return[];let e=[];for(let i of t){let r=dt(i);r&&e.push(r)}return e}function w(t){let e=x(t)?t:{};return{type:"custom:juiced-dashboard",schema_version:1,general:ct(e.general),today:lt(e.today),quick_actions:mt(e.quick_actions),security:yt(e.security),rooms:vt(e.rooms)}}function q(t){return{name:t.name,icon:t.icon,zone:t.zone,temperature:t.temperature_entity,humidity:t.humidity_entity,lights:(t.light_entities??[]).map(e=>({entity:e})),covers:(t.cover_entities??[]).map(e=>({entity:e})),awnings:(t.awning_entities??[]).map(e=>({entity:e})),media_player:t.media_player_entity,climate:t.climate_entity}}var bt=typeof HTMLElement>"u"?class{}:HTMLElement,xt={home:{title:"Home",icon:"mdi:home"},rooms:{title:"Kamers",icon:"mdi:floor-plan"},energy:{title:"Energie",icon:"mdi:lightning-bolt"},domains:{title:"Domeinen",icon:"mdi:view-grid-outline"},more:{title:"Meer",icon:"mdi:dots-horizontal-circle-outline"}};function Le(t){return`room-${t}`}function _t(t,e){let i=xt[t];return{title:i.title,path:t,icon:i.icon,subview:!1,strategy:{type:"custom:juiced-dashboard-view",view:t,general:e.general,today:e.today,quick_actions:e.quick_actions,security:e.security,rooms:e.rooms}}}function jt(t,e){return{title:t.name,path:Le(t.key),icon:t.icon||"mdi:sofa-outline",subview:!0,back_path:"rooms",strategy:{type:"custom:juiced-dashboard-view",view:"room",general:e.general,room:t}}}var U=class extends bt{static getCreateSuggestions(){return{title:"Juiced Dashboard",icon:"mdi:home-assistant"}}static getConfigElement(){return document.createElement("juiced-dashboard-strategy-editor")}static async generate(e){let i=w(e),r=[i.general.start_view,...te.filter(o=>o!==i.general.start_view)];return{title:i.general.title,views:[...r.map(o=>_t(o,i)),...i.rooms.map(o=>jt(o,i))]}}};function ae(){if(typeof customElements>"u"||typeof window>"u")return;let t="ll-strategy-dashboard-juiced-dashboard";customElements.get(t)||customElements.define(t,U),window.customStrategies??=[],window.customStrategies.some(e=>e.type==="juiced-dashboard"&&e.strategyType==="dashboard")||window.customStrategies.push({type:"juiced-dashboard",strategyType:"dashboard",name:"Juiced Dashboard",description:"Kia-ge\xEFnspireerd, GUI-geconfigureerd dashboard: Home, Kamers, Energie, Domeinen en Meer.",documentationURL:"https://github.com/ju1ced/juiced-dashboard"})}var wt=typeof HTMLElement>"u"?class{}:HTMLElement,kt='<svg viewBox="0 0 24 24" width="16" height="16"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',Ct=new Set(["on","open","armed_home","armed_away","armed_night","playing","heat","cool"]);function Et(t){return t.split(".")[0]??""}var G=class extends wt{_config=null;_hass=null;constructor(){super(),this.attachShadow({mode:"open"}),this._onClick=this._onClick.bind(this)}get root(){return this.shadowRoot}static getStubConfig(){return{type:"custom:juiced-dashboard-quick-actions",actions:[]}}setConfig(e){if(!e||typeof e!="object")throw new Error("juiced-dashboard-quick-actions: invalid configuration.");this._config=e,this._render()}set hass(e){this._hass=e,this._render()}get hass(){return this._hass}getCardSize(){return 1}connectedCallback(){this.root.addEventListener("click",this._onClick)}disconnectedCallback(){this.root.removeEventListener("click",this._onClick)}_onClick(e){let r=e.target?.closest("[data-entity]");if(!r||!this._hass)return;let o=r.dataset.entity,a=r.dataset.service;!o||!a||this._hass.callService(Et(o),a,{entity_id:o})}_render(){if(!this._config)return;let e=this._config.actions??[],i=this._hass;if(e.length===0){this.root.innerHTML=`<style>${$e}</style>`;return}let r=e.map(o=>{let a=u(i,o.entity),n=g(a?.state);return`
          <button class="jqa-chip${!!(a&&Ct.has(a.state))?" on":""}" data-entity="${s(o.entity)}" data-service="${s(o.service)}" ${n?"disabled":""}>
            <span class="jqa-ic">${kt}</span>
            <span class="jqa-label">${s(o.label)}</span>
          </button>`}).join("");this.root.innerHTML=`<style>${$e}</style><div class="jqa-row">${r}</div>`}},$e=`
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
`;function ne(){typeof customElements>"u"||(customElements.get("juiced-dashboard-quick-actions")||customElements.define("juiced-dashboard-quick-actions",G),typeof window<"u"&&(window.customCards=window.customCards||[],window.customCards.some(t=>t.type==="juiced-dashboard-quick-actions")||window.customCards.push({type:"juiced-dashboard-quick-actions",name:"Juiced Dashboard \u2014 Snelacties",description:"Een kleine, gecureerde rij kruis-kamer acties (alarm, garagepoort, ...).",preview:!1,documentationURL:"https://github.com/ju1ced/juiced-dashboard"})))}var Rt=typeof HTMLElement>"u"?class{}:HTMLElement;function St(t,e){let i=[],r=u(t,e.temperature);if(r&&!g(r.state)){let n=h(r.state,1);n&&i.push(`<div class="jrd-tile"><div class="jrd-tile-value">${s(n)}</div><div class="jrd-tile-label">Temperatuur</div></div>`)}let o=u(t,e.humidity);if(o&&!g(o.state)){let n=v(o.state,0);n&&i.push(`<div class="jrd-tile"><div class="jrd-tile-value">${s(n)}<span class="jrd-tile-unit">%</span></div><div class="jrd-tile-label">Vochtigheid</div></div>`)}let a=e.lights||[];if(a.length>0){let n=D(t,e);i.push(`<div class="jrd-tile"><div class="jrd-tile-value">${n}<span class="jrd-tile-unit">/${a.length}</span></div><div class="jrd-tile-label">Lampen aan</div></div>`)}if(e.climate){let n=u(t,e.climate);if(n&&!g(n.state)){let d=h(n.attributes?.temperature,1);i.push(`<div class="jrd-tile"><div class="jrd-tile-value">${s(E(n.state))}</div><div class="jrd-tile-label">Klimaat${d?` \xB7 doel ${s(d)}`:""}</div></div>`)}}return i.length?`<div class="jrd-overview">${i.join("")}</div>`:""}var F=class extends Rt{_config=null;_hass=null;constructor(){super(),this.attachShadow({mode:"open"}),this._onClick=this._onClick.bind(this)}get root(){return this.shadowRoot}static getStubConfig(){return{type:"custom:juiced-dashboard-room-detail-card",room:{name:"Bureau",icon:"mdi:desk"}}}setConfig(e){if(!e||typeof e!="object")throw new Error("juiced-dashboard-room-detail-card: invalid configuration.");this._config=e,this._render()}set hass(e){this._hass=e,this._render()}get hass(){return this._hass}getCardSize(){return 5}connectedCallback(){this.root.addEventListener("click",this._onClick)}disconnectedCallback(){this.root.removeEventListener("click",this._onClick)}_render(){if(!this._config)return;let e=this._config.room,i=this._hass,r=St(i,e),o=[P(i,e),B(i,e),j(i,e,"covers","Rolluiken"),j(i,e,"awnings","Luifels"),K(i,e)].filter(n=>!!n),a=r||o.length?`${r}${o.length?`<div class="jrd-sections">${o.join("")}</div>`:""}`:'<p class="jrd-empty">Geen bediening of sensoren geconfigureerd voor deze kamer.</p>';this.root.innerHTML=`
      <style>${Lt}</style>
      <ha-card class="jrd-shell">
        <div class="jrd-hero">
          <span class="jrd-hero-ic">${R(e.icon)}</span>
          <h2 class="jrd-hero-name">${s(e.name)}</h2>
        </div>
        <div class="jrd-body">${a}</div>
      </ha-card>`}_onClick(e){let r=e.target?.closest("[data-action]");if(!r)return;let o=r.dataset.action,a=this._hass;if(o==="toggle-light"){M(a,r.dataset.entity);return}if(o==="cover-open"){z(a,r.dataset.entity);return}if(o==="cover-close"){I(a,r.dataset.entity);return}if(o==="cover-stop"){O(a,r.dataset.entity);return}if(o==="media-toggle"){V(a,r.dataset.entity);return}if(o==="climate-mode"){J(a,r.dataset.entity,r.dataset.mode);return}if(o==="climate-step"){N(a,r.dataset.entity,r.dataset.target,Number(r.dataset.step));return}}},Lt=`
  :host { display: block; }
  * { box-sizing: border-box; }
  ha-card.jrd-shell {
    background: var(--juiced-surface-raised, var(--ha-card-background, var(--card-background-color, #fff)));
    border-radius: var(--juiced-radius-lg, var(--ha-card-border-radius, 16px));
    overflow: hidden;
  }

  .jrd-hero {
    display: flex; align-items: center; gap: 18px; padding: 28px 24px;
    background: linear-gradient(155deg, var(--juiced-surface-elevated, var(--secondary-background-color, rgba(0,0,0,.04))), transparent);
  }
  .jrd-hero-ic {
    width: 64px; height: 64px; border-radius: 18px; flex: none;
    background: var(--juiced-surface-elevated, var(--secondary-background-color, rgba(0,0,0,.05)));
    color: var(--juiced-brand-primary, var(--primary-color));
    display: flex; align-items: center; justify-content: center;
  }
  .jrd-hero-ic ha-icon { --mdc-icon-size: 32px; }
  .jrd-hero-name { margin: 0; font-size: 26px; font-weight: 800; color: var(--juiced-text-primary, var(--primary-text-color)); }

  .jrd-body { padding: 0 24px 24px; }
  .jrd-empty { color: var(--juiced-text-muted, var(--secondary-text-color)); font-size: 12.5px; padding: 10px 0; }

  .jrd-sections { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 14px; margin-top: 4px; }
  .jrd-sections .jrc-section {
    padding: 16px; border-top: none;
    background: var(--juiced-surface-elevated, var(--secondary-background-color, rgba(0,0,0,.035)));
    border-radius: var(--juiced-radius-md, 14px);
  }

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
`;function se(){typeof customElements>"u"||(customElements.get("juiced-dashboard-room-detail-card")||customElements.define("juiced-dashboard-room-detail-card",F),typeof window<"u"&&(window.customCards=window.customCards||[],window.customCards.some(t=>t.type==="juiced-dashboard-room-detail-card")||window.customCards.push({type:"juiced-dashboard-room-detail-card",name:"Juiced Dashboard \u2014 Kamerdetail",description:"Volledige kamerpagina: overzicht, klimaat, verlichting, rolluiken/luifels en media.",preview:!1,documentationURL:"https://github.com/ju1ced/juiced-dashboard"})))}var $t=typeof HTMLElement>"u"?class{}:HTMLElement,At={disarmed:"Uitgeschakeld",armed_home:"Ingeschakeld (thuis)",armed_away:"Ingeschakeld (afwezig)",armed_night:"Ingeschakeld (nacht)",arming:"Wordt ingeschakeld\u2026",pending:"In afwachting\u2026",triggered:"Alarm!"},Tt=6e3,Q=class extends $t{_config=null;_hass=null;_cameraIndex=0;_timer=null;constructor(){super(),this.attachShadow({mode:"open"}),this._onClick=this._onClick.bind(this)}get root(){return this.shadowRoot}static getStubConfig(){return{type:"custom:juiced-dashboard-security-card",security:{alarm_entity:"alarm_control_panel.huis",cameras:[]}}}setConfig(e){if(!e||typeof e!="object")throw new Error("juiced-dashboard-security-card: invalid configuration.");this._config=e,this._cameraIndex=0,this._render()}set hass(e){this._hass=e,this._render()}get hass(){return this._hass}getCardSize(){return 3}connectedCallback(){this.root.addEventListener("click",this._onClick),this._startTimer()}disconnectedCallback(){this.root.removeEventListener("click",this._onClick),this._stopTimer()}_startTimer(){this._stopTimer(),!((this._config?.security.cameras??[]).length<=1)&&(typeof window<"u"&&window.matchMedia?.("(prefers-reduced-motion: reduce)").matches||(this._timer=setInterval(()=>{let i=this._config?.security.cameras.length??0;i!==0&&(this._cameraIndex=(this._cameraIndex+1)%i,this._render())},Tt)))}_stopTimer(){this._timer!==null&&(clearInterval(this._timer),this._timer=null)}_onClick(e){let i=e.target?.closest("[data-action]");if(!i||!this._hass||!this._config)return;let r=i.dataset.action;if(r==="alarm"){let a=i.dataset.service,n=this._config.security.alarm_entity;a&&n&&this._hass.callService("alarm_control_panel",a,{entity_id:n});return}let o=this._config.security.cameras;if(r==="camera-select"){let a=Number(i.dataset.index);Number.isFinite(a)&&(this._cameraIndex=a,this._startTimer(),this._render());return}if(r==="camera-prev"||r==="camera-next"){if(o.length===0)return;let a=r==="camera-prev"?-1:1;this._cameraIndex=(this._cameraIndex+a+o.length)%o.length,this._startTimer(),this._render();return}if(r==="privacy-toggle"){let a=i.dataset.entity,n=i.dataset.service||"toggle";a&&this._hass.callService(a.split(".")[0]??"",n,{entity_id:a});return}}_render(){if(!this._config)return;let e=this._config.security,i=this._alarmHtml(e.alarm_entity),r=this._cameraHtml(e.cameras??[]);if(!i&&!r){this.root.innerHTML=`<style>${Ae}</style>`;return}this.root.innerHTML=`<style>${Ae}</style><ha-card class="jsc-shell">${i}${r}</ha-card>`}_alarmHtml(e){if(!e)return"";let i=u(this._hass,e);if(!i||g(i.state))return"";let r=At[i.state]||i.state;return`
      <div class="jsc-alarm">
        <div class="jsc-alarm-text">
          <span class="jsc-alarm-label">Alarm</span>
          <span class="jsc-alarm-status${i.state.startsWith("armed")||i.state==="triggered"?" on":""}">${s(r)}</span>
        </div>
        <div class="jsc-alarm-btns">
          <button data-action="alarm" data-service="alarm_disarm">Uit</button>
          <button data-action="alarm" data-service="alarm_arm_home">Thuis</button>
          <button data-action="alarm" data-service="alarm_arm_away">Afwezig</button>
        </div>
      </div>`}_cameraHtml(e){if(e.length===0)return"";let i=Math.min(this._cameraIndex,e.length-1),r=e[i];if(!r)return"";let a=u(this._hass,r.camera_entity)?.attributes?.entity_picture,n=e.map((d,c)=>c===i?"":this._cameraRowHtml(d,c)).filter(Boolean).join("");return`
      <div class="jsc-cam">
        <div class="jsc-cam-head">
          <span>${s(r.name)} &middot; ${i+1} van ${e.length}</span>
          ${e.length>1?`<span class="jsc-cam-nav">
                  <button data-action="camera-prev" aria-label="Vorige camera">&lsaquo;</button>
                  <button data-action="camera-next" aria-label="Volgende camera">&rsaquo;</button>
                </span>`:""}
        </div>
        <div class="jsc-cam-stage">
          ${typeof a=="string"&&a?`<img src="${s(a)}" alt="${s(r.name)}">`:'<div class="jsc-cam-empty">Geen beeld beschikbaar</div>'}
        </div>
        ${n?`<div class="jsc-cam-list">${n}</div>`:""}
      </div>`}_cameraRowHtml(e,i){let o=(e.privacy_entity?u(this._hass,e.privacy_entity):null)?.state==="on";return`
      <button class="jsc-cam-item" data-action="camera-select" data-index="${i}">
        <span>${s(e.name)}</span>
        ${e.privacy_entity?`<span class="jsc-privacy${o?" on":""}" data-action="privacy-toggle"
                 data-entity="${s(e.privacy_entity)}" data-service="${s(e.privacy_service||"toggle")}">
                 ${o?"Privacy aan":"Privacy uit"}
               </span>`:""}
      </button>`}},Ae=`
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
`;function ce(){typeof customElements>"u"||(customElements.get("juiced-dashboard-security-card")||customElements.define("juiced-dashboard-security-card",Q),typeof window<"u"&&(window.customCards=window.customCards||[],window.customCards.some(t=>t.type==="juiced-dashboard-security-card")||window.customCards.push({type:"juiced-dashboard-security-card",name:"Juiced Dashboard \u2014 Security",description:"Alarmbediening en een doorbladerbare camerastrook, privacy enkel bij camera's die dat effectief hebben.",preview:!1,documentationURL:"https://github.com/ju1ced/juiced-dashboard"})))}var Ht=typeof HTMLElement>"u"?class{}:HTMLElement,Dt=[{key:"battery_soc_entity",label:"Thuisbatterij SoC"},{key:"battery_charge_entity",label:"Batterij laden"},{key:"battery_discharge_entity",label:"Batterij ontladen"},{key:"solar_power_entity",label:"Zonnepanelen opbrengst"},{key:"home_consumption_entity",label:"Huisverbruik"},{key:"monthly_peak_entity",label:"Maandelijkse vermogenspiek"}];function Mt(t,e){let r=u(t,e)?.attributes?.unit_of_measurement;return typeof r=="string"?r:""}function zt(t){return{"clear-night":"Helder",cloudy:"Bewolkt",exceptional:"Uitzonderlijk",fog:"Mist",hail:"Hagel",lightning:"Onweer","lightning-rainy":"Onweer met regen",partlycloudy:"Half bewolkt",pouring:"Zware regen",rainy:"Regenachtig",snowy:"Sneeuw","snowy-rainy":"Natte sneeuw",sunny:"Zonnig",windy:"Winderig","windy-variant":"Winderig"}[t]||t}var It=["zo","ma","di","wo","do","vr","za"];function Te(t){let e=t.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);if(e)return new Date(Number(e[3]),Number(e[2])-1,Number(e[1]));let i=t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);if(i)return new Date(Number(i[1]),Number(i[2])-1,Number(i[3]));let r=new Date(t);return Number.isNaN(r.getTime())?null:r}function He(t,e=new Date){let i=new Date(e.getFullYear(),e.getMonth(),e.getDate()),r=new Date(t.getFullYear(),t.getMonth(),t.getDate());return Math.round((r.getTime()-i.getTime())/864e5)}function De(t){return t===0?"Vandaag":t===1?"Morgen":t>1?`Over ${t} dagen`:t===-1?"Gisteren":`${Math.abs(t)} dagen geleden`}var W=class extends Ht{_config=null;_hass=null;constructor(){super(),this.attachShadow({mode:"open"})}get root(){return this.shadowRoot}static getStubConfig(){return{type:"custom:juiced-dashboard-today-card",today:{weather_entity:"weather.thuis",waste_entities:[]}}}setConfig(e){if(!e||typeof e!="object")throw new Error("juiced-dashboard-today-card: invalid configuration.");this._config=e,this._render()}set hass(e){this._hass=e,this._render()}get hass(){return this._hass}getCardSize(){return 3}_render(){if(!this._config)return;let e=this._config.today??{waste_entities:[]},i=this._hass,r=this._weatherHtml(i,e.weather_entity),o=this._energyHtml(i,e),a=this._wasteHtml(i,e.waste_entities??[]);this.root.innerHTML=`
      <style>${Ot}</style>
      <ha-card class="jtc-shell">
        ${r}
        ${o}
        ${a}
      </ha-card>`}_weatherHtml(e,i){let r=u(e,i);if(!i||!r||g(r.state))return"";let o=h(r.attributes?.temperature,1);return`
      <div class="jtc-weather">
        <div>
          <div class="jtc-weather-cond">${s(zt(r.state))}</div>
          <div class="jtc-weather-loc">Thuis &middot; nu</div>
        </div>
        ${o?`<div class="jtc-weather-temp">${s(o)}</div>`:""}
      </div>`}_energyHtml(e,i){let r=Dt.map(o=>{let a=i[o.key],n=u(e,a);if(!a||!n||g(n.state))return"";let d=v(n.state,1);if(d===null)return"";let c=Mt(e,a);return`
        <div class="jtc-tile">
          <div class="jtc-tile-value">${s(d)}${c?` <span class="jtc-tile-unit">${s(c)}</span>`:""}</div>
          <div class="jtc-tile-label">${s(o.label)}</div>
        </div>`}).join("");return r?`<div class="jtc-energy">${r}</div>`:""}_wasteHtml(e,i){let r=i.map(o=>{let a=u(e,o);if(!a||g(a.state))return"";let n=a.attributes?.friendly_name,d=typeof n=="string"&&n?n:o,c=Te(a.state),l=c===null?`<span class="jtc-waste-wd">${s(a.state)}</span>`:`<span class="jtc-waste-day">${c.getDate()}</span><span class="jtc-waste-wd">${It[c.getDay()]}</span>`,m=c===null?"":De(He(c));return`
          <div class="jtc-waste-chip">
            <div class="jtc-waste-date">${l}</div>
            <div class="jtc-waste-text">
              <div class="jtc-waste-name">${s(d)}</div>
              ${m?`<div class="jtc-waste-value">${s(m)}</div>`:""}
            </div>
          </div>`}).filter(Boolean).join("");return r?`
      <div class="jtc-waste">
        <h4>Afvalophaling</h4>
        <div class="jtc-waste-row">${r}</div>
      </div>`:""}},Ot=`
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
  .jtc-waste-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; }
  .jtc-waste-chip {
    display: flex; align-items: center; gap: 10px;
    background: var(--juiced-surface-elevated, var(--secondary-background-color, rgba(0,0,0,.04)));
    border-radius: 12px; padding: 10px;
  }
  .jtc-waste-date {
    display: flex; flex-direction: column; align-items: center; justify-content: center; flex: none;
    width: 40px; height: 40px; border-radius: 10px;
    background: var(--juiced-surface-raised, var(--card-background-color, #fff));
    color: var(--juiced-brand-primary, var(--primary-color));
  }
  .jtc-waste-day { font-size: 15px; font-weight: 800; line-height: 1.1; }
  .jtc-waste-wd { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .3px; }
  .jtc-waste-text { min-width: 0; }
  .jtc-waste-name {
    font-size: 11.5px; font-weight: 700; color: var(--juiced-text-primary, var(--primary-text-color));
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jtc-waste-value { font-size: 10.5px; color: var(--juiced-text-muted, var(--secondary-text-color)); margin-top: 2px; }

  @media (max-width: 480px) { .jtc-energy { grid-template-columns: repeat(2, 1fr); } }
`;function de(){typeof customElements>"u"||(customElements.get("juiced-dashboard-today-card")||customElements.define("juiced-dashboard-today-card",W),typeof window<"u"&&(window.customCards=window.customCards||[],window.customCards.some(t=>t.type==="juiced-dashboard-today-card")||window.customCards.push({type:"juiced-dashboard-today-card",name:"Juiced Dashboard \u2014 Vandaag",description:"Weer, energie-KPI's en afvalophaling in \xE9\xE9n rustige kaart.",preview:!1,documentationURL:"https://github.com/ju1ced/juiced-dashboard"})))}var Jt=typeof HTMLElement>"u"?class{}:HTMLElement;function ue(t,e){return{type:"markdown",...e?{title:e}:{},content:t,grid_options:k}}var Me="Kamers",Nt="Tik een kamer om lichten, rolluiken, luifels, radio of airco direct te bedienen",y=4,k={columns:"full"};function Vt(t){return t?!!(t.weather_entity||t.battery_soc_entity||t.battery_charge_entity||t.battery_discharge_entity||t.solar_power_entity||t.home_consumption_entity||t.monthly_peak_entity||(t.waste_entities??[]).length>0):!1}function Bt(t){if(!(!t||t.length===0))return{type:"grid",column_span:y,cards:[{type:"custom:juiced-dashboard-quick-actions",actions:t,grid_options:k}]}}function Kt(t){return t?!!(t.alarm_entity||(t.cameras??[]).length>0):!1}function Pt(t,e){let i=[];if(Vt(t)&&i.push({type:"custom:juiced-dashboard-today-card",today:t}),Kt(e)&&i.push({type:"custom:juiced-dashboard-security-card",security:e}),i.length!==0)return i.length===1?{type:"grid",column_span:y,cards:[{...i[0],grid_options:k}]}:{type:"grid",column_span:y,cards:[{type:"grid",columns:2,square:!1,grid_options:k,cards:i}]}}function ze(t){return t.length===0?{type:"grid",column_span:y,cards:[ue("Voeg kamers toe via **Dashboard bewerken \u2192 instellingen**.",Me)]}:{type:"grid",column_span:y,cards:[{type:"custom:juiced-dashboard-room-card",title:Me,subtitle:Nt,rooms:t.map(q),grid_options:k}]}}function qt(t){let e=t?.person_entities??[];if(e.length)return e.map(i=>({type:"entity",entity:i,show_name:!0}))}function Ut(t){return t?[{type:"grid",column_span:y,cards:[{type:"custom:juiced-dashboard-room-detail-card",room:q(t),grid_options:k}]}]:[{type:"grid",column_span:y,cards:[ue("Deze kamerconfiguratie ontbreekt.","Kamer")]}]}function le(t,e){return[{type:"grid",column_span:y,cards:[ue(e,t)]}]}function Ie(t){let e;switch(t.view){case"home":e=[Pt(t.today,t.security),Bt(t.quick_actions),ze(t.rooms??[])].filter(r=>!!r);break;case"rooms":e=[ze(t.rooms??[])];break;case"room":e=Ut(t.room);break;case"energy":e=le("Energie","Energie-overzicht volgt in een volgende stap.");break;case"domains":e=le("Domeinen","Specialistische domeinen (Kia, tuin, robotstofzuiger, zwembad) volgen in een volgende stap.");break;default:e=le("Meer","Instellingen en geschiedenis volgen in een volgende stap.");break}let i=t.view==="home"?qt(t.general):void 0;return{type:"sections",max_columns:y,dense_section_placement:!0,sections:e,...i?{badges:i}:{}}}var Z=class extends Jt{static async generate(e){return Ie(e)}};function pe(){if(de(),ne(),ce(),se(),typeof customElements>"u")return;let t="ll-strategy-view-juiced-dashboard-view";customElements.get(t)||customElements.define(t,Z)}var Gt={buiten:"Buiten",gelijkvloers:"Gelijkvloers",boven:"Boven"},Ft=typeof HTMLElement>"u"?class{}:HTMLElement,me=[{key:"temperature_entity",label:"Temperatuursensor",domain:"sensor"},{key:"humidity_entity",label:"Vochtigheidssensor",domain:"sensor"},{key:"light_entities",label:"Lichten",domain:"light",multiple:!0},{key:"cover_entities",label:"Rolluiken",domain:"cover",multiple:!0},{key:"awning_entities",label:"Luifels",domain:"cover",multiple:!0},{key:"media_player_entity",label:"Mediaspeler",domain:"media_player"},{key:"climate_entity",label:"Klimaat",domain:"climate"}],Oe=0,Je=0,Ne=0,Ve=[{key:"weather_entity",label:"Weerbron",domain:"weather"},{key:"battery_soc_entity",label:"Thuisbatterij SoC",domain:"sensor"},{key:"battery_charge_entity",label:"Batterij laden",domain:"sensor"},{key:"battery_discharge_entity",label:"Batterij ontladen",domain:"sensor"},{key:"solar_power_entity",label:"Zonnepanelen opbrengst",domain:"sensor"},{key:"home_consumption_entity",label:"Huisverbruik",domain:"sensor"},{key:"monthly_peak_entity",label:"Maandelijkse vermogenspiek",domain:"sensor"}];function f(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}var Y=class extends Ft{_config;_hass=null;constructor(){super(),this.attachShadow({mode:"open"}),this._config=w(void 0),this._onInput=this._onInput.bind(this),this._onClick=this._onClick.bind(this),this._onSelectorChange=this._onSelectorChange.bind(this)}get root(){return this.shadowRoot}setConfig(e){this._config=w(e),this._render()}set hass(e){this._hass=e,this.root.querySelectorAll("ha-selector").forEach(i=>{i.hass=e})}get hass(){return this._hass}connectedCallback(){this.root.addEventListener("input",this._onInput),this.root.addEventListener("click",this._onClick),this.root.addEventListener("value-changed",this._onSelectorChange)}disconnectedCallback(){this.root.removeEventListener("input",this._onInput),this.root.removeEventListener("click",this._onClick),this.root.removeEventListener("value-changed",this._onSelectorChange)}_emit(){this.dispatchEvent(new CustomEvent("config-changed",{bubbles:!0,composed:!0,detail:{config:this._config}}))}_updateGeneral(e,i){this._config={...this._config,general:{...this._config.general,[e]:i}},this._emit()}_updateRoom(e,i){this._config={...this._config,rooms:this._config.rooms.map(r=>r.key===e?{...r,...i}:r)},this._emit()}_addRoom(){Oe+=1;let e={key:`room-${Date.now().toString(36)}-${Oe}`,name:"Nieuwe kamer",light_entities:[],cover_entities:[],awning_entities:[]};this._config={...this._config,rooms:[...this._config.rooms,e]},this._emit(),this._render()}_removeRoom(e){this._config={...this._config,rooms:this._config.rooms.filter(i=>i.key!==e)},this._emit(),this._render()}_updateToday(e){this._config={...this._config,today:{...this._config.today,...e}},this._emit()}_updateAction(e,i){this._config={...this._config,quick_actions:this._config.quick_actions.map(r=>r.key===e?{...r,...i}:r)},this._emit()}_addAction(){Je+=1;let e={key:`action-${Date.now().toString(36)}-${Je}`,label:"Nieuwe actie",entity:"",service:"toggle"};this._config={...this._config,quick_actions:[...this._config.quick_actions,e]},this._emit(),this._render()}_removeAction(e){this._config={...this._config,quick_actions:this._config.quick_actions.filter(i=>i.key!==e)},this._emit(),this._render()}_updateSecurity(e){this._config={...this._config,security:{...this._config.security,...e}},this._emit()}_updateCamera(e,i){this._config={...this._config,security:{...this._config.security,cameras:this._config.security.cameras.map(r=>r.key===e?{...r,...i}:r)}},this._emit()}_addCamera(){Ne+=1;let e={key:`camera-${Date.now().toString(36)}-${Ne}`,name:"Nieuwe camera",camera_entity:""};this._config={...this._config,security:{...this._config.security,cameras:[...this._config.security.cameras,e]}},this._emit(),this._render()}_removeCamera(e){this._config={...this._config,security:{...this._config.security,cameras:this._config.security.cameras.filter(i=>i.key!==e)}},this._emit(),this._render()}_onInput(e){let i=e.target;if(!i)return;let r=i.dataset.field;if(!r)return;if(i.dataset.scope==="general"){r==="title"&&this._updateGeneral("title",i.value),r==="start_view"&&this._updateGeneral("start_view",i.value),r==="theme_mode"&&this._updateGeneral("theme_mode",i.value);return}if(i.dataset.scope==="action"){let a=i.dataset.actionKey;if(!a)return;r==="label"&&this._updateAction(a,{label:i.value}),r==="icon"&&this._updateAction(a,{icon:i.value||void 0}),r==="service"&&this._updateAction(a,{service:i.value});return}if(i.dataset.scope==="camera"){let a=i.dataset.cameraKey;if(!a)return;r==="name"&&this._updateCamera(a,{name:i.value}),r==="privacy_service"&&this._updateCamera(a,{privacy_service:i.value||void 0});return}let o=i.dataset.room;o&&(r==="name"&&this._updateRoom(o,{name:i.value}),r==="icon"&&this._updateRoom(o,{icon:i.value||void 0}),r==="zone"&&this._updateRoom(o,{zone:i.value||void 0}))}_onSelectorChange(e){let i=e.target;if(!i||i.tagName.toLowerCase()!=="ha-selector")return;e.stopPropagation();let r=i.dataset.field,o=i.dataset.scope;if(!r)return;if(o==="general"){if(r==="person_entities"){let c=Array.isArray(e.detail?.value)?e.detail.value.filter(l=>typeof l=="string"):[];this._updateGeneral("person_entities",c)}return}if(o==="today"){if(r==="waste_entities"){let l=Array.isArray(e.detail?.value)?e.detail.value.filter(m=>typeof m=="string"):[];this._updateToday({waste_entities:l});return}let c=typeof e.detail?.value=="string"?e.detail.value:void 0;this._updateToday({[r]:c});return}if(o==="action"){let c=i.dataset.actionKey;if(!c)return;let l=typeof e.detail?.value=="string"?e.detail.value:"";this._updateAction(c,{entity:l});return}if(o==="security"){let c=typeof e.detail?.value=="string"?e.detail.value:void 0;this._updateSecurity({alarm_entity:c});return}if(o==="camera"){let c=i.dataset.cameraKey;if(!c)return;let l=typeof e.detail?.value=="string"?e.detail.value:void 0;r==="camera_entity"&&this._updateCamera(c,{camera_entity:l??""}),r==="privacy_entity"&&this._updateCamera(c,{privacy_entity:l});return}let a=i.dataset.room;if(!a)return;if(me.find(c=>c.key===r)?.multiple){let c=Array.isArray(e.detail?.value)?e.detail.value.filter(l=>typeof l=="string"):[];this._updateRoom(a,{[r]:c});return}let d=typeof e.detail?.value=="string"?e.detail.value:void 0;this._updateRoom(a,{[r]:d})}_onClick(e){let i=e.target?.closest("[data-action]");i&&(i.dataset.action==="add-room"&&this._addRoom(),i.dataset.action==="remove-room"&&i.dataset.room&&this._removeRoom(i.dataset.room),i.dataset.action==="add-action"&&this._addAction(),i.dataset.action==="remove-action"&&i.dataset.actionKey&&this._removeAction(i.dataset.actionKey),i.dataset.action==="add-camera"&&this._addCamera(),i.dataset.action==="remove-camera"&&i.dataset.cameraKey&&this._removeCamera(i.dataset.cameraKey))}_render(){let e=this._config;this.root.innerHTML=`
      <style>${Qt}</style>
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
        <label>Bewoners (tonen als badges op Home)
          <ha-selector data-scope="general" data-field="person_entities"></ha-selector>
        </label>
      </div>

      <div class="jde-section">
        <h3>Vandaag</h3>
        ${Ve.map(i=>`
          <label>${f(i.label)}
            <ha-selector data-scope="today" data-field="${i.key}"></ha-selector>
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
        ${e.security.cameras.length===0?`<p class="jde-empty">Nog geen camera's geconfigureerd.</p>`:e.security.cameras.map(i=>this._cameraHtml(i)).join("")}
      </div>

      <div class="jde-section">
        <div class="jde-section-head">
          <h3>Snelacties</h3>
          <button type="button" data-action="add-action">+ Actie toevoegen</button>
        </div>
        ${e.quick_actions.length===0?'<p class="jde-empty">Nog geen snelacties geconfigureerd.</p>':e.quick_actions.map(i=>this._actionHtml(i)).join("")}
      </div>

      <div class="jde-section">
        <div class="jde-section-head">
          <h3>Kamers</h3>
          <button type="button" data-action="add-room">+ Kamer toevoegen</button>
        </div>
        ${e.rooms.length===0?'<p class="jde-empty">Nog geen kamers geconfigureerd.</p>':e.rooms.map(i=>this._roomHtml(i)).join("")}
      </div>`,this.root.querySelectorAll("ha-selector").forEach(i=>{let r=i,o=r.dataset.scope,a=r.dataset.field;if(!a)return;if(o==="general"){a==="person_entities"&&(r.selector={entity:{domain:"person",multiple:!0}},r.value=e.general.person_entities??[],this._hass&&(r.hass=this._hass));return}if(o==="today"){if(a==="waste_entities")r.selector={entity:{multiple:!0}},r.value=e.today.waste_entities??[];else{let l=Ve.find(m=>m.key===a);r.selector={entity:l?.domain?{domain:l.domain}:{}},r.value=e.today[a]??""}this._hass&&(r.hass=this._hass);return}if(o==="action"){let l=r.dataset.actionKey,m=e.quick_actions.find(_=>_.key===l);if(!m)return;r.selector={entity:{}},r.value=m.entity??"",this._hass&&(r.hass=this._hass);return}if(o==="security"){r.selector={entity:{domain:"alarm_control_panel"}},r.value=e.security.alarm_entity??"",this._hass&&(r.hass=this._hass);return}if(o==="camera"){let l=r.dataset.cameraKey,m=e.security.cameras.find(_=>_.key===l);if(!m)return;a==="camera_entity"?(r.selector={entity:{domain:"camera"}},r.value=m.camera_entity??""):(r.selector={entity:{}},r.value=m.privacy_entity??""),this._hass&&(r.hass=this._hass);return}let n=r.dataset.room;if(!n)return;let d=e.rooms.find(l=>l.key===n),c=me.find(l=>l.key===a);!d||!c||(c.multiple?(r.selector={entity:{multiple:!0,...c.domain?{domain:c.domain}:{}}},r.value=d[c.key]??[]):(r.selector={entity:c.domain?{domain:c.domain}:{}},r.value=d[c.key]??""),this._hass&&(r.hass=this._hass))})}_actionHtml(e){return`
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
        <label>Zone
          <select data-room="${e.key}" data-field="zone">
            <option value="" ${e.zone?"":"selected"}>Geen</option>
            ${$.map(i=>`<option value="${i}" ${e.zone===i?"selected":""}>${f(Gt[i])}</option>`).join("")}
          </select>
        </label>
        ${me.map(i=>`
          <label>${f(i.label)}
            <ha-selector data-room="${e.key}" data-field="${i.key}"></ha-selector>
          </label>`).join("")}
      </div>`}},Qt=`
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
`;function ge(){typeof customElements>"u"||customElements.get("juiced-dashboard-strategy-editor")||customElements.define("juiced-dashboard-strategy-editor",Y)}var Be=Object.freeze({name:"Juiced Dashboard",version:"0.1.0"});typeof window<"u"&&(ee(),ge(),pe(),ae(),window.__JUICED_DASHBOARD_BUILD__=Be,console.info("%c JUICED DASHBOARD %c "+Be.version,"color: #081018; background: #5cc8ff; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;","color: #5cc8ff; background: #0f1115; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;"));export{L as CONFIG_SCHEMA_VERSION,Ce as DEFAULT_CLIMATE_TARGET,G as JuicedDashboardQuickActions,H as JuicedDashboardRoomCard,F as JuicedDashboardRoomDetailCard,Q as JuicedDashboardSecurityCard,U as JuicedDashboardStrategy,Y as JuicedDashboardStrategyEditor,W as JuicedDashboardTodayCard,Z as JuicedDashboardViewStrategy,$ as ROOM_ZONES,ie as START_VIEWS,re as THEME_MODES,te as VIEW_PATHS,Be as buildInfo,Ie as buildView,I as closeCover,je as collectEntityIds,w as compileConfig,q as compileRoomForCard,be as coverPosition,xe as coverPositionLabel,oe as createDefaultConfig,He as daysUntil,S as displayName,u as entityState,s as escapeHtml,v as formatNumber,h as formatTemp,we as hasRelevantChange,ve as humanize,E as hvacModeLabel,g as isUnavailable,z as openCover,Te as parseWasteDate,ge as registerJuicedDashboardEditor,ne as registerJuicedDashboardQuickActions,ee as registerJuicedDashboardRoomCard,se as registerJuicedDashboardRoomDetailCard,ce as registerJuicedDashboardSecurityCard,ae as registerJuicedDashboardStrategy,de as registerJuicedDashboardTodayCard,pe as registerJuicedDashboardViewStrategy,De as relativeWasteLabel,_e as roomEntityIds,ke as roomFlag,Ue as roomHasControls,R as roomIconSvg,D as roomLightsOn,Le as roomPath,P as roomSectionClimate,j as roomSectionCovers,B as roomSectionLights,K as roomSectionMedia,X as roomStatLine,J as setHvacMode,N as stepClimateTarget,O as stopCover,M as toggleLight,V as toggleMediaPlayPause};
