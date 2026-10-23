/* JC.icon — SF-Symbol-like glyphs (24×24, currentColor) and original iOS-style app icons. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});

  const F = 'fill="currentColor" stroke="none"';
  const KNOCK = 'style="stroke:var(--knock,#fff)"';
  const KNOCKF = 'style="fill:var(--knock,#fff)"';

  function gearPath(cx, cy, rOut, rIn, teeth, rot) {
    const pts = [];
    const n = teeth * 4;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (rot || 0);
      const r = i % 4 === 0 || i % 4 === 1 ? rOut : rIn;
      pts.push((cx + Math.cos(a) * r).toFixed(2) + ' ' + (cy + Math.sin(a) * r).toFixed(2));
    }
    return 'M' + pts.join('L') + 'Z';
  }

  const PHONE = 'M6.6 3.6c.5-.4 1.3-.3 1.7.2l2 2.7c.4.5.3 1.2-.1 1.6L8.9 9.2c.9 2.1 2.4 3.7 4.5 4.7l1.1-1.3c.4-.5 1.1-.5 1.6-.1l2.7 2c.5.4.6 1.2.2 1.7l-1.2 1.5c-.6.8-1.7 1.1-2.7.8C9.9 16.9 6.2 13.1 4.6 8c-.3-1 0-2.1.8-2.7z';
  const BUBBLE = 'M12 4.2c-4.8 0-8.5 3.1-8.5 7 0 2.2 1.2 4.2 3.1 5.5-.2 1.2-.8 2.3-1.7 3.1 1.9 0 3.6-.7 4.8-1.7.7.1 1.5.2 2.3.2 4.8 0 8.5-3.1 8.5-7S16.8 4.2 12 4.2z';
  const HEART = 'M12 20.2s-7.6-4.6-7.6-10.3A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.6 2.7c0 5.7-7.6 10.3-7.6 10.3z';
  const STAR = 'm12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z';
  const PERSON_HEAD = '<circle cx="12" cy="8" r="4"/>';
  const PERSON_BODY = '<path d="M4.5 20.2c.6-3.9 3.7-6.2 7.5-6.2s6.9 2.3 7.5 6.2c.1.5-.3.8-.8.8H5.3c-.5 0-.9-.3-.8-.8z"/>';
  const LOTUS = '<path d="M12 5c-1.6 2-2.4 4.2-2.4 6.4 0 2.6 1.1 4.6 2.4 5.6 1.3-1 2.4-3 2.4-5.6 0-2.2-.8-4.4-2.4-6.4z"/><path d="M4.5 9.5c.2 3.9 2.5 7 7.5 7.5M19.5 9.5c-.2 3.9-2.5 7-7.5 7.5"/><path d="M3.5 17.5c2.6 1.6 5.4 2.2 8.5 2.2s5.9-.6 8.5-2.2"/>';

  const G = {
    'chevron.left': '<path d="M15 4.5 7.5 12l7.5 7.5"/>',
    'chevron.right': '<path d="M9 4.5 16.5 12 9 19.5"/>',
    'chevron.down': '<path d="M4.5 9 12 16.5 19.5 9"/>',
    'chevron.up': '<path d="M4.5 15 12 7.5l7.5 7.5"/>',
    'chevron.up.chevron.down': '<path d="m8 9 4-4 4 4M8 15l4 4 4-4"/>',
    plus: '<path d="M12 4.5v15M4.5 12h15"/>',
    minus: '<path d="M4.5 12h15"/>',
    xmark: '<path d="M6 6l12 12M18 6 6 18"/>',
    'xmark.circle.fill': `<circle cx="12" cy="12" r="10" ${F}/><path d="M8.6 8.6l6.8 6.8M15.4 8.6l-6.8 6.8" stroke-width="2" ${KNOCK}/>`,
    'plus.circle.fill': `<circle cx="12" cy="12" r="10" ${F}/><path d="M12 7.5v9M7.5 12h9" stroke-width="2.2" ${KNOCK}/>`,
    'minus.circle.fill': `<circle cx="12" cy="12" r="10" ${F}/><path d="M7.5 12h9" stroke-width="2.2" ${KNOCK}/>`,
    'checkmark.circle.fill': `<circle cx="12" cy="12" r="10" ${F}/><path d="m7.6 12.3 3 3 5.8-6.2" stroke-width="2.2" ${KNOCK}/>`,
    'exclamationmark.circle.fill': `<circle cx="12" cy="12" r="10" ${F}/><path d="M12 7v6" stroke-width="2.3" ${KNOCK}/><circle cx="12" cy="16.6" r="1.3" ${KNOCKF}/>`,
    'exclamationmark.triangle.fill': `<path d="M10.3 4.2c.8-1.4 2.7-1.4 3.5 0l7.6 13.4c.8 1.4-.2 3-1.8 3H4.5c-1.6 0-2.6-1.6-1.8-3z" ${F}/><path d="M12 9v5" stroke-width="2.2" ${KNOCK}/><circle cx="12" cy="17.2" r="1.2" ${KNOCKF}/>`,
    'questionmark.circle': '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.6"/><circle cx="12" cy="16.8" r="1" fill="currentColor" stroke="none"/>',
    circle: '<circle cx="12" cy="12" r="9"/>',
    'circle.fill': `<circle cx="12" cy="12" r="9" ${F}/>`,
    'largecircle.fill.circle': `<circle cx="12" cy="12" r="9.2"/><circle cx="12" cy="12" r="5.5" ${F}/>`,
    magnifyingglass: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.4 15.4 5 5"/>',
    'square.and.pencil': '<path d="M11 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V13"/><path d="M17.8 3.7a1.9 1.9 0 0 1 2.7 2.7L12 14.9l-3.5.9.9-3.5z"/>',
    pencil: '<path d="M16.5 4.2a2 2 0 0 1 2.9 2.9L8.6 17.9 4.5 19.5l1.6-4.1z"/><path d="m14.8 6 3.2 3.2"/>',
    ellipsis: `<circle cx="5.5" cy="12" r="1.7" ${F}/><circle cx="12" cy="12" r="1.7" ${F}/><circle cx="18.5" cy="12" r="1.7" ${F}/>`,
    'ellipsis.circle': `<circle cx="12" cy="12" r="9"/><circle cx="8" cy="12" r="1.25" ${F}/><circle cx="12" cy="12" r="1.25" ${F}/><circle cx="16" cy="12" r="1.25" ${F}/>`,
    trash: '<path d="M4.5 6.5h15M9.5 6.5V4.8c0-.7.6-1.3 1.3-1.3h2.4c.7 0 1.3.6 1.3 1.3v1.7M6.5 6.5l.9 12.2c.1 1 .9 1.8 1.9 1.8h5.4c1 0 1.8-.8 1.9-1.8l.9-12.2M10 10.5v6M14 10.5v6"/>',
    'trash.fill': `<path d="M4.5 6.5h15" /><path d="M9.5 6.5V4.8c0-.7.6-1.3 1.3-1.3h2.4c.7 0 1.3.6 1.3 1.3v1.7"/><path d="M6.2 7.5h11.6l-.9 11.3c-.1 1-.9 1.7-1.9 1.7H9c-1 0-1.8-.7-1.9-1.7z" ${F}/>`,
    heart: `<path d="${HEART}"/>`,
    'heart.fill': `<path d="${HEART}" ${F}/>`,
    star: `<path d="${STAR}"/>`,
    'star.fill': `<path d="${STAR}" ${F}/>`,
    'phone.fill': `<path d="${PHONE}" ${F}/>`,
    phone: `<path d="${PHONE}"/>`,
    'phone.down.fill': `<g transform="rotate(135 12 12)"><path d="${PHONE}" ${F}/></g>`,
    'phone.arrow.up.right': `<path d="${PHONE}"/><path d="M15 4h5v5M20 4l-5.5 5.5"/>`,
    'phone.arrow.down.left': `<path d="${PHONE}"/><path d="M19.5 9h-5V4M14.5 9 20 3.5"/>`,
    'video.fill': `<rect x="2.5" y="6.5" width="13" height="11" rx="2.6" ${F}/><path d="M16.5 10.3 21 7.6v8.8l-4.5-2.7z" ${F}/>`,
    video: '<rect x="2.5" y="6.5" width="13" height="11" rx="2.6"/><path d="M16.5 10.3 21 7.6v8.8l-4.5-2.7z"/>',
    'message.fill': `<path d="${BUBBLE}" ${F}/>`,
    message: `<path d="${BUBBLE}"/>`,
    envelope: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m3.8 7 8.2 6 8.2-6"/>',
    'envelope.fill': `<rect x="3" y="5.5" width="18" height="13" rx="2.5" ${F}/><path d="m3.8 7.2 8.2 6 8.2-6" stroke-width="1.6" ${KNOCK}/>`,
    'envelope.open': '<path d="M3 10.5 12 4l9 6.5v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="m3.5 11 8.5 6 8.5-6"/>',
    'info.circle': `<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r="1.15" ${F}/>`,
    checkmark: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    'play.fill': `<path d="M7.5 4.9v14.2c0 .8.9 1.3 1.6.9l11.2-7.1c.6-.4.6-1.3 0-1.7L9.1 4c-.7-.4-1.6.1-1.6.9z" ${F}/>`,
    'pause.fill': `<rect x="6" y="4.5" width="4" height="15" rx="1.3" ${F}/><rect x="14" y="4.5" width="4" height="15" rx="1.3" ${F}/>`,
    'stop.fill': `<rect x="5.5" y="5.5" width="13" height="13" rx="2.5" ${F}/>`,
    'forward.fill': `<path d="M2.8 6.7v10.6c0 .7.8 1.1 1.4.7l7.4-5.3c.5-.4.5-1.1 0-1.5L4.2 5.9c-.6-.4-1.4 0-1.4.8z" ${F}/><path d="M12.3 6.7v10.6c0 .7.8 1.1 1.4.7l7.4-5.3c.5-.4.5-1.1 0-1.5l-7.4-5.3c-.6-.4-1.4 0-1.4.8z" ${F}/>`,
    'backward.fill': `<g transform="matrix(-1 0 0 1 24 0)"><path d="M2.8 6.7v10.6c0 .7.8 1.1 1.4.7l7.4-5.3c.5-.4.5-1.1 0-1.5L4.2 5.9c-.6-.4-1.4 0-1.4.8z" ${F}/><path d="M12.3 6.7v10.6c0 .7.8 1.1 1.4.7l7.4-5.3c.5-.4.5-1.1 0-1.5l-7.4-5.3c-.6-.4-1.4 0-1.4.8z" ${F}/></g>`,
    'gobackward.15': '<path d="M5.2 8.5A8 8 0 1 1 4 12.5"/><path d="M4.5 4.5v4.2h4.2"/><text x="12.3" y="15.6" font-size="7.2" text-anchor="middle" fill="currentColor" stroke="none" font-family="-apple-system,Helvetica,Arial" font-weight="700">15</text>',
    'goforward.15': '<path d="M18.8 8.5A8 8 0 1 0 20 12.5"/><path d="M19.5 4.5v4.2h-4.2"/><text x="11.7" y="15.6" font-size="7.2" text-anchor="middle" fill="currentColor" stroke="none" font-family="-apple-system,Helvetica,Arial" font-weight="700">15</text>',
    shuffle: '<path d="M3.5 7.5h3.2c2 0 3.2 1 4.2 2.6l2.2 3.8c1 1.6 2.2 2.6 4.2 2.6h3.2M3.5 16.5h3.2c1.4 0 2.4-.5 3.2-1.3M13.9 8.8c.8-.8 1.8-1.3 3.2-1.3h3.2"/><path d="m17.8 5 2.7 2.5-2.7 2.5M17.8 14l2.7 2.5-2.7 2.5"/>',
    repeat: '<path d="M4.5 11V9.5a3 3 0 0 1 3-3h12M19.5 13v1.5a3 3 0 0 1-3 3h-12"/><path d="m16.8 3.8 2.7 2.7-2.7 2.7M7.2 20.2l-2.7-2.7 2.7-2.7"/>',
    'mic.fill': `<rect x="8.5" y="2.8" width="7" height="12" rx="3.5" ${F}/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5v3.5"/>`,
    mic: '<rect x="8.5" y="2.8" width="7" height="12" rx="3.5"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5v3.5"/>',
    'mic.slash.fill': `<rect x="8.5" y="2.8" width="7" height="12" rx="3.5" ${F}/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5v3.5M4 3.5l16 16"/>`,
    'camera.fill': `<path d="M8.6 5.2 9.7 3.8c.3-.4.8-.6 1.3-.6h2c.5 0 1 .2 1.3.6l1.1 1.4h2.9a2.7 2.7 0 0 1 2.7 2.7v9.4a2.7 2.7 0 0 1-2.7 2.7H5.7A2.7 2.7 0 0 1 3 16.6V7.9a2.7 2.7 0 0 1 2.7-2.7z" ${F}/><circle cx="12" cy="12.2" r="3.7" stroke-width="1.8" ${KNOCK}/>`,
    camera: '<path d="M8.6 5.2 9.7 3.8c.3-.4.8-.6 1.3-.6h2c.5 0 1 .2 1.3.6l1.1 1.4h2.9a2.7 2.7 0 0 1 2.7 2.7v9.4a2.7 2.7 0 0 1-2.7 2.7H5.7A2.7 2.7 0 0 1 3 16.6V7.9a2.7 2.7 0 0 1 2.7-2.7z"/><circle cx="12" cy="12.2" r="3.7"/>',
    'camera.rotate': '<path d="M8.6 5.2 9.7 3.8c.3-.4.8-.6 1.3-.6h2c.5 0 1 .2 1.3.6l1.1 1.4h2.9a2.7 2.7 0 0 1 2.7 2.7v9.4a2.7 2.7 0 0 1-2.7 2.7H5.7A2.7 2.7 0 0 1 3 16.6V7.9a2.7 2.7 0 0 1 2.7-2.7z"/><path d="M9 11.5a3 3 0 0 1 5.3-1.6M15 13a3 3 0 0 1-5.3 1.6"/><path d="M14.6 8.4v1.8h-1.8M9.4 16.1v-1.8h1.8"/>',
    photo: '<rect x="3" y="4.5" width="18" height="15" rx="2.6"/><circle cx="8.5" cy="9.5" r="1.8"/><path d="m3.5 17 5-5 4 4 2.5-2.5 5.5 5"/>',
    'photo.fill': `<rect x="3" y="4.5" width="18" height="15" rx="2.6" ${F}/><circle cx="8.5" cy="9.5" r="1.8" ${KNOCKF}/><path d="m4 17.5 4.5-4.5 4 4 2.5-2.5 5 4.5" stroke-width="1.8" ${KNOCK}/>`,
    'photo.on.rectangle': '<rect x="6.5" y="3.5" width="15" height="12.5" rx="2.2"/><path d="M3.5 8v10a2.5 2.5 0 0 0 2.5 2.5h12"/><circle cx="11" cy="7.8" r="1.4"/><path d="m7 14.5 4-4 3 3 2-2 5 4.5"/>',
    gear: `<path d="${gearPath(12, 12, 9.4, 7.3, 9, 0.17)}"/><circle cx="12" cy="12" r="3.1"/>`,
    'gearshape.fill': `<path d="${gearPath(12, 12, 9.6, 7.4, 9, 0.17)}" ${F}/><circle cx="12" cy="12" r="3.2" ${KNOCKF}/>`,
    'person.fill': `<g ${F}>${PERSON_HEAD}${PERSON_BODY}</g>`,
    person: `${PERSON_HEAD}<path d="M4.8 20.5c.6-3.9 3.6-6.3 7.2-6.3s6.6 2.4 7.2 6.3"/>`,
    'person.crop.circle': '<circle cx="12" cy="12" r="9.2"/><circle cx="12" cy="9.8" r="3.2"/><path d="M6.3 18.6c1.1-2.4 3.2-3.7 5.7-3.7s4.6 1.3 5.7 3.7"/>',
    'person.crop.circle.fill': `<circle cx="12" cy="12" r="9.5" ${F}/><circle cx="12" cy="9.8" r="3.3" ${KNOCKF}/><path d="M6.4 18.4c1.2-2.4 3.2-3.6 5.6-3.6s4.4 1.2 5.6 3.6A9.4 9.4 0 0 1 12 21.5a9.4 9.4 0 0 1-5.6-3.1z" ${KNOCKF}/>`,
    'person.2.fill': `<g ${F}><circle cx="9" cy="8.5" r="3.4"/><path d="M2.5 19.4c.5-3.3 3.2-5.3 6.5-5.3s6 2 6.5 5.3c.1.4-.2.6-.6.6H3.1c-.4 0-.7-.2-.6-.6z"/><circle cx="16.5" cy="8" r="2.8"/><path d="M16.2 13.2c2.9 0 5 1.7 5.4 4.6.1.4-.2.6-.6.6h-3.5c-.4-2-1.3-3.6-2.8-4.8.5-.3 1-.4 1.5-.4z"/></g>`,
    'person.badge.plus': `${PERSON_HEAD}<path d="M4 20.5c.6-3.9 3.6-6.3 7.2-6.3 1.3 0 2.5.3 3.5.8"/><path d="M18.5 14.5v6M15.5 17.5h6"/>`,
    'location.fill': `<path d="M20.2 3.8 3.7 10.6c-.8.3-.7 1.4.1 1.6l6.3 1.6 1.6 6.3c.2.8 1.3.9 1.6.1z" ${F}/>`,
    location: '<path d="M20.2 3.8 3.7 10.6c-.8.3-.7 1.4.1 1.6l6.3 1.6 1.6 6.3c.2.8 1.3.9 1.6.1z"/>',
    mappin: '<path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.4"/>',
    'mappin.fill': `<path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z" ${F}/><circle cx="12" cy="9.8" r="2.4" ${KNOCKF}/>`,
    'paperplane.fill': `<path d="M20.6 3.4 3.5 10.2c-.7.3-.7 1.3 0 1.6l6.4 2.4 2.4 6.4c.3.7 1.3.7 1.6 0z" ${F}/>`,
    'arrow.up': '<path d="M12 19.5v-15M5.5 11 12 4.5l6.5 6.5"/>',
    'arrow.down': '<path d="M12 4.5v15M5.5 13 12 19.5l6.5-6.5"/>',
    'arrow.left': '<path d="M19.5 12h-15M11 5.5 4.5 12l6.5 6.5"/>',
    'arrow.right': '<path d="M4.5 12h15M13 5.5l6.5 6.5-6.5 6.5"/>',
    'arrow.up.circle.fill': `<circle cx="12" cy="12" r="10.5" ${F}/><path d="M12 17V7.5M7.8 11.5 12 7.3l4.2 4.2" stroke-width="2.3" ${KNOCK}/>`,
    'arrow.up.right': '<path d="M7 17 17 7M8.5 7H17v8.5"/>',
    'arrow.down.left': '<path d="M17 7 7 17M15.5 17H7V8.5"/>',
    'arrow.clockwise': '<path d="M19 12a7 7 0 1 1-2.1-5"/><path d="M19.5 4.5v4.2h-4.2"/>',
    'arrow.counterclockwise': '<path d="M5 12a7 7 0 1 0 2.1-5"/><path d="M4.5 4.5v4.2h4.2"/>',
    'arrowshape.turn.up.left': '<path d="M9.5 5 3.5 11l6 6M3.8 11H14a6.5 6.5 0 0 1 6.5 6.5v1"/>',
    'arrowshape.turn.up.right': '<path d="m14.5 5 6 6-6 6M20.2 11H10a6.5 6.5 0 0 0-6.5 6.5v1"/>',
    'arrow.triangle.turn.up.right.diamond.fill': `<path d="M11 2.6c.6-.6 1.5-.6 2 0l8.4 8.4c.6.6.6 1.5 0 2L13 21.4c-.6.6-1.5.6-2 0L2.6 13c-.6-.6-.6-1.5 0-2z" ${F}/><path d="M9.2 15.5v-2.3c0-1.2 1-2.2 2.2-2.2h4.1M13.6 8.6 16 11l-2.4 2.4" stroke-width="1.8" ${KNOCK}/>`,
    'square.and.arrow.up': '<path d="M12 3.5v11M8 7.5l4-4 4 4"/><path d="M8.5 10.5h-2a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-2"/>',
    'square.and.arrow.down': '<path d="M12 3.5v11M8 10.5l4 4 4-4"/><path d="M8.5 10.5h-2a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-2"/>',
    'doc.on.doc': '<rect x="8" y="7.5" width="11.5" height="13.5" rx="2"/><path d="M5 16.5V5a2 2 0 0 1 2-2h8.5"/>',
    doc: '<path d="M13.5 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z"/><path d="M13.5 3.5V9H19"/>',
    'doc.text': '<path d="M13.5 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z"/><path d="M13.5 3.5V9H19M8.5 13h7M8.5 16.5h7"/>',
    folder: '<path d="M3.5 7.5v10a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2V9.5a2 2 0 0 0-2-2h-6.8L9.6 5.4a1.6 1.6 0 0 0-1.1-.4H5.5a2 2 0 0 0-2 2z"/>',
    'folder.fill': `<path d="M3.5 7.5v10a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2V9.5a2 2 0 0 0-2-2h-6.8L9.6 5.4a1.6 1.6 0 0 0-1.1-.4H5.5a2 2 0 0 0-2 2z" ${F}/>`,
    'tray.fill': `<path d="M4.4 6.3A2 2 0 0 1 6.2 5h11.6a2 2 0 0 1 1.8 1.3l1.9 5.2V17a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2v-5.5z" ${F}/><path d="M3 12h4.5l1.2 2.2h6.6L16.5 12H21" stroke-width="1.6" ${KNOCK}/>`,
    tray: '<path d="M4.4 6.3A2 2 0 0 1 6.2 5h11.6a2 2 0 0 1 1.8 1.3l1.9 5.2V17a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2v-5.5z"/><path d="M3 12h4.5l1.2 2.2h6.6L16.5 12H21"/>',
    'archivebox': '<rect x="3" y="4" width="18" height="5" rx="1.5"/><path d="M4.5 9v9a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V9M10 13h4"/>',
    paperclip: '<path d="m19.5 11.5-7 7a4.6 4.6 0 0 1-6.5-6.5l7.4-7.4a3 3 0 0 1 4.3 4.3l-7.3 7.3a1.5 1.5 0 0 1-2.1-2.1l6.6-6.6"/>',
    'bell.fill': `<path d="M12 3.2a5.7 5.7 0 0 0-5.7 5.7v3.7l-1.6 2.6c-.4.7.1 1.5.9 1.5h12.8c.8 0 1.3-.8.9-1.5l-1.6-2.6V8.9A5.7 5.7 0 0 0 12 3.2z" ${F}/><path d="M9.6 18.6a2.5 2.5 0 0 0 4.8 0z" ${F}/>`,
    bell: '<path d="M12 3.2a5.7 5.7 0 0 0-5.7 5.7v3.7l-1.6 2.6c-.4.7.1 1.5.9 1.5h12.8c.8 0 1.3-.8.9-1.5l-1.6-2.6V8.9A5.7 5.7 0 0 0 12 3.2z"/><path d="M9.8 19a2.4 2.4 0 0 0 4.4 0"/>',
    'bell.slash.fill': `<path d="M12 3.2a5.7 5.7 0 0 0-5.7 5.7v3.7l-1.6 2.6c-.4.7.1 1.5.9 1.5h12.8c.8 0 1.3-.8.9-1.5l-1.6-2.6V8.9A5.7 5.7 0 0 0 12 3.2z" ${F}/><path d="M3.5 3.5l17 17" stroke-width="2.4" ${KNOCK}/><path d="M3.5 3.5l17 17" stroke-width="1.6"/>`,
    'moon.fill': `<path d="M20 14.6A8.3 8.3 0 0 1 9.4 4a8.3 8.3 0 1 0 10.6 10.6z" ${F}/>`,
    moon: '<path d="M20 14.6A8.3 8.3 0 0 1 9.4 4a8.3 8.3 0 1 0 10.6 10.6z"/>',
    'sun.max.fill': `<circle cx="12" cy="12" r="4.4" ${F}/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.5 1.5M17.2 17.2l1.5 1.5M5.3 18.7l1.5-1.5M17.2 6.8l1.5-1.5"/>`,
    'sun.min': '<circle cx="12" cy="12" r="3.6"/><path d="M12 5.2v.6M12 18.2v.6M5.2 12h.6M18.2 12h.6M7.2 7.2l.4.4M16.4 16.4l.4.4M7.2 16.8l.4-.4M16.4 7.6l.4-.4"/>',
    'cloud.fill': `<path d="M7 18.5a4.5 4.5 0 0 1-.5-9 6 6 0 0 1 11.4 1.6A3.8 3.8 0 0 1 17.5 18.5z" ${F}/>`,
    wifi: '<path d="M2.8 9.2a13.2 13.2 0 0 1 18.4 0M5.9 12.5a8.8 8.8 0 0 1 12.2 0M9 15.7a4.4 4.4 0 0 1 6 0"/><circle cx="12" cy="18.8" r="1.4" fill="currentColor" stroke="none"/>',
    'wifi.slash': '<path d="M2.8 9.2a13.2 13.2 0 0 1 18.4 0M5.9 12.5a8.8 8.8 0 0 1 12.2 0M9 15.7a4.4 4.4 0 0 1 6 0M4 4l16 16"/><circle cx="12" cy="18.8" r="1.4" fill="currentColor" stroke="none"/>',
    airplane: `<path d="M21 13.4v-1.7l-7.4-4.6V3.8c0-.9-.7-1.8-1.6-1.8s-1.6.9-1.6 1.8v3.3L3 11.7v1.7l7.4-2.3v4.8l-2.1 1.6v1.5l3.7-1.1 3.7 1.1v-1.5l-2.1-1.6v-4.8z" ${F}/>`,
    'bolt.fill': `<path d="M13.4 2.5 4.6 13.4c-.3.4 0 1 .5 1h5.6l-1.1 7.1 8.8-10.9c.3-.4 0-1-.5-1h-5.6z" ${F}/>`,
    'lock.fill': `<rect x="5" y="10.2" width="14" height="10.5" rx="2.4" ${F}/><path d="M8 10.2V7.5a4 4 0 0 1 8 0v2.7" stroke-width="2.1"/>`,
    'lock.open.fill': `<rect x="5" y="10.2" width="14" height="10.5" rx="2.4" ${F}/><path d="M8 10.2V7.5a4 4 0 0 1 7.7-1.5" stroke-width="2.1"/>`,
    lock: '<rect x="5" y="10.2" width="14" height="10.5" rx="2.4"/><path d="M8 10.2V7.5a4 4 0 0 1 8 0v2.7"/>',
    'lock.rotation': '<path d="M5.2 8.8a8 8 0 0 1 13.4-1.6M18.8 15.2a8 8 0 0 1-13.4 1.6"/><path d="m18.6 3.8.1 3.6-3.6.1M5.4 20.2l-.1-3.6 3.6-.1"/><rect x="9" y="11" width="6" height="4.6" rx="1"/><path d="M10.2 11v-1a1.8 1.8 0 0 1 3.6 0v1"/>',
    'flag.fill': `<path d="M5 21V4.2" stroke-width="2"/><path d="M5.5 4.5c3.8-2 6.2 1.6 10 0 1-.4 2.2-.6 3 .1v8.9c-.8-.7-2-.5-3-.1-3.8 1.6-6.2-2-10 0z" ${F}/>`,
    flag: '<path d="M5 21V4.2"/><path d="M5.5 4.5c3.8-2 6.2 1.6 10 0 1-.4 2.2-.6 3 .1v8.9c-.8-.7-2-.5-3-.1-3.8 1.6-6.2-2-10 0z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.3 2"/>',
    'clock.fill': `<circle cx="12" cy="12" r="9.5" ${F}/><path d="M12 7v5.2l3.3 2" stroke-width="1.9" ${KNOCK}/>`,
    'alarm.fill': `<circle cx="12" cy="13" r="7.8" ${F}/><path d="M12 9v4.3l2.6 1.6" stroke-width="1.8" ${KNOCK}/><path d="M3.8 6.2 7 3.4M20.2 6.2 17 3.4M6.5 19.5l-1.6 1.7M17.5 19.5l1.6 1.7"/>`,
    stopwatch: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4.5M9.8 2.8h4.4M12 2.8V6M18 6.8l1.5-1.5"/>',
    timer: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5V7M12 12 8.6 8.6"/>',
    'stopwatch.fill': `<circle cx="12" cy="13.5" r="7.8" ${F}/><path d="M12 9.6v4.4" stroke-width="2" ${KNOCK}/><path d="M9.8 2.8h4.4M12 2.8V6"/>`,
    hourglass: '<path d="M6.5 3.5h11M6.5 20.5h11M7.5 3.5c0 4.5 4.5 5.3 4.5 8.5s-4.5 4-4.5 8.5M16.5 3.5c0 4.5-4.5 5.3-4.5 8.5s4.5 4 4.5 8.5"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.6"/><path d="M3.5 9.8h17M8 3v4M16 3v4"/>',
    'calendar.badge.plus': '<rect x="3.5" y="5" width="17" height="15.5" rx="2.6"/><path d="M3.5 9.8h17M8 3v4M16 3v4M12 12.5v5M9.5 15h5"/>',
    map: '<path d="M9 4.5 3.5 6.6v13l5.5-2.1 6 2.1 5.5-2.1v-13L15 6.6z"/><path d="M9 4.5v13M15 6.6v13"/>',
    'map.fill': `<path d="M9 4.5 3.5 6.6v13l5.5-2.1 6 2.1 5.5-2.1v-13L15 6.6z" ${F}/><path d="M9 4.5v13M15 6.6v13" stroke-width="1.2" ${KNOCK}/>`,
    'house.fill': `<path d="M12 3.5 3.2 11c-.4.3-.1 1 .4 1H5v7.5c0 .6.4 1 1 1h4v-5.5h4v5.5h4c.6 0 1-.4 1-1V12h1.4c.5 0 .8-.7.4-1z" ${F}/>`,
    house: '<path d="M12 3.5 3.2 11c-.4.3-.1 1 .4 1H5v7.5c0 .6.4 1 1 1h4v-5.5h4v5.5h4c.6 0 1-.4 1-1V12h1.4c.5 0 .8-.7.4-1z"/>',
    'building.2': '<path d="M4 20.5V5.5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v15M13 9.5h6a1 1 0 0 1 1 1v10M2.5 20.5h19M7 8h3M7 11.5h3M7 15h3M16 13h1.5M16 16.5h1.5"/>',
    'briefcase.fill': `<rect x="3" y="7" width="18" height="13" rx="2.4" ${F}/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" stroke-width="1.8"/>`,
    'flashlight.off.fill': `<path d="M8 2.5h8v4.2l-1.6 3v10.8a1.5 1.5 0 0 1-1.5 1.5h-1.8a1.5 1.5 0 0 1-1.5-1.5V9.7L8 6.7z" ${F}/><circle cx="12" cy="13.5" r="1.1" ${KNOCKF}/>`,
    'flashlight.on.fill': `<path d="M8 2.5h8v4.2l-1.6 3v10.8a1.5 1.5 0 0 1-1.5 1.5h-1.8a1.5 1.5 0 0 1-1.5-1.5V9.7L8 6.7z" ${F}/><circle cx="12" cy="13.5" r="1.1" ${KNOCKF}/><path d="M8.3 4.6h7.4" stroke-width="1.4" ${KNOCK}/>`,
    calculator: '<rect x="5" y="2.8" width="14" height="18.4" rx="2.6"/><rect x="7.7" y="5.5" width="8.6" height="3.4" rx=".8"/><path d="M8.3 12.5h.1M12 12.5h.1M15.7 12.5h.1M8.3 15.8h.1M12 15.8h.1M15.7 15.8h.1M8.3 19h.1M12 19h.1M15.7 19h.1" stroke-width="2.2"/>',
    bluetooth: '<path d="m7 7.3 10 9.4-5 4.3V3l5 4.3-10 9.4"/>',
    'antenna.radiowaves.left.and.right': '<circle cx="12" cy="10" r="1.6"/><path d="M12 11.6v8.9M8.2 13.8a5.3 5.3 0 0 1 0-7.6M15.8 6.2a5.3 5.3 0 0 1 0 7.6M5.3 16.6a9.4 9.4 0 0 1 0-13.2M18.7 3.4a9.4 9.4 0 0 1 0 13.2"/>',
    'speaker.wave.2.fill': `<path d="M3.5 9.2v5.6c0 .5.4.9.9.9h2.9l4.4 3.7c.6.5 1.5.1 1.5-.7V5.3c0-.8-.9-1.2-1.5-.7L7.3 8.3H4.4c-.5 0-.9.4-.9.9z" ${F}/><path d="M16 9a4.2 4.2 0 0 1 0 6M18.6 6.4a7.9 7.9 0 0 1 0 11.2"/>`,
    'speaker.slash.fill': `<path d="M3.5 9.2v5.6c0 .5.4.9.9.9h2.9l4.4 3.7c.6.5 1.5.1 1.5-.7V5.3c0-.8-.9-1.2-1.5-.7L7.3 8.3H4.4c-.5 0-.9.4-.9.9z" ${F}/><path d="M16 9.5l5 5M21 9.5l-5 5"/>`,
    'speaker.fill': `<path d="M5.5 9.2v5.6c0 .5.4.9.9.9h2.9l4.4 3.7c.6.5 1.5.1 1.5-.7V5.3c0-.8-.9-1.2-1.5-.7L9.3 8.3H6.4c-.5 0-.9.4-.9.9z" ${F}/>`,
    keypad: `<g ${F}><circle cx="6.5" cy="5" r="1.9"/><circle cx="12" cy="5" r="1.9"/><circle cx="17.5" cy="5" r="1.9"/><circle cx="6.5" cy="10.3" r="1.9"/><circle cx="12" cy="10.3" r="1.9"/><circle cx="17.5" cy="10.3" r="1.9"/><circle cx="6.5" cy="15.6" r="1.9"/><circle cx="12" cy="15.6" r="1.9"/><circle cx="17.5" cy="15.6" r="1.9"/><circle cx="12" cy="20.9" r="1.9"/></g>`,
    recordingtape: '<circle cx="6.8" cy="12" r="3.6"/><circle cx="17.2" cy="12" r="3.6"/><path d="M6.8 15.6h10.4"/>',
    'square.grid.2x2': '<rect x="4" y="4" width="7" height="7" rx="1.8"/><rect x="13" y="4" width="7" height="7" rx="1.8"/><rect x="4" y="13" width="7" height="7" rx="1.8"/><rect x="13" y="13" width="7" height="7" rx="1.8"/>',
    'square.grid.2x2.fill': `<g ${F}><rect x="4" y="4" width="7" height="7" rx="1.8"/><rect x="13" y="4" width="7" height="7" rx="1.8"/><rect x="4" y="13" width="7" height="7" rx="1.8"/><rect x="13" y="13" width="7" height="7" rx="1.8"/></g>`,
    'rectangle.stack': '<rect x="3.5" y="8.5" width="17" height="12" rx="2.4"/><path d="M5.5 5.8h13M7.5 3.3h9"/>',
    'square.on.square': '<rect x="8" y="8" width="12.5" height="12.5" rx="2.2"/><path d="M16 5.5V5a1.5 1.5 0 0 0-1.5-1.5H5A1.5 1.5 0 0 0 3.5 5v9.5A1.5 1.5 0 0 0 5 16h.5"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3.2-3.2a4 4 0 0 0-5.7-5.7l-1.2 1.2"/><path d="M14 10a4 4 0 0 0-5.7 0l-3.2 3.2a4 4 0 0 0 5.7 5.7l1.2-1.2"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.9 5.6 3.9 9s-1.3 6.4-3.9 9c-2.6-2.6-3.9-5.6-3.9-9S9.4 5.6 12 3z"/>',
    book: '<path d="M12 6.5C10.2 5 7.6 4.5 4 4.8v13.5c3.6-.3 6.2.2 8 1.7 1.8-1.5 4.4-2 8-1.7V4.8c-3.6-.3-6.2.2-8 1.7zM12 6.5V20"/>',
    'book.fill': `<path d="M11.2 6.2C9.4 4.8 7 4.4 3.7 4.6c-.4 0-.7.3-.7.7v12.8c0 .4.3.7.7.7 3.1-.1 5.4.3 7.5 1.6zM12.8 6.2c1.8-1.4 4.2-1.8 7.5-1.6.4 0 .7.3.7.7v12.8c0 .4-.3.7-.7.7-3.1-.1-5.4.3-7.5 1.6z" ${F}/>`,
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3.2"/>',
    'eye.slash': '<path d="M2.5 12S6 5.5 12 5.5c1.6 0 3 .4 4.2 1M21.5 12s-1.2 2.3-3.5 4.1M9.2 18c.9.3 1.8.5 2.8.5 6 0 9.5-6.5 9.5-6.5M4 4l16 16"/>',
    'hand.thumbsup.fill': `<path d="M7.5 10.5v9.5H4.6a1 1 0 0 1-1-1v-7.5a1 1 0 0 1 1-1zM9 10.3l3.3-6.1c.3-.5.9-.8 1.5-.6 1.1.3 1.7 1.4 1.4 2.5l-.8 3h4.3c1.2 0 2.1 1.1 1.9 2.3l-1.2 6.8c-.2 1.1-1.1 1.8-2.2 1.8H9z" ${F}/>`,
    'face.smiling': '<circle cx="12" cy="12" r="9"/><path d="M8.2 14.2a4.6 4.6 0 0 0 7.6 0"/><circle cx="9" cy="9.8" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="9.8" r="1.1" fill="currentColor" stroke="none"/>',
    'music.note': `<path d="M9 18V5.5l10-2v12" /><circle cx="6.8" cy="18" r="2.6" ${F}/><circle cx="16.8" cy="15.5" r="2.6" ${F}/>`,
    'music.note.list': '<path d="M3.5 6h10M3.5 10.5h10M3.5 15h6"/><path d="M17 17.5V5l3.5-1"/><circle cx="15" cy="17.5" r="2.2" fill="currentColor" stroke="none"/>',
    waveform: '<path d="M3 11v2M6.2 8v8M9.4 5v14M12.6 9v6M15.8 6.5v11M19 10v4M21.5 11.3v1.4"/>',
    'list.bullet': `<path d="M9 6h11.5M9 12h11.5M9 18h11.5"/><circle cx="4.5" cy="6" r="1.3" ${F}/><circle cx="4.5" cy="12" r="1.3" ${F}/><circle cx="4.5" cy="18" r="1.3" ${F}/>`,
    'line.3.horizontal': '<path d="M4 7h16M4 12h16M4 17h16"/>',
    'line.3.horizontal.decrease': '<path d="M4 7h16M7 12h10M10 17h4"/>',
    'slider.horizontal.3': '<path d="M3.5 6.5h9M16.5 6.5h4M3.5 12h3M10.5 12h10M3.5 17.5h11M18.5 17.5h2"/><circle cx="14.5" cy="6.5" r="2"/><circle cx="8.5" cy="12" r="2"/><circle cx="16.5" cy="17.5" r="2"/>',
    'chart.line.uptrend.xyaxis': '<path d="M3.5 3.5v17h17"/><path d="m6.5 15.5 4-4.5 3 3 6-7"/><path d="M15.5 7h4v4"/>',
    creditcard: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 9.5h19M6 15h4"/>',
    'creditcard.fill': `<rect x="2.5" y="5" width="19" height="14" rx="2.5" ${F}/><path d="M2.5 9.5h19" stroke-width="2.4" ${KNOCK}/>`,
    bag: '<path d="M5.5 8h13l-1 12.5h-11zM9 8V6.5a3 3 0 0 1 6 0V8"/>',
    'bag.fill': `<path d="M5.4 7.5h13.2l-1 12.2c-.1.8-.7 1.3-1.5 1.3H7.9c-.8 0-1.4-.5-1.5-1.3z" ${F}/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>`,
    'car.fill': `<path d="M5.4 6.8C5.8 5.7 6.9 5 8.1 5h7.8c1.2 0 2.3.7 2.7 1.8l1.4 3.7c.9.4 1.5 1.3 1.5 2.3v4.7c0 .6-.4 1-1 1H19v1.5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V18.5H8V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-1.5h-1.5c-.6 0-1-.4-1-1v-4.7c0-1 .6-1.9 1.5-2.3z" ${F}/><path d="M6.4 10h11.2" stroke-width="1.4" ${KNOCK}/><circle cx="6.8" cy="14" r="1.2" ${KNOCKF}/><circle cx="17.2" cy="14" r="1.2" ${KNOCKF}/>`,
    'figure.walk': `<circle cx="13.5" cy="4.3" r="1.9" ${F}/><path d="M12.3 8.2 9.5 10.4 8.6 14M12.3 8.2l1.6 5.4 3.1 2.2M13.2 11.5l-2.7 9M13.9 13.6l1.4 6.9M12.3 8.2l3 .9 1.7 2.4" stroke-width="2"/>`,
    'bed.double.fill': `<path d="M3 11.5V6a1.5 1.5 0 0 1 1.5-1.5h15A1.5 1.5 0 0 1 21 6v5.5zM2 12.5h20v6H2zM3 18.5V20M21 18.5V20" ${F}/><rect x="5" y="7.5" width="5.5" height="3" rx="1" ${KNOCKF}/><rect x="13.5" y="7.5" width="5.5" height="3" rx="1" ${KNOCKF}/>`,
    'flame.fill': `<path d="M12 21.5c-4 0-6.8-2.7-6.8-6.5 0-3.4 2.3-5.5 3.9-7.4.4-.5 1.2-.2 1.2.4 0 1.3.7 2.4 1.7 2.4 1.2 0 1.6-1.1 1.4-2.6-.3-1.9.4-3.8 1.4-5 .4-.4 1-.2 1.1.3.6 2.5 2.9 4.7 2.9 9 0 5.2-3 9.4-6.8 9.4z" ${F}/>`,
    'drop.fill': `<path d="M12 3s-6.5 7.2-6.5 11.6a6.5 6.5 0 0 0 13 0C18.5 10.2 12 3 12 3z" ${F}/>`,
    'leaf.fill': `<path d="M19.6 4.1c-8.4-.6-14.4 3.9-14.4 10.4 0 1.2.3 2.3.7 3.3C8 11.6 13 9 17 8c-4.2 2-8.6 5.3-10.4 11.3.9.4 1.9.6 3 .6 6.5 0 10.6-6 10-15.8z" ${F}/>`,
    'gift.fill': `<path d="M3.5 8.5h17v3.5h-17zM5 12h14v8.5H5z" ${F}/><path d="M12 8.5v12" stroke-width="2" ${KNOCK}/><path d="M12 8.5C10.5 5 7.5 4.5 7 6.3c-.5 1.8 2.8 2.2 5 2.2zM12 8.5c1.5-3.5 4.5-4 5-2.2.5 1.8-2.8 2.2-5 2.2z"/>`,
    'pin.fill': `<path d="M14.6 3.4 20.6 9.4c.4.4.2 1-.3 1.1l-2.8.6-3.6 3.6.3 3.3c0 .4-.4.7-.8.4L4.2 9.2c-.3-.4 0-.8.4-.8l3.3.3 3.6-3.6.6-2.8c.1-.5.7-.7 1.1-.3z" ${F}/><path d="M8.5 15.5 3.5 20.5"/>`,
    pin: '<path d="M14.6 3.4 20.6 9.4c.4.4.2 1-.3 1.1l-2.8.6-3.6 3.6.3 3.3c0 .4-.4.7-.8.4L4.2 9.2c-.3-.4 0-.8.4-.8l3.3.3 3.6-3.6.6-2.8c.1-.5.7-.7 1.1-.3zM8.5 15.5 3.5 20.5"/>',
    'pin.slash': '<path d="M14.6 3.4 20.6 9.4c.4.4.2 1-.3 1.1l-2.8.6-3.6 3.6.3 3.3c0 .4-.4.7-.8.4L4.2 9.2c-.3-.4 0-.8.4-.8l3.3.3 3.6-3.6.6-2.8c.1-.5.7-.7 1.1-.3zM8.5 15.5 3.5 20.5M3.5 3.5l17 17"/>',
    at: '<circle cx="12" cy="12" r="3.6"/><path d="M15.6 9v4.3c0 1.4 1 2.4 2.3 2.4 1.6 0 2.6-1.6 2.6-3.7a8.5 8.5 0 1 0-3.4 6.8"/>',
    textformat: '<path d="M3 18.5 8 5.5l5 13M4.9 14h6.2M15 18.5v-6.2a2.8 2.8 0 0 1 5.5 0v6.2M15 15.3h5.5"/>',
    scribble: '<path d="M4 15c2-4.5 4.5-8 6-7.5 1.8.6-2.7 7.3-.8 8 1.9.7 5.2-7.3 7.3-6.5 1.8.7-1.5 5.6.2 6.3 1 .4 2.3-.6 3.3-1.8"/>',
    sparkles: `<path d="M10 3.5c.6 3.6 2.4 5.4 6 6-3.6.6-5.4 2.4-6 6-.6-3.6-2.4-5.4-6-6 3.6-.6 5.4-2.4 6-6zM18 13c.3 1.9 1.1 2.7 3 3-1.9.3-2.7 1.1-3 3-.3-1.9-1.1-2.7-3-3 1.9-.3 2.7-1.1 3-3z" ${F}/>`,
    'wand.and.stars': '<path d="m4 20 10.5-10.5M13 8l3 3"/><path d="M17 3v3M15.5 4.5h3M20 9v2.5M18.8 10.2h2.5M9 3.5v2M8 4.5h2"/>',
    'crop.rotate': '<path d="M7 3.5v12.5a1 1 0 0 0 1 1h12.5M3.5 7H16a1 1 0 0 1 1 1v12.5"/>',
    'pawprint.fill': `<g ${F}><ellipse cx="6.2" cy="10.2" rx="1.9" ry="2.4"/><ellipse cx="9.8" cy="6.2" rx="1.9" ry="2.5"/><ellipse cx="14.2" cy="6.2" rx="1.9" ry="2.5"/><ellipse cx="17.8" cy="10.2" rx="1.9" ry="2.4"/><path d="M12 11.2c-2.6 0-5.3 3.6-5.3 6 0 1.6 1.2 2.5 2.6 2.5 1.2 0 1.8-.6 2.7-.6s1.5.6 2.7.6c1.4 0 2.6-.9 2.6-2.5 0-2.4-2.7-6-5.3-6z"/></g>`,
    // story glyphs (the brand emblem is JC.world.brand.emblem)
    'vision.hydro': '<path d="M12 2.8 18.4 9.6 12 21.2 5.6 9.6z"/><path d="M12 6.6c-1.6 2.2-2.6 4-2.6 5.4a2.6 2.6 0 0 0 5.2 0c0-1.4-1-3.2-2.6-5.4z" fill="currentColor" stroke="none"/><path d="M5.6 9.6h12.8M9.2 9.6 12 2.8l2.8 6.8" stroke-width="1.2" stroke-opacity=".7"/>',
    hare: '<path d="M5 18c0-3.5 2.4-6.5 6-6.5 2.4 0 4 1 5.4 1 1.6 0 3.6.9 3.6 2.8 0 1.5-1.2 2.7-3 2.7H5z"/><path d="M14 11.8c-.8-2.5-.4-5.6 1.2-6.8 1.5.9 1.4 4.2.4 6.6M16.6 12.6c.5-2.5 1.7-4.6 3.3-5-.2 1.9-1.2 3.9-2.4 5.3"/>',
    'hare.fill': '<path d="M5 18c0-3.5 2.4-6.5 6-6.5 2.4 0 4 1 5.4 1 1.6 0 3.6.9 3.6 2.8 0 1.5-1.2 2.7-3 2.7H5z" fill="currentColor"/><path d="M14 11.8c-.8-2.5-.4-5.6 1.2-6.8 1.5.9 1.4 4.2.4 6.6M16.6 12.6c.5-2.5 1.7-4.6 3.3-5-.2 1.9-1.2 3.9-2.4 5.3" fill="currentColor"/>',
    snowflake: '<path d="M12 2.5v19M3.8 7.25l16.4 9.5M3.8 16.75l16.4-9.5M9.5 4 12 6.3 14.5 4M9.5 20 12 17.7 14.5 20M4.2 10.1l3.2-.9-.9-3.2M19.8 13.9l-3.2.9.9 3.2M6.5 17.8l.9-3.2-3.2-.9M17.5 6.2l-.9 3.2 3.2.9"/>',
    'forward.end.fill': '<path d="M3 6.6c0-.6.7-1 1.2-.6l6.6 5.4c.4.3.4.9 0 1.2l-6.6 5.4c-.5.4-1.2 0-1.2-.6zM10.6 6.6c0-.6.7-1 1.2-.6l6.6 5.4c.4.3.4.9 0 1.2l-6.6 5.4c-.5.4-1.2 0-1.2-.6z" fill="currentColor" stroke="none"/><rect x="18.8" y="5.8" width="2.3" height="12.4" rx=".8" fill="currentColor" stroke="none"/>',
    'moon.zzz.fill': '<path d="M14.6 5.2A8 8 0 1 0 19 17.3 7 7 0 0 1 14.6 5.2z" fill="currentColor" stroke="none"/><path d="M15.5 3.5h3.2l-3.2 3.6h3.2M19.8 8.6h2.2l-2.2 2.5h2.2" stroke-width="1.5"/>',
    lotus: LOTUS,
    'lotus.fill': `<g ${F}><path d="M12 4.6c-1.7 2.1-2.6 4.4-2.6 6.8 0 2.7 1.2 4.8 2.6 5.9 1.4-1.1 2.6-3.2 2.6-5.9 0-2.4-.9-4.7-2.6-6.8z"/><path d="M3.8 9.2c3 .3 5.6 2 6.6 6.3.2.8.5 1.4.9 1.9-4.7-.4-7.4-3.6-7.5-8.2zM20.2 9.2c-3 .3-5.6 2-6.6 6.3-.2.8-.5 1.4-.9 1.9 4.7-.4 7.4-3.6 7.5-8.2z"/></g><path d="M3.5 18.3c2.6 1.5 5.4 2.1 8.5 2.1s5.9-.6 8.5-2.1"/>`,
    checklist: '<path d="m3.5 6.5 1.5 1.5 3-3M3.5 13.5l1.5 1.5 3-3M11 7h9.5M11 14h9.5M11 19.5h9.5"/>',
    'iphone': '<rect x="6.5" y="2.5" width="11" height="19" rx="2.6"/><path d="M10.5 4.6h3"/>',
    'ipad': '<rect x="4" y="2.5" width="16" height="19" rx="2.4"/><circle cx="12" cy="19.2" r=".6" fill="currentColor"/>',
    laptopcomputer: '<rect x="5" y="5" width="14" height="10" rx="1.4"/><path d="M2.5 18h19"/>',
    airpods: '<path d="M7.5 4.5a3 3 0 0 0-3 3c0 1.7 1.3 3 3 3h.5v9a1 1 0 0 0 1 1h.2a1 1 0 0 0 1-1V7.5a3 3 0 0 0-2.7-3zM16.5 4.5a3 3 0 0 1 3 3c0 1.7-1.3 3-3 3H16v9a1 1 0 0 1-1 1h-.2a1 1 0 0 1-1-1V7.5a3 3 0 0 1 2.7-3z"/>',
    key: '<circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3M15.5 12v2.2"/>',
    'tag.fill': `<path d="M3.5 4.7v6.2c0 .5.2 1 .6 1.3l8.7 8.7c.6.6 1.6.6 2.2 0l5.2-5.2c.6-.6.6-1.6 0-2.2L11.5 4.8c-.4-.4-.9-.6-1.4-.6H4.2c-.4 0-.7.2-.7.5z" ${F}/><circle cx="7.6" cy="8.3" r="1.6" ${KNOCKF}/>`,
    'cart.fill': `<path d="M2.5 3.5h2.3c.5 0 .9.3 1 .8l.4 1.7h14.3c.6 0 1.1.6.9 1.2l-1.7 6.6c-.1.5-.6.8-1 .8H8.2l.4 1.9h10.4" stroke-width="1.8"/><circle cx="9.5" cy="19.5" r="1.6" ${F}/><circle cx="17.5" cy="19.5" r="1.6" ${F}/>`,
    'sos': '<rect x="2.5" y="6" width="19" height="12" rx="6"/><text x="12" y="14.6" font-size="7" text-anchor="middle" fill="currentColor" stroke="none" font-weight="800" font-family="-apple-system,Helvetica,Arial">SOS</text>',
    'staroflife.fill': `<path d="M10.4 3h3.2v5.9l5.1-3 1.6 2.8-5.1 3 5.1 2.9-1.6 2.8-5.1-3V21h-3.2v-5.9l-5.1 3-1.6-2.8 5.1-2.9-5.1-3 1.6-2.8 5.1 3z" ${F}/>`,
    'cross.case.fill': `<rect x="2.5" y="6.5" width="19" height="14" rx="2.5" ${F}/><path d="M9 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1.5"/><path d="M12 10v7M8.5 13.5h7" stroke-width="2.2" ${KNOCK}/>`,
    'heart.text.square.fill': `<rect x="3" y="3" width="18" height="18" rx="4" ${F}/><path d="M12 15.8s-4-2.4-4-5.3a2.2 2.2 0 0 1 4-1.3 2.2 2.2 0 0 1 4 1.3c0 2.9-4 5.3-4 5.3z" ${KNOCKF}/>`,
    'waveform.path.ecg': '<path d="M2.5 12.5h4l2-5 3.5 10 2.5-7 1.5 2h5.5"/>',
    'figure.mind.and.body': '<circle cx="12" cy="5" r="2"/><path d="M12 8.5v5M5 11.5c2.3.4 4.6.4 7-.4 2.4.8 4.7.8 7 .4M7 19.5l5-4 5 4"/>',
    'text.bubble': `<path d="${BUBBLE}"/><path d="M8.5 10h7M8.5 13h4.5"/>`,
    'bubble.left.and.bubble.right.fill': `<path d="M9.5 3.5c-4 0-7 2.5-7 5.6 0 1.8.9 3.3 2.4 4.3-.1.9-.6 1.8-1.3 2.4 1.5 0 2.8-.5 3.8-1.3.7.2 1.4.3 2.1.3 4 0 7-2.5 7-5.7s-3-5.6-7-5.6z" ${F}/><path d="M18.4 9.2c1.9.9 3.1 2.5 3.1 4.3 0 1.4-.7 2.6-1.9 3.5.1.7.5 1.4 1 1.9-1.2 0-2.2-.4-3-1-.6.1-1.1.2-1.7.2-2.4 0-4.4-1-5.4-2.6" stroke-width="1.7"/>`,
    'number': '<path d="M9.5 3.5 7.5 20.5M16.5 3.5l-2 17M4 8.5h16.5M3.5 15.5H20"/>',
    'delete.left': '<path d="M9 5.5h10.5a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H9L3 12z"/><path d="m11.5 9.5 5 5M16.5 9.5l-5 5"/>',
    'delete.left.fill': `<path d="M9 5.5h10.5a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H9L3 12z" ${F}/><path d="m11.5 9.5 5 5M16.5 9.5l-5 5" stroke-width="1.8" ${KNOCK}/>`,
    'shift': '<path d="M12 4 3.5 12.5h4.5V20h8v-7.5h4.5z"/>',
    'shift.fill': `<path d="M12 4 3.5 12.5h4.5V20h8v-7.5h4.5z" ${F}/>`,
    'capslock.fill': `<path d="M12 3.5 3.5 12h4.5v4.5h8V12h4.5z" ${F}/><rect x="8" y="18.2" width="8" height="2.3" rx=".6" ${F}/>`,
    'globe.simple': '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.3 2.3 3.4 5.2 3.4 8.5s-1.1 6.2-3.4 8.5c-2.3-2.3-3.4-5.2-3.4-8.5S9.7 5.8 12 3.5z"/>',
    'battery.100': '<rect x="2.5" y="7" width="17" height="10" rx="3"/><rect x="4.5" y="9" width="13" height="6" rx="1.4" fill="currentColor" stroke="none"/><path d="M21.5 10.5v3"/>',
    'battery.25': '<rect x="2.5" y="7" width="17" height="10" rx="3"/><rect x="4.5" y="9" width="3.5" height="6" rx="1.2" fill="currentColor" stroke="none"/><path d="M21.5 10.5v3"/>',
    'cellularbars': `<g ${F}><rect x="3" y="15" width="3.2" height="5" rx="1"/><rect x="8" y="11.5" width="3.2" height="8.5" rx="1"/><rect x="13" y="8" width="3.2" height="12" rx="1"/><rect x="18" y="4.5" width="3.2" height="15.5" rx="1"/></g>`,
    'qrcode': '<rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="14" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="3.5" y="14" width="6.5" height="6.5" rx="1"/><path d="M14 14h3v3h-3zM17.5 17.5h3v3h-3zM14 20.5h.1M20.5 14h.1"/>',
    'tv': '<rect x="2.5" y="4.5" width="19" height="13" rx="2.2"/><path d="M8 20.5h8"/>',
    'rectangle.on.rectangle': '<rect x="3" y="7" width="14" height="10.5" rx="2"/><path d="M7 4.5h12a2 2 0 0 1 2 2v9"/>',
    'record.circle': `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5" ${F}/>`,
    'scissors': '<circle cx="6" cy="6.5" r="2.6"/><circle cx="6" cy="17.5" r="2.6"/><path d="M8.2 8 20 18M8.2 16 20 6"/>',
    'printer': '<path d="M7 8.5V3.5h10v5M7 17H4.5A1.5 1.5 0 0 1 3 15.5v-5.5a1.5 1.5 0 0 1 1.5-1.5h15a1.5 1.5 0 0 1 1.5 1.5v5.5a1.5 1.5 0 0 1-1.5 1.5H17"/><rect x="7" y="13.5" width="10" height="7" rx="1"/>',
    'hand.raised': '<path d="M8 12.5V5.8a1.4 1.4 0 0 1 2.8 0v5M10.8 10.5V4.4a1.4 1.4 0 0 1 2.8 0v6M13.6 10.5V5.6a1.4 1.4 0 0 1 2.8 0v6.8M16.4 12.5V9.3a1.4 1.4 0 0 1 2.8 0v5.2a7 7 0 0 1-7 7h-.6a6.4 6.4 0 0 1-5.2-2.7L4 15.5a1.4 1.4 0 0 1 2.2-1.7L8 15.8"/>',
    'nosign': '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
    'arrow.up.arrow.down': '<path d="M8 20V4.5M4 8.5l4-4 4 4M16 4v15.5M12 15.5l4 4 4-4"/>',
    'gauge': '<path d="M4.2 17.5a8.5 8.5 0 1 1 15.6 0"/><path d="m12 13.5 3.5-4"/><circle cx="12" cy="13.5" r="1.4" fill="currentColor"/>',
    'dot.radiowaves.left.and.right': '<circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none"/><path d="M8.5 15.5a5 5 0 0 1 0-7M15.5 8.5a5 5 0 0 1 0 7M5.6 18.4a9 9 0 0 1 0-12.8M18.4 5.6a9 9 0 0 1 0 12.8"/>',
    'figure.run': '<circle cx="14.5" cy="4.5" r="1.9" fill="currentColor" stroke="none"/><path d="M8 10.5 11 8l3.5 1.5 1.5 3 3 1M11 8l-1.5 5.5 3.5 2.5-1 5M9.5 13.5 6 15.5l-2-1" stroke-width="2"/>',
  };

  const extra = {};
  function markup(name) {
    return extra[name] || G[name] || G['questionmark.circle'];
  }

  function icon(name, opts) {
    opts = opts || {};
    const size = opts.size || 22;
    const sw = opts.weight || 1.8;
    const span = document.createElement('span');
    span.className = 'ic' + (opts.cls ? ' ' + opts.cls : '');
    span.style.width = size + 'px';
    span.style.height = size + 'px';
    if (opts.color) span.style.color = opts.color;
    span.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${markup(name)}</svg>`;
    return span;
  }
  icon.svg = (name, size, sw) => `<svg viewBox="0 0 24 24" width="${size || 22}" height="${size || 22}" fill="none" stroke="currentColor" stroke-width="${sw || 1.8}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${markup(name)}</svg>`;
  icon.add = (map) => Object.assign(extra, map);
  icon.names = () => Object.keys(G).concat(Object.keys(extra));
  icon.has = (n) => !!(G[n] || extra[n]);
  JC.icon = icon;

  // ── App icons (60×60 artboards, original designs) ───────────────
  const W = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"';
  const DAYS3 = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  function clockFace(d) {
    const h = d.getHours() % 12, m = d.getMinutes(), s = d.getSeconds();
    const ah = ((h + m / 60) / 12) * 360, am = ((m + s / 60) / 60) * 360, as = (s / 60) * 360;
    let ticks = '';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const r1 = i % 3 === 0 ? 19 : 20.2, r2 = 22;
      ticks += `<line x1="${30 + Math.sin(a) * r1}" y1="${30 - Math.cos(a) * r1}" x2="${30 + Math.sin(a) * r2}" y2="${30 - Math.cos(a) * r2}" stroke="#1c1c1e" stroke-width="${i % 3 === 0 ? 1.6 : 1}" stroke-linecap="round"/>`;
    }
    const nums = [12, 3, 6, 9].map((n, i) => {
      const a = (i / 4) * Math.PI * 2;
      return `<text x="${30 + Math.sin(a) * 15.2}" y="${30 - Math.cos(a) * 15.2 + 2.6}" font-size="7.2" text-anchor="middle" font-family="-apple-system,Helvetica,Arial" font-weight="500" fill="#1c1c1e">${n}</text>`;
    }).join('');
    return `<svg ${W}><rect width="60" height="60" fill="#0b0b0c"/><circle cx="30" cy="30" r="24.5" fill="#fff"/>${ticks}${nums}` +
      `<line x1="30" y1="30" x2="30" y2="17" stroke="#1c1c1e" stroke-width="2.4" stroke-linecap="round" transform="rotate(${ah} 30 30)"/>` +
      `<line x1="30" y1="30" x2="30" y2="11" stroke="#1c1c1e" stroke-width="1.7" stroke-linecap="round" transform="rotate(${am} 30 30)"/>` +
      `<line x1="30" y1="34" x2="30" y2="10" stroke="#ff9500" stroke-width=".9" stroke-linecap="round" transform="rotate(${as} 30 30)"/>` +
      `<circle cx="30" cy="30" r="1.6" fill="#ff9500"/><circle cx="30" cy="30" r=".6" fill="#fff"/></svg>`;
  }

  function petals() {
    const cols = ['#ff9f0a', '#ffd60a', '#a6e22e', '#30d158', '#40c8e0', '#0a84ff', '#7d5cff', '#ff375f'];
    let s = '';
    for (let i = 0; i < 8; i++) {
      s += `<path d="M30 30 C 25 22, 25.5 12, 30 8 C 34.5 12, 35 22, 30 30Z" fill="${cols[i]}" fill-opacity=".86" transform="rotate(${i * 45} 30 30)" style="mix-blend-mode:multiply"/>`;
    }
    return s;
  }

  const APP_ICONS = {
    phone: () => `<svg ${W}><defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#65f37b"/><stop offset="1" stop-color="#0ab934"/></linearGradient></defs><rect width="60" height="60" fill="url(#a)"/><g transform="translate(12.5 12.5) scale(1.46)" fill="#fff"><path d="${PHONE}"/></g></svg>`,
    messages: () => `<svg ${W}><defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#65f37b"/><stop offset="1" stop-color="#0ab934"/></linearGradient></defs><rect width="60" height="60" fill="url(#a)"/><path d="M30 13.5c-10.8 0-19 6.8-19 15.2 0 4.9 2.8 9.2 7.2 12-.4 2.6-1.7 4.8-3.8 6.6 4 .1 7.6-1.4 10.2-3.6 1.7.4 3.5.5 5.4.5 10.8 0 19-6.8 19-15.5S40.8 13.5 30 13.5z" fill="#fff"/></svg>`,
    facetime: () => `<svg ${W}><defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#65f37b"/><stop offset="1" stop-color="#0ab934"/></linearGradient></defs><rect width="60" height="60" fill="url(#a)"/><rect x="10" y="19" width="27" height="22" rx="5.5" fill="#fff"/><path d="M39 26.5 49.5 20v20L39 33.5z" fill="#fff"/></svg>`,
    safari: () => {
      let ticks = '';
      for (let i = 0; i < 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        const r1 = i % 4 === 0 ? 19.5 : 21;
        ticks += `<line x1="${30 + Math.cos(a) * r1}" y1="${30 + Math.sin(a) * r1}" x2="${30 + Math.cos(a) * 22.6}" y2="${30 + Math.sin(a) * 22.6}" stroke="#fff" stroke-width="${i % 4 === 0 ? 1 : .55}" stroke-opacity=".9"/>`;
      }
      return `<svg ${W}><defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#e6e6ea"/></linearGradient><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1ed2ff"/><stop offset="1" stop-color="#1b5cf0"/></linearGradient></defs><rect width="60" height="60" fill="url(#b)"/><circle cx="30" cy="30" r="24.5" fill="url(#a)"/>${ticks}<path d="M30 30 44 16 33.5 33.5z" fill="#ff3b30"/><path d="M30 30 16 44l10.5-17.5z" fill="#fff"/><circle cx="30" cy="30" r="1.4" fill="#fff"/></svg>`;
    },
    music: () => `<svg ${W}><defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6b82"/><stop offset="1" stop-color="#fa233b"/></linearGradient></defs><rect width="60" height="60" fill="url(#a)"/><path d="M24 39.5V18.5l17-3.6v19.6" fill="none" stroke="#fff" stroke-width="3.2" stroke-linejoin="round"/><path d="M24 22.3l17-3.6" stroke="#fff" stroke-width="3.2"/><ellipse cx="20" cy="40" rx="5.3" ry="4.4" fill="#fff"/><ellipse cx="37" cy="35.5" rx="5.3" ry="4.4" fill="#fff"/></svg>`,
    mail: () => `<svg ${W}><defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#21a7ff"/><stop offset="1" stop-color="#1764f2"/></linearGradient></defs><rect width="60" height="60" fill="url(#a)"/><rect x="10" y="17" width="40" height="27" rx="4" fill="#fff"/><path d="M11.2 18.6 30 33l18.8-14.4" fill="none" stroke="#1d7cf5" stroke-opacity=".55" stroke-width="2"/></svg>`,
    calendar: (d) => `<svg ${W}><rect width="60" height="60" fill="#fff"/><text x="30" y="17" text-anchor="middle" font-family="-apple-system,Helvetica,Arial" font-weight="600" font-size="9" fill="#ff3b30" letter-spacing=".3">${DAYS3[d.getDay()]}</text><text x="30" y="47" text-anchor="middle" font-family="-apple-system,Helvetica,Arial" font-weight="300" font-size="32" fill="#1c1c1e" letter-spacing="-1">${d.getDate()}</text></svg>`,
    photos: () => `<svg ${W}><rect width="60" height="60" fill="#fff"/>${petals()}</svg>`,
    camera: () => `<svg ${W}><defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2f2f4"/><stop offset="1" stop-color="#a7a7ad"/></linearGradient><radialGradient id="l" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#5a6c8a"/><stop offset=".55" stop-color="#1b2232"/><stop offset="1" stop-color="#05070b"/></radialGradient></defs><rect width="60" height="60" fill="url(#a)"/><rect x="8" y="18" width="44" height="29" rx="5" fill="#2c2c2e"/><path d="M21 18l2.6-4.2h12.8L39 18z" fill="#2c2c2e"/><circle cx="30" cy="32.5" r="10.4" fill="#d1d1d6"/><circle cx="30" cy="32.5" r="8.4" fill="url(#l)"/><circle cx="27.5" cy="29.8" r="2" fill="#fff" fill-opacity=".35"/><circle cx="45.5" cy="23" r="1.7" fill="#ffd60a"/></svg>`,
    clock: (d) => clockFace(d),
    weather: () => `<svg ${W}><defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c86ee"/><stop offset="1" stop-color="#76c7ff"/></linearGradient><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe14d"/><stop offset="1" stop-color="#ffb800"/></linearGradient></defs><rect width="60" height="60" fill="url(#a)"/><circle cx="23" cy="24" r="10" fill="url(#s)"/><path d="M22 46a8 8 0 0 1 .4-16 11 11 0 0 1 21 3.4A6.4 6.4 0 0 1 43.5 46z" fill="#fff"/></svg>`,
    maps: () => `<svg ${W}><rect width="60" height="60" fill="#e9f3dd"/><path d="M0 40 60 8v14L0 54z" fill="#f4f1e8"/><path d="M38 0h10L22 60H12z" fill="#fff"/><path d="M0 30 60 0" stroke="#ffd54a" stroke-width="5"/><path d="M0 30 60 0" stroke="#f2b400" stroke-width="1" stroke-dasharray="3 3"/><path d="M14 60 40 0" stroke="#fff" stroke-width="4"/><path d="M8 50c10-4 18-14 26-20s14-8 18-8" fill="none" stroke="#0a7aff" stroke-width="3.6" stroke-linecap="round"/><rect x="40" y="36" width="11" height="9" rx="2" fill="#2e7d32"/><text x="45.5" y="43" text-anchor="middle" font-size="6.5" font-weight="700" fill="#fff" font-family="-apple-system,Helvetica,Arial">9</text><circle cx="18" cy="19" r="6.5" fill="#ff3b30"/><circle cx="18" cy="19" r="2.4" fill="#fff"/><path d="M18 25.5v7" stroke="#8e8e93" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    notes: () => `<svg ${W}><defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe066"/><stop offset="1" stop-color="#fcc419"/></linearGradient></defs><rect width="60" height="60" fill="#fff"/><rect width="60" height="17" fill="url(#a)"/><path d="M0 17h60" stroke="#e8b900" stroke-width=".6"/><g fill="#c7c7cc">${[2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58].map((x) => `<circle cx="${x}" cy="20.3" r=".8"/>`).join('')}</g><g stroke="#d8d8dc" stroke-width=".9"><path d="M7 30h46M7 39h46M7 48h46"/></g></svg>`,
    reminders: () => `<svg ${W}><rect width="60" height="60" fill="#fff"/><circle cx="14" cy="16" r="4.4" fill="#0a84ff"/><circle cx="14" cy="16" r="5.3" fill="none" stroke="#0a84ff" stroke-opacity=".25" stroke-width="1.4"/><circle cx="14" cy="30" r="4.4" fill="#ff3b30"/><circle cx="14" cy="30" r="5.3" fill="none" stroke="#ff3b30" stroke-opacity=".25" stroke-width="1.4"/><circle cx="14" cy="44" r="4.4" fill="#ff9500"/><circle cx="14" cy="44" r="5.3" fill="none" stroke="#ff9500" stroke-opacity=".25" stroke-width="1.4"/><g stroke="#d1d1d6" stroke-width="2" stroke-linecap="round"><path d="M24 16h27M24 30h27M24 44h27"/></g></svg>`,
    wallet: () => `<svg ${W}><rect width="60" height="60" fill="#0d0d0f"/><rect x="9" y="11" width="42" height="27" rx="4" fill="#2f80ed"/><rect x="9" y="17" width="42" height="27" rx="4" fill="#ffc83d"/><rect x="9" y="23" width="42" height="27" rx="4" fill="#3ccf6e"/><rect x="9" y="29" width="42" height="27" rx="4" fill="#ff7a45"/><path d="M6 33h13.5c1.3 0 2.3.8 2.8 2a8.2 8.2 0 0 0 15.4 0c.5-1.2 1.5-2 2.8-2H54v21H6z" fill="#1d1d20"/></svg>`,
    settings: () => `<svg ${W}><defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c3c3c8"/><stop offset="1" stop-color="#7c7c82"/></linearGradient><radialGradient id="g" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#d9d9de"/><stop offset="1" stop-color="#8e8e93"/></radialGradient></defs><rect width="60" height="60" fill="url(#a)"/><circle cx="30" cy="30" r="23" fill="#2c2c2e"/><path d="${gearPath(30, 30, 21.5, 18.2, 24, 0)}" fill="url(#g)"/><circle cx="30" cy="30" r="13" fill="#3a3a3c"/><path d="${gearPath(30, 30, 11.5, 8.8, 9, 0.2)}" fill="#c7c7cc"/><circle cx="30" cy="30" r="4.3" fill="#3a3a3c"/></svg>`,
    health: () => `<svg ${W}><defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7e9b"/><stop offset="1" stop-color="#ff2d55"/></linearGradient></defs><rect width="60" height="60" fill="#fff"/><path d="M41.5 11c-3.2 0-5.7 1.8-7 4.4-1.3-2.6-3.8-4.4-7-4.4-4.4 0-7.7 3.4-7.7 7.9 0 7.4 9.3 12.8 14.7 17 5.4-4.2 14.7-9.6 14.7-17 0-4.5-3.3-7.9-7.7-7.9z" fill="url(#a)"/></svg>`,
    calculator: () => `<svg ${W}><rect width="60" height="60" fill="#1c1c1e"/><rect x="9" y="9" width="19" height="19" rx="9.5" fill="#505055"/><rect x="32" y="9" width="19" height="19" rx="9.5" fill="#505055"/><rect x="9" y="32" width="19" height="19" rx="9.5" fill="#505055"/><rect x="32" y="32" width="19" height="19" rx="9.5" fill="#ff9f0a"/><g stroke="#fff" stroke-width="2.3" stroke-linecap="round"><path d="M18.5 13.5v10M13.5 18.5h10M37 18.5h9M14.6 38l7.8 7.8M22.4 38l-7.8 7.8M37 39.3h9M37 43.7h9"/></g></svg>`,
    voicememos: () => `<svg ${W}><rect width="60" height="60" fill="#1c1c1e"/><g stroke-linecap="round" stroke-width="2.6">${[6, 14, 22, 30, 18, 34, 26, 12, 20, 28, 10, 16].map((hgt, i) => `<line x1="${8 + i * 4}" y1="${30 - hgt / 2}" x2="${8 + i * 4}" y2="${30 + hgt / 2}" stroke="${i < 6 ? '#ff453a' : '#fff'}"/>`).join('')}</g></svg>`,
    findmy: () => `<svg ${W}><defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4cd964"/><stop offset="1" stop-color="#1fb245"/></linearGradient></defs><rect width="60" height="60" fill="url(#a)"/><circle cx="30" cy="30" r="21" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2"/><circle cx="30" cy="30" r="13.5" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="2"/><circle cx="30" cy="30" r="7" fill="#fff"/><circle cx="30" cy="30" r="4.2" fill="#0a84ff"/></svg>`,
    contacts: () => `<svg ${W}><defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ececef"/><stop offset="1" stop-color="#c9c9ce"/></linearGradient></defs><rect width="60" height="60" fill="url(#a)"/><rect x="8" y="8" width="38" height="44" rx="4" fill="#fff"/><rect x="46" y="12" width="5" height="9" rx="1.5" fill="#ff9f0a"/><rect x="46" y="23" width="5" height="9" rx="1.5" fill="#30d158"/><rect x="46" y="34" width="5" height="9" rx="1.5" fill="#0a84ff"/><circle cx="27" cy="24" r="7" fill="#a1a1a6"/><path d="M14.5 43c1.5-6 6.6-9 12.5-9s11 3 12.5 9z" fill="#a1a1a6"/></svg>`,
    wavelet: () => `<svg ${W}><defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a5cff"/><stop offset=".55" stop-color="#5b6cff"/><stop offset="1" stop-color="#00c6ff"/></linearGradient></defs><rect width="60" height="60" fill="url(#a)"/><path d="M10 34c5-9 10-9 15 0s10 9 15 0 7-7 10-4" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="45" cy="18" r="4" fill="#fff"/></svg>`,
    lotuseats: () => `<svg ${W}><defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9a5c"/><stop offset="1" stop-color="#ff3b3b"/></linearGradient></defs><rect width="60" height="60" fill="url(#a)"/><path d="M11 30h38c0 9-8.5 16-19 16s-19-7-19-16z" fill="#fff"/><path d="M22 46h16" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M33 26 47 10M37 27l12-14" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><path d="M20 26c0-3 3-4 3-7M26 26c0-3 3-4 3-7" stroke="#fff" stroke-opacity=".75" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`,
    swift: () => `<svg ${W}><rect width="60" height="60" fill="#111214"/><path d="M14 36.5c0-1.4 1-2.6 2.4-2.9l3.4-.7 3.6-6.3c.7-1.2 2-2 3.4-2h9.4c1.6 0 3 .9 3.7 2.3l2.9 5.9 2.5.6c1.4.3 2.3 1.5 2.3 2.9V41H14z" fill="#ffd60a"/><circle cx="21" cy="41.5" r="4" fill="#111214" stroke="#ffd60a" stroke-width="2.2"/><circle cx="40" cy="41.5" r="4" fill="#111214" stroke="#ffd60a" stroke-width="2.2"/><path d="M25.5 27.5h12l2.4 5H22.8z" fill="#111214" fill-opacity=".85"/><path d="M8 20h14M5 24h10" stroke="#ffd60a" stroke-width="2.4" stroke-linecap="round"/></svg>`,
    stocks: () => `<svg ${W}><rect width="60" height="60" fill="#0d0d0f"/><g stroke="#2c2c2e" stroke-width=".8"><path d="M6 18h48M6 30h48M6 42h48"/></g><path d="M6 44 15 38l7 3 9-12 7 5 9-14 7 4" fill="none" stroke="#30d158" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="54" cy="24" r="2.6" fill="#30d158"/></svg>`,
    appstore: () => `<svg ${W}><defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1ac8ff"/><stop offset="1" stop-color="#1e6cf5"/></linearGradient></defs><rect width="60" height="60" fill="url(#a)"/><g stroke="#fff" stroke-width="3.6" stroke-linecap="round"><path d="M24 14 37 37M36 14 23 37M15 38h30"/></g></svg>`,
  };

  function appIcon(id, size) {
    const el = document.createElement('div');
    el.className = 'appicon';
    el.dataset.app = id;
    if (size) el.style.setProperty('--s', size + 'px');
    // Rendered as an image so gradient ids inside different icons never collide.
    const draw = () => {
      el.style.backgroundImage = `url("${appIcon.url(id)}")`;
    };
    draw();
    if (id === 'clock' || id === 'calendar') {
      el.__redraw = draw;
      el.classList.add('live-icon');
    }
    return el;
  }
  appIcon.has = (id) => !!APP_ICONS[id];
  /** register an app icon from an app's own file: fn(date) returns a 60×60 SVG string (see APP_ICONS) */
  appIcon.add = (id, fn) => { if (id && typeof fn === 'function') APP_ICONS[id] = fn; return fn; };
  appIcon.W = W; // attributes to open an icon svg with: `<svg ${JC.appIcon.W}>…</svg>` (60×60 viewBox)
  appIcon.svg = (id) => (APP_ICONS[id] ? APP_ICONS[id](JC.time ? JC.time.date() : new Date()) : `<svg ${W}><rect width="60" height="60" fill="#8e8e93"/></svg>`);
  appIcon.url = (id) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(appIcon.svg(id));
  JC.appIcon = appIcon;
})();
