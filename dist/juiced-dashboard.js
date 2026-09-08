/*! Juiced Dashboard 0.1.0 | MIT License | https://github.com/ju1ced/juiced-dashboard */
function s(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}var ve=new Set(["unavailable","unknown"]);function v(t){return t==null||ve.has(t)}function u(t,e){return!e||!t?null:t.states?.[e]||null}function H(t,e){let o=Number(t);return Number.isFinite(o)?o.toFixed(e??1).replace(".",","):null}function b(t,e){let o=H(t,e);return o===null?null:`${o}\xB0`}var ye={off:"Uit",heat:"Verwarmen",cool:"Koelen",heat_cool:"Auto",auto:"Auto",fan_only:"Ventilator",dry:"Droog"};function F(t){let e=String(t??"").replace(/_/g," ");return e?e.charAt(0).toUpperCase()+e.slice(1):""}function R(t){return t&&(ye[t]||F(t))||"Onbekend"}function G(t){if(!t)return null;let e=t.attributes?.current_position;return typeof e=="number"&&Number.isFinite(e)?Math.round(e):t.state==="open"?100:t.state==="closed"?0:null}function W(t){let e=G(t);return e===null?"\u2014":`${e}%`}function h(t,e,o){if(t)return t;let r=e?.attributes?.friendly_name;return typeof r=="string"&&r?r:o||""}function q(t){let e=[],o=r=>{typeof r=="string"&&r.includes(".")&&e.push(r)};return o(t?.temperature),o(t?.humidity),o(t?.media_player),o(t?.climate),(t?.lights||[]).forEach(r=>o(r?.entity)),(t?.covers||[]).forEach(r=>o(r?.entity)),(t?.awnings||[]).forEach(r=>o(r?.entity)),e}function Y(t){let e=new Set;return(t?.rooms||[]).forEach(o=>{q(o).forEach(r=>e.add(r))}),[...e]}function Q(t,e,o){if(!t||!e)return!0;let r=t.states||{},i=e.states||{};for(let n of o){let d=r[n],a=i[n];if(!d||!a){if(d!==a)return!0;continue}if(d.state!==a.state||d.last_updated!==a.last_updated)return!0}return!1}function L(t,e){let o=[],r=u(t,e?.temperature);if(r&&!v(r.state)){let n=b(r.state,1);n&&o.push(n)}let i=u(t,e?.humidity);if(i&&!v(i.state)){let n=H(i.state,0);n&&o.push(`${n}%`)}return o.length?o.join(" \xB7 "):e?.idle_text||"Rustig"}function X(t,e){return(e?.lights||[]).filter(o=>u(t,o?.entity)?.state==="on").length}function Z(t,e){let o=X(t,e);return o<=0?null:o===1?"1 lamp aan":`${o} lampen aan`}function be(t){return!!((t?.lights||[]).length||(t?.covers||[]).length||(t?.awnings||[]).length||t?.media_player||t?.climate)}function m(t,e,o,r,i){!t||!r||t.callService(e,o,{entity_id:r,...i||{}})}function ee(t,e){m(t,"light","toggle",e)}function te(t,e){m(t,"cover","open_cover",e)}function oe(t,e){m(t,"cover","close_cover",e)}function re(t,e){m(t,"cover","stop_cover",e)}function ie(t,e,o){m(t,"climate","set_hvac_mode",e,{hvac_mode:o})}var ne=20;function ae(t,e,o,r){let n=o!==""&&o!==null&&o!==void 0?Number(o):NaN,d=Number.isFinite(n)?n:ne,a=Math.round((d+r)*10)/10;m(t,"climate","set_temperature",e,{temperature:a})}function se(t,e){m(t,"media_player","media_play_pause",e)}var xe=typeof HTMLElement>"u"?class{}:HTMLElement,x=class extends xe{_config=null;_hass=null;_entityIds=[];_openRoomIndex=null;_built=!1;constructor(){super(),this.attachShadow({mode:"open"}),this._onClick=this._onClick.bind(this),this._onKeydown=this._onKeydown.bind(this),this._onDocKeydown=this._onDocKeydown.bind(this)}get root(){return this.shadowRoot}static getStubConfig(){return{type:"custom:juiced-dashboard-room-card",title:"Kamers",subtitle:"Tik een kamer om lichten, rolluiken, luifels, radio of airco direct te bedienen",rooms:[{name:"Bureau",icon:"mdi:desk",temperature:"sensor.bureau_temperature",humidity:"sensor.bureau_humidity",lights:[{entity:"light.bureau_spellenruimte",name:"Bureau & spellenruimte"},{entity:"light.bureau_spellentafel",name:"Spellentafel"}],awnings:[{entity:"cover.luifel_bureau",name:"Luifel bureau"}],media_player:"media_player.kantoor",climate:"climate.daikin_bureau"}]}}setConfig(e){if(!e||typeof e!="object")throw new Error("juiced-dashboard-room-card: invalid configuration.");if(!Array.isArray(e.rooms))throw new Error("juiced-dashboard-room-card: `rooms` must be a list.");e.rooms.forEach((o,r)=>{if(!o||typeof o!="object")throw new Error(`juiced-dashboard-room-card: room at index ${r} must be an object.`);if(!o.name)throw new Error(`juiced-dashboard-room-card: room at index ${r} is missing \`name\`.`)}),this._config=e,this._entityIds=Y(e),this._openRoomIndex=null,this._built=!1,this._renderShell(),this._renderList(),this._built=!0}set hass(e){let o=this._hass;this._hass=e,this._config&&(this._built&&o&&!Q(o,e,this._entityIds)||(this._renderList(),this._openRoomIndex!==null&&this._renderPopup()))}get hass(){return this._hass}getCardSize(){return 1+Math.ceil((this._config?.rooms?.length||0)/2)}connectedCallback(){this.root.addEventListener("click",this._onClick),this.root.addEventListener("keydown",this._onKeydown)}disconnectedCallback(){this.root.removeEventListener("click",this._onClick),this.root.removeEventListener("keydown",this._onKeydown),typeof document<"u"&&document.removeEventListener("keydown",this._onDocKeydown)}_renderShell(){let e=this._config||{};this.root.innerHTML=`
      <style>${Se}</style>
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
            <button class="jrc-close" data-action="close" aria-label="Sluiten">${we}</button>
          </div>
          <div class="jrc-popup-body" id="popup-body"></div>
        </div>
      </div>`}_renderList(){let e=this.root.getElementById("list");if(!e)return;let o=this._hass,r=this._config?.rooms||[];e.innerHTML=r.map((i,n)=>this._roomRowHtml(i,n,o)).join("")}_roomRowHtml(e,o,r){let i=L(r,e),n=Z(r,e),d=(e.lights||[])[0],a=d?u(r,d.entity)?.state==="on":!1;return`
      <div class="jrc-row" role="button" tabindex="0" data-action="open-room" data-room="${o}">
        <span class="jrc-row-ic">${S(e.icon)}</span>
        <span class="jrc-row-text">
          <span class="jrc-row-name">${s(e.name)}</span>
          <span class="jrc-row-stat">${s(i)}</span>
        </span>
        ${n?`<span class="jrc-flag">${s(n)}</span>`:""}
        ${d?`<button class="jrc-quick${a?" on":""}" data-action="toggle-light"
                 data-entity="${s(d.entity)}"
                 aria-label="Licht ${s(e.name)} omschakelen" title="Licht omschakelen">${U}</button>`:`<span class="jrc-chev">${_e}</span>`}
      </div>`}_openRoom(e){if(!(this._config?.rooms||[])[e])return;this._openRoomIndex=e,this._renderPopup(),this.root.getElementById("backdrop")?.classList.add("show"),typeof document<"u"&&document.addEventListener("keydown",this._onDocKeydown)}_closePopup(){this._openRoomIndex=null,this.root.getElementById("backdrop")?.classList.remove("show"),typeof document<"u"&&document.removeEventListener("keydown",this._onDocKeydown)}_renderPopup(){let e=(this._config?.rooms||[])[this._openRoomIndex];if(!e)return;let o=this._hass,r=this.root.getElementById("popup-icon");r&&(r.innerHTML=S(e.icon));let i=this.root.getElementById("popup-name");i&&(i.textContent=e.name);let n=this.root.getElementById("popup-sub");n&&(n.textContent=L(o,e));let d=[this._sectionLights(o,e),this._sectionCovers(o,e,"covers","Rolluiken"),this._sectionCovers(o,e,"awnings","Luifels"),this._sectionMedia(o,e),this._sectionClimate(o,e)].filter(Boolean).join(""),a=this.root.getElementById("popup-body");a&&(a.innerHTML=d||'<p class="jrc-empty">Geen snelbediening geconfigureerd voor deze kamer.</p>')}_sectionLights(e,o){let r=o.lights||[];return r.length?`<div class="jrc-section"><h4>Verlichting</h4>${r.map(n=>{let d=u(e,n.entity),a=d?.state==="on",c=h(n.name,d,n.entity),l=v(d?.state);return`
          <div class="jrc-lightrow${a?" on":""}">
            <span class="jrc-lrow-ic">${U}</span>
            <span class="jrc-lrow-text">
              <span class="jrc-lrow-name">${s(c)}</span>
              <span class="jrc-lrow-sub">${l?"Niet beschikbaar":a?"Aan":"Uit"}</span>
            </span>
            <button class="jrc-toggle${a?" on":""}" data-action="toggle-light"
              data-entity="${s(n.entity)}" ${l?"disabled":""}
              aria-label="${s(c)} omschakelen"><i></i></button>
          </div>`}).join("")}</div>`:""}_sectionCovers(e,o,r,i){let n=o[r]||[];if(!n.length)return"";let d=n.map(a=>{let c=u(e,a.entity),l=h(a.name,c,a.entity);return`
          <div class="jrc-coverrow">
            <span class="jrc-cr-name">${s(l)}</span>
            <span class="jrc-cr-pos">${W(c)}</span>
            <span class="jrc-cr-btns">
              <button data-action="cover-open" data-entity="${s(a.entity)}" aria-label="Omhoog">${je}</button>
              <button data-action="cover-stop" data-entity="${s(a.entity)}" aria-label="Stop">${Ee}</button>
              <button data-action="cover-close" data-entity="${s(a.entity)}" aria-label="Omlaag">${ke}</button>
            </span>
          </div>`}).join("");return`<div class="jrc-section"><h4>${s(i)}</h4>${d}</div>`}_sectionMedia(e,o){if(!o.media_player)return"";let r=u(e,o.media_player),i=h(null,r,o.media_player),n=r?.attributes?.media_title,d=typeof n=="string"&&n?n:v(r?.state)?"Niet beschikbaar":"Uit",a=r?.state==="playing";return`
      <div class="jrc-section">
        <h4>Media</h4>
        <div class="jrc-media">
          <span class="jrc-media-ic">${Ce}</span>
          <span class="jrc-media-text">
            <span class="jrc-media-name">${s(i)}</span>
            <span class="jrc-media-sub">${s(d)}</span>
          </span>
          <button class="jrc-media-btn${a?" on":""}" data-action="media-toggle"
            data-entity="${s(o.media_player)}" aria-label="Afspelen/pauzeren">${Re}</button>
        </div>
      </div>`}_sectionClimate(e,o){if(!o.climate)return"";let r=u(e,o.climate),i=h(null,r,o.climate),n=r?.attributes?.hvac_modes,d=Array.isArray(n)?n.filter(f=>typeof f=="string"):[],a=r?.state,c=b(r?.attributes?.current_temperature,1),l=r?.attributes?.temperature,he=b(l,1)||"\u2014",C=Number(r?.attributes?.target_temp_step),B=Number.isFinite(C)&&C>0?C:.5,P=d.map(f=>`
        <button class="jrc-pill${f===a?" on":""}" data-action="climate-mode"
          data-entity="${s(o.climate)}" data-mode="${s(f)}">${s(R(f))}</button>`).join(""),K=typeof l=="string"||typeof l=="number"?String(l):"";return`
      <div class="jrc-section">
        <h4>Klimaat</h4>
        <div class="jrc-kv"><span>${s(i)}</span><span class="ok">${s(R(a))}</span></div>
        ${P?`<div class="jrc-pillrow">${P}</div>`:""}
        <div class="jrc-stepper">
          <button data-action="climate-step" data-entity="${s(o.climate)}"
            data-target="${K}" data-step="${-B}" aria-label="Kouder">\u2212</button>
          <div class="jrc-stepper-mid">
            <div class="v">${s(he)}</div>
            <div class="l">doel${c?` \xB7 nu ${s(c)}`:""}</div>
          </div>
          <button data-action="climate-step" data-entity="${s(o.climate)}"
            data-target="${K}" data-step="${B}" aria-label="Warmer">+</button>
        </div>
      </div>`}_onClick(e){let r=e.target?.closest("[data-action]");if(!r)return;let i=r.dataset.action,n=this._hass;if(i==="open-room"){this._openRoom(Number(r.dataset.room));return}if(i==="close"||i==="close-backdrop"){if(i==="close-backdrop"&&e.target!==r)return;this._closePopup();return}if(i==="toggle-light"){e.stopPropagation(),ee(n,r.dataset.entity);return}if(i==="cover-open"){te(n,r.dataset.entity);return}if(i==="cover-close"){oe(n,r.dataset.entity);return}if(i==="cover-stop"){re(n,r.dataset.entity);return}if(i==="media-toggle"){se(n,r.dataset.entity);return}if(i==="climate-mode"){ie(n,r.dataset.entity,r.dataset.mode);return}if(i==="climate-step"){ae(n,r.dataset.entity,r.dataset.target,Number(r.dataset.step));return}}_onKeydown(e){if(e.key!=="Enter"&&e.key!==" ")return;let r=e.target?.closest('[data-action="open-room"]');r&&(e.preventDefault(),this._openRoom(Number(r.dataset.room)))}_onDocKeydown(e){e.key==="Escape"&&this._closePopup()}},U='<svg viewBox="0 0 24 24" width="16" height="16"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.4 10.9c.5.5.9 1.2 1 2h4.8c.1-.8.5-1.5 1-2A6 6 0 0 0 12 3z"/></g></svg>',_e='<svg viewBox="0 0 24 24" width="15" height="15"><polyline points="9 6 15 12 9 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',we='<svg viewBox="0 0 24 24" width="15" height="15"><g stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></g></svg>',je='<svg viewBox="0 0 24 24" width="14" height="14"><polyline points="6 15 12 9 18 15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',ke='<svg viewBox="0 0 24 24" width="14" height="14"><polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',Ee='<svg viewBox="0 0 24 24" width="14" height="14"><rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor"/></svg>',Ce='<svg viewBox="0 0 24 24" width="18" height="18"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="3"/><circle cx="12" cy="8.2" r="2.4"/><circle cx="12" cy="16.5" r="1.1"/></g></svg>',Re='<svg viewBox="0 0 24 24" width="13" height="13"><polygon points="6 4 20 12 6 20" fill="currentColor"/></svg>',Le='<svg viewBox="0 0 24 24" width="17" height="17"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/></g></svg>';function S(t){return typeof t=="string"&&t.startsWith("mdi:")?`<ha-icon icon="${s(t)}"></ha-icon>`:Le}var Se=`
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
`;function D(){typeof customElements<"u"&&(customElements.get("juiced-dashboard-room-card")||customElements.define("juiced-dashboard-room-card",x)),typeof window<"u"&&(window.customCards=window.customCards||[],window.customCards.some(t=>t.type==="juiced-dashboard-room-card")||window.customCards.push({type:"juiced-dashboard-room-card",name:"Juiced Dashboard Room Card",description:"Tik een kamer, krijg een popup met enkel wat daar bedienbaar is \u2014 lichten, rolluiken, luifels, radio, airco.",preview:!1,documentationURL:"https://github.com/ju1ced/juiced-dashboard"}))}var y=1,A=["home","rooms","energy","domains","more"],M=["home","rooms"],T=["system","light","dark"];function $(){return{type:"custom:juiced-dashboard",schema_version:1,general:{title:"Juiced Dashboard",start_view:"home",theme_mode:"system"},rooms:[]}}function I(t){return typeof t=="object"&&t!==null}function ce(t,e){return typeof t=="string"&&t?t:e}function p(t){return typeof t=="string"&&t?t:void 0}function He(t,e){return typeof t=="string"&&M.includes(t)?t:e}function De(t,e){return typeof t=="string"&&T.includes(t)?t:e}var de=0;function Ae(){return de+=1,`room-${Date.now().toString(36)}-${de}`}function Me(t){let e=$().general;return I(t)?{title:ce(t.title,e.title),start_view:He(t.start_view,e.start_view),theme_mode:De(t.theme_mode,e.theme_mode)}:e}function Te(t){if(!I(t))return null;let e=p(t.name);return e?{key:ce(t.key,Ae()),name:e,icon:p(t.icon),temperature_entity:p(t.temperature_entity),humidity_entity:p(t.humidity_entity),light_entity:p(t.light_entity),cover_entity:p(t.cover_entity),awning_entity:p(t.awning_entity),media_player_entity:p(t.media_player_entity),climate_entity:p(t.climate_entity)}:null}function $e(t){if(!Array.isArray(t))return[];let e=[];for(let o of t){let r=Te(o);r&&e.push(r)}return e}function g(t){let e=I(t)?t:{};return{type:"custom:juiced-dashboard",schema_version:1,general:Me(e.general),rooms:$e(e.rooms)}}function V(t){return{name:t.name,icon:t.icon,temperature:t.temperature_entity,humidity:t.humidity_entity,lights:t.light_entity?[{entity:t.light_entity}]:[],covers:t.cover_entity?[{entity:t.cover_entity}]:[],awnings:t.awning_entity?[{entity:t.awning_entity}]:[],media_player:t.media_player_entity,climate:t.climate_entity}}var Ie=typeof HTMLElement>"u"?class{}:HTMLElement,Ve={home:{title:"Home",icon:"mdi:home"},rooms:{title:"Kamers",icon:"mdi:floor-plan"},energy:{title:"Energie",icon:"mdi:lightning-bolt"},domains:{title:"Domeinen",icon:"mdi:view-grid-outline"},more:{title:"Meer",icon:"mdi:dots-horizontal-circle-outline"}};function le(t){return`room-${t}`}function Oe(t,e){let o=Ve[t];return{title:o.title,path:t,icon:o.icon,subview:!1,strategy:{type:"custom:juiced-dashboard-view",view:t,general:e.general,rooms:e.rooms}}}function Je(t,e){return{title:t.name,path:le(t.key),icon:t.icon||"mdi:sofa-outline",subview:!0,back_path:"rooms",strategy:{type:"custom:juiced-dashboard-view",view:"room",general:e.general,room:t}}}var _=class extends Ie{static getCreateSuggestions(){return{title:"Juiced Dashboard",icon:"mdi:home-assistant"}}static getConfigElement(){return document.createElement("juiced-dashboard-strategy-editor")}static async generate(e){let o=g(e),r=[o.general.start_view,...A.filter(i=>i!==o.general.start_view)];return{title:o.general.title,views:[...r.map(i=>Oe(i,o)),...o.rooms.map(i=>Je(i,o))]}}};function O(){if(typeof customElements>"u"||typeof window>"u")return;let t="ll-strategy-dashboard-juiced-dashboard";customElements.get(t)||customElements.define(t,_),window.customStrategies??=[],window.customStrategies.some(e=>e.type==="juiced-dashboard"&&e.strategyType==="dashboard")||window.customStrategies.push({type:"juiced-dashboard",strategyType:"dashboard",name:"Juiced Dashboard",description:"Kia-ge\xEFnspireerd, GUI-geconfigureerd dashboard: Home, Kamers, Energie, Domeinen en Meer.",documentationURL:"https://github.com/ju1ced/juiced-dashboard"})}var Ne=typeof HTMLElement>"u"?class{}:HTMLElement;function w(t,e){return{type:"markdown",...e?{title:e}:{},content:t}}var ue="Kamers",ze="Tik een kamer om lichten, rolluiken, luifels, radio of airco direct te bedienen";function Be(t){return t.length===0?{type:"grid",cards:[w("Voeg kamers toe via **Dashboard bewerken \u2192 instellingen**.",ue)]}:{type:"grid",cards:[{type:"custom:juiced-dashboard-room-card",title:ue,subtitle:ze,rooms:t.map(V)}]}}function Pe(t){if(!t)return[{type:"grid",cards:[w("Deze kamerconfiguratie ontbreekt.","Kamer")]}];let e=[t.temperature_entity,t.humidity_entity,t.light_entity,t.cover_entity,t.awning_entity,t.media_player_entity,t.climate_entity].filter(r=>!!r),o=[w(`Volledige kamerdetail (hero + secties zoals Klimaat/Verlichting/Sensoren/Media) voor **${t.name}** volgt in een volgende stap.`,t.name)];return e.length>0&&o.push({type:"entities",title:"Entiteiten in deze kamer",entities:e}),[{type:"grid",cards:o}]}function J(t,e){return[{type:"grid",cards:[w(e,t)]}]}function pe(t){let e;switch(t.view){case"home":case"rooms":e=[Be(t.rooms??[])];break;case"room":e=Pe(t.room);break;case"energy":e=J("Energie","Energie-overzicht volgt in een volgende stap.");break;case"domains":e=J("Domeinen","Specialistische domeinen (Kia, tuin, robotstofzuiger, zwembad) volgen in een volgende stap.");break;default:e=J("Meer","Instellingen en geschiedenis volgen in een volgende stap.");break}return{type:"sections",max_columns:2,dense_section_placement:!0,sections:e}}var j=class extends Ne{static async generate(e){return pe(e)}};function N(){if(typeof customElements>"u")return;let t="ll-strategy-view-juiced-dashboard-view";customElements.get(t)||customElements.define(t,j)}var Ke=typeof HTMLElement>"u"?class{}:HTMLElement,me=[{key:"temperature_entity",label:"Temperatuursensor",domain:"sensor"},{key:"humidity_entity",label:"Vochtigheidssensor",domain:"sensor"},{key:"light_entity",label:"Licht",domain:"light"},{key:"cover_entity",label:"Rolluik",domain:"cover"},{key:"awning_entity",label:"Luifel",domain:"cover"},{key:"media_player_entity",label:"Mediaspeler",domain:"media_player"},{key:"climate_entity",label:"Klimaat",domain:"climate"}],ge=0;function k(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}var E=class extends Ke{_config;_hass=null;constructor(){super(),this.attachShadow({mode:"open"}),this._config=g(void 0),this._onInput=this._onInput.bind(this),this._onClick=this._onClick.bind(this),this._onSelectorChange=this._onSelectorChange.bind(this)}get root(){return this.shadowRoot}setConfig(e){this._config=g(e),this._render()}set hass(e){this._hass=e,this.root.querySelectorAll("ha-selector").forEach(o=>{o.hass=e})}get hass(){return this._hass}connectedCallback(){this.root.addEventListener("input",this._onInput),this.root.addEventListener("click",this._onClick),this.root.addEventListener("value-changed",this._onSelectorChange)}disconnectedCallback(){this.root.removeEventListener("input",this._onInput),this.root.removeEventListener("click",this._onClick),this.root.removeEventListener("value-changed",this._onSelectorChange)}_emit(){this.dispatchEvent(new CustomEvent("config-changed",{bubbles:!0,composed:!0,detail:{config:this._config}}))}_updateGeneral(e,o){this._config={...this._config,general:{...this._config.general,[e]:o}},this._emit()}_updateRoom(e,o){this._config={...this._config,rooms:this._config.rooms.map(r=>r.key===e?{...r,...o}:r)},this._emit()}_addRoom(){ge+=1;let e={key:`room-${Date.now().toString(36)}-${ge}`,name:"Nieuwe kamer"};this._config={...this._config,rooms:[...this._config.rooms,e]},this._emit(),this._render()}_removeRoom(e){this._config={...this._config,rooms:this._config.rooms.filter(o=>o.key!==e)},this._emit(),this._render()}_onInput(e){let o=e.target;if(!o)return;let r=o.dataset.field;if(!r)return;if(o.dataset.scope==="general"){r==="title"&&this._updateGeneral("title",o.value),r==="start_view"&&this._updateGeneral("start_view",o.value),r==="theme_mode"&&this._updateGeneral("theme_mode",o.value);return}let i=o.dataset.room;i&&(r==="name"&&this._updateRoom(i,{name:o.value}),r==="icon"&&this._updateRoom(i,{icon:o.value||void 0}))}_onSelectorChange(e){let o=e.target;if(!o||o.tagName.toLowerCase()!=="ha-selector")return;e.stopPropagation();let r=o.dataset.field,i=o.dataset.room;if(!r||!i)return;let n=typeof e.detail?.value=="string"?e.detail.value:void 0;this._updateRoom(i,{[r]:n})}_onClick(e){let o=e.target?.closest("[data-action]");o&&(o.dataset.action==="add-room"&&this._addRoom(),o.dataset.action==="remove-room"&&o.dataset.room&&this._removeRoom(o.dataset.room))}_render(){let e=this._config;this.root.innerHTML=`
      <style>${Ue}</style>
      <div class="jde-section">
        <h3>Algemeen</h3>
        <label>Titel
          <input type="text" data-scope="general" data-field="title" value="${k(e.general.title)}">
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
        <div class="jde-section-head">
          <h3>Kamers</h3>
          <button type="button" data-action="add-room">+ Kamer toevoegen</button>
        </div>
        ${e.rooms.length===0?'<p class="jde-empty">Nog geen kamers geconfigureerd.</p>':e.rooms.map(o=>this._roomHtml(o)).join("")}
      </div>`,this.root.querySelectorAll("ha-selector").forEach(o=>{let r=o,i=r.dataset.room,n=r.dataset.field;if(!i||!n)return;let d=e.rooms.find(c=>c.key===i),a=me.find(c=>c.key===n);!d||!a||(r.selector={entity:a.domain?{domain:a.domain}:{}},r.value=d[n]??"",this._hass&&(r.hass=this._hass))})}_roomHtml(e){return`
      <div class="jde-room">
        <div class="jde-room-head">
          <input type="text" data-room="${e.key}" data-field="name" value="${k(e.name)}" placeholder="Kamernaam">
          <button type="button" data-action="remove-room" data-room="${e.key}" aria-label="Kamer verwijderen">&times;</button>
        </div>
        <label>Icoon
          <input type="text" data-room="${e.key}" data-field="icon" value="${k(e.icon??"")}" placeholder="mdi:sofa">
        </label>
        ${me.map(o=>`
          <label>${k(o.label)}
            <ha-selector data-room="${e.key}" data-field="${o.key}"></ha-selector>
          </label>`).join("")}
      </div>`}},Ue=`
  :host { display: block; font-family: var(--paper-font-body1_-_font-family, inherit); color: var(--primary-text-color); }
  .jde-section { padding: 16px 0; border-bottom: 1px solid var(--divider-color, #e0e0e0); }
  .jde-section:last-child { border-bottom: 0; }
  .jde-section h3 { margin: 0 0 12px; font-size: 15px; font-weight: 600; }
  .jde-section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .jde-section-head h3 { margin: 0; }
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
`;function z(){typeof customElements>"u"||customElements.get("juiced-dashboard-strategy-editor")||customElements.define("juiced-dashboard-strategy-editor",E)}var fe=Object.freeze({name:"Juiced Dashboard",version:"0.1.0"});typeof window<"u"&&(D(),z(),N(),O(),window.__JUICED_DASHBOARD_BUILD__=fe,console.info("%c JUICED DASHBOARD %c "+fe.version,"color: #081018; background: #5cc8ff; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;","color: #5cc8ff; background: #0f1115; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;"));export{y as CONFIG_SCHEMA_VERSION,ne as DEFAULT_CLIMATE_TARGET,x as JuicedDashboardRoomCard,_ as JuicedDashboardStrategy,E as JuicedDashboardStrategyEditor,j as JuicedDashboardViewStrategy,M as START_VIEWS,T as THEME_MODES,A as VIEW_PATHS,fe as buildInfo,pe as buildView,oe as closeCover,Y as collectEntityIds,g as compileConfig,V as compileRoomForCard,G as coverPosition,W as coverPositionLabel,$ as createDefaultConfig,h as displayName,u as entityState,s as escapeHtml,H as formatNumber,b as formatTemp,Q as hasRelevantChange,F as humanize,R as hvacModeLabel,v as isUnavailable,te as openCover,z as registerJuicedDashboardEditor,D as registerJuicedDashboardRoomCard,O as registerJuicedDashboardStrategy,N as registerJuicedDashboardViewStrategy,q as roomEntityIds,Z as roomFlag,be as roomHasControls,S as roomIconSvg,X as roomLightsOn,le as roomPath,L as roomStatLine,ie as setHvacMode,ae as stepClimateTarget,re as stopCover,ee as toggleLight,se as toggleMediaPlayPause};
