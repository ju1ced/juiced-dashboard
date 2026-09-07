/*! Juiced Dashboard 0.1.0 | MIT License | https://github.com/ju1ced/juiced-dashboard */
function a(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}var F=new Set(["unavailable","unknown"]);function f(t){return t==null||F.has(t)}function l(t,e){return!e||!t?null:t.states?.[e]||null}function w(t,e){let r=Number(t);return Number.isFinite(r)?r.toFixed(e??1).replace(".",","):null}function v(t,e){let r=w(t,e);return r===null?null:`${r}\xB0`}var W={off:"Uit",heat:"Verwarmen",cool:"Koelen",heat_cool:"Auto",auto:"Auto",fan_only:"Ventilator",dry:"Droog"};function L(t){let e=String(t??"").replace(/_/g," ");return e?e.charAt(0).toUpperCase()+e.slice(1):""}function x(t){return t&&(W[t]||L(t))||"Onbekend"}function $(t){if(!t)return null;let e=t.attributes?.current_position;return typeof e=="number"&&Number.isFinite(e)?Math.round(e):t.state==="open"?100:t.state==="closed"?0:null}function A(t){let e=$(t);return e===null?"\u2014":`${e}%`}function m(t,e,r){if(t)return t;let o=e?.attributes?.friendly_name;return typeof o=="string"&&o?o:r||""}function H(t){let e=[],r=o=>{typeof o=="string"&&o.includes(".")&&e.push(o)};return r(t?.temperature),r(t?.humidity),r(t?.media_player),r(t?.climate),(t?.lights||[]).forEach(o=>r(o?.entity)),(t?.covers||[]).forEach(o=>r(o?.entity)),(t?.awnings||[]).forEach(o=>r(o?.entity)),e}function D(t){let e=new Set;return(t?.rooms||[]).forEach(r=>{H(r).forEach(o=>e.add(o))}),[...e]}function I(t,e,r){if(!t||!e)return!0;let o=t.states||{},i=e.states||{};for(let n of r){let c=o[n],s=i[n];if(!c||!s){if(c!==s)return!0;continue}if(c.state!==s.state||c.last_updated!==s.last_updated)return!0}return!1}function y(t,e){let r=[],o=l(t,e?.temperature);if(o&&!f(o.state)){let n=v(o.state,1);n&&r.push(n)}let i=l(t,e?.humidity);if(i&&!f(i.state)){let n=w(i.state,0);n&&r.push(`${n}%`)}return r.length?r.join(" \xB7 "):e?.idle_text||"Rustig"}function S(t,e){return(e?.lights||[]).filter(r=>l(t,r?.entity)?.state==="on").length}function B(t,e){let r=S(t,e);return r<=0?null:r===1?"1 lamp aan":`${r} lampen aan`}function q(t){return!!((t?.lights||[]).length||(t?.covers||[]).length||(t?.awnings||[]).length||t?.media_player||t?.climate)}function p(t,e,r,o,i){!t||!o||t.callService(e,r,{entity_id:o,...i||{}})}function M(t,e){p(t,"light","toggle",e)}function O(t,e){p(t,"cover","open_cover",e)}function N(t,e){p(t,"cover","close_cover",e)}function z(t,e){p(t,"cover","stop_cover",e)}function T(t,e,r){p(t,"climate","set_hvac_mode",e,{hvac_mode:r})}var J=20;function U(t,e,r,o){let n=r!==""&&r!==null&&r!==void 0?Number(r):NaN,c=Number.isFinite(n)?n:J,s=Math.round((c+o)*10)/10;p(t,"climate","set_temperature",e,{temperature:s})}function P(t,e){p(t,"media_player","media_play_pause",e)}var G=typeof HTMLElement>"u"?class{}:HTMLElement,h=class extends G{_config=null;_hass=null;_entityIds=[];_openRoomIndex=null;_built=!1;constructor(){super(),this.attachShadow({mode:"open"}),this._onClick=this._onClick.bind(this),this._onKeydown=this._onKeydown.bind(this),this._onDocKeydown=this._onDocKeydown.bind(this)}get root(){return this.shadowRoot}static getStubConfig(){return{type:"custom:juiced-dashboard-room-card",title:"Kamers",subtitle:"Tik een kamer om lichten, rolluiken, luifels, radio of airco direct te bedienen",rooms:[{name:"Bureau",icon:"mdi:desk",temperature:"sensor.bureau_temperature",humidity:"sensor.bureau_humidity",lights:[{entity:"light.bureau_spellenruimte",name:"Bureau & spellenruimte"},{entity:"light.bureau_spellentafel",name:"Spellentafel"}],awnings:[{entity:"cover.luifel_bureau",name:"Luifel bureau"}],media_player:"media_player.kantoor",climate:"climate.daikin_bureau"}]}}setConfig(e){if(!e||typeof e!="object")throw new Error("juiced-dashboard-room-card: invalid configuration.");if(!Array.isArray(e.rooms))throw new Error("juiced-dashboard-room-card: `rooms` must be a list.");e.rooms.forEach((r,o)=>{if(!r||typeof r!="object")throw new Error(`juiced-dashboard-room-card: room at index ${o} must be an object.`);if(!r.name)throw new Error(`juiced-dashboard-room-card: room at index ${o} is missing \`name\`.`)}),this._config=e,this._entityIds=D(e),this._openRoomIndex=null,this._built=!1,this._renderShell(),this._renderList(),this._built=!0}set hass(e){let r=this._hass;this._hass=e,this._config&&(this._built&&r&&!I(r,e,this._entityIds)||(this._renderList(),this._openRoomIndex!==null&&this._renderPopup()))}get hass(){return this._hass}getCardSize(){return 1+Math.ceil((this._config?.rooms?.length||0)/2)}connectedCallback(){this.root.addEventListener("click",this._onClick),this.root.addEventListener("keydown",this._onKeydown)}disconnectedCallback(){this.root.removeEventListener("click",this._onClick),this.root.removeEventListener("keydown",this._onKeydown),typeof document<"u"&&document.removeEventListener("keydown",this._onDocKeydown)}_renderShell(){let e=this._config||{};this.root.innerHTML=`
      <style>${ne}</style>
      <ha-card class="jrc-shell">
        ${e.title||e.subtitle?`<div class="jrc-head">
                ${e.title?`<h2 class="jrc-title">${a(e.title)}</h2>`:""}
                ${e.subtitle?`<p class="jrc-subtitle">${a(e.subtitle)}</p>`:""}
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
            <button class="jrc-close" data-action="close" aria-label="Sluiten">${Q}</button>
          </div>
          <div class="jrc-popup-body" id="popup-body"></div>
        </div>
      </div>`}_renderList(){let e=this.root.getElementById("list");if(!e)return;let r=this._hass,o=this._config?.rooms||[];e.innerHTML=o.map((i,n)=>this._roomRowHtml(i,n,r)).join("")}_roomRowHtml(e,r,o){let i=y(o,e),n=B(o,e),c=(e.lights||[])[0],s=c?l(o,c.entity)?.state==="on":!1;return`
      <div class="jrc-row" role="button" tabindex="0" data-action="open-room" data-room="${r}">
        <span class="jrc-row-ic">${j(e.icon)}</span>
        <span class="jrc-row-text">
          <span class="jrc-row-name">${a(e.name)}</span>
          <span class="jrc-row-stat">${a(i)}</span>
        </span>
        ${n?`<span class="jrc-flag">${a(n)}</span>`:""}
        ${c?`<button class="jrc-quick${s?" on":""}" data-action="toggle-light"
                 data-entity="${a(c.entity)}"
                 aria-label="Licht ${a(e.name)} omschakelen" title="Licht omschakelen">${R}</button>`:`<span class="jrc-chev">${Y}</span>`}
      </div>`}_openRoom(e){if(!(this._config?.rooms||[])[e])return;this._openRoomIndex=e,this._renderPopup(),this.root.getElementById("backdrop")?.classList.add("show"),typeof document<"u"&&document.addEventListener("keydown",this._onDocKeydown)}_closePopup(){this._openRoomIndex=null,this.root.getElementById("backdrop")?.classList.remove("show"),typeof document<"u"&&document.removeEventListener("keydown",this._onDocKeydown)}_renderPopup(){let e=(this._config?.rooms||[])[this._openRoomIndex];if(!e)return;let r=this._hass,o=this.root.getElementById("popup-icon");o&&(o.innerHTML=j(e.icon));let i=this.root.getElementById("popup-name");i&&(i.textContent=e.name);let n=this.root.getElementById("popup-sub");n&&(n.textContent=y(r,e));let c=[this._sectionLights(r,e),this._sectionCovers(r,e,"covers","Rolluiken"),this._sectionCovers(r,e,"awnings","Luifels"),this._sectionMedia(r,e),this._sectionClimate(r,e)].filter(Boolean).join(""),s=this.root.getElementById("popup-body");s&&(s.innerHTML=c||'<p class="jrc-empty">Geen snelbediening geconfigureerd voor deze kamer.</p>')}_sectionLights(e,r){let o=r.lights||[];return o.length?`<div class="jrc-section"><h4>Verlichting</h4>${o.map(n=>{let c=l(e,n.entity),s=c?.state==="on",u=m(n.name,c,n.entity),d=f(c?.state);return`
          <div class="jrc-lightrow${s?" on":""}">
            <span class="jrc-lrow-ic">${R}</span>
            <span class="jrc-lrow-text">
              <span class="jrc-lrow-name">${a(u)}</span>
              <span class="jrc-lrow-sub">${d?"Niet beschikbaar":s?"Aan":"Uit"}</span>
            </span>
            <button class="jrc-toggle${s?" on":""}" data-action="toggle-light"
              data-entity="${a(n.entity)}" ${d?"disabled":""}
              aria-label="${a(u)} omschakelen"><i></i></button>
          </div>`}).join("")}</div>`:""}_sectionCovers(e,r,o,i){let n=r[o]||[];if(!n.length)return"";let c=n.map(s=>{let u=l(e,s.entity),d=m(s.name,u,s.entity);return`
          <div class="jrc-coverrow">
            <span class="jrc-cr-name">${a(d)}</span>
            <span class="jrc-cr-pos">${A(u)}</span>
            <span class="jrc-cr-btns">
              <button data-action="cover-open" data-entity="${a(s.entity)}" aria-label="Omhoog">${X}</button>
              <button data-action="cover-stop" data-entity="${a(s.entity)}" aria-label="Stop">${ee}</button>
              <button data-action="cover-close" data-entity="${a(s.entity)}" aria-label="Omlaag">${Z}</button>
            </span>
          </div>`}).join("");return`<div class="jrc-section"><h4>${a(i)}</h4>${c}</div>`}_sectionMedia(e,r){if(!r.media_player)return"";let o=l(e,r.media_player),i=m(null,o,r.media_player),n=o?.attributes?.media_title,c=typeof n=="string"&&n?n:f(o?.state)?"Niet beschikbaar":"Uit",s=o?.state==="playing";return`
      <div class="jrc-section">
        <h4>Media</h4>
        <div class="jrc-media">
          <span class="jrc-media-ic">${te}</span>
          <span class="jrc-media-text">
            <span class="jrc-media-name">${a(i)}</span>
            <span class="jrc-media-sub">${a(c)}</span>
          </span>
          <button class="jrc-media-btn${s?" on":""}" data-action="media-toggle"
            data-entity="${a(r.media_player)}" aria-label="Afspelen/pauzeren">${re}</button>
        </div>
      </div>`}_sectionClimate(e,r){if(!r.climate)return"";let o=l(e,r.climate),i=m(null,o,r.climate),n=o?.attributes?.hvac_modes,c=Array.isArray(n)?n.filter(g=>typeof g=="string"):[],s=o?.state,u=v(o?.attributes?.current_temperature,1),d=o?.attributes?.temperature,V=v(d,1)||"\u2014",b=Number(o?.attributes?.target_temp_step),k=Number.isFinite(b)&&b>0?b:.5,C=c.map(g=>`
        <button class="jrc-pill${g===s?" on":""}" data-action="climate-mode"
          data-entity="${a(r.climate)}" data-mode="${a(g)}">${a(x(g))}</button>`).join(""),E=typeof d=="string"||typeof d=="number"?String(d):"";return`
      <div class="jrc-section">
        <h4>Klimaat</h4>
        <div class="jrc-kv"><span>${a(i)}</span><span class="ok">${a(x(s))}</span></div>
        ${C?`<div class="jrc-pillrow">${C}</div>`:""}
        <div class="jrc-stepper">
          <button data-action="climate-step" data-entity="${a(r.climate)}"
            data-target="${E}" data-step="${-k}" aria-label="Kouder">\u2212</button>
          <div class="jrc-stepper-mid">
            <div class="v">${a(V)}</div>
            <div class="l">doel${u?` \xB7 nu ${a(u)}`:""}</div>
          </div>
          <button data-action="climate-step" data-entity="${a(r.climate)}"
            data-target="${E}" data-step="${k}" aria-label="Warmer">+</button>
        </div>
      </div>`}_onClick(e){let o=e.target?.closest("[data-action]");if(!o)return;let i=o.dataset.action,n=this._hass;if(i==="open-room"){this._openRoom(Number(o.dataset.room));return}if(i==="close"||i==="close-backdrop"){if(i==="close-backdrop"&&e.target!==o)return;this._closePopup();return}if(i==="toggle-light"){e.stopPropagation(),M(n,o.dataset.entity);return}if(i==="cover-open"){O(n,o.dataset.entity);return}if(i==="cover-close"){N(n,o.dataset.entity);return}if(i==="cover-stop"){z(n,o.dataset.entity);return}if(i==="media-toggle"){P(n,o.dataset.entity);return}if(i==="climate-mode"){T(n,o.dataset.entity,o.dataset.mode);return}if(i==="climate-step"){U(n,o.dataset.entity,o.dataset.target,Number(o.dataset.step));return}}_onKeydown(e){if(e.key!=="Enter"&&e.key!==" ")return;let o=e.target?.closest('[data-action="open-room"]');o&&(e.preventDefault(),this._openRoom(Number(o.dataset.room)))}_onDocKeydown(e){e.key==="Escape"&&this._closePopup()}},R='<svg viewBox="0 0 24 24" width="16" height="16"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.4 10.9c.5.5.9 1.2 1 2h4.8c.1-.8.5-1.5 1-2A6 6 0 0 0 12 3z"/></g></svg>',Y='<svg viewBox="0 0 24 24" width="15" height="15"><polyline points="9 6 15 12 9 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',Q='<svg viewBox="0 0 24 24" width="15" height="15"><g stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></g></svg>',X='<svg viewBox="0 0 24 24" width="14" height="14"><polyline points="6 15 12 9 18 15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',Z='<svg viewBox="0 0 24 24" width="14" height="14"><polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',ee='<svg viewBox="0 0 24 24" width="14" height="14"><rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor"/></svg>',te='<svg viewBox="0 0 24 24" width="18" height="18"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="3"/><circle cx="12" cy="8.2" r="2.4"/><circle cx="12" cy="16.5" r="1.1"/></g></svg>',re='<svg viewBox="0 0 24 24" width="13" height="13"><polygon points="6 4 20 12 6 20" fill="currentColor"/></svg>',oe='<svg viewBox="0 0 24 24" width="17" height="17"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/></g></svg>';function j(t){return typeof t=="string"&&t.startsWith("mdi:")?`<ha-icon icon="${a(t)}"></ha-icon>`:oe}var ne=`
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
`;function _(){typeof customElements<"u"&&(customElements.get("juiced-dashboard-room-card")||customElements.define("juiced-dashboard-room-card",h)),typeof window<"u"&&(window.customCards=window.customCards||[],window.customCards.some(t=>t.type==="juiced-dashboard-room-card")||window.customCards.push({type:"juiced-dashboard-room-card",name:"Juiced Dashboard Room Card",description:"Tik een kamer, krijg een popup met enkel wat daar bedienbaar is \u2014 lichten, rolluiken, luifels, radio, airco.",preview:!1,documentationURL:"https://github.com/ju1ced/juiced-dashboard"}))}var K=Object.freeze({name:"Juiced Dashboard",version:"0.1.0"});typeof window<"u"&&(_(),window.__JUICED_DASHBOARD_BUILD__=K,console.info("%c JUICED DASHBOARD %c "+K.version,"color: #081018; background: #5cc8ff; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;","color: #5cc8ff; background: #0f1115; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;"));export{J as DEFAULT_CLIMATE_TARGET,h as JuicedDashboardRoomCard,K as buildInfo,N as closeCover,D as collectEntityIds,$ as coverPosition,A as coverPositionLabel,m as displayName,l as entityState,a as escapeHtml,w as formatNumber,v as formatTemp,I as hasRelevantChange,L as humanize,x as hvacModeLabel,f as isUnavailable,O as openCover,_ as registerJuicedDashboardRoomCard,H as roomEntityIds,B as roomFlag,q as roomHasControls,j as roomIconSvg,S as roomLightsOn,y as roomStatLine,T as setHvacMode,U as stepClimateTarget,z as stopCover,M as toggleLight,P as toggleMediaPlayPause};
