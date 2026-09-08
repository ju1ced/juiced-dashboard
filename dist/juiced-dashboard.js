/*! Juiced Dashboard 0.1.0 | MIT License | https://github.com/ju1ced/juiced-dashboard */
function a(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}var Ee=new Set(["unavailable","unknown"]);function m(t){return t==null||Ee.has(t)}function p(t,e){return!e||!t?null:t.states?.[e]||null}function w(t,e){let i=Number(t);return Number.isFinite(i)?i.toFixed(e??1).replace(".",","):null}function y(t,e){let i=w(t,e);return i===null?null:`${i}\xB0`}var Re={off:"Uit",heat:"Verwarmen",cool:"Koelen",heat_cool:"Auto",auto:"Auto",fan_only:"Ventilator",dry:"Droog"};function Z(t){let e=String(t??"").replace(/_/g," ");return e?e.charAt(0).toUpperCase()+e.slice(1):""}function $(t){return t&&(Re[t]||Z(t))||"Onbekend"}function X(t){if(!t)return null;let e=t.attributes?.current_position;return typeof e=="number"&&Number.isFinite(e)?Math.round(e):t.state==="open"?100:t.state==="closed"?0:null}function ee(t){let e=X(t);return e===null?"\u2014":`${e}%`}function x(t,e,i){if(t)return t;let o=e?.attributes?.friendly_name;return typeof o=="string"&&o?o:i||""}function te(t){let e=[],i=o=>{typeof o=="string"&&o.includes(".")&&e.push(o)};return i(t?.temperature),i(t?.humidity),i(t?.media_player),i(t?.climate),(t?.lights||[]).forEach(o=>i(o?.entity)),(t?.covers||[]).forEach(o=>i(o?.entity)),(t?.awnings||[]).forEach(o=>i(o?.entity)),e}function ie(t){let e=new Set;return(t?.rooms||[]).forEach(i=>{te(i).forEach(o=>e.add(o))}),[...e]}function oe(t,e,i){if(!t||!e)return!0;let o=t.states||{},r=e.states||{};for(let n of i){let c=o[n],s=r[n];if(!c||!s){if(c!==s)return!0;continue}if(c.state!==s.state||c.last_updated!==s.last_updated)return!0}return!1}function D(t,e){let i=[],o=p(t,e?.temperature);if(o&&!m(o.state)){let n=y(o.state,1);n&&i.push(n)}let r=p(t,e?.humidity);if(r&&!m(r.state)){let n=w(r.state,0);n&&i.push(`${n}%`)}return i.length?i.join(" \xB7 "):e?.idle_text||"Rustig"}function ne(t,e){return(e?.lights||[]).filter(i=>p(t,i?.entity)?.state==="on").length}function re(t,e){let i=ne(t,e);return i<=0?null:i===1?"1 lamp aan":`${i} lampen aan`}function Ae(t){return!!((t?.lights||[]).length||(t?.covers||[]).length||(t?.awnings||[]).length||t?.media_player||t?.climate)}function f(t,e,i,o,r){!t||!o||t.callService(e,i,{entity_id:o,...r||{}})}function ae(t,e){f(t,"light","toggle",e)}function se(t,e){f(t,"cover","open_cover",e)}function ce(t,e){f(t,"cover","close_cover",e)}function de(t,e){f(t,"cover","stop_cover",e)}function le(t,e,i){f(t,"climate","set_hvac_mode",e,{hvac_mode:i})}var ue=20;function pe(t,e,i,o){let n=i!==""&&i!==null&&i!==void 0?Number(i):NaN,c=Number.isFinite(n)?n:ue,s=Math.round((c+o)*10)/10;f(t,"climate","set_temperature",e,{temperature:s})}function me(t,e){f(t,"media_player","media_play_pause",e)}var Se=typeof HTMLElement>"u"?class{}:HTMLElement,C=class extends Se{_config=null;_hass=null;_entityIds=[];_openRoomIndex=null;_built=!1;constructor(){super(),this.attachShadow({mode:"open"}),this._onClick=this._onClick.bind(this),this._onKeydown=this._onKeydown.bind(this),this._onDocKeydown=this._onDocKeydown.bind(this)}get root(){return this.shadowRoot}static getStubConfig(){return{type:"custom:juiced-dashboard-room-card",title:"Kamers",subtitle:"Tik een kamer om lichten, rolluiken, luifels, radio of airco direct te bedienen",rooms:[{name:"Bureau",icon:"mdi:desk",temperature:"sensor.bureau_temperature",humidity:"sensor.bureau_humidity",lights:[{entity:"light.bureau_spellenruimte",name:"Bureau & spellenruimte"},{entity:"light.bureau_spellentafel",name:"Spellentafel"}],awnings:[{entity:"cover.luifel_bureau",name:"Luifel bureau"}],media_player:"media_player.kantoor",climate:"climate.daikin_bureau"}]}}setConfig(e){if(!e||typeof e!="object")throw new Error("juiced-dashboard-room-card: invalid configuration.");if(!Array.isArray(e.rooms))throw new Error("juiced-dashboard-room-card: `rooms` must be a list.");e.rooms.forEach((i,o)=>{if(!i||typeof i!="object")throw new Error(`juiced-dashboard-room-card: room at index ${o} must be an object.`);if(!i.name)throw new Error(`juiced-dashboard-room-card: room at index ${o} is missing \`name\`.`)}),this._config=e,this._entityIds=ie(e),this._openRoomIndex=null,this._built=!1,this._renderShell(),this._renderList(),this._built=!0}set hass(e){let i=this._hass;this._hass=e,this._config&&(this._built&&i&&!oe(i,e,this._entityIds)||(this._renderList(),this._openRoomIndex!==null&&this._renderPopup()))}get hass(){return this._hass}getCardSize(){return 1+Math.ceil((this._config?.rooms?.length||0)/2)}connectedCallback(){this.root.addEventListener("click",this._onClick),this.root.addEventListener("keydown",this._onKeydown)}disconnectedCallback(){this.root.removeEventListener("click",this._onClick),this.root.removeEventListener("keydown",this._onKeydown),typeof document<"u"&&document.removeEventListener("keydown",this._onDocKeydown)}_renderShell(){let e=this._config||{};this.root.innerHTML=`
      <style>${Je}</style>
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
            <button class="jrc-close" data-action="close" aria-label="Sluiten">${Te}</button>
          </div>
          <div class="jrc-popup-body" id="popup-body"></div>
        </div>
      </div>`}_renderList(){let e=this.root.getElementById("list");if(!e)return;let i=this._hass,o=this._config?.rooms||[];e.innerHTML=o.map((r,n)=>this._roomRowHtml(r,n,i)).join("")}_roomRowHtml(e,i,o){let r=D(o,e),n=re(o,e),c=(e.lights||[])[0],s=c?p(o,c.entity)?.state==="on":!1;return`
      <div class="jrc-row" role="button" tabindex="0" data-action="open-room" data-room="${i}">
        <span class="jrc-row-ic">${M(e.icon)}</span>
        <span class="jrc-row-text">
          <span class="jrc-row-name">${a(e.name)}</span>
          <span class="jrc-row-stat">${a(r)}</span>
        </span>
        ${n?`<span class="jrc-flag">${a(n)}</span>`:""}
        ${c?`<button class="jrc-quick${s?" on":""}" data-action="toggle-light"
                 data-entity="${a(c.entity)}"
                 aria-label="Licht ${a(e.name)} omschakelen" title="Licht omschakelen">${Y}</button>`:`<span class="jrc-chev">${Le}</span>`}
      </div>`}_openRoom(e){if(!(this._config?.rooms||[])[e])return;this._openRoomIndex=e,this._renderPopup(),this.root.getElementById("backdrop")?.classList.add("show"),typeof document<"u"&&document.addEventListener("keydown",this._onDocKeydown)}_closePopup(){this._openRoomIndex=null,this.root.getElementById("backdrop")?.classList.remove("show"),typeof document<"u"&&document.removeEventListener("keydown",this._onDocKeydown)}_renderPopup(){let e=(this._config?.rooms||[])[this._openRoomIndex];if(!e)return;let i=this._hass,o=this.root.getElementById("popup-icon");o&&(o.innerHTML=M(e.icon));let r=this.root.getElementById("popup-name");r&&(r.textContent=e.name);let n=this.root.getElementById("popup-sub");n&&(n.textContent=D(i,e));let c=[this._sectionLights(i,e),this._sectionCovers(i,e,"covers","Rolluiken"),this._sectionCovers(i,e,"awnings","Luifels"),this._sectionMedia(i,e),this._sectionClimate(i,e)].filter(Boolean).join(""),s=this.root.getElementById("popup-body");s&&(s.innerHTML=c||'<p class="jrc-empty">Geen snelbediening geconfigureerd voor deze kamer.</p>')}_sectionLights(e,i){let o=i.lights||[];return o.length?`<div class="jrc-section"><h4>Verlichting</h4>${o.map(n=>{let c=p(e,n.entity),s=c?.state==="on",d=x(n.name,c,n.entity),l=m(c?.state);return`
          <div class="jrc-lightrow${s?" on":""}">
            <span class="jrc-lrow-ic">${Y}</span>
            <span class="jrc-lrow-text">
              <span class="jrc-lrow-name">${a(d)}</span>
              <span class="jrc-lrow-sub">${l?"Niet beschikbaar":s?"Aan":"Uit"}</span>
            </span>
            <button class="jrc-toggle${s?" on":""}" data-action="toggle-light"
              data-entity="${a(n.entity)}" ${l?"disabled":""}
              aria-label="${a(d)} omschakelen"><i></i></button>
          </div>`}).join("")}</div>`:""}_sectionCovers(e,i,o,r){let n=i[o]||[];if(!n.length)return"";let c=n.map(s=>{let d=p(e,s.entity),l=x(s.name,d,s.entity);return`
          <div class="jrc-coverrow">
            <span class="jrc-cr-name">${a(l)}</span>
            <span class="jrc-cr-pos">${ee(d)}</span>
            <span class="jrc-cr-btns">
              <button data-action="cover-open" data-entity="${a(s.entity)}" aria-label="Omhoog">${He}</button>
              <button data-action="cover-stop" data-entity="${a(s.entity)}" aria-label="Stop">${De}</button>
              <button data-action="cover-close" data-entity="${a(s.entity)}" aria-label="Omlaag">${$e}</button>
            </span>
          </div>`}).join("");return`<div class="jrc-section"><h4>${a(r)}</h4>${c}</div>`}_sectionMedia(e,i){if(!i.media_player)return"";let o=p(e,i.media_player),r=x(null,o,i.media_player),n=o?.attributes?.media_title,c=typeof n=="string"&&n?n:m(o?.state)?"Niet beschikbaar":"Uit",s=o?.state==="playing";return`
      <div class="jrc-section">
        <h4>Media</h4>
        <div class="jrc-media">
          <span class="jrc-media-ic">${Me}</span>
          <span class="jrc-media-text">
            <span class="jrc-media-name">${a(r)}</span>
            <span class="jrc-media-sub">${a(c)}</span>
          </span>
          <button class="jrc-media-btn${s?" on":""}" data-action="media-toggle"
            data-entity="${a(i.media_player)}" aria-label="Afspelen/pauzeren">${Ie}</button>
        </div>
      </div>`}_sectionClimate(e,i){if(!i.climate)return"";let o=p(e,i.climate),r=x(null,o,i.climate),n=o?.attributes?.hvac_modes,c=Array.isArray(n)?n.filter(_=>typeof _=="string"):[],s=o?.state,d=y(o?.attributes?.current_temperature,1),l=o?.attributes?.temperature,h=y(l,1)||"\u2014",b=Number(o?.attributes?.target_temp_step),Q=Number.isFinite(b)&&b>0?b:.5,G=c.map(_=>`
        <button class="jrc-pill${_===s?" on":""}" data-action="climate-mode"
          data-entity="${a(i.climate)}" data-mode="${a(_)}">${a($(_))}</button>`).join(""),W=typeof l=="string"||typeof l=="number"?String(l):"";return`
      <div class="jrc-section">
        <h4>Klimaat</h4>
        <div class="jrc-kv"><span>${a(r)}</span><span class="ok">${a($(s))}</span></div>
        ${G?`<div class="jrc-pillrow">${G}</div>`:""}
        <div class="jrc-stepper">
          <button data-action="climate-step" data-entity="${a(i.climate)}"
            data-target="${W}" data-step="${-Q}" aria-label="Kouder">\u2212</button>
          <div class="jrc-stepper-mid">
            <div class="v">${a(h)}</div>
            <div class="l">doel${d?` \xB7 nu ${a(d)}`:""}</div>
          </div>
          <button data-action="climate-step" data-entity="${a(i.climate)}"
            data-target="${W}" data-step="${Q}" aria-label="Warmer">+</button>
        </div>
      </div>`}_onClick(e){let o=e.target?.closest("[data-action]");if(!o)return;let r=o.dataset.action,n=this._hass;if(r==="open-room"){this._openRoom(Number(o.dataset.room));return}if(r==="close"||r==="close-backdrop"){if(r==="close-backdrop"&&e.target!==o)return;this._closePopup();return}if(r==="toggle-light"){e.stopPropagation(),ae(n,o.dataset.entity);return}if(r==="cover-open"){se(n,o.dataset.entity);return}if(r==="cover-close"){ce(n,o.dataset.entity);return}if(r==="cover-stop"){de(n,o.dataset.entity);return}if(r==="media-toggle"){me(n,o.dataset.entity);return}if(r==="climate-mode"){le(n,o.dataset.entity,o.dataset.mode);return}if(r==="climate-step"){pe(n,o.dataset.entity,o.dataset.target,Number(o.dataset.step));return}}_onKeydown(e){if(e.key!=="Enter"&&e.key!==" ")return;let o=e.target?.closest('[data-action="open-room"]');o&&(e.preventDefault(),this._openRoom(Number(o.dataset.room)))}_onDocKeydown(e){e.key==="Escape"&&this._closePopup()}},Y='<svg viewBox="0 0 24 24" width="16" height="16"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.4 10.9c.5.5.9 1.2 1 2h4.8c.1-.8.5-1.5 1-2A6 6 0 0 0 12 3z"/></g></svg>',Le='<svg viewBox="0 0 24 24" width="15" height="15"><polyline points="9 6 15 12 9 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',Te='<svg viewBox="0 0 24 24" width="15" height="15"><g stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></g></svg>',He='<svg viewBox="0 0 24 24" width="14" height="14"><polyline points="6 15 12 9 18 15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',$e='<svg viewBox="0 0 24 24" width="14" height="14"><polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',De='<svg viewBox="0 0 24 24" width="14" height="14"><rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor"/></svg>',Me='<svg viewBox="0 0 24 24" width="18" height="18"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="3"/><circle cx="12" cy="8.2" r="2.4"/><circle cx="12" cy="16.5" r="1.1"/></g></svg>',Ie='<svg viewBox="0 0 24 24" width="13" height="13"><polygon points="6 4 20 12 6 20" fill="currentColor"/></svg>',Ve='<svg viewBox="0 0 24 24" width="17" height="17"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/></g></svg>';function M(t){return typeof t=="string"&&t.startsWith("mdi:")?`<ha-icon icon="${a(t)}"></ha-icon>`:Ve}var Je=`
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
`;function I(){typeof customElements<"u"&&(customElements.get("juiced-dashboard-room-card")||customElements.define("juiced-dashboard-room-card",C)),typeof window<"u"&&(window.customCards=window.customCards||[],window.customCards.some(t=>t.type==="juiced-dashboard-room-card")||window.customCards.push({type:"juiced-dashboard-room-card",name:"Juiced Dashboard Room Card",description:"Tik een kamer, krijg een popup met enkel wat daar bedienbaar is \u2014 lichten, rolluiken, luifels, radio, airco.",preview:!1,documentationURL:"https://github.com/ju1ced/juiced-dashboard"}))}var j=1,V=["home","rooms","energy","domains","more"],J=["home","rooms"],O=["system","light","dark"];function z(){return{type:"custom:juiced-dashboard",schema_version:1,general:{title:"Juiced Dashboard",start_view:"home",theme_mode:"system"},today:{waste_entities:[]},quick_actions:[],rooms:[]}}function k(t){return typeof t=="object"&&t!==null}function E(t,e){return typeof t=="string"&&t?t:e}function u(t){return typeof t=="string"&&t?t:void 0}function Oe(t,e){return typeof t=="string"&&J.includes(t)?t:e}function ze(t,e){return typeof t=="string"&&O.includes(t)?t:e}var ge=0;function Be(){return ge+=1,`room-${Date.now().toString(36)}-${ge}`}function Ne(t){let e=z().general;return k(t)?{title:E(t.title,e.title),start_view:Oe(t.start_view,e.start_view),theme_mode:ze(t.theme_mode,e.theme_mode)}:e}function Ke(t){if(!k(t))return null;let e=u(t.name);return e?{key:E(t.key,Be()),name:e,icon:u(t.icon),temperature_entity:u(t.temperature_entity),humidity_entity:u(t.humidity_entity),light_entity:u(t.light_entity),cover_entity:u(t.cover_entity),awning_entity:u(t.awning_entity),media_player_entity:u(t.media_player_entity),climate_entity:u(t.climate_entity)}:null}function Pe(t){return Array.isArray(t)?t.filter(e=>typeof e=="string"&&e.length>0):[]}function qe(t){return k(t)?{weather_entity:u(t.weather_entity),battery_soc_entity:u(t.battery_soc_entity),battery_charge_entity:u(t.battery_charge_entity),battery_discharge_entity:u(t.battery_discharge_entity),solar_power_entity:u(t.solar_power_entity),home_consumption_entity:u(t.home_consumption_entity),monthly_peak_entity:u(t.monthly_peak_entity),waste_entities:Pe(t.waste_entities)}:{waste_entities:[]}}var fe=0;function Ue(){return fe+=1,`action-${Date.now().toString(36)}-${fe}`}function Fe(t){if(!k(t))return null;let e=u(t.entity),i=u(t.service);return!e||!i?null:{key:E(t.key,Ue()),label:E(t.label,e),icon:u(t.icon),entity:e,service:i}}function Qe(t){if(!Array.isArray(t))return[];let e=[];for(let i of t){let o=Fe(i);o&&e.push(o)}return e}function Ge(t){if(!Array.isArray(t))return[];let e=[];for(let i of t){let o=Ke(i);o&&e.push(o)}return e}function v(t){let e=k(t)?t:{};return{type:"custom:juiced-dashboard",schema_version:1,general:Ne(e.general),today:qe(e.today),quick_actions:Qe(e.quick_actions),rooms:Ge(e.rooms)}}function B(t){return{name:t.name,icon:t.icon,temperature:t.temperature_entity,humidity:t.humidity_entity,lights:t.light_entity?[{entity:t.light_entity}]:[],covers:t.cover_entity?[{entity:t.cover_entity}]:[],awnings:t.awning_entity?[{entity:t.awning_entity}]:[],media_player:t.media_player_entity,climate:t.climate_entity}}var We=typeof HTMLElement>"u"?class{}:HTMLElement,Ye={home:{title:"Home",icon:"mdi:home"},rooms:{title:"Kamers",icon:"mdi:floor-plan"},energy:{title:"Energie",icon:"mdi:lightning-bolt"},domains:{title:"Domeinen",icon:"mdi:view-grid-outline"},more:{title:"Meer",icon:"mdi:dots-horizontal-circle-outline"}};function he(t){return`room-${t}`}function Ze(t,e){let i=Ye[t];return{title:i.title,path:t,icon:i.icon,subview:!1,strategy:{type:"custom:juiced-dashboard-view",view:t,general:e.general,today:e.today,quick_actions:e.quick_actions,rooms:e.rooms}}}function Xe(t,e){return{title:t.name,path:he(t.key),icon:t.icon||"mdi:sofa-outline",subview:!0,back_path:"rooms",strategy:{type:"custom:juiced-dashboard-view",view:"room",general:e.general,room:t}}}var R=class extends We{static getCreateSuggestions(){return{title:"Juiced Dashboard",icon:"mdi:home-assistant"}}static getConfigElement(){return document.createElement("juiced-dashboard-strategy-editor")}static async generate(e){let i=v(e),o=[i.general.start_view,...V.filter(r=>r!==i.general.start_view)];return{title:i.general.title,views:[...o.map(r=>Ze(r,i)),...i.rooms.map(r=>Xe(r,i))]}}};function N(){if(typeof customElements>"u"||typeof window>"u")return;let t="ll-strategy-dashboard-juiced-dashboard";customElements.get(t)||customElements.define(t,R),window.customStrategies??=[],window.customStrategies.some(e=>e.type==="juiced-dashboard"&&e.strategyType==="dashboard")||window.customStrategies.push({type:"juiced-dashboard",strategyType:"dashboard",name:"Juiced Dashboard",description:"Kia-ge\xEFnspireerd, GUI-geconfigureerd dashboard: Home, Kamers, Energie, Domeinen en Meer.",documentationURL:"https://github.com/ju1ced/juiced-dashboard"})}var et=typeof HTMLElement>"u"?class{}:HTMLElement,tt='<svg viewBox="0 0 24 24" width="16" height="16"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',it=new Set(["on","open","armed_home","armed_away","armed_night","playing","heat","cool"]);function ot(t){return t.split(".")[0]??""}var A=class extends et{_config=null;_hass=null;constructor(){super(),this.attachShadow({mode:"open"}),this._onClick=this._onClick.bind(this)}get root(){return this.shadowRoot}static getStubConfig(){return{type:"custom:juiced-dashboard-quick-actions",actions:[]}}setConfig(e){if(!e||typeof e!="object")throw new Error("juiced-dashboard-quick-actions: invalid configuration.");this._config=e,this._render()}set hass(e){this._hass=e,this._render()}get hass(){return this._hass}getCardSize(){return 1}connectedCallback(){this.root.addEventListener("click",this._onClick)}disconnectedCallback(){this.root.removeEventListener("click",this._onClick)}_onClick(e){let o=e.target?.closest("[data-entity]");if(!o||!this._hass)return;let r=o.dataset.entity,n=o.dataset.service;!r||!n||this._hass.callService(ot(r),n,{entity_id:r})}_render(){if(!this._config)return;let e=this._config.actions??[],i=this._hass;if(e.length===0){this.root.innerHTML=`<style>${ye}</style>`;return}let o=e.map(r=>{let n=p(i,r.entity),c=m(n?.state);return`
          <button class="jqa-chip${!!(n&&it.has(n.state))?" on":""}" data-entity="${a(r.entity)}" data-service="${a(r.service)}" ${c?"disabled":""}>
            <span class="jqa-ic">${tt}</span>
            <span class="jqa-label">${a(r.label)}</span>
          </button>`}).join("");this.root.innerHTML=`<style>${ye}</style><div class="jqa-row">${o}</div>`}},ye=`
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
`;function K(){typeof customElements>"u"||(customElements.get("juiced-dashboard-quick-actions")||customElements.define("juiced-dashboard-quick-actions",A),typeof window<"u"&&(window.customCards=window.customCards||[],window.customCards.some(t=>t.type==="juiced-dashboard-quick-actions")||window.customCards.push({type:"juiced-dashboard-quick-actions",name:"Juiced Dashboard \u2014 Snelacties",description:"Een kleine, gecureerde rij kruis-kamer acties (alarm, garagepoort, ...).",preview:!1,documentationURL:"https://github.com/ju1ced/juiced-dashboard"})))}var nt=typeof HTMLElement>"u"?class{}:HTMLElement,rt=[{key:"battery_soc_entity",label:"Thuisbatterij SoC"},{key:"battery_charge_entity",label:"Batterij laden"},{key:"battery_discharge_entity",label:"Batterij ontladen"},{key:"solar_power_entity",label:"Zonnepanelen opbrengst"},{key:"home_consumption_entity",label:"Huisverbruik"},{key:"monthly_peak_entity",label:"Maandelijkse vermogenspiek"}];function at(t,e){let o=p(t,e)?.attributes?.unit_of_measurement;return typeof o=="string"?o:""}function st(t){return{"clear-night":"Helder",cloudy:"Bewolkt",exceptional:"Uitzonderlijk",fog:"Mist",hail:"Hagel",lightning:"Onweer","lightning-rainy":"Onweer met regen",partlycloudy:"Half bewolkt",pouring:"Zware regen",rainy:"Regenachtig",snowy:"Sneeuw","snowy-rainy":"Natte sneeuw",sunny:"Zonnig",windy:"Winderig","windy-variant":"Winderig"}[t]||t}var S=class extends nt{_config=null;_hass=null;constructor(){super(),this.attachShadow({mode:"open"})}get root(){return this.shadowRoot}static getStubConfig(){return{type:"custom:juiced-dashboard-today-card",today:{weather_entity:"weather.thuis",waste_entities:[]}}}setConfig(e){if(!e||typeof e!="object")throw new Error("juiced-dashboard-today-card: invalid configuration.");this._config=e,this._render()}set hass(e){this._hass=e,this._render()}get hass(){return this._hass}getCardSize(){return 3}_render(){if(!this._config)return;let e=this._config.today??{waste_entities:[]},i=this._hass,o=this._weatherHtml(i,e.weather_entity),r=this._energyHtml(i,e),n=this._wasteHtml(i,e.waste_entities??[]);this.root.innerHTML=`
      <style>${ct}</style>
      <ha-card class="jtc-shell">
        ${o}
        ${r}
        ${n}
      </ha-card>`}_weatherHtml(e,i){let o=p(e,i);if(!i||!o||m(o.state))return"";let r=y(o.attributes?.temperature,1);return`
      <div class="jtc-weather">
        <div>
          <div class="jtc-weather-cond">${a(st(o.state))}</div>
          <div class="jtc-weather-loc">Thuis &middot; nu</div>
        </div>
        ${r?`<div class="jtc-weather-temp">${a(r)}</div>`:""}
      </div>`}_energyHtml(e,i){let o=rt.map(r=>{let n=i[r.key],c=p(e,n);if(!n||!c||m(c.state))return"";let s=w(c.state,1);if(s===null)return"";let d=at(e,n);return`
        <div class="jtc-tile">
          <div class="jtc-tile-value">${a(s)}${d?` <span class="jtc-tile-unit">${a(d)}</span>`:""}</div>
          <div class="jtc-tile-label">${a(r.label)}</div>
        </div>`}).join("");return o?`<div class="jtc-energy">${o}</div>`:""}_wasteHtml(e,i){let o=i.map(r=>{let n=p(e,r);if(!n||m(n.state))return"";let c=n.attributes?.friendly_name;return`
          <div class="jtc-waste-chip">
            <div class="jtc-waste-name">${a(typeof c=="string"&&c?c:r)}</div>
            <div class="jtc-waste-value">${a(n.state)}</div>
          </div>`}).filter(Boolean).join("");return o?`
      <div class="jtc-waste">
        <h4>Afvalophaling</h4>
        <div class="jtc-waste-row">${o}</div>
      </div>`:""}},ct=`
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
`;function P(){typeof customElements>"u"||(customElements.get("juiced-dashboard-today-card")||customElements.define("juiced-dashboard-today-card",S),typeof window<"u"&&(window.customCards=window.customCards||[],window.customCards.some(t=>t.type==="juiced-dashboard-today-card")||window.customCards.push({type:"juiced-dashboard-today-card",name:"Juiced Dashboard \u2014 Vandaag",description:"Weer, energie-KPI's en afvalophaling in \xE9\xE9n rustige kaart.",preview:!1,documentationURL:"https://github.com/ju1ced/juiced-dashboard"})))}var dt=typeof HTMLElement>"u"?class{}:HTMLElement;function L(t,e){return{type:"markdown",...e?{title:e}:{},content:t}}var ve="Kamers",lt="Tik een kamer om lichten, rolluiken, luifels, radio of airco direct te bedienen";function ut(t){return t?!!(t.weather_entity||t.battery_soc_entity||t.battery_charge_entity||t.battery_discharge_entity||t.solar_power_entity||t.home_consumption_entity||t.monthly_peak_entity||(t.waste_entities??[]).length>0):!1}function pt(t){if(ut(t))return{type:"grid",cards:[{type:"custom:juiced-dashboard-today-card",today:t}]}}function mt(t){if(!(!t||t.length===0))return{type:"grid",cards:[{type:"custom:juiced-dashboard-quick-actions",actions:t}]}}function be(t){return t.length===0?{type:"grid",cards:[L("Voeg kamers toe via **Dashboard bewerken \u2192 instellingen**.",ve)]}:{type:"grid",cards:[{type:"custom:juiced-dashboard-room-card",title:ve,subtitle:lt,rooms:t.map(B)}]}}function gt(t){if(!t)return[{type:"grid",cards:[L("Deze kamerconfiguratie ontbreekt.","Kamer")]}];let e=[t.temperature_entity,t.humidity_entity,t.light_entity,t.cover_entity,t.awning_entity,t.media_player_entity,t.climate_entity].filter(o=>!!o),i=[L(`Volledige kamerdetail (hero + secties zoals Klimaat/Verlichting/Sensoren/Media) voor **${t.name}** volgt in een volgende stap.`,t.name)];return e.length>0&&i.push({type:"entities",title:"Entiteiten in deze kamer",entities:e}),[{type:"grid",cards:i}]}function q(t,e){return[{type:"grid",cards:[L(e,t)]}]}function _e(t){let e;switch(t.view){case"home":e=[pt(t.today),mt(t.quick_actions),be(t.rooms??[])].filter(i=>!!i);break;case"rooms":e=[be(t.rooms??[])];break;case"room":e=gt(t.room);break;case"energy":e=q("Energie","Energie-overzicht volgt in een volgende stap.");break;case"domains":e=q("Domeinen","Specialistische domeinen (Kia, tuin, robotstofzuiger, zwembad) volgen in een volgende stap.");break;default:e=q("Meer","Instellingen en geschiedenis volgen in een volgende stap.");break}return{type:"sections",max_columns:2,dense_section_placement:!0,sections:e}}var T=class extends dt{static async generate(e){return _e(e)}};function U(){if(P(),K(),typeof customElements>"u")return;let t="ll-strategy-view-juiced-dashboard-view";customElements.get(t)||customElements.define(t,T)}var ft=typeof HTMLElement>"u"?class{}:HTMLElement,xe=[{key:"temperature_entity",label:"Temperatuursensor",domain:"sensor"},{key:"humidity_entity",label:"Vochtigheidssensor",domain:"sensor"},{key:"light_entity",label:"Licht",domain:"light"},{key:"cover_entity",label:"Rolluik",domain:"cover"},{key:"awning_entity",label:"Luifel",domain:"cover"},{key:"media_player_entity",label:"Mediaspeler",domain:"media_player"},{key:"climate_entity",label:"Klimaat",domain:"climate"}],we=0,je=0,ke=[{key:"weather_entity",label:"Weerbron",domain:"weather"},{key:"battery_soc_entity",label:"Thuisbatterij SoC",domain:"sensor"},{key:"battery_charge_entity",label:"Batterij laden",domain:"sensor"},{key:"battery_discharge_entity",label:"Batterij ontladen",domain:"sensor"},{key:"solar_power_entity",label:"Zonnepanelen opbrengst",domain:"sensor"},{key:"home_consumption_entity",label:"Huisverbruik",domain:"sensor"},{key:"monthly_peak_entity",label:"Maandelijkse vermogenspiek",domain:"sensor"}];function g(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}var H=class extends ft{_config;_hass=null;constructor(){super(),this.attachShadow({mode:"open"}),this._config=v(void 0),this._onInput=this._onInput.bind(this),this._onClick=this._onClick.bind(this),this._onSelectorChange=this._onSelectorChange.bind(this)}get root(){return this.shadowRoot}setConfig(e){this._config=v(e),this._render()}set hass(e){this._hass=e,this.root.querySelectorAll("ha-selector").forEach(i=>{i.hass=e})}get hass(){return this._hass}connectedCallback(){this.root.addEventListener("input",this._onInput),this.root.addEventListener("click",this._onClick),this.root.addEventListener("value-changed",this._onSelectorChange)}disconnectedCallback(){this.root.removeEventListener("input",this._onInput),this.root.removeEventListener("click",this._onClick),this.root.removeEventListener("value-changed",this._onSelectorChange)}_emit(){this.dispatchEvent(new CustomEvent("config-changed",{bubbles:!0,composed:!0,detail:{config:this._config}}))}_updateGeneral(e,i){this._config={...this._config,general:{...this._config.general,[e]:i}},this._emit()}_updateRoom(e,i){this._config={...this._config,rooms:this._config.rooms.map(o=>o.key===e?{...o,...i}:o)},this._emit()}_addRoom(){we+=1;let e={key:`room-${Date.now().toString(36)}-${we}`,name:"Nieuwe kamer"};this._config={...this._config,rooms:[...this._config.rooms,e]},this._emit(),this._render()}_removeRoom(e){this._config={...this._config,rooms:this._config.rooms.filter(i=>i.key!==e)},this._emit(),this._render()}_updateToday(e){this._config={...this._config,today:{...this._config.today,...e}},this._emit()}_updateAction(e,i){this._config={...this._config,quick_actions:this._config.quick_actions.map(o=>o.key===e?{...o,...i}:o)},this._emit()}_addAction(){je+=1;let e={key:`action-${Date.now().toString(36)}-${je}`,label:"Nieuwe actie",entity:"",service:"toggle"};this._config={...this._config,quick_actions:[...this._config.quick_actions,e]},this._emit(),this._render()}_removeAction(e){this._config={...this._config,quick_actions:this._config.quick_actions.filter(i=>i.key!==e)},this._emit(),this._render()}_onInput(e){let i=e.target;if(!i)return;let o=i.dataset.field;if(!o)return;if(i.dataset.scope==="general"){o==="title"&&this._updateGeneral("title",i.value),o==="start_view"&&this._updateGeneral("start_view",i.value),o==="theme_mode"&&this._updateGeneral("theme_mode",i.value);return}if(i.dataset.scope==="action"){let n=i.dataset.actionKey;if(!n)return;o==="label"&&this._updateAction(n,{label:i.value}),o==="icon"&&this._updateAction(n,{icon:i.value||void 0}),o==="service"&&this._updateAction(n,{service:i.value});return}let r=i.dataset.room;r&&(o==="name"&&this._updateRoom(r,{name:i.value}),o==="icon"&&this._updateRoom(r,{icon:i.value||void 0}))}_onSelectorChange(e){let i=e.target;if(!i||i.tagName.toLowerCase()!=="ha-selector")return;e.stopPropagation();let o=i.dataset.field,r=i.dataset.scope;if(!o)return;if(r==="today"){if(o==="waste_entities"){let d=Array.isArray(e.detail?.value)?e.detail.value.filter(l=>typeof l=="string"):[];this._updateToday({waste_entities:d});return}let s=typeof e.detail?.value=="string"?e.detail.value:void 0;this._updateToday({[o]:s});return}if(r==="action"){let s=i.dataset.actionKey;if(!s)return;let d=typeof e.detail?.value=="string"?e.detail.value:"";this._updateAction(s,{entity:d});return}let n=i.dataset.room;if(!n)return;let c=typeof e.detail?.value=="string"?e.detail.value:void 0;this._updateRoom(n,{[o]:c})}_onClick(e){let i=e.target?.closest("[data-action]");i&&(i.dataset.action==="add-room"&&this._addRoom(),i.dataset.action==="remove-room"&&i.dataset.room&&this._removeRoom(i.dataset.room),i.dataset.action==="add-action"&&this._addAction(),i.dataset.action==="remove-action"&&i.dataset.actionKey&&this._removeAction(i.dataset.actionKey))}_render(){let e=this._config;this.root.innerHTML=`
      <style>${ht}</style>
      <div class="jde-section">
        <h3>Algemeen</h3>
        <label>Titel
          <input type="text" data-scope="general" data-field="title" value="${g(e.general.title)}">
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
        ${ke.map(i=>`
          <label>${g(i.label)}
            <ha-selector data-scope="today" data-field="${i.key}"></ha-selector>
          </label>`).join("")}
        <label>Afvalbronnen
          <ha-selector data-scope="today" data-field="waste_entities"></ha-selector>
        </label>
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
      </div>`,this.root.querySelectorAll("ha-selector").forEach(i=>{let o=i,r=o.dataset.scope,n=o.dataset.field;if(!n)return;if(r==="today"){if(n==="waste_entities")o.selector={entity:{multiple:!0}},o.value=e.today.waste_entities??[];else{let l=ke.find(h=>h.key===n);o.selector={entity:l?.domain?{domain:l.domain}:{}},o.value=e.today[n]??""}this._hass&&(o.hass=this._hass);return}if(r==="action"){let l=o.dataset.actionKey,h=e.quick_actions.find(b=>b.key===l);if(!h)return;o.selector={entity:{}},o.value=h.entity??"",this._hass&&(o.hass=this._hass);return}let c=o.dataset.room;if(!c)return;let s=e.rooms.find(l=>l.key===c),d=xe.find(l=>l.key===n);!s||!d||(o.selector={entity:d.domain?{domain:d.domain}:{}},o.value=s[d.key]??"",this._hass&&(o.hass=this._hass))})}_actionHtml(e){return`
      <div class="jde-room">
        <div class="jde-room-head">
          <input type="text" data-scope="action" data-action-key="${e.key}" data-field="label" value="${g(e.label)}" placeholder="Label">
          <button type="button" data-action="remove-action" data-action-key="${e.key}" aria-label="Actie verwijderen">&times;</button>
        </div>
        <label>Icoon
          <input type="text" data-scope="action" data-action-key="${e.key}" data-field="icon" value="${g(e.icon??"")}" placeholder="mdi:lightning-bolt">
        </label>
        <label>Entiteit
          <ha-selector data-scope="action" data-action-key="${e.key}" data-field="entity"></ha-selector>
        </label>
        <label>Service (bv. toggle, turn_on, alarm_arm_home)
          <input type="text" data-scope="action" data-action-key="${e.key}" data-field="service" value="${g(e.service)}" placeholder="toggle">
        </label>
      </div>`}_roomHtml(e){return`
      <div class="jde-room">
        <div class="jde-room-head">
          <input type="text" data-room="${e.key}" data-field="name" value="${g(e.name)}" placeholder="Kamernaam">
          <button type="button" data-action="remove-room" data-room="${e.key}" aria-label="Kamer verwijderen">&times;</button>
        </div>
        <label>Icoon
          <input type="text" data-room="${e.key}" data-field="icon" value="${g(e.icon??"")}" placeholder="mdi:sofa">
        </label>
        ${xe.map(i=>`
          <label>${g(i.label)}
            <ha-selector data-room="${e.key}" data-field="${i.key}"></ha-selector>
          </label>`).join("")}
      </div>`}},ht=`
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
`;function F(){typeof customElements>"u"||customElements.get("juiced-dashboard-strategy-editor")||customElements.define("juiced-dashboard-strategy-editor",H)}var Ce=Object.freeze({name:"Juiced Dashboard",version:"0.1.0"});typeof window<"u"&&(I(),F(),U(),N(),window.__JUICED_DASHBOARD_BUILD__=Ce,console.info("%c JUICED DASHBOARD %c "+Ce.version,"color: #081018; background: #5cc8ff; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;","color: #5cc8ff; background: #0f1115; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;"));export{j as CONFIG_SCHEMA_VERSION,ue as DEFAULT_CLIMATE_TARGET,A as JuicedDashboardQuickActions,C as JuicedDashboardRoomCard,R as JuicedDashboardStrategy,H as JuicedDashboardStrategyEditor,S as JuicedDashboardTodayCard,T as JuicedDashboardViewStrategy,J as START_VIEWS,O as THEME_MODES,V as VIEW_PATHS,Ce as buildInfo,_e as buildView,ce as closeCover,ie as collectEntityIds,v as compileConfig,B as compileRoomForCard,X as coverPosition,ee as coverPositionLabel,z as createDefaultConfig,x as displayName,p as entityState,a as escapeHtml,w as formatNumber,y as formatTemp,oe as hasRelevantChange,Z as humanize,$ as hvacModeLabel,m as isUnavailable,se as openCover,F as registerJuicedDashboardEditor,K as registerJuicedDashboardQuickActions,I as registerJuicedDashboardRoomCard,N as registerJuicedDashboardStrategy,P as registerJuicedDashboardTodayCard,U as registerJuicedDashboardViewStrategy,te as roomEntityIds,re as roomFlag,Ae as roomHasControls,M as roomIconSvg,ne as roomLightsOn,he as roomPath,D as roomStatLine,le as setHvacMode,pe as stepClimateTarget,de as stopCover,ae as toggleLight,me as toggleMediaPlayPause};
