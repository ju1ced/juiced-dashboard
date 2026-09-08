/*! Juiced Dashboard 0.1.0 | MIT License | https://github.com/ju1ced/juiced-dashboard */
function n(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}var Te=new Set(["unavailable","unknown"]);function m(t){return t==null||Te.has(t)}function p(t,e){return!e||!t?null:t.states?.[e]||null}function w(t,e){let i=Number(t);return Number.isFinite(i)?i.toFixed(e??1).replace(".",","):null}function b(t,e){let i=w(t,e);return i===null?null:`${i}\xB0`}var He={off:"Uit",heat:"Verwarmen",cool:"Koelen",heat_cool:"Auto",auto:"Auto",fan_only:"Ventilator",dry:"Droog"};function ee(t){let e=String(t??"").replace(/_/g," ");return e?e.charAt(0).toUpperCase()+e.slice(1):""}function D(t){return t&&(He[t]||ee(t))||"Onbekend"}function te(t){if(!t)return null;let e=t.attributes?.current_position;return typeof e=="number"&&Number.isFinite(e)?Math.round(e):t.state==="open"?100:t.state==="closed"?0:null}function ie(t){let e=te(t);return e===null?"\u2014":`${e}%`}function j(t,e,i){if(t)return t;let r=e?.attributes?.friendly_name;return typeof r=="string"&&r?r:i||""}function re(t){let e=[],i=r=>{typeof r=="string"&&r.includes(".")&&e.push(r)};return i(t?.temperature),i(t?.humidity),i(t?.media_player),i(t?.climate),(t?.lights||[]).forEach(r=>i(r?.entity)),(t?.covers||[]).forEach(r=>i(r?.entity)),(t?.awnings||[]).forEach(r=>i(r?.entity)),e}function oe(t){let e=new Set;return(t?.rooms||[]).forEach(i=>{re(i).forEach(r=>e.add(r))}),[...e]}function ae(t,e,i){if(!t||!e)return!0;let r=t.states||{},a=e.states||{};for(let o of i){let c=r[o],s=a[o];if(!c||!s){if(c!==s)return!0;continue}if(c.state!==s.state||c.last_updated!==s.last_updated)return!0}return!1}function M(t,e){let i=[],r=p(t,e?.temperature);if(r&&!m(r.state)){let o=b(r.state,1);o&&i.push(o)}let a=p(t,e?.humidity);if(a&&!m(a.state)){let o=w(a.state,0);o&&i.push(`${o}%`)}return i.length?i.join(" \xB7 "):e?.idle_text||"Rustig"}function ne(t,e){return(e?.lights||[]).filter(i=>p(t,i?.entity)?.state==="on").length}function se(t,e){let i=ne(t,e);return i<=0?null:i===1?"1 lamp aan":`${i} lampen aan`}function $e(t){return!!((t?.lights||[]).length||(t?.covers||[]).length||(t?.awnings||[]).length||t?.media_player||t?.climate)}function y(t,e,i,r,a){!t||!r||t.callService(e,i,{entity_id:r,...a||{}})}function ce(t,e){y(t,"light","toggle",e)}function de(t,e){y(t,"cover","open_cover",e)}function le(t,e){y(t,"cover","close_cover",e)}function ue(t,e){y(t,"cover","stop_cover",e)}function pe(t,e,i){y(t,"climate","set_hvac_mode",e,{hvac_mode:i})}var me=20;function ge(t,e,i,r){let o=i!==""&&i!==null&&i!==void 0?Number(i):NaN,c=Number.isFinite(o)?o:me,s=Math.round((c+r)*10)/10;y(t,"climate","set_temperature",e,{temperature:s})}function fe(t,e){y(t,"media_player","media_play_pause",e)}var De=typeof HTMLElement>"u"?class{}:HTMLElement,E=class extends De{_config=null;_hass=null;_entityIds=[];_openRoomIndex=null;_built=!1;constructor(){super(),this.attachShadow({mode:"open"}),this._onClick=this._onClick.bind(this),this._onKeydown=this._onKeydown.bind(this),this._onDocKeydown=this._onDocKeydown.bind(this)}get root(){return this.shadowRoot}static getStubConfig(){return{type:"custom:juiced-dashboard-room-card",title:"Kamers",subtitle:"Tik een kamer om lichten, rolluiken, luifels, radio of airco direct te bedienen",rooms:[{name:"Bureau",icon:"mdi:desk",temperature:"sensor.bureau_temperature",humidity:"sensor.bureau_humidity",lights:[{entity:"light.bureau_spellenruimte",name:"Bureau & spellenruimte"},{entity:"light.bureau_spellentafel",name:"Spellentafel"}],awnings:[{entity:"cover.luifel_bureau",name:"Luifel bureau"}],media_player:"media_player.kantoor",climate:"climate.daikin_bureau"}]}}setConfig(e){if(!e||typeof e!="object")throw new Error("juiced-dashboard-room-card: invalid configuration.");if(!Array.isArray(e.rooms))throw new Error("juiced-dashboard-room-card: `rooms` must be a list.");e.rooms.forEach((i,r)=>{if(!i||typeof i!="object")throw new Error(`juiced-dashboard-room-card: room at index ${r} must be an object.`);if(!i.name)throw new Error(`juiced-dashboard-room-card: room at index ${r} is missing \`name\`.`)}),this._config=e,this._entityIds=oe(e),this._openRoomIndex=null,this._built=!1,this._renderShell(),this._renderList(),this._built=!0}set hass(e){let i=this._hass;this._hass=e,this._config&&(this._built&&i&&!ae(i,e,this._entityIds)||(this._renderList(),this._openRoomIndex!==null&&this._renderPopup()))}get hass(){return this._hass}getCardSize(){return 1+Math.ceil((this._config?.rooms?.length||0)/2)}connectedCallback(){this.root.addEventListener("click",this._onClick),this.root.addEventListener("keydown",this._onKeydown)}disconnectedCallback(){this.root.removeEventListener("click",this._onClick),this.root.removeEventListener("keydown",this._onKeydown),typeof document<"u"&&document.removeEventListener("keydown",this._onDocKeydown)}_renderShell(){let e=this._config||{};this.root.innerHTML=`
      <style>${Ne}</style>
      <ha-card class="jrc-shell">
        ${e.title||e.subtitle?`<div class="jrc-head">
                ${e.title?`<h2 class="jrc-title">${n(e.title)}</h2>`:""}
                ${e.subtitle?`<p class="jrc-subtitle">${n(e.subtitle)}</p>`:""}
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
            <button class="jrc-close" data-action="close" aria-label="Sluiten">${Ie}</button>
          </div>
          <div class="jrc-popup-body" id="popup-body"></div>
        </div>
      </div>`}_renderList(){let e=this.root.getElementById("list");if(!e)return;let i=this._hass,r=this._config?.rooms||[];e.innerHTML=r.map((a,o)=>this._roomRowHtml(a,o,i)).join("")}_roomRowHtml(e,i,r){let a=M(r,e),o=se(r,e),c=(e.lights||[])[0],s=c?p(r,c.entity)?.state==="on":!1;return`
      <div class="jrc-row" role="button" tabindex="0" data-action="open-room" data-room="${i}">
        <span class="jrc-row-ic">${I(e.icon)}</span>
        <span class="jrc-row-text">
          <span class="jrc-row-name">${n(e.name)}</span>
          <span class="jrc-row-stat">${n(a)}</span>
        </span>
        ${o?`<span class="jrc-flag">${n(o)}</span>`:""}
        ${c?`<button class="jrc-quick${s?" on":""}" data-action="toggle-light"
                 data-entity="${n(c.entity)}"
                 aria-label="Licht ${n(e.name)} omschakelen" title="Licht omschakelen">${X}</button>`:`<span class="jrc-chev">${Me}</span>`}
      </div>`}_openRoom(e){if(!(this._config?.rooms||[])[e])return;this._openRoomIndex=e,this._renderPopup(),this.root.getElementById("backdrop")?.classList.add("show"),typeof document<"u"&&document.addEventListener("keydown",this._onDocKeydown)}_closePopup(){this._openRoomIndex=null,this.root.getElementById("backdrop")?.classList.remove("show"),typeof document<"u"&&document.removeEventListener("keydown",this._onDocKeydown)}_renderPopup(){let e=(this._config?.rooms||[])[this._openRoomIndex];if(!e)return;let i=this._hass,r=this.root.getElementById("popup-icon");r&&(r.innerHTML=I(e.icon));let a=this.root.getElementById("popup-name");a&&(a.textContent=e.name);let o=this.root.getElementById("popup-sub");o&&(o.textContent=M(i,e));let c=[this._sectionLights(i,e),this._sectionCovers(i,e,"covers","Rolluiken"),this._sectionCovers(i,e,"awnings","Luifels"),this._sectionMedia(i,e),this._sectionClimate(i,e)].filter(Boolean).join(""),s=this.root.getElementById("popup-body");s&&(s.innerHTML=c||'<p class="jrc-empty">Geen snelbediening geconfigureerd voor deze kamer.</p>')}_sectionLights(e,i){let r=i.lights||[];return r.length?`<div class="jrc-section"><h4>Verlichting</h4>${r.map(o=>{let c=p(e,o.entity),s=c?.state==="on",d=j(o.name,c,o.entity),u=m(c?.state);return`
          <div class="jrc-lightrow${s?" on":""}">
            <span class="jrc-lrow-ic">${X}</span>
            <span class="jrc-lrow-text">
              <span class="jrc-lrow-name">${n(d)}</span>
              <span class="jrc-lrow-sub">${u?"Niet beschikbaar":s?"Aan":"Uit"}</span>
            </span>
            <button class="jrc-toggle${s?" on":""}" data-action="toggle-light"
              data-entity="${n(o.entity)}" ${u?"disabled":""}
              aria-label="${n(d)} omschakelen"><i></i></button>
          </div>`}).join("")}</div>`:""}_sectionCovers(e,i,r,a){let o=i[r]||[];if(!o.length)return"";let c=o.map(s=>{let d=p(e,s.entity),u=j(s.name,d,s.entity);return`
          <div class="jrc-coverrow">
            <span class="jrc-cr-name">${n(u)}</span>
            <span class="jrc-cr-pos">${ie(d)}</span>
            <span class="jrc-cr-btns">
              <button data-action="cover-open" data-entity="${n(s.entity)}" aria-label="Omhoog">${Je}</button>
              <button data-action="cover-stop" data-entity="${n(s.entity)}" aria-label="Stop">${ze}</button>
              <button data-action="cover-close" data-entity="${n(s.entity)}" aria-label="Omlaag">${Ve}</button>
            </span>
          </div>`}).join("");return`<div class="jrc-section"><h4>${n(a)}</h4>${c}</div>`}_sectionMedia(e,i){if(!i.media_player)return"";let r=p(e,i.media_player),a=j(null,r,i.media_player),o=r?.attributes?.media_title,c=typeof o=="string"&&o?o:m(r?.state)?"Niet beschikbaar":"Uit",s=r?.state==="playing";return`
      <div class="jrc-section">
        <h4>Media</h4>
        <div class="jrc-media">
          <span class="jrc-media-ic">${Oe}</span>
          <span class="jrc-media-text">
            <span class="jrc-media-name">${n(a)}</span>
            <span class="jrc-media-sub">${n(c)}</span>
          </span>
          <button class="jrc-media-btn${s?" on":""}" data-action="media-toggle"
            data-entity="${n(i.media_player)}" aria-label="Afspelen/pauzeren">${Ke}</button>
        </div>
      </div>`}_sectionClimate(e,i){if(!i.climate)return"";let r=p(e,i.climate),a=j(null,r,i.climate),o=r?.attributes?.hvac_modes,c=Array.isArray(o)?o.filter(x=>typeof x=="string"):[],s=r?.state,d=b(r?.attributes?.current_temperature,1),u=r?.attributes?.temperature,g=b(u,1)||"\u2014",h=Number(r?.attributes?.target_temp_step),W=Number.isFinite(h)&&h>0?h:.5,Y=c.map(x=>`
        <button class="jrc-pill${x===s?" on":""}" data-action="climate-mode"
          data-entity="${n(i.climate)}" data-mode="${n(x)}">${n(D(x))}</button>`).join(""),Z=typeof u=="string"||typeof u=="number"?String(u):"";return`
      <div class="jrc-section">
        <h4>Klimaat</h4>
        <div class="jrc-kv"><span>${n(a)}</span><span class="ok">${n(D(s))}</span></div>
        ${Y?`<div class="jrc-pillrow">${Y}</div>`:""}
        <div class="jrc-stepper">
          <button data-action="climate-step" data-entity="${n(i.climate)}"
            data-target="${Z}" data-step="${-W}" aria-label="Kouder">\u2212</button>
          <div class="jrc-stepper-mid">
            <div class="v">${n(g)}</div>
            <div class="l">doel${d?` \xB7 nu ${n(d)}`:""}</div>
          </div>
          <button data-action="climate-step" data-entity="${n(i.climate)}"
            data-target="${Z}" data-step="${W}" aria-label="Warmer">+</button>
        </div>
      </div>`}_onClick(e){let r=e.target?.closest("[data-action]");if(!r)return;let a=r.dataset.action,o=this._hass;if(a==="open-room"){this._openRoom(Number(r.dataset.room));return}if(a==="close"||a==="close-backdrop"){if(a==="close-backdrop"&&e.target!==r)return;this._closePopup();return}if(a==="toggle-light"){e.stopPropagation(),ce(o,r.dataset.entity);return}if(a==="cover-open"){de(o,r.dataset.entity);return}if(a==="cover-close"){le(o,r.dataset.entity);return}if(a==="cover-stop"){ue(o,r.dataset.entity);return}if(a==="media-toggle"){fe(o,r.dataset.entity);return}if(a==="climate-mode"){pe(o,r.dataset.entity,r.dataset.mode);return}if(a==="climate-step"){ge(o,r.dataset.entity,r.dataset.target,Number(r.dataset.step));return}}_onKeydown(e){if(e.key!=="Enter"&&e.key!==" ")return;let r=e.target?.closest('[data-action="open-room"]');r&&(e.preventDefault(),this._openRoom(Number(r.dataset.room)))}_onDocKeydown(e){e.key==="Escape"&&this._closePopup()}},X='<svg viewBox="0 0 24 24" width="16" height="16"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.4 10.9c.5.5.9 1.2 1 2h4.8c.1-.8.5-1.5 1-2A6 6 0 0 0 12 3z"/></g></svg>',Me='<svg viewBox="0 0 24 24" width="15" height="15"><polyline points="9 6 15 12 9 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',Ie='<svg viewBox="0 0 24 24" width="15" height="15"><g stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></g></svg>',Je='<svg viewBox="0 0 24 24" width="14" height="14"><polyline points="6 15 12 9 18 15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',Ve='<svg viewBox="0 0 24 24" width="14" height="14"><polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',ze='<svg viewBox="0 0 24 24" width="14" height="14"><rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor"/></svg>',Oe='<svg viewBox="0 0 24 24" width="18" height="18"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="3"/><circle cx="12" cy="8.2" r="2.4"/><circle cx="12" cy="16.5" r="1.1"/></g></svg>',Ke='<svg viewBox="0 0 24 24" width="13" height="13"><polygon points="6 4 20 12 6 20" fill="currentColor"/></svg>',Be='<svg viewBox="0 0 24 24" width="17" height="17"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/></g></svg>';function I(t){return typeof t=="string"&&t.startsWith("mdi:")?`<ha-icon icon="${n(t)}"></ha-icon>`:Be}var Ne=`
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
`;function J(){typeof customElements<"u"&&(customElements.get("juiced-dashboard-room-card")||customElements.define("juiced-dashboard-room-card",E)),typeof window<"u"&&(window.customCards=window.customCards||[],window.customCards.some(t=>t.type==="juiced-dashboard-room-card")||window.customCards.push({type:"juiced-dashboard-room-card",name:"Juiced Dashboard Room Card",description:"Tik een kamer, krijg een popup met enkel wat daar bedienbaar is \u2014 lichten, rolluiken, luifels, radio, airco.",preview:!1,documentationURL:"https://github.com/ju1ced/juiced-dashboard"}))}var k=1,V=["home","rooms","energy","domains","more"],z=["home","rooms"],O=["system","light","dark"];function K(){return{type:"custom:juiced-dashboard",schema_version:1,general:{title:"Juiced Dashboard",start_view:"home",theme_mode:"system"},today:{waste_entities:[]},quick_actions:[],security:{cameras:[]},rooms:[]}}function v(t){return typeof t=="object"&&t!==null}function C(t,e){return typeof t=="string"&&t?t:e}function l(t){return typeof t=="string"&&t?t:void 0}function Pe(t,e){return typeof t=="string"&&z.includes(t)?t:e}function qe(t,e){return typeof t=="string"&&O.includes(t)?t:e}var he=0;function Ue(){return he+=1,`room-${Date.now().toString(36)}-${he}`}function Fe(t){let e=K().general;return v(t)?{title:C(t.title,e.title),start_view:Pe(t.start_view,e.start_view),theme_mode:qe(t.theme_mode,e.theme_mode)}:e}function Qe(t){if(!v(t))return null;let e=l(t.name);return e?{key:C(t.key,Ue()),name:e,icon:l(t.icon),temperature_entity:l(t.temperature_entity),humidity_entity:l(t.humidity_entity),light_entity:l(t.light_entity),cover_entity:l(t.cover_entity),awning_entity:l(t.awning_entity),media_player_entity:l(t.media_player_entity),climate_entity:l(t.climate_entity)}:null}function Ge(t){return Array.isArray(t)?t.filter(e=>typeof e=="string"&&e.length>0):[]}function We(t){return v(t)?{weather_entity:l(t.weather_entity),battery_soc_entity:l(t.battery_soc_entity),battery_charge_entity:l(t.battery_charge_entity),battery_discharge_entity:l(t.battery_discharge_entity),solar_power_entity:l(t.solar_power_entity),home_consumption_entity:l(t.home_consumption_entity),monthly_peak_entity:l(t.monthly_peak_entity),waste_entities:Ge(t.waste_entities)}:{waste_entities:[]}}var ye=0;function Ye(){return ye+=1,`action-${Date.now().toString(36)}-${ye}`}function Ze(t){if(!v(t))return null;let e=l(t.entity),i=l(t.service);return!e||!i?null:{key:C(t.key,Ye()),label:C(t.label,e),icon:l(t.icon),entity:e,service:i}}function Xe(t){if(!Array.isArray(t))return[];let e=[];for(let i of t){let r=Ze(i);r&&e.push(r)}return e}var ve=0;function et(){return ve+=1,`camera-${Date.now().toString(36)}-${ve}`}function tt(t){if(!v(t))return null;let e=l(t.name),i=l(t.camera_entity);return!e||!i?null:{key:C(t.key,et()),name:e,camera_entity:i,privacy_entity:l(t.privacy_entity),privacy_service:l(t.privacy_service)}}function it(t){if(!Array.isArray(t))return[];let e=[];for(let i of t){let r=tt(i);r&&e.push(r)}return e}function rt(t){return v(t)?{alarm_entity:l(t.alarm_entity),cameras:it(t.cameras)}:{cameras:[]}}function ot(t){if(!Array.isArray(t))return[];let e=[];for(let i of t){let r=Qe(i);r&&e.push(r)}return e}function _(t){let e=v(t)?t:{};return{type:"custom:juiced-dashboard",schema_version:1,general:Fe(e.general),today:We(e.today),quick_actions:Xe(e.quick_actions),security:rt(e.security),rooms:ot(e.rooms)}}function B(t){return{name:t.name,icon:t.icon,temperature:t.temperature_entity,humidity:t.humidity_entity,lights:t.light_entity?[{entity:t.light_entity}]:[],covers:t.cover_entity?[{entity:t.cover_entity}]:[],awnings:t.awning_entity?[{entity:t.awning_entity}]:[],media_player:t.media_player_entity,climate:t.climate_entity}}var at=typeof HTMLElement>"u"?class{}:HTMLElement,nt={home:{title:"Home",icon:"mdi:home"},rooms:{title:"Kamers",icon:"mdi:floor-plan"},energy:{title:"Energie",icon:"mdi:lightning-bolt"},domains:{title:"Domeinen",icon:"mdi:view-grid-outline"},more:{title:"Meer",icon:"mdi:dots-horizontal-circle-outline"}};function be(t){return`room-${t}`}function st(t,e){let i=nt[t];return{title:i.title,path:t,icon:i.icon,subview:!1,strategy:{type:"custom:juiced-dashboard-view",view:t,general:e.general,today:e.today,quick_actions:e.quick_actions,security:e.security,rooms:e.rooms}}}function ct(t,e){return{title:t.name,path:be(t.key),icon:t.icon||"mdi:sofa-outline",subview:!0,back_path:"rooms",strategy:{type:"custom:juiced-dashboard-view",view:"room",general:e.general,room:t}}}var S=class extends at{static getCreateSuggestions(){return{title:"Juiced Dashboard",icon:"mdi:home-assistant"}}static getConfigElement(){return document.createElement("juiced-dashboard-strategy-editor")}static async generate(e){let i=_(e),r=[i.general.start_view,...V.filter(a=>a!==i.general.start_view)];return{title:i.general.title,views:[...r.map(a=>st(a,i)),...i.rooms.map(a=>ct(a,i))]}}};function N(){if(typeof customElements>"u"||typeof window>"u")return;let t="ll-strategy-dashboard-juiced-dashboard";customElements.get(t)||customElements.define(t,S),window.customStrategies??=[],window.customStrategies.some(e=>e.type==="juiced-dashboard"&&e.strategyType==="dashboard")||window.customStrategies.push({type:"juiced-dashboard",strategyType:"dashboard",name:"Juiced Dashboard",description:"Kia-ge\xEFnspireerd, GUI-geconfigureerd dashboard: Home, Kamers, Energie, Domeinen en Meer.",documentationURL:"https://github.com/ju1ced/juiced-dashboard"})}var dt=typeof HTMLElement>"u"?class{}:HTMLElement,lt='<svg viewBox="0 0 24 24" width="16" height="16"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',ut=new Set(["on","open","armed_home","armed_away","armed_night","playing","heat","cool"]);function pt(t){return t.split(".")[0]??""}var R=class extends dt{_config=null;_hass=null;constructor(){super(),this.attachShadow({mode:"open"}),this._onClick=this._onClick.bind(this)}get root(){return this.shadowRoot}static getStubConfig(){return{type:"custom:juiced-dashboard-quick-actions",actions:[]}}setConfig(e){if(!e||typeof e!="object")throw new Error("juiced-dashboard-quick-actions: invalid configuration.");this._config=e,this._render()}set hass(e){this._hass=e,this._render()}get hass(){return this._hass}getCardSize(){return 1}connectedCallback(){this.root.addEventListener("click",this._onClick)}disconnectedCallback(){this.root.removeEventListener("click",this._onClick)}_onClick(e){let r=e.target?.closest("[data-entity]");if(!r||!this._hass)return;let a=r.dataset.entity,o=r.dataset.service;!a||!o||this._hass.callService(pt(a),o,{entity_id:a})}_render(){if(!this._config)return;let e=this._config.actions??[],i=this._hass;if(e.length===0){this.root.innerHTML=`<style>${_e}</style>`;return}let r=e.map(a=>{let o=p(i,a.entity),c=m(o?.state);return`
          <button class="jqa-chip${!!(o&&ut.has(o.state))?" on":""}" data-entity="${n(a.entity)}" data-service="${n(a.service)}" ${c?"disabled":""}>
            <span class="jqa-ic">${lt}</span>
            <span class="jqa-label">${n(a.label)}</span>
          </button>`}).join("");this.root.innerHTML=`<style>${_e}</style><div class="jqa-row">${r}</div>`}},_e=`
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
`;function P(){typeof customElements>"u"||(customElements.get("juiced-dashboard-quick-actions")||customElements.define("juiced-dashboard-quick-actions",R),typeof window<"u"&&(window.customCards=window.customCards||[],window.customCards.some(t=>t.type==="juiced-dashboard-quick-actions")||window.customCards.push({type:"juiced-dashboard-quick-actions",name:"Juiced Dashboard \u2014 Snelacties",description:"Een kleine, gecureerde rij kruis-kamer acties (alarm, garagepoort, ...).",preview:!1,documentationURL:"https://github.com/ju1ced/juiced-dashboard"})))}var mt=typeof HTMLElement>"u"?class{}:HTMLElement,gt={disarmed:"Uitgeschakeld",armed_home:"Ingeschakeld (thuis)",armed_away:"Ingeschakeld (afwezig)",armed_night:"Ingeschakeld (nacht)",arming:"Wordt ingeschakeld\u2026",pending:"In afwachting\u2026",triggered:"Alarm!"},ft=6e3,A=class extends mt{_config=null;_hass=null;_cameraIndex=0;_timer=null;constructor(){super(),this.attachShadow({mode:"open"}),this._onClick=this._onClick.bind(this)}get root(){return this.shadowRoot}static getStubConfig(){return{type:"custom:juiced-dashboard-security-card",security:{alarm_entity:"alarm_control_panel.huis",cameras:[]}}}setConfig(e){if(!e||typeof e!="object")throw new Error("juiced-dashboard-security-card: invalid configuration.");this._config=e,this._cameraIndex=0,this._render()}set hass(e){this._hass=e,this._render()}get hass(){return this._hass}getCardSize(){return 3}connectedCallback(){this.root.addEventListener("click",this._onClick),this._startTimer()}disconnectedCallback(){this.root.removeEventListener("click",this._onClick),this._stopTimer()}_startTimer(){this._stopTimer(),!((this._config?.security.cameras??[]).length<=1)&&(typeof window<"u"&&window.matchMedia?.("(prefers-reduced-motion: reduce)").matches||(this._timer=setInterval(()=>{let i=this._config?.security.cameras.length??0;i!==0&&(this._cameraIndex=(this._cameraIndex+1)%i,this._render())},ft)))}_stopTimer(){this._timer!==null&&(clearInterval(this._timer),this._timer=null)}_onClick(e){let i=e.target?.closest("[data-action]");if(!i||!this._hass||!this._config)return;let r=i.dataset.action;if(r==="alarm"){let o=i.dataset.service,c=this._config.security.alarm_entity;o&&c&&this._hass.callService("alarm_control_panel",o,{entity_id:c});return}let a=this._config.security.cameras;if(r==="camera-select"){let o=Number(i.dataset.index);Number.isFinite(o)&&(this._cameraIndex=o,this._startTimer(),this._render());return}if(r==="camera-prev"||r==="camera-next"){if(a.length===0)return;let o=r==="camera-prev"?-1:1;this._cameraIndex=(this._cameraIndex+o+a.length)%a.length,this._startTimer(),this._render();return}if(r==="privacy-toggle"){let o=i.dataset.entity,c=i.dataset.service||"toggle";o&&this._hass.callService(o.split(".")[0]??"",c,{entity_id:o});return}}_render(){if(!this._config)return;let e=this._config.security,i=this._alarmHtml(e.alarm_entity),r=this._cameraHtml(e.cameras??[]);if(!i&&!r){this.root.innerHTML=`<style>${xe}</style>`;return}this.root.innerHTML=`<style>${xe}</style><ha-card class="jsc-shell">${i}${r}</ha-card>`}_alarmHtml(e){if(!e)return"";let i=p(this._hass,e);if(!i||m(i.state))return"";let r=gt[i.state]||i.state;return`
      <div class="jsc-alarm">
        <div class="jsc-alarm-text">
          <span class="jsc-alarm-label">Alarm</span>
          <span class="jsc-alarm-status${i.state.startsWith("armed")||i.state==="triggered"?" on":""}">${n(r)}</span>
        </div>
        <div class="jsc-alarm-btns">
          <button data-action="alarm" data-service="alarm_disarm">Uit</button>
          <button data-action="alarm" data-service="alarm_arm_home">Thuis</button>
          <button data-action="alarm" data-service="alarm_arm_away">Afwezig</button>
        </div>
      </div>`}_cameraHtml(e){if(e.length===0)return"";let i=Math.min(this._cameraIndex,e.length-1),r=e[i];if(!r)return"";let o=p(this._hass,r.camera_entity)?.attributes?.entity_picture,c=e.map((s,d)=>d===i?"":this._cameraRowHtml(s,d)).filter(Boolean).join("");return`
      <div class="jsc-cam">
        <div class="jsc-cam-head">
          <span>${n(r.name)} &middot; ${i+1} van ${e.length}</span>
          ${e.length>1?`<span class="jsc-cam-nav">
                  <button data-action="camera-prev" aria-label="Vorige camera">&lsaquo;</button>
                  <button data-action="camera-next" aria-label="Volgende camera">&rsaquo;</button>
                </span>`:""}
        </div>
        <div class="jsc-cam-stage">
          ${typeof o=="string"&&o?`<img src="${n(o)}" alt="${n(r.name)}">`:'<div class="jsc-cam-empty">Geen beeld beschikbaar</div>'}
        </div>
        ${c?`<div class="jsc-cam-list">${c}</div>`:""}
      </div>`}_cameraRowHtml(e,i){let a=(e.privacy_entity?p(this._hass,e.privacy_entity):null)?.state==="on";return`
      <button class="jsc-cam-item" data-action="camera-select" data-index="${i}">
        <span>${n(e.name)}</span>
        ${e.privacy_entity?`<span class="jsc-privacy${a?" on":""}" data-action="privacy-toggle"
                 data-entity="${n(e.privacy_entity)}" data-service="${n(e.privacy_service||"toggle")}">
                 ${a?"Privacy aan":"Privacy uit"}
               </span>`:""}
      </button>`}},xe=`
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
`;function q(){typeof customElements>"u"||(customElements.get("juiced-dashboard-security-card")||customElements.define("juiced-dashboard-security-card",A),typeof window<"u"&&(window.customCards=window.customCards||[],window.customCards.some(t=>t.type==="juiced-dashboard-security-card")||window.customCards.push({type:"juiced-dashboard-security-card",name:"Juiced Dashboard \u2014 Security",description:"Alarmbediening en een doorbladerbare camerastrook, privacy enkel bij camera's die dat effectief hebben.",preview:!1,documentationURL:"https://github.com/ju1ced/juiced-dashboard"})))}var ht=typeof HTMLElement>"u"?class{}:HTMLElement,yt=[{key:"battery_soc_entity",label:"Thuisbatterij SoC"},{key:"battery_charge_entity",label:"Batterij laden"},{key:"battery_discharge_entity",label:"Batterij ontladen"},{key:"solar_power_entity",label:"Zonnepanelen opbrengst"},{key:"home_consumption_entity",label:"Huisverbruik"},{key:"monthly_peak_entity",label:"Maandelijkse vermogenspiek"}];function vt(t,e){let r=p(t,e)?.attributes?.unit_of_measurement;return typeof r=="string"?r:""}function bt(t){return{"clear-night":"Helder",cloudy:"Bewolkt",exceptional:"Uitzonderlijk",fog:"Mist",hail:"Hagel",lightning:"Onweer","lightning-rainy":"Onweer met regen",partlycloudy:"Half bewolkt",pouring:"Zware regen",rainy:"Regenachtig",snowy:"Sneeuw","snowy-rainy":"Natte sneeuw",sunny:"Zonnig",windy:"Winderig","windy-variant":"Winderig"}[t]||t}var L=class extends ht{_config=null;_hass=null;constructor(){super(),this.attachShadow({mode:"open"})}get root(){return this.shadowRoot}static getStubConfig(){return{type:"custom:juiced-dashboard-today-card",today:{weather_entity:"weather.thuis",waste_entities:[]}}}setConfig(e){if(!e||typeof e!="object")throw new Error("juiced-dashboard-today-card: invalid configuration.");this._config=e,this._render()}set hass(e){this._hass=e,this._render()}get hass(){return this._hass}getCardSize(){return 3}_render(){if(!this._config)return;let e=this._config.today??{waste_entities:[]},i=this._hass,r=this._weatherHtml(i,e.weather_entity),a=this._energyHtml(i,e),o=this._wasteHtml(i,e.waste_entities??[]);this.root.innerHTML=`
      <style>${_t}</style>
      <ha-card class="jtc-shell">
        ${r}
        ${a}
        ${o}
      </ha-card>`}_weatherHtml(e,i){let r=p(e,i);if(!i||!r||m(r.state))return"";let a=b(r.attributes?.temperature,1);return`
      <div class="jtc-weather">
        <div>
          <div class="jtc-weather-cond">${n(bt(r.state))}</div>
          <div class="jtc-weather-loc">Thuis &middot; nu</div>
        </div>
        ${a?`<div class="jtc-weather-temp">${n(a)}</div>`:""}
      </div>`}_energyHtml(e,i){let r=yt.map(a=>{let o=i[a.key],c=p(e,o);if(!o||!c||m(c.state))return"";let s=w(c.state,1);if(s===null)return"";let d=vt(e,o);return`
        <div class="jtc-tile">
          <div class="jtc-tile-value">${n(s)}${d?` <span class="jtc-tile-unit">${n(d)}</span>`:""}</div>
          <div class="jtc-tile-label">${n(a.label)}</div>
        </div>`}).join("");return r?`<div class="jtc-energy">${r}</div>`:""}_wasteHtml(e,i){let r=i.map(a=>{let o=p(e,a);if(!o||m(o.state))return"";let c=o.attributes?.friendly_name;return`
          <div class="jtc-waste-chip">
            <div class="jtc-waste-name">${n(typeof c=="string"&&c?c:a)}</div>
            <div class="jtc-waste-value">${n(o.state)}</div>
          </div>`}).filter(Boolean).join("");return r?`
      <div class="jtc-waste">
        <h4>Afvalophaling</h4>
        <div class="jtc-waste-row">${r}</div>
      </div>`:""}},_t=`
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
`;function U(){typeof customElements>"u"||(customElements.get("juiced-dashboard-today-card")||customElements.define("juiced-dashboard-today-card",L),typeof window<"u"&&(window.customCards=window.customCards||[],window.customCards.some(t=>t.type==="juiced-dashboard-today-card")||window.customCards.push({type:"juiced-dashboard-today-card",name:"Juiced Dashboard \u2014 Vandaag",description:"Weer, energie-KPI's en afvalophaling in \xE9\xE9n rustige kaart.",preview:!1,documentationURL:"https://github.com/ju1ced/juiced-dashboard"})))}var xt=typeof HTMLElement>"u"?class{}:HTMLElement;function T(t,e){return{type:"markdown",...e?{title:e}:{},content:t}}var je="Kamers",jt="Tik een kamer om lichten, rolluiken, luifels, radio of airco direct te bedienen";function wt(t){return t?!!(t.weather_entity||t.battery_soc_entity||t.battery_charge_entity||t.battery_discharge_entity||t.solar_power_entity||t.home_consumption_entity||t.monthly_peak_entity||(t.waste_entities??[]).length>0):!1}function kt(t){if(wt(t))return{type:"grid",cards:[{type:"custom:juiced-dashboard-today-card",today:t}]}}function Ct(t){if(!(!t||t.length===0))return{type:"grid",cards:[{type:"custom:juiced-dashboard-quick-actions",actions:t}]}}function Et(t){return t?!!(t.alarm_entity||(t.cameras??[]).length>0):!1}function St(t){if(Et(t))return{type:"grid",cards:[{type:"custom:juiced-dashboard-security-card",security:t}]}}function we(t){return t.length===0?{type:"grid",cards:[T("Voeg kamers toe via **Dashboard bewerken \u2192 instellingen**.",je)]}:{type:"grid",cards:[{type:"custom:juiced-dashboard-room-card",title:je,subtitle:jt,rooms:t.map(B)}]}}function Rt(t){if(!t)return[{type:"grid",cards:[T("Deze kamerconfiguratie ontbreekt.","Kamer")]}];let e=[t.temperature_entity,t.humidity_entity,t.light_entity,t.cover_entity,t.awning_entity,t.media_player_entity,t.climate_entity].filter(r=>!!r),i=[T(`Volledige kamerdetail (hero + secties zoals Klimaat/Verlichting/Sensoren/Media) voor **${t.name}** volgt in een volgende stap.`,t.name)];return e.length>0&&i.push({type:"entities",title:"Entiteiten in deze kamer",entities:e}),[{type:"grid",cards:i}]}function F(t,e){return[{type:"grid",cards:[T(e,t)]}]}function ke(t){let e;switch(t.view){case"home":e=[kt(t.today),St(t.security),Ct(t.quick_actions),we(t.rooms??[])].filter(i=>!!i);break;case"rooms":e=[we(t.rooms??[])];break;case"room":e=Rt(t.room);break;case"energy":e=F("Energie","Energie-overzicht volgt in een volgende stap.");break;case"domains":e=F("Domeinen","Specialistische domeinen (Kia, tuin, robotstofzuiger, zwembad) volgen in een volgende stap.");break;default:e=F("Meer","Instellingen en geschiedenis volgen in een volgende stap.");break}return{type:"sections",max_columns:2,dense_section_placement:!0,sections:e}}var H=class extends xt{static async generate(e){return ke(e)}};function Q(){if(U(),P(),q(),typeof customElements>"u")return;let t="ll-strategy-view-juiced-dashboard-view";customElements.get(t)||customElements.define(t,H)}var At=typeof HTMLElement>"u"?class{}:HTMLElement,Ce=[{key:"temperature_entity",label:"Temperatuursensor",domain:"sensor"},{key:"humidity_entity",label:"Vochtigheidssensor",domain:"sensor"},{key:"light_entity",label:"Licht",domain:"light"},{key:"cover_entity",label:"Rolluik",domain:"cover"},{key:"awning_entity",label:"Luifel",domain:"cover"},{key:"media_player_entity",label:"Mediaspeler",domain:"media_player"},{key:"climate_entity",label:"Klimaat",domain:"climate"}],Ee=0,Se=0,Re=0,Ae=[{key:"weather_entity",label:"Weerbron",domain:"weather"},{key:"battery_soc_entity",label:"Thuisbatterij SoC",domain:"sensor"},{key:"battery_charge_entity",label:"Batterij laden",domain:"sensor"},{key:"battery_discharge_entity",label:"Batterij ontladen",domain:"sensor"},{key:"solar_power_entity",label:"Zonnepanelen opbrengst",domain:"sensor"},{key:"home_consumption_entity",label:"Huisverbruik",domain:"sensor"},{key:"monthly_peak_entity",label:"Maandelijkse vermogenspiek",domain:"sensor"}];function f(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}var $=class extends At{_config;_hass=null;constructor(){super(),this.attachShadow({mode:"open"}),this._config=_(void 0),this._onInput=this._onInput.bind(this),this._onClick=this._onClick.bind(this),this._onSelectorChange=this._onSelectorChange.bind(this)}get root(){return this.shadowRoot}setConfig(e){this._config=_(e),this._render()}set hass(e){this._hass=e,this.root.querySelectorAll("ha-selector").forEach(i=>{i.hass=e})}get hass(){return this._hass}connectedCallback(){this.root.addEventListener("input",this._onInput),this.root.addEventListener("click",this._onClick),this.root.addEventListener("value-changed",this._onSelectorChange)}disconnectedCallback(){this.root.removeEventListener("input",this._onInput),this.root.removeEventListener("click",this._onClick),this.root.removeEventListener("value-changed",this._onSelectorChange)}_emit(){this.dispatchEvent(new CustomEvent("config-changed",{bubbles:!0,composed:!0,detail:{config:this._config}}))}_updateGeneral(e,i){this._config={...this._config,general:{...this._config.general,[e]:i}},this._emit()}_updateRoom(e,i){this._config={...this._config,rooms:this._config.rooms.map(r=>r.key===e?{...r,...i}:r)},this._emit()}_addRoom(){Ee+=1;let e={key:`room-${Date.now().toString(36)}-${Ee}`,name:"Nieuwe kamer"};this._config={...this._config,rooms:[...this._config.rooms,e]},this._emit(),this._render()}_removeRoom(e){this._config={...this._config,rooms:this._config.rooms.filter(i=>i.key!==e)},this._emit(),this._render()}_updateToday(e){this._config={...this._config,today:{...this._config.today,...e}},this._emit()}_updateAction(e,i){this._config={...this._config,quick_actions:this._config.quick_actions.map(r=>r.key===e?{...r,...i}:r)},this._emit()}_addAction(){Se+=1;let e={key:`action-${Date.now().toString(36)}-${Se}`,label:"Nieuwe actie",entity:"",service:"toggle"};this._config={...this._config,quick_actions:[...this._config.quick_actions,e]},this._emit(),this._render()}_removeAction(e){this._config={...this._config,quick_actions:this._config.quick_actions.filter(i=>i.key!==e)},this._emit(),this._render()}_updateSecurity(e){this._config={...this._config,security:{...this._config.security,...e}},this._emit()}_updateCamera(e,i){this._config={...this._config,security:{...this._config.security,cameras:this._config.security.cameras.map(r=>r.key===e?{...r,...i}:r)}},this._emit()}_addCamera(){Re+=1;let e={key:`camera-${Date.now().toString(36)}-${Re}`,name:"Nieuwe camera",camera_entity:""};this._config={...this._config,security:{...this._config.security,cameras:[...this._config.security.cameras,e]}},this._emit(),this._render()}_removeCamera(e){this._config={...this._config,security:{...this._config.security,cameras:this._config.security.cameras.filter(i=>i.key!==e)}},this._emit(),this._render()}_onInput(e){let i=e.target;if(!i)return;let r=i.dataset.field;if(!r)return;if(i.dataset.scope==="general"){r==="title"&&this._updateGeneral("title",i.value),r==="start_view"&&this._updateGeneral("start_view",i.value),r==="theme_mode"&&this._updateGeneral("theme_mode",i.value);return}if(i.dataset.scope==="action"){let o=i.dataset.actionKey;if(!o)return;r==="label"&&this._updateAction(o,{label:i.value}),r==="icon"&&this._updateAction(o,{icon:i.value||void 0}),r==="service"&&this._updateAction(o,{service:i.value});return}if(i.dataset.scope==="camera"){let o=i.dataset.cameraKey;if(!o)return;r==="name"&&this._updateCamera(o,{name:i.value}),r==="privacy_service"&&this._updateCamera(o,{privacy_service:i.value||void 0});return}let a=i.dataset.room;a&&(r==="name"&&this._updateRoom(a,{name:i.value}),r==="icon"&&this._updateRoom(a,{icon:i.value||void 0}))}_onSelectorChange(e){let i=e.target;if(!i||i.tagName.toLowerCase()!=="ha-selector")return;e.stopPropagation();let r=i.dataset.field,a=i.dataset.scope;if(!r)return;if(a==="today"){if(r==="waste_entities"){let d=Array.isArray(e.detail?.value)?e.detail.value.filter(u=>typeof u=="string"):[];this._updateToday({waste_entities:d});return}let s=typeof e.detail?.value=="string"?e.detail.value:void 0;this._updateToday({[r]:s});return}if(a==="action"){let s=i.dataset.actionKey;if(!s)return;let d=typeof e.detail?.value=="string"?e.detail.value:"";this._updateAction(s,{entity:d});return}if(a==="security"){let s=typeof e.detail?.value=="string"?e.detail.value:void 0;this._updateSecurity({alarm_entity:s});return}if(a==="camera"){let s=i.dataset.cameraKey;if(!s)return;let d=typeof e.detail?.value=="string"?e.detail.value:void 0;r==="camera_entity"&&this._updateCamera(s,{camera_entity:d??""}),r==="privacy_entity"&&this._updateCamera(s,{privacy_entity:d});return}let o=i.dataset.room;if(!o)return;let c=typeof e.detail?.value=="string"?e.detail.value:void 0;this._updateRoom(o,{[r]:c})}_onClick(e){let i=e.target?.closest("[data-action]");i&&(i.dataset.action==="add-room"&&this._addRoom(),i.dataset.action==="remove-room"&&i.dataset.room&&this._removeRoom(i.dataset.room),i.dataset.action==="add-action"&&this._addAction(),i.dataset.action==="remove-action"&&i.dataset.actionKey&&this._removeAction(i.dataset.actionKey),i.dataset.action==="add-camera"&&this._addCamera(),i.dataset.action==="remove-camera"&&i.dataset.cameraKey&&this._removeCamera(i.dataset.cameraKey))}_render(){let e=this._config;this.root.innerHTML=`
      <style>${Lt}</style>
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
        ${Ae.map(i=>`
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
      </div>`,this.root.querySelectorAll("ha-selector").forEach(i=>{let r=i,a=r.dataset.scope,o=r.dataset.field;if(!o)return;if(a==="today"){if(o==="waste_entities")r.selector={entity:{multiple:!0}},r.value=e.today.waste_entities??[];else{let u=Ae.find(g=>g.key===o);r.selector={entity:u?.domain?{domain:u.domain}:{}},r.value=e.today[o]??""}this._hass&&(r.hass=this._hass);return}if(a==="action"){let u=r.dataset.actionKey,g=e.quick_actions.find(h=>h.key===u);if(!g)return;r.selector={entity:{}},r.value=g.entity??"",this._hass&&(r.hass=this._hass);return}if(a==="security"){r.selector={entity:{domain:"alarm_control_panel"}},r.value=e.security.alarm_entity??"",this._hass&&(r.hass=this._hass);return}if(a==="camera"){let u=r.dataset.cameraKey,g=e.security.cameras.find(h=>h.key===u);if(!g)return;o==="camera_entity"?(r.selector={entity:{domain:"camera"}},r.value=g.camera_entity??""):(r.selector={entity:{}},r.value=g.privacy_entity??""),this._hass&&(r.hass=this._hass);return}let c=r.dataset.room;if(!c)return;let s=e.rooms.find(u=>u.key===c),d=Ce.find(u=>u.key===o);!s||!d||(r.selector={entity:d.domain?{domain:d.domain}:{}},r.value=s[d.key]??"",this._hass&&(r.hass=this._hass))})}_actionHtml(e){return`
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
        ${Ce.map(i=>`
          <label>${f(i.label)}
            <ha-selector data-room="${e.key}" data-field="${i.key}"></ha-selector>
          </label>`).join("")}
      </div>`}},Lt=`
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
`;function G(){typeof customElements>"u"||customElements.get("juiced-dashboard-strategy-editor")||customElements.define("juiced-dashboard-strategy-editor",$)}var Le=Object.freeze({name:"Juiced Dashboard",version:"0.1.0"});typeof window<"u"&&(J(),G(),Q(),N(),window.__JUICED_DASHBOARD_BUILD__=Le,console.info("%c JUICED DASHBOARD %c "+Le.version,"color: #081018; background: #5cc8ff; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;","color: #5cc8ff; background: #0f1115; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;"));export{k as CONFIG_SCHEMA_VERSION,me as DEFAULT_CLIMATE_TARGET,R as JuicedDashboardQuickActions,E as JuicedDashboardRoomCard,A as JuicedDashboardSecurityCard,S as JuicedDashboardStrategy,$ as JuicedDashboardStrategyEditor,L as JuicedDashboardTodayCard,H as JuicedDashboardViewStrategy,z as START_VIEWS,O as THEME_MODES,V as VIEW_PATHS,Le as buildInfo,ke as buildView,le as closeCover,oe as collectEntityIds,_ as compileConfig,B as compileRoomForCard,te as coverPosition,ie as coverPositionLabel,K as createDefaultConfig,j as displayName,p as entityState,n as escapeHtml,w as formatNumber,b as formatTemp,ae as hasRelevantChange,ee as humanize,D as hvacModeLabel,m as isUnavailable,de as openCover,G as registerJuicedDashboardEditor,P as registerJuicedDashboardQuickActions,J as registerJuicedDashboardRoomCard,q as registerJuicedDashboardSecurityCard,N as registerJuicedDashboardStrategy,U as registerJuicedDashboardTodayCard,Q as registerJuicedDashboardViewStrategy,re as roomEntityIds,se as roomFlag,$e as roomHasControls,I as roomIconSvg,ne as roomLightsOn,be as roomPath,M as roomStatLine,pe as setHvacMode,ge as stepClimateTarget,ue as stopCover,ce as toggleLight,fe as toggleMediaPlayPause};
