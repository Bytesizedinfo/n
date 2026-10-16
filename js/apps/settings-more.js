/* Settings pages, part 2: Accessibility, Action Button, Siri, Camera, Control Center, Home Screen, Search, StandBy,
   Screen Time, Emergency SOS, Privacy & Security, Passwords, Game Center, iCloud, Wallet, Apple Account, Apps. */
(function () {
  'use strict';
  const JC = window.JC;
  const { h } = JC;
  const U = JC.util;
  const SK = (JC.settingsKit = JC.settingsKit || { pages: {} });
  const P = SK.pages;
  const S = () => JC.state.d.settings;
  const hero = (icon, bg, t, s) => h('div.set-hero', h('div.set-hero-ic', { style: { background: bg } }, JC.icon(icon, { size: 30 })), h('div.set-hero-t', t), s ? h('div.set-hero-s', s) : null);
  /** quick page made only of preference toggles: [[title, key, default, footer?]] */
  function tpage(id, title, path, groups, extra) {
    P[id] = Object.assign({
      title, path,
      render: (K) => groups.map((g) => ({ h: g.h, f: g.f, rows: g.rows.map((r) => (Array.isArray(r) ? { t: r[0], pref: r[1], def: r[2] } : r)) })),
    }, extra || {});
  }

  // ═══ Accessibility ═════════════════════════════════════════════
  P.accessibility = {
    title: 'Accessibility', icon: ['accessibility', 'var(--blue)'], idx: ['VoiceOver', 'Zoom', 'Reduce Motion', 'Larger Text', 'Bold Text', 'AssistiveTouch', 'Back Tap', 'Color Filters', 'Invert'],
    render: (K) => [
      hero('accessibility', 'var(--blue)', 'Accessibility', 'Personalize iPhone in ways that work best for you with accessibility features for vision, mobility, hearing, and cognitive needs.'),
      { h: 'Vision', rows: [
        { t: 'VoiceOver', icon: ['eye.fill', '#1c1c1e'], d: K.pref('a11y.vo', false) ? 'On' : 'Off', go: 'a11y.vo' },
        { t: 'Zoom', icon: ['magnifyingglass', '#1c1c1e'], d: K.pref('a11y.zoom', false) ? 'On' : 'Off', go: 'a11y.zoom' },
        { t: 'Display & Text Size', icon: ['textformat.size', 'var(--blue)'], go: 'a11y.display' },
        { t: 'Motion', icon: ['circle.fill', 'var(--green)'], go: 'a11y.motion' },
        { t: 'Spoken Content', icon: ['text.bubble', '#1c1c1e'], go: 'a11y.spoken' },
        { t: 'Audio Descriptions', icon: ['text.bubble', '#1c1c1e'], d: 'Off', pick: { pref: 'a11y.ad', def: 'off', options: [['off', 'Off'], ['on', 'On']] } },
      ] },
      { h: 'Physical and Motor', rows: [
        { t: 'Touch', icon: ['hand.raised.fill', 'var(--blue)'], go: 'a11y.touch' },
        { t: 'Face ID & Attention', icon: ['faceid', 'var(--green)'], go: 'a11y.face' },
        { t: 'Switch Control', icon: ['switch.2', '#1c1c1e'], d: 'Off', go: 'a11y.switch' },
        { t: 'Voice Control', icon: ['mic.fill', 'var(--blue)'], d: 'Off', go: 'a11y.voice' },
        { t: 'Side Button', icon: ['button.programmable', 'var(--blue)'], go: 'a11y.side' },
        { t: 'Keyboards & Typing', icon: ['keypad', 'var(--gray)'], go: 'keyboard' },
      ] },
      { h: 'Hearing', rows: [
        { t: 'Hearing Devices', icon: ['ear', 'var(--blue)'], go: 'a11y.hearing' },
        { t: 'Sound Recognition', icon: ['waveform', 'var(--red)'], d: 'Off', go: 'a11y.soundrec' },
        { t: 'Audio & Visual', icon: ['speaker.wave.2.fill', 'var(--blue)'], go: 'a11y.av' },
        { t: 'Subtitles & Captioning', icon: ['text.bubble', 'var(--blue)'], go: 'a11y.subs' },
        { t: 'Live Captions', icon: ['waveform', 'var(--blue)'], go: 'a11y.livecap' },
      ] },
      { h: 'General', rows: [
        { t: 'Guided Access', icon: ['lock.fill', '#1c1c1e'], d: 'Off', go: 'a11y.guided' },
        { t: 'Accessibility Shortcut', icon: ['accessibility', 'var(--blue)'], d: 'Off', go: 'a11y.shortcut' },
        { t: 'Per-App Settings', icon: ['square.grid.2x2.fill', 'var(--blue)'], go: 'apps' },
      ] },
    ],
  };
  P['a11y.vo'] = {
    title: 'VoiceOver', path: 'Accessibility',
    render: (K) => [
      { rows: [{ t: 'VoiceOver', pref: 'a11y.vo', def: false, confirm: (ok) => JC.ui.alert({ title: 'Turn On VoiceOver?', message: 'VoiceOver reads everything on screen aloud — including every message A-Ling sends. In a taxi. At midnight.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Turn On', style: 'default', onTap: () => { ok(); JC.ui.toast('VoiceOver on — speaking rate 50%', { icon: 'eye.fill' }); } }] }) }], f: 'VoiceOver speaks items on the screen. Tap once to select an item, double-tap to activate.' },
      { h: 'Speaking Rate', rows: [{ custom: () => h('div.set-ts', JC.icon('tortoise', { size: 20, cls: 'set-ts-ic' }), JC.ui.slider({ value: K.pref('a11y.vo.rate', 0.5), onChange: (v) => K.setPref('a11y.vo.rate', v) }), JC.icon('hare', { size: 20, cls: 'set-ts-ic' })) }] },
    ],
  };
  tpage('a11y.zoom', 'Zoom', 'Accessibility', [{ rows: [['Zoom', 'a11y.zoom', false]], f: 'Zoom magnifies the entire screen: double-tap three fingers to zoom.' }, { rows: [['Follow Focus', 'a11y.zoom.ff', true], ['Smart Typing', 'a11y.zoom.st', true], ['Show Controller', 'a11y.zoom.ctl', false]] }]);
  P['a11y.display'] = {
    title: 'Display & Text Size', path: 'Accessibility', idx: ['Bold Text', 'Larger Text', 'Increase Contrast', 'Reduce Transparency', 'Smart Invert', 'Classic Invert', 'Color Filters'],
    render: (K) => [
      { rows: [
        { t: 'Bold Text', core: 'boldText' },
        { t: 'Larger Text', d: (K.core('textSize') || 1) > 1 ? 'On' : 'Off', go: 'textsize' },
        { t: 'Button Shapes', pref: 'a11y.shapes', def: false },
        { t: 'On/Off Labels', pref: 'a11y.onoff', def: false },
        { t: 'Reduce Transparency', pref: 'a11y.rt', def: false },
        { t: 'Increase Contrast', pref: 'a11y.contrast', def: false },
        { t: 'Differentiate Without Color', pref: 'a11y.dwc', def: false },
        { t: 'Prefer Horizontal Text', pref: 'a11y.horiz', def: false },
      ] },
      { rows: [{ t: 'Smart Invert', pref: 'a11y.smartInvert', def: false }], f: 'Smart Invert reverses the colors of the display, except for images, media and some apps that use dark color styles.' },
      { rows: [{ t: 'Classic Invert', pref: 'a11y.classicInvert', def: false }], f: 'Classic Invert reverses the colors of the display.' },
      { rows: [{ t: 'Color Filters', d: { off: 'Off', gray: 'Grayscale' }[K.pref('a11y.colorFilter', 'off')], pick: { pref: 'a11y.colorFilter', def: 'off', options: [['off', 'Off'], ['gray', 'Grayscale']], footer: 'Color filters can be used to differentiate colors by users who are color blind and aid users who have difficulty reading text on the display.' } }] },
      { rows: [{ t: 'Reduce White Point', pref: 'a11y.rwp', def: false }, { t: 'Auto-Brightness', pref: 'a11y.autobright', def: true }], f: 'Turning off auto-brightness may affect battery life and long-term display performance.' },
    ],
  };
  P['a11y.motion'] = {
    title: 'Motion', path: 'Accessibility', idx: ['Reduce Motion', 'Auto-Play Message Effects'],
    render: (K) => [
      { rows: [{ t: 'Reduce Motion', core: 'reduceMotion', after: (v) => K.act('reduceMotion', v) }], f: 'Reduce the motion of the user interface, including the parallax effect of icons. Lotus Leap turns off its camera shake too.' },
      { rows: [['Prefer Cross-Fade Transitions', 'a11y.xfade', false], ['Auto-Play Message Effects', 'a11y.msgfx', true], ['Auto-Play Animated Images', 'a11y.anim', true], ['Auto-Play Video Previews', 'a11y.vidprev', true], ['Limit Frame Rate', 'a11y.fps', false], ['Dim Flashing Lights', 'a11y.flash', false]].map(([t, k, d]) => ({ t, pref: k, def: d })) },
    ],
  };
  tpage('a11y.spoken', 'Spoken Content', 'Accessibility', [{ rows: [['Speak Selection', 'a11y.speaksel', false], ['Speak Screen', 'a11y.speakscr', false], ['Highlight Content', 'a11y.highlight', false]], f: 'Swipe down with two fingers from the top of the screen to hear the content of the screen.' }, { rows: [{ t: 'Voices', pick: { pref: 'a11y.voice', def: 'tingting', options: [['tingting', 'Tingting (Chinese)'], ['samantha', 'Samantha (English)'], ['meijia', 'Meijia (Chinese, Taiwan)']] } }] }]);
  P['a11y.touch'] = {
    title: 'Touch', path: 'Accessibility', idx: ['AssistiveTouch', 'Haptic Touch', 'Tap to Wake', 'Shake to Undo', 'Back Tap', 'Vibration'],
    render: (K) => [
      { rows: [{ t: 'AssistiveTouch', d: K.pref('a11y.at', false) ? 'On' : 'Off', go: 'a11y.at' }, { t: 'Reachability', pref: 'a11y.reach', def: false }] },
      { rows: [{ t: 'Haptic Touch', pick: { pref: 'a11y.ht', def: 'default', options: [['fast', 'Fast'], ['default', 'Default'], ['slow', 'Slow']] } }, { t: 'Touch Accommodations', d: 'Off', alert: { title: 'Touch Accommodations', message: 'Touch Accommodations is off.' } }] },
      { rows: [['Tap or Swipe to Wake', 'a11y.tapwake', true], ['Shake to Undo', 'a11y.shake', true], ['Vibration', 'a11y.vib', true], ['Prevent Lock to End Call', 'a11y.plec', false]].map(([t, k, d]) => ({ t, pref: k, def: d })) },
      { rows: [{ t: 'Call Audio Routing', pick: { pref: 'a11y.route', def: 'auto', options: [['auto', 'Automatic'], ['bt', 'Bluetooth Headset'], ['speaker', 'Speaker']] } }, { t: 'Back Tap', d: K.pref('a11y.backtap2', 'none') === 'none' && K.pref('a11y.backtap3', 'none') === 'none' ? 'Off' : 'On', go: 'a11y.backtap' }] },
    ],
  };
  tpage('a11y.at', 'AssistiveTouch', 'Touch', [{ rows: [['AssistiveTouch', 'a11y.at', false]], f: 'AssistiveTouch allows you to use your iPhone if you have difficulty touching the screen.' }]);
  const BT_ACTIONS = [['none', 'None'], ['cc', 'Control Center'], ['home', 'Home'], ['lock', 'Lock Screen'], ['mute', 'Mute'], ['screenshot', 'Screenshot'], ['shake', 'Shake'], ['siri', 'Siri'], ['spotlight', 'Spotlight']];
  P['a11y.backtap'] = { title: 'Back Tap', path: 'Touch', render: (K) => [{ rows: [{ t: 'Double Tap', pick: { pref: 'a11y.backtap2', def: 'none', options: BT_ACTIONS } }, { t: 'Triple Tap', pick: { pref: 'a11y.backtap3', def: 'none', options: BT_ACTIONS } }], f: 'Double or triple tap on the back of your iPhone to perform actions quickly.' }] };
  tpage('a11y.face', 'Face ID & Attention', 'Accessibility', [{ rows: [['Require Attention for Face ID', 'fid.att', true]], f: 'TrueDepth camera provides an additional level of security by verifying that you’re looking at iPhone before authenticating.' }, { rows: [['Attention Aware Features', 'fid.aware', true], ['Haptic on Successful Authentication', 'fid.haptic', false]] }]);
  tpage('a11y.switch', 'Switch Control', 'Accessibility', [{ rows: [['Switch Control', 'a11y.switch', false]], f: 'Switch Control allows you to use your iPhone by sequentially highlighting items on the screen.' }]);
  P['a11y.voice'] = { title: 'Voice Control', path: 'Accessibility', render: (K) => [{ rows: [{ t: 'Voice Control', pref: 'a11y.vc', def: false, confirm: (ok) => JC.ui.alert({ title: 'Voice Control', message: 'Voice Control needs a 1.2 GB download and listens to everything you say. (Master Wu is humming.)', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Turn On', style: 'default', onTap: ok }] }) }] }] };
  P['a11y.side'] = { title: 'Side Button', path: 'Accessibility', render: (K) => [{ h: 'Click Speed', rows: [['default', 'Default'], ['slow', 'Slow'], ['slowest', 'Slowest']].map(([k, l]) => ({ t: l, check: () => K.pref('a11y.click', 'default') === k, tap: () => { K.setPref('a11y.click', k); K.render(); } })) }, { h: 'Press and Hold to Speak', rows: [{ t: 'Siri', check: () => K.pref('a11y.hold', 'siri') === 'siri', tap: () => { K.setPref('a11y.hold', 'siri'); K.render(); } }, { t: 'Off', check: () => K.pref('a11y.hold', 'siri') === 'off', tap: () => { K.setPref('a11y.hold', 'off'); K.render(); } }] }] };
  tpage('a11y.hearing', 'Hearing Devices', 'Accessibility', [{ h: 'MFi Hearing Devices', rows: [{ t: 'Searching…', right: h('div.set-spin') }] }, { rows: [['Hearing Aid Compatibility', 'a11y.hac', false]] }]);
  tpage('a11y.soundrec', 'Sound Recognition', 'Accessibility', [{ rows: [['Sound Recognition', 'a11y.sr', false]], f: 'iPhone will continuously listen for certain sounds and notify you when they may be recognized. Sounds: Dog bark, Doorbell, Kettle, Baby crying.' }, { h: 'Animals', rows: [['Dog', 'a11y.sr.dog', false], ['Cat', 'a11y.sr.cat', false]], f: 'Wei Wuxian would like this to be on.' }]);
  tpage('a11y.av', 'Audio & Visual', 'Accessibility', [{ rows: [['Mono Audio', 'a11y.mono', false], ['Phone Noise Cancellation', 'a11y.pnc', true], ['LED Flash for Alerts', 'a11y.led', false], ['Background Sounds', 'a11y.bgs', false]] }]);
  tpage('a11y.subs', 'Subtitles & Captioning', 'Accessibility', [{ rows: [['Closed Captions + SDH', 'a11y.cc', false]] }]);
  tpage('a11y.livecap', 'Live Captions', 'Accessibility', [{ rows: [['Live Captions', 'a11y.lc', false]], f: 'Live Captions are available in English (US). Phone calls already show captions in this story.' }]);
  P['a11y.guided'] = { title: 'Guided Access', path: 'Accessibility', render: (K) => [{ rows: [{ t: 'Guided Access', pref: 'a11y.ga', def: false }], f: 'Guided Access keeps the iPhone in a single app. Triple-click the side button in an app to start. (Perfect for handing your phone to A-Ling.)' }, { rows: [{ t: 'Passcode Settings', alert: { title: 'Passcode Settings', message: 'Guided Access uses the device passcode.' }, chev: true }, { t: 'Time Limits', alert: { title: 'Time Limits', message: 'Sound and speak alerts when time is up.' }, chev: true }] }] };
  P['a11y.shortcut'] = { title: 'Accessibility Shortcut', path: 'Accessibility', render: (K) => [{ h: 'Triple-click the side button for:', rows: ['AssistiveTouch', 'Classic Invert', 'Color Filters', 'Reduce White Point', 'Smart Invert', 'VoiceOver', 'Zoom', 'Background Sounds'].map((t) => ({ t, check: () => K.pref('a11y.sc.' + t, false), tap: () => { K.setPref('a11y.sc.' + t, !K.pref('a11y.sc.' + t, false)); K.render(); } })) }] };

  // ═══ Action Button ═════════════════════════════════════════════
  const ACTIONS = [
    ['silent', 'Silent Mode', 'bell.slash.fill', 'Switch between Silent and Ring for calls and alerts.'],
    ['focus', 'Focus', 'moon.fill', 'Turn a Focus on or off.'],
    ['camera', 'Camera', 'camera.fill', 'Open the camera to capture a moment.'],
    ['flashlight', 'Flashlight', 'flashlight.on.fill', 'Turn the flashlight on or off.'],
    ['memo', 'Voice Memo', 'waveform', 'Record a voice memo.'],
    ['music', 'Recognize Music', 'music.note', 'Identify the song playing around you.'],
    ['translate', 'Translate', 'globe', 'Translate phrases or have a conversation with someone in another language.'],
    ['magnifier', 'Magnifier', 'magnifyingglass', 'Zoom in on things around you.'],
    ['controls', 'Controls', 'switch.2', 'Quickly access a control.'],
    ['none', 'No Action', 'nosign', 'The Action button won’t do anything.'],
  ];
  P.actionbutton = {
    title: 'Action Button', icon: ['button.programmable', 'var(--blue)'], idx: ['Silent Mode', 'Action'],
    render(K) {
      const cur = K.pref('actionButton', 'silent');
      const i = Math.max(0, ACTIONS.findIndex((a) => a[0] === cur));
      const a = ACTIONS[i];
      const set = (k) => { K.setPref('actionButton', k); K.setCore('actionButton', k); JC.audio.haptic(10); K.render(); };
      const stage = h('div.set-ab',
        h('div.set-ab-ph', h('div.set-ab-btn'), h('div.set-ab-ic', JC.icon(a[2], { size: 44 }))),
        h('div.set-ab-t', a[1]), h('div.set-ab-s', a[3]),
        h('div.set-ab-dots', ACTIONS.map((x, k) => h('i.tap', { class: { on: k === i }, onTap: () => set(x[0]) }))),
        h('div.set-ab-arrows', h('div.set-ab-ar.tap', { onTap: () => set(ACTIONS[(i + ACTIONS.length - 1) % ACTIONS.length][0]) }, JC.icon('chevron.left', { size: 20, weight: 2.4 })), h('div.set-ab-ar.tap', { onTap: () => set(ACTIONS[(i + 1) % ACTIONS.length][0]) }, JC.icon('chevron.right', { size: 20, weight: 2.4 }))));
      U.drag(stage, { axis: 'x', end: (e, p) => { if (p.dx < -40) set(ACTIONS[(i + 1) % ACTIONS.length][0]); else if (p.dx > 40) set(ACTIONS[(i + ACTIONS.length - 1) % ACTIONS.length][0]); } });
      return [stage, a[0] === 'focus' ? { rows: [{ t: 'Focus', pick: { pref: 'actionButton.focus', def: 'dnd', options: (SK.FOCI || []).map((f) => [f.id, f.name]) } }] } : null, h('div.set-hero-s.pad', 'Press and hold the Action button on the left side of the phone. Swipe to choose what it does.')];
    },
  };

  // ═══ Siri, Camera, Control Center, Home Screen, Search, StandBy ═
  P.siri = {
    title: 'Apple Intelligence & Siri', icon: ['sparkles', 'var(--purple)'], idx: ['Siri', 'Hey Siri', 'Type to Siri', 'Siri Responses', 'Siri History'],
    render: (K) => [
      hero('sparkles', 'linear-gradient(135deg,#ff7a59,#c63ad6 55%,#2f7bf6)', 'Apple Intelligence & Siri', 'Apple Intelligence is not available in China mainland. Siri is.'),
      { rows: [{ t: 'Apple Intelligence', locked: false, lockTitle: 'Apple Intelligence', lockMsg: 'Apple Intelligence isn’t available with your current region and language settings.' }] },
      { h: 'Siri', rows: [
        { t: 'Talk & Type to Siri', d: K.pref('siri.talk', 'siri') === 'off' ? 'Off' : '“Siri”', pick: { pref: 'siri.talk', def: 'siri', options: [['siri', '“Siri” or “Hey Siri”'], ['hey', '“Hey Siri”'], ['off', 'Off']] } },
        { t: 'Press Side Button for Siri', pref: 'siri.side', def: true },
        { t: 'Type to Siri', pref: 'siri.type', def: true },
        { t: 'Language', d: 'Chinese (Mandarin – China mainland)', alert: { title: 'Language', message: 'Siri uses Mandarin (China mainland).' } },
        { t: 'Voice', d: 'Chinese (Voice 2)', alert: { title: 'Siri Voice', message: 'Voice 2. Jiang Cheng picked the least cheerful one.' } },
        { t: 'Siri Responses', pick: { pref: 'siri.resp', def: 'auto', options: [['auto', 'Automatic'], ['pref', 'Prefer Spoken Responses'], ['silent', 'Prefer Silent Responses']] } },
        { t: 'Messaging with Siri', go: 'siri.msg' },
        { t: 'Siri & Dictation History', tint: true, tap: () => JC.ui.alert({ title: 'Delete Siri & Dictation History?', message: 'Your Siri and Dictation history will be deleted from Apple servers.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onTap: () => K.toast('Siri history deleted', 'trash') }] }) },
        { t: 'Ask Siri', tint: true, tap: () => JC.os.siri && JC.os.siri() },
      ] },
      { h: 'Suggestions', rows: [['Allow Notifications', 'siri.notif', true], ['Show in App Library', 'siri.lib', true], ['Show When Sharing', 'siri.share', true], ['Show Listening Suggestions', 'siri.listen', true]].map(([t, k, d]) => ({ t, pref: k, def: d })) },
    ],
  };
  tpage('siri.msg', 'Messaging with Siri', 'Siri', [{ rows: [['Automatically Send Messages', 'siri.autosend', false], ['Announce Notifications', 'siri.announce', false]], f: 'Siri will never send “Get lost.” on your behalf. You have to type it yourself.' }]);
  P.camera = {
    title: 'Camera', icon: ['camera.fill', 'var(--gray)'], idx: ['Grid', 'Formats', 'Record Video', 'Mirror Front Camera', 'Scan QR Codes', 'Macro'],
    render: (K) => [
      { rows: [
        { t: 'Formats', go: 'cam.formats' },
        { t: 'Record Video', d: { '1080p30': '1080p at 30 fps', '4k30': '4K at 30 fps', '4k60': '4K at 60 fps', '4k120': '4K at 120 fps' }[K.pref('cam.video', '4k60')], pick: { pref: 'cam.video', def: '4k60', options: [['1080p30', '1080p HD at 30 fps'], ['4k30', '4K at 30 fps'], ['4k60', '4K at 60 fps'], ['4k120', '4K at 120 fps']] } },
        { t: 'Record Slo-mo', pick: { pref: 'cam.slomo', def: '1080p240', options: [['1080p120', '1080p HD at 120 fps'], ['1080p240', '1080p HD at 240 fps']] } },
        { t: 'Record Sound', pick: { pref: 'cam.sound', def: 'stereo', options: [['stereo', 'Stereo'], ['spatial', 'Spatial Audio']] } },
        { t: 'Preserve Settings', go: 'cam.preserve' },
        { t: 'Use Volume Up for Burst', pref: 'cam.burst', def: false },
        { t: 'Scan QR Codes', pref: 'cam.qr', def: true },
        { t: 'Show Detected Text', pref: 'cam.text', def: true },
      ] },
      { h: 'Composition', rows: [['Grid', 'cam.grid', false], ['Level', 'cam.level', false], ['Mirror Front Camera', 'cam.mirror', true], ['View Outside the Frame', 'cam.outside', true]].map(([t, k, d]) => ({ t, pref: k, def: d })) },
      { h: 'Photo Capture', rows: [{ t: 'Photographic Styles', d: 'Standard', alert: { title: 'Photographic Styles', message: 'Choose a style in the Camera app.' } }, { t: 'Prioritize Faster Shooting', pref: 'cam.fast', def: true }, { t: 'Lens Correction', pref: 'cam.lens', def: true }, { t: 'Macro Control', pref: 'cam.macro', def: true }] },
      { rows: [{ t: 'Open Camera', tint: true, tap: () => JC.os.open('camera') }] },
    ],
  };
  P['cam.formats'] = { title: 'Formats', path: 'Camera', render: (K) => [{ h: 'Camera Capture', rows: [['heif', 'High Efficiency'], ['jpeg', 'Most Compatible']].map(([k, l]) => ({ t: l, check: () => K.pref('cam.fmt', 'heif') === k, tap: () => { K.setPref('cam.fmt', k); K.render(); } })), f: 'To reduce file size, capture photos and videos in the high efficiency HEIF/HEVC format.' }, { h: 'Photo Capture', rows: [{ t: 'ProRAW & Resolution Control', pref: 'cam.raw', def: false }, { t: 'Photo Mode', pick: { pref: 'cam.mp', def: '24', options: [['24', '24 MP'], ['48', '48 MP']] } }] }] };
  tpage('cam.preserve', 'Preserve Settings', 'Camera', [{ rows: [['Camera Mode', 'cam.p.mode', false], ['Creative Controls', 'cam.p.creative', false], ['Macro Control', 'cam.p.macro', true], ['Exposure Adjustment', 'cam.p.exp', false], ['Night Mode', 'cam.p.night', false], ['Live Photo', 'cam.p.live', true]] }]);
  P.controlcenter = {
    title: 'Control Center', icon: ['switch.2', 'var(--gray)'], idx: ['Access Within Apps', 'Customize Controls'],
    render: (K) => [
      hero('switch.2', 'var(--gray)', 'Control Center', 'Swipe down from the top-right edge to open Control Center.'),
      { rows: [{ t: 'Access Within Apps', pref: 'cc.apps', def: true }, { t: 'Show Home Controls', pref: 'cc.home', def: true }], f: 'Allow access to Control Center within apps. When disabled, you can still access Control Center from the Home Screen.' },
      { rows: [{ t: 'Open Control Center', tint: true, tap: () => setTimeout(() => JC.os.openCC(), 100) }, { t: 'Customize Controls', tint: true, tap: () => K.alert({ title: 'Customize Controls', message: 'In iOS 26, touch and hold an empty area in Control Center to add, move or resize controls. Jiang Cheng’s layout is locked by his device policy.' }) }] },
    ],
  };
  P.homescreen = {
    title: 'Home Screen & App Library', icon: ['apps.iphone', 'var(--indigo)'], idx: ['Reset Home Screen Layout', 'App Library', 'Notification Badges', 'Show on Home Screen'],
    render: (K) => [
      { h: 'Newly Downloaded Apps', rows: [['home', 'Add to Home Screen'], ['lib', 'App Library Only']].map(([k, l]) => ({ t: l, check: () => K.pref('hs.new', 'home') === k, tap: () => { K.setPref('hs.new', k); K.render(); } })) },
      { h: 'Notification Badges', rows: [{ t: 'Show in App Library', pref: 'hs.badges', def: false }] },
      { h: 'Search', rows: [{ t: 'Show on Home Screen', pref: 'hs.search', def: true }], f: 'Search will appear at the bottom of the Home Screen.' },
      { rows: [{ t: 'Edit Home Screen', tint: true, tap: () => { JC.os.home(); setTimeout(() => JC.os.setJiggle && JC.os.setJiggle(true), 500); } }, { t: 'Reset Home Screen Layout', danger: true, tap: () => JC.ui.alert({ title: 'Reset Home Screen?', message: 'Your Home Screen will be reset to its factory layout. Folders you have created will be removed.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Reset Home Screen', style: 'destructive', onTap: () => { JC.os.resetHome(); K.toast('Home Screen reset', 'apps.iphone'); } }] }) }] },
    ],
  };
  P.search = {
    title: 'Search', icon: ['magnifyingglass', 'var(--gray)'], idx: ['Spotlight', 'Show Recent Searches', 'Siri Suggestions'],
    render: (K) => [
      { rows: [['Show Recent Searches', 'sr.recent', true], ['Show Related Content', 'sr.related', true], ['Help Apple Improve Search', 'sr.improve', false]].map(([t, k, d]) => ({ t, pref: k, def: d })) },
      { h: 'Show in Search', rows: K.apps().map((id) => ({ t: K.appName(id), icon: 'app:' + id, pref: 'sr.app.' + id, def: true })) },
    ],
  };
  tpage('standby', 'StandBy', '', [{ rows: [['StandBy', 'sb.on', true]], f: 'StandBy shows glanceable information when iPhone is on its side and charging.' }, { h: 'Display', rows: [['Always On', 'sb.aod', true], ['Night Mode', 'sb.night', true], ['Motion To Wake', 'sb.motion', true]] }, { h: 'Notifications', rows: [['Show Notifications', 'sb.notif', true], ['Show Preview Only on Tap', 'sb.prevtap', false]] }], { icon: ['platter.2.filled.iphone', '#1c1c1e'] });

  // ═══ Screen Time ═══════════════════════════════════════════════
  const DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const WEEK = [ // minutes per category: social, productivity, games
    [196, 98, 18], [184, 76, 26], [251, 182, 0], [238, 161, 12], [286, 175, 31], [214, 153, 18], [262, 109, 19],
  ];
  const MOST = [['messages', 1104, 'social'], ['mail', 591, 'prod'], ['phone', 277, 'social'], ['calendar', 122, 'prod'], ['lotusleap', 80, 'games'], ['notes', 69, 'prod'], ['wavelet', 58, 'social'], ['stocks', 44, 'prod'], ['safari', 39, 'prod'], ['maps', 27, 'prod'], ['health', 12, 'prod'], ['wallet', 9, 'prod']];
  const fmtM = (m) => { m = Math.round(m); const hh = Math.floor(m / 60); return hh ? hh + 'h ' + (m % 60) + 'm' : m + 'm'; };
  function stChart(K, day) {
    const colors = ['var(--st-social)', 'var(--st-prod)', 'var(--st-games)'];
    if (day) {
      const hours = [3, 1, 0, 0, 0, 14, 21, 18, 26, 31, 22, 19, 24, 28, 17, 21, 26, 14, 6, 2, 4, 11, 31, 44];
      return SK.barChart({ data: hours.map((m, i) => ({ label: i % 6 === 0 ? String(i).padStart(2, '0') : '', full: String(i).padStart(2, '0') + ':00', segs: [Math.round(m * 0.62), Math.round(m * 0.3), i === 22 ? 6 : 0], tip: fmtM(m + (i === 22 ? 6 : 0)) })), colors, yMax: 60, ticks: [0, 30, 60], fmt: (v) => v + 'm', barW: 8, h: 150 });
    }
    const avg = WEEK.reduce((a, d) => a + d[0] + d[1] + d[2], 0) / 7;
    return SK.barChart({ data: WEEK.map((d, i) => ({ label: DAYS[i], full: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][i], segs: d, tip: fmtM(d[0] + d[1] + d[2]) })), colors, yMax: 540, ticks: [0, 240, 480], fmt: (v) => v / 60 + 'h', avg, avgLabel: 'avg', h: 160 });
  }
  const stLegend = () => h('div.set-legend', h('span', h('i', { style: { background: 'var(--st-social)' } }), 'Social ', h('b', fmtM(WEEK.reduce((a, d) => a + d[0], 0) / 7))), h('span', h('i', { style: { background: 'var(--st-prod)' } }), 'Productivity & Finance ', h('b', fmtM(WEEK.reduce((a, d) => a + d[1], 0) / 7))), h('span', h('i', { style: { background: 'var(--st-games)' } }), 'Games ', h('b', fmtM(WEEK.reduce((a, d) => a + d[2], 0) / 7))));
  P.screentime = {
    title: 'Screen Time', icon: ['hourglass', 'var(--indigo)'], idx: ['App Limits', 'Downtime', 'Communication Limits', 'Content & Privacy Restrictions', 'Daily Average', 'Lotus Leap'],
    render(K) {
      const on = K.pref('st.on', true);
      if (!on) return [hero('hourglass', 'var(--indigo)', 'Screen Time', 'Get insights about your screen time and set limits for what you want to manage.'), { rows: [{ t: 'Turn On App & Website Activity', tint: true, tap: () => { K.setPref('st.on', true); K.render(); } }] }];
      const avg = WEEK.reduce((a, d) => a + d[0] + d[1] + d[2], 0) / 7;
      return [
        { rows: [{ custom: () => h('div.set-st-card.tap', { onTap: () => K.go('stactivity') },
          h('div.set-st-k', 'Daily Average'), h('div.set-st-v', fmtM(avg)), h('div.set-st-d', JC.icon('arrow.up', { size: 12, weight: 2.6 }), '14% from last week'),
          stChart(K, false), stLegend()) }, { t: 'See All App & Website Activity', go: 'stactivity' }], f: 'Updated today at ' + U.fmtTime(JC.time.now()) },
        { h: 'Limit Usage', rows: [
          { t: 'Downtime', s: 'Schedule time away from the screen', icon: ['moon.fill', 'var(--indigo)'], go: 'st.downtime' },
          { t: 'App Limits', s: 'Set time limits for apps', icon: ['hourglass', 'var(--orange)'], go: 'st.limits' },
          { t: 'Always Allowed', s: 'Choose apps you want at all times', icon: ['checkmark.circle.fill', 'var(--green)'], go: 'st.allowed' },
          { t: 'Screen Distance', s: 'Reduce eye strain', icon: ['eye.fill', 'var(--teal)'], go: 'st.distance' },
        ] },
        { h: 'Communication', rows: [
          { t: 'Communication Limits', s: 'Set limits based on contacts', icon: ['bubble.left.and.bubble.right.fill', 'var(--green)'], go: 'st.comm' },
          { t: 'Communication Safety', s: 'Protect from sensitive content', icon: ['checkmark.shield.fill', 'var(--blue)'], go: 'st.safety' },
        ] },
        { h: 'Restrictions', rows: [{ t: 'Content & Privacy Restrictions', s: 'Block inappropriate content', icon: ['nosign', 'var(--red)'], go: 'st.restrict' }] },
        { rows: [{ t: 'Lock Screen Time Settings', tint: true, tap: () => K.alert({ title: 'Screen Time Passcode', message: 'Setting a Screen Time passcode requires the Apple Account password for jiang.cheng@lotuspier.yunmeng.' }) }], f: 'Use a passcode to secure Screen Time settings.' },
        { rows: [{ t: 'Share Across Devices', pref: 'st.share', def: true }], f: 'You can enable this on any device signed in to iCloud to report your combined screen time.' },
        { rows: [{ t: 'Turn Off App & Website Activity', danger: true, tap: () => JC.ui.alert({ title: 'Turn Off App & Website Activity?', message: 'App & website activity reports will no longer be updated.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Turn Off', style: 'destructive', onTap: () => { K.setPref('st.on', false); K.render(); } }] }) }] },
      ];
    },
  };
  P.stactivity = {
    title: 'All Activity', path: 'Screen Time', noSearch: true,
    render(K, a, page) {
      const day = !!(page && page._day);
      const seg = JC.ui.segmented({ items: ['Week', 'Day'], value: day ? 1 : 0, onChange: (i) => { const t = K.top(); t._day = i === 1; t.render(); } });
      const factor = day ? 1 / 7 : 1;
      return [
        h('div.set-st-seg', seg),
        { rows: [{ custom: () => h('div.set-st-card', h('div.set-st-k', day ? 'Today' : 'This Week'), h('div.set-st-v', day ? '6h 50m' : fmtM(WEEK.reduce((x, d) => x + d[0] + d[1] + d[2], 0))), stChart(K, day), stLegend()) }] },
        { h: h('span.set-hh', 'Most Used', h('span.set-hh-link.tap', { onTap: () => K.toast('Showing apps', 'square.grid.2x2.fill') }, 'Show Categories')), rows: MOST.map(([id, m, cat]) => ({
          t: K.appName(id), icon: 'app:' + id, s: id === 'lotusleap' ? 'Games · limit 30 min/day (ignored 6×)' : id === 'messages' ? 'Mostly A-Ling' : null,
          right: h('div.set-st-bar', h('i', { style: { width: Math.round((m / 1104) * 100) + '%', background: 'var(--st-' + cat + ')' } }), h('span', fmtM(m * factor))),
          go: 'stapp', arg: id,
        })) },
        { h: 'Pickups', rows: [{ t: 'Daily Average', d: day ? '137' : '112' }, { t: 'First Pickup', d: day ? 'Today at 5:21 AM' : 'Mon at 5:12 AM' }, { t: 'Most Pickups', d: 'Messages' }] },
        { h: 'Notifications', rows: [
          { t: 'Messages', icon: 'app:messages', d: day ? '87' : '412', s: 'A-Ling 238 · 🐶 DO NOT ANSWER 97 · YMJ Ops 🔔 41', go: 'stapp', arg: 'messages' },
          { t: 'Mail', icon: 'app:mail', d: day ? '22' : '163' },
          { t: 'Phone', icon: 'app:phone', d: day ? '9' : '38' },
          { t: 'Wavelet', icon: 'app:wavelet', d: day ? '14' : '61', s: 'Mostly @teaspiller_qh' },
          { t: 'Health', icon: 'app:health', d: day ? '1' : '3', s: 'High Heart Rate' },
        ] },
      ];
    },
  };
  P.stapp = {
    title: (id) => JC.os.appNames[id] || id, path: 'Screen Time', noSearch: true,
    render(K, id) {
      const m = (MOST.find((x) => x[0] === id) || [0, 30])[1];
      const lim = K.pref('st.lim.' + id, id === 'lotusleap' ? 30 : 0);
      const rows = [
        { rows: [{ custom: () => h('div.set-st-card', h('div.set-st-k', 'Daily Average'), h('div.set-st-v', fmtM(m / 7)), SK.barChart({ data: DAYS.map((d, i) => ({ label: d, segs: [Math.round((m / 7) * [0.8, 0.7, 1.2, 1.1, 1.3, 0.9, 1][i])], tip: fmtM((m / 7) * [0.8, 0.7, 1.2, 1.1, 1.3, 0.9, 1][i]) })), colors: ['var(--st-' + ((MOST.find((x) => x[0] === id) || [0, 0, 'prod'])[2]) + ')'], h: 130, fmt: (v) => fmtM(v) })) }] },
        { h: 'Limits', rows: [{ t: 'App Limit', d: lim ? fmtM(lim) + ' / day' : 'None', pick: { pref: 'st.lim.' + id, def: id === 'lotusleap' ? 30 : 0, options: [[0, 'None'], [15, '15 min'], [30, '30 min'], [60, '1 hour'], [120, '2 hours']] } }] },
      ];
      if (id === 'messages') rows.push({ h: 'Most Messaged', rows: [{ t: 'A-Ling', avatar: 'jl', d: '58%' }, { t: '🐶 DO NOT ANSWER', avatar: 'wwx', d: '19%' }, { t: 'Tang Mei (EA)', avatar: 'ea', d: '9%' }, { t: 'Zewu-jun', avatar: 'lxc', d: '7%' }] });
      if (id === 'lotusleap') rows.push({ h: 'This Week', rows: [{ t: 'Total', d: '1h 20m' }, { t: 'Most Played', d: 'Wednesday 22:47–23:18' }, { t: 'High Score', d: '1,203 (A-Ling: 1,824)' }, { t: 'Open Lotus Leap', tint: true, tap: () => JC.os.open('lotusleap') }], f: 'Jiang Cheng ignored this limit 6 times this week.' });
      rows.push({ rows: [{ t: 'Open ' + K.appName(id), tint: true, tap: () => JC.os.open(id) }] });
      return rows;
    },
  };
  P['st.downtime'] = { title: 'Downtime', path: 'Screen Time', render: (K) => [{ rows: [{ t: 'Turn On Downtime Until Tomorrow', tint: true, tap: () => JC.ui.alert({ title: 'Turn On Downtime Until Tomorrow?', message: 'Only calls and apps you choose to allow will be available.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Turn On', style: 'default', onTap: () => { K.setPref('st.dt.now', true); K.toast('Downtime on until 7:00', 'moon.fill'); K.render(); } }] }) }], f: K.pref('st.dt.now', false) ? 'Downtime is on until 7:00 tomorrow.' : null }, { rows: [{ t: 'Scheduled', pref: 'st.dt', def: false, rerender: true }, K.pref('st.dt', false) ? { t: 'Every Day', d: '23:00 – 06:00' } : null].filter(Boolean), f: 'Set a schedule for time away from the screen. During downtime, only apps you choose and phone calls will be available.' }] };
  P['st.limits'] = {
    title: 'App Limits', path: 'Screen Time', idx: ['Lotus Leap limit'],
    render: (K) => [
      { rows: [{ t: 'App Limits', pref: 'st.limits', def: true }] },
      { rows: K.apps().filter((id) => K.pref('st.lim.' + id, id === 'lotusleap' ? 30 : 0)).map((id) => ({ t: K.appName(id), icon: 'app:' + id, s: fmtM(K.pref('st.lim.' + id, 30)) + ', Every Day', go: 'stapp', arg: id })).concat([{ t: 'Add Limit', tint: true, tap: () => {
        const sh = JC.ui.sheet({ title: 'Choose Apps', detent: 'large', left: { text: 'Cancel' }, content: () => [JC.ui.list([{ rows: K.apps().map((id) => ({ title: K.appName(id), icon: { app: id }, onTap: () => { sh.close(); K.setPref('st.lim.' + id, 60); K.render(); K.toast(K.appName(id) + ': 1 hour a day', 'hourglass'); } })) }])] });
      } }]), f: 'Set daily time limits for app categories you want to manage. Limits reset every day at midnight.' },
    ],
  };
  P['st.allowed'] = { title: 'Always Allowed', path: 'Screen Time', render: (K) => [{ h: 'Allowed Apps', rows: ['phone', 'messages', 'facetime', 'maps', 'findmy'].map((id) => ({ t: K.appName(id), icon: 'app:' + id, check: () => K.pref('st.al.' + id, id !== 'facetime'), tap: () => { if (id === 'phone') { K.alert({ title: 'Phone', message: 'Phone is always allowed.' }); return; } K.setPref('st.al.' + id, !K.pref('st.al.' + id, id !== 'facetime')); K.render(); } })), f: 'Allowed apps are available during downtime or if you selected the “All Apps & Categories” app limit.' }] };
  tpage('st.distance', 'Screen Distance', 'Screen Time', [{ rows: [['Screen Distance', 'st.dist', false]], f: 'iPhone will alert you when it is being held too close for an extended period of time.' }]);
  P['st.comm'] = { title: 'Communication Limits', path: 'Screen Time', render: (K) => [{ h: 'During Screen Time', rows: [['everyone', 'Everyone'], ['contacts', 'Contacts Only'], ['family', 'Contacts & Groups with at Least One Contact']].map(([k, l]) => ({ t: l, check: () => K.pref('st.c1', 'everyone') === k, tap: () => { K.setPref('st.c1', k); K.render(); } })) }, { h: 'During Downtime', rows: [{ t: 'Specific Contacts', d: 'A-Ling, Tang Mei', check: () => true, tap: () => K.alert({ title: 'Specific Contacts', message: 'A-Ling and Tang Mei can always reach you.' }) }] }] };
  tpage('st.safety', 'Communication Safety', 'Screen Time', [{ rows: [['Communication Safety', 'st.cs', false]], f: 'Detect nude photos and videos before they are viewed on this iPhone.' }]);
  P['st.restrict'] = { title: 'Content & Privacy Restrictions', path: 'Screen Time', render: (K) => [{ rows: [{ t: 'Content & Privacy Restrictions', pref: 'st.cpr', def: false, rerender: true }] }, { rows: ['iTunes & App Store Purchases', 'Allowed Apps & Features', 'Content Restrictions'].map((t) => ({ t, tap: () => (K.pref('st.cpr', false) ? K.toast(t + ': no restrictions set', 'nosign') : K.alert({ title: t, message: 'Turn on Content & Privacy Restrictions first.' })), chev: true })) }] };

  // ═══ Emergency SOS ═════════════════════════════════════════════
  P.sos = {
    title: 'Emergency SOS', icon: ['sos', 'var(--red)'], idx: ['Emergency Contacts', 'Crash Detection', 'Call with Hold'],
    render: (K) => [
      { rows: [{ t: 'Call with Hold and Release', pref: 'sos.hold', def: true }, { t: 'Call with 5 Button Presses', pref: 'sos.five', def: false }], f: 'If you hold the side and volume buttons, or press the side button 5 times, a countdown begins and an alarm sounds. When the countdown ends, iPhone calls emergency services.' },
      { rows: [{ t: 'Call Quietly', pref: 'sos.quiet', def: false }], f: 'Warning alarms, flashes and VoiceOver audio will be silenced when calling emergency services.' },
      { h: 'Crash Detection', rows: [{ t: 'Call After Severe Crash', pref: 'sos.crash', def: true }], f: 'iPhone will automatically call emergency services if a severe car crash is detected. (Sandu GT is not moving. It’s in a pond.)' },
      { h: 'Emergency Contacts', rows: [{ t: 'A-Jie', s: 'sister', avatar: 'ajie', tap: () => K.alert({ title: 'A-Jie', message: 'This number is no longer in service. Jiang Cheng never removed it.' }) }, { t: 'A-Ling', s: 'nephew', avatar: 'jl', tap: () => JC.os.open('contacts', { contact: 'jl' }) }, { t: 'Edit Emergency Contacts in Health', tint: true, tap: () => JC.os.open('health', { page: 'medicalid' }) }], f: 'You can add and edit emergency contacts in your Medical ID in Health.' },
      { h: 'Emergency SOS via Satellite', rows: [{ t: 'Try Demo', tint: true, tap: () => K.alert({ title: 'Satellite Demo', message: 'Point your iPhone at the sky to connect to a satellite.\n\nYou’re in the back of a taxi. The roof is in the way.' }) }] },
    ],
  };

  // ═══ Privacy & Security ════════════════════════════════════════
  const LOC_APPS = [['findmy', 'always'], ['maps', 'using'], ['swift', 'using'], ['lotuseats', 'using'], ['weather', 'always'], ['camera', 'using'], ['photos', 'using'], ['wavelet', 'never'], ['safari', 'ask'], ['calendar', 'using'], ['wallet', 'using']];
  const LOC_L = { never: 'Never', ask: 'Ask Next Time', using: 'While Using', always: 'Always' };
  P.privacy = {
    title: 'Privacy & Security', icon: ['hand.raised.fill', 'var(--blue)'], idx: ['Location Services', 'Tracking', 'Camera Access', 'Microphone', 'Lockdown Mode', 'Safety Check', 'App Privacy Report'],
    render: (K) => [
      hero('hand.raised.fill', 'var(--blue)', 'Privacy & Security', 'Control which apps can access your data, location, camera, and microphone, and manage safety protections.'),
      { rows: [{ t: 'Location Services', icon: ['location.fill', 'var(--blue)'], d: K.pref('loc.on', true) ? 'On' : 'Off', go: 'location' }, { t: 'Tracking', icon: ['location.circle', 'var(--orange)'], go: 'tracking' }] },
      { rows: [
        ['Calendars', 'calendar', 'var(--red)', ['calendar', 'wavelet']], ['Contacts', 'person.crop.circle', 'var(--gray)', ['messages', 'wavelet', 'lotuseats']], ['Files & Folders', 'folder.fill', 'var(--blue)', ['mail']], ['Focus', 'moon.fill', 'var(--indigo)', ['messages']], ['Health', 'heart.fill', 'var(--pink)', ['lotusleap']], ['Local Network', 'network', 'var(--blue)', ['music', 'swift']], ['Media & Apple Music', 'music.note', 'var(--pink)', ['wavelet', 'lotusleap']], ['Motion & Fitness', 'figure.run', 'var(--green)', ['health', 'maps']], ['Photos', 'photo.fill', 'linear-gradient(135deg,#ff9500,#ff2d55 50%,#5856d6)', ['wavelet', 'messages', 'lotuseats']], ['Reminders', 'list.bullet', 'var(--orange)', ['calendar']],
      ].map(([t, ic, bg, apps]) => ({ t, icon: [ic, bg], go: 'perm', arg: { t, apps } })) },
      { rows: [['Bluetooth', 'bluetooth', 'var(--blue)', ['music', 'swift', 'findmy']], ['Camera', 'camera.fill', 'var(--gray)', ['wavelet', 'messages', 'lotuseats']], ['Microphone', 'mic.fill', 'var(--orange)', ['wavelet', 'voicememos', 'facetime']], ['Speech Recognition', 'waveform', 'var(--gray)', ['notes']]].map(([t, ic, bg, apps]) => ({ t, icon: [ic, bg], go: 'perm', arg: { t, apps } })) },
      { rows: [{ t: 'Sensitive Content Warning', pref: 'priv.scw', def: false }], f: 'Detect nude photos and videos before they are viewed on your iPhone.' },
      { rows: [{ t: 'Analytics & Improvements', go: 'analytics' }, { t: 'Apple Advertising', go: 'ads' }, { t: 'App Privacy Report', go: 'apr' }] },
      { h: 'Security', rows: [{ t: 'Stolen Device Protection', d: K.pref('sdp', false) ? 'On' : 'Off', tap: () => K.go('faceid') }, { t: 'Safety Check', go: 'safety' }, { t: 'Lockdown Mode', d: 'Off', go: 'lockdown' }] },
    ],
  };
  P.location = {
    title: 'Location Services', path: 'Privacy & Security', icon: ['location.fill', 'var(--blue)'], idx: ['Share My Location', 'System Services'],
    render: (K) => [
      { rows: [{ t: 'Location Services', pref: 'loc.on', def: true, rerender: true, confirm: (ok) => ok() }, { t: 'Location Alerts', d: '', alert: { title: 'Location Alerts', message: 'Show map in location alerts: On.' } }], f: 'Location Services uses GPS, Bluetooth, and crowd-sourced Wi-Fi hotspot and cell tower locations to determine your approximate location.' },
      { rows: [{ t: 'Share My Location', d: 'On', go: 'sharemyloc' }], f: 'This iPhone is being used for location sharing.' },
      { rows: LOC_APPS.map(([id, d]) => ({ t: K.appName(id), icon: 'app:' + id, d: LOC_L[K.pref('loc.' + id, d)], pick: { pref: 'loc.' + id, def: d, options: Object.keys(LOC_L).map((k) => [k, LOC_L[k]]), header: 'Allow Location Access' } })).concat([{ t: 'System Services', go: 'sysservices' }]) },
    ],
  };
  P.sharemyloc = { title: 'Share My Location', path: 'Location Services', render: (K) => [{ rows: [{ t: 'Share My Location', pref: 'loc.share', def: true }], f: 'Share your location with family and friends in Messages and Find My.' }, { h: 'Sharing With', rows: [{ t: 'A-Ling', avatar: 'jl', d: 'Indefinitely' }, { t: '🐶 DO NOT ANSWER', avatar: 'wwx', d: 'Started 2 days ago', s: 'He asked. You said yes. You don’t remember why.' }] }, { rows: [{ t: 'Find My iPhone', d: 'On', go: 'findmyset' }] }] };
  tpage('sysservices', 'System Services', 'Location Services', [{ rows: [['Cell Network Search', 'ss.cell', true], ['Compass Calibration', 'ss.compass', true], ['Emergency Calls & SOS', 'ss.sos', true], ['Find My iPhone', 'ss.findmy', true], ['Location-Based Alerts', 'ss.alerts', true], ['Setting Time Zone', 'ss.tz', true], ['Significant Locations', 'ss.sig', true]] }]);
  P.perm = { title: (a) => a.t, path: 'Privacy & Security', noSearch: true, render: (K, a) => [{ rows: a.apps.map((id) => ({ t: K.appName(id), icon: 'app:' + id, pref: 'perm.' + a.t + '.' + id, def: !(a.t === 'Health' && id === 'lotusleap') })), f: 'Applications that have requested access to your ' + a.t.toLowerCase() + ' will appear here.' }] };
  P.tracking = { title: 'Tracking', path: 'Privacy & Security', render: (K) => [{ rows: [{ t: 'Allow Apps to Request to Track', pref: 'track', def: false }], f: 'Allow apps to ask to track your activity across other companies’ apps and websites. When this is off, all new app tracking requests are automatically denied.' }, { rows: [{ t: 'Wavelet', icon: 'app:wavelet', pref: 'track.wavelet', def: false }, { t: 'Lotus Leap', icon: 'app:lotusleap', pref: 'track.lotusleap', def: false }] }] };
  tpage('analytics', 'Analytics & Improvements', 'Privacy & Security', [{ rows: [['Share iPhone Analytics', 'an.share', false], ['Improve Siri & Dictation', 'an.siri', false], ['Share iCloud Analytics', 'an.icloud', false]], f: 'Help Apple improve its products and services by automatically sending daily diagnostic and usage data.' }]);
  tpage('ads', 'Apple Advertising', 'Privacy & Security', [{ rows: [['Personalized Ads', 'ads.pers', false]], f: 'Turning off Personalized Ads limits Apple’s ability to deliver relevant ads to you.' }]);
  P.apr = { title: 'App Privacy Report', path: 'Privacy & Security', render: (K) => (K.pref('apr', false) ? [{ h: 'Data & Sensor Access', rows: [{ t: 'Wavelet', icon: 'app:wavelet', s: 'Photos, Camera · 2 min ago' }, { t: 'Swift Ride', icon: 'app:swift', s: 'Location · 23:37' }, { t: 'Lotus Leap', icon: 'app:lotusleap', s: 'No access' }] }, { rows: [{ t: 'Turn Off App Privacy Report', danger: true, center: true, tap: () => { K.setPref('apr', false); K.render(); } }] }] : [hero('hand.raised.fill', 'var(--blue)', 'App Privacy Report', 'See how often apps have accessed your data — such as your location, camera, microphone and more.'), { rows: [{ t: 'Turn On App Privacy Report', tint: true, center: true, tap: () => { K.setPref('apr', true); K.render(); } }] }]) };
  P.safety = { title: 'Safety Check', path: 'Privacy & Security', render: (K) => [hero('person.2.fill', 'var(--blue)', 'Safety Check', 'If your personal safety is at risk, use Safety Check to quickly stop sharing your information, or to review and update sharing with individual people and apps.'), { rows: [{ t: 'Emergency Reset', tint: true, tap: () => K.alert({ title: 'Emergency Reset', message: 'Emergency Reset requires the Apple Account password.' }) }, { t: 'Manage Sharing & Access', tint: true, tap: () => K.go('sharemyloc') }] }, { rows: [{ t: 'Quick Exit', tint: true, tap: () => JC.os.home() }], f: 'Quick Exit immediately closes Safety Check and returns to the Home Screen.' }] };
  P.lockdown = { title: 'Lockdown Mode', path: 'Privacy & Security', render: (K) => [hero('hand.raised.fill', 'var(--blue)', 'Lockdown Mode', 'Lockdown Mode is an extreme, optional protection that should only be used if you believe you may be personally targeted by a highly sophisticated cyberattack.'), { rows: [{ t: 'Turn On Lockdown Mode', tint: true, center: true, tap: () => JC.ui.alert({ title: 'Turn On & Restart', message: 'iPhone needs to restart to turn on Lockdown Mode. You don’t want to restart someone else’s phone at midnight.', buttons: [{ text: 'Cancel', style: 'cancel' }] }) }] }] };

  // ═══ Passwords ═════════════════════════════════════════════════
  const PWS = [
    { id: 'apple', site: 'Apple Account', user: 'jiang.cheng@lotuspier.yunmeng', pw: '••• (iCloud Keychain can’t show this)', hidden: true, note: '' },
    { id: 'ymj', site: 'portal.lotuspier.yunmeng', user: 'jiangcheng', pw: 'NinePetals!1508', note: 'YMJ intranet' },
    { id: 'school', site: 'parents.lanling-intl.edu', user: 'jiangwanyin', pw: 'A-Ling2008!', note: 'Lanling International parent portal', reused: true },
    { id: 'pet', site: 'petkingdom.lanling', user: 'jiangwanyin', pw: 'A-Ling2008!', note: 'Fairy’s food. 20 kg every three weeks.', reused: true },
    { id: 'koi', site: 'board.koitower.jin', user: 'jiang.c', pw: 'A-Ling2008!', note: 'Jin Group board portal (guardian seat)', reused: true },
    { id: 'peony', site: 'goldenpeony.hotel', user: '+86 555 0716 0515', pw: 'Lotus-Root-400kg', note: 'Room 1808' },
    { id: 'wavelet', site: 'wavelet.app', user: '@jiangwanyin', pw: 'getlost1992', note: '' },
    { id: 'swift', site: 'swiftride.cn', user: '+86 555 0716 0515', pw: 'ZiDian#9', note: '' },
    { id: 'tea', site: 'cloudrecesses-teashop.gusu', user: 'jiang.cheng@lotuspier.yunmeng', pw: 'whitepeony85c', note: '85°C. No sugar.' },
  ];
  const WIFI_PW = [['Lotus Pier Residence', 'jiasongyu1508'], ['YMJ-HQ-Staff', 'ymj-staff-2026'], ['The Jingshi (guest)', 'radishes4ever'], ['Cloud Recesses Tea Shop', 'whitepeony']];
  P.passwords = {
    title: 'Passwords', icon: ['key', 'var(--gray)'], gate: 'Passwords', idx: ['Saved Passwords', 'Security Recommendations', 'Wi-Fi Passwords'],
    right: (K) => [JC.ui.navBtn({ icon: 'plus', onTap: () => K.alert({ title: 'New Password', message: 'Saving new passwords requires iCloud Keychain, which needs the owner’s Apple Account password.' }) })],
    render(K, a, page) {
      const q = (page && page._q) || '';
      const list = PWS.filter((p) => !q || (p.site + p.user).toLowerCase().includes(q));
      return [
        h('div.set-pw-search', JC.ui.search({ placeholder: 'Search', onInput: (v) => { const t = K.top(); t._q = v.trim().toLowerCase(); t.render(); setTimeout(() => { const inp = t.el.querySelector('.set-pw-search input'); if (inp) { inp.focus(); inp.value = v; } }, 0); } })),
        { rows: [{ t: 'Security Recommendations', s: '3 passwords are reused', icon: ['exclamationmark.triangle.fill', 'var(--orange)'], go: 'pwsec' }] },
        { h: 'Passwords', rows: list.map((p) => ({ t: p.site, s: p.user, icon: ['key', p.reused ? 'var(--orange)' : 'var(--gray)'], go: 'pwitem', arg: p.id })) },
        q ? null : { h: 'Wi-Fi', rows: WIFI_PW.map(([n, pw]) => ({ t: n, icon: ['wifi', 'var(--blue)'], go: 'pwwifi', arg: n })) },
      ];
    },
  };
  P.pwsec = { title: 'Security Recommendations', path: 'Passwords', noSearch: true, render: (K) => [{ h: 'Reused Passwords', rows: PWS.filter((p) => p.reused).map((p) => ({ t: p.site, s: 'Reused on 3 websites', icon: ['exclamationmark.triangle.fill', 'var(--orange)'], go: 'pwitem', arg: p.id })), f: 'These accounts use the same password: A-Ling’s name and birth year. Jiang Cheng uses his nephew’s birthday for everything.' }] };
  P.pwitem = {
    title: (id) => (PWS.find((p) => p.id === id) || {}).site, path: 'Passwords', noSearch: true,
    render(K, id, page) {
      const p = PWS.find((x) => x.id === id);
      const shown = page && page._show;
      return [
        { rows: [{ custom: () => h('div.set-pw-head', h('div.set-pw-ic', JC.icon('key', { size: 26 })), h('div.set-pw-site', p.site)) }] },
        { rows: [
          { t: 'User Name', d: p.user, copy: true },
          { t: 'Password', d: shown ? p.pw : '••••••••••', tap: () => { if (p.hidden) { K.alert({ title: 'Apple Account', message: 'This password isn’t stored on this iPhone.' }); return; } const t = K.top(); t._show = !t._show; t.render(); }, right: h('span.set-pw-reveal', shown ? 'Hide' : 'Show') },
          { t: 'Copy Password', tint: true, tap: () => { if (p.hidden) return; U.copy(p.pw); K.toast('Password copied', 'doc.on.doc'); } },
        ] },
        p.note ? { h: 'Notes', rows: [{ t: p.note }] } : null,
        p.reused ? { rows: [{ t: 'Change Password on Website', tint: true, tap: () => JC.os.open('safari', { url: p.site }) }], f: 'This password is reused on 3 websites.' } : null,
        { rows: [{ t: 'Delete Password', danger: true, center: true, tap: () => K.alert({ title: 'Delete Password?', message: 'Deleting passwords is disabled on this supervised iPhone.' }) }] },
      ];
    },
  };
  P.pwwifi = { title: (n) => n, path: 'Passwords', noSearch: true, render: (K, n, page) => { const pw = (WIFI_PW.find((x) => x[0] === n) || [0, ''])[1]; const shown = page && page._show; return [{ rows: [{ t: 'Network', d: n }, { t: 'Password', d: shown ? pw : '••••••••', right: h('span.set-pw-reveal', shown ? 'Hide' : 'Show'), tap: () => { const t = K.top(); t._show = !t._show; t.render(); } }, { t: 'Copy Password', tint: true, tap: () => { U.copy(pw); K.toast('Password copied', 'doc.on.doc'); } }] }, n.startsWith('The Jingshi') ? h('div.set-hero-s.pad', 'Saved from Wei Wuxian’s house. The password is a crime.') : null]; } };

  // ═══ Game Center, iCloud, Wallet ═══════════════════════════════
  P.gamecenter = {
    title: 'Game Center', icon: ['gamecontroller.fill', 'var(--pink)'], idx: ['Nickname', 'Friends', 'Leaderboards', 'jiujiu'],
    render(K) {
      const ll = JC.store.hasSeed && JC.store.hasSeed('lotusleap') ? JC.store.get('lotusleap', 'me') : null;
      const best = Math.max(1203, (ll && ll.best) || 0);
      return [
        { rows: [{ t: 'Game Center', pref: 'gc.on', def: true }] },
        { rows: [{ custom: () => h('div.set-gc', h('div.set-gc-av', 'J'), h('div', h('div.set-gc-n', 'jiujiu'), h('div.set-gc-s', 'Jiang Cheng · 3 friends'))) }, { t: 'Nickname', d: 'jiujiu', alert: { title: 'Nickname', message: 'A-Ling chose this nickname in 2023. It can only be changed once a year. It was changed yesterday. (By A-Ling.)' } }] },
        { h: 'Friends', rows: [{ t: 'A-Ling', s: 'rulan_jin · Lotus Leap 1,824', avatar: 'jl', tap: () => JC.os.open('lotusleap', { board: true }) }, { t: 'Lan Sizhui', s: 'sizhui_lan · Lotus Leap 990', avatar: 'sz' }, { t: 'Wei Ying', s: 'radish_king · Lotus Leap 12', avatar: 'wwx' }] },
        { h: 'Your Games', rows: [{ t: 'Lotus Leap', icon: 'app:lotusleap', s: 'Best: ' + best.toLocaleString('en-US') + (best > 1824 ? ' · #1 among friends' : ' · #2 among friends'), tap: () => JC.os.open('lotusleap'), chev: true }] },
        { rows: [{ t: 'Nearby Players', pref: 'gc.nearby', def: true }, { t: 'Allow Finding by Friends', pref: 'gc.find', def: true }, { t: 'Connect with Friends', pref: 'gc.connect', def: true }] },
        { rows: [{ t: 'Sign Out', danger: true, center: true, tap: () => K.alert({ title: 'Sign Out', message: 'Signing out of Game Center requires the Apple Account password.' }) }] },
      ];
    },
  };
  P.icloud = {
    title: 'iCloud', path: 'Apple Account', icon: ['cloud.fill', 'var(--blue)'], idx: ['iCloud Backup', 'iCloud Storage', 'iCloud Drive', 'Private Relay', 'Back Up Now'],
    render: (K) => [
      { rows: [{ custom: () => h('div.set-pad', K.usageBar([{ name: 'Photos', v: 1.41, c: 'var(--yellow)' }, { name: 'Backups', v: 0.22, c: 'var(--purple)' }, { name: 'Messages', v: 0.14, c: 'var(--green)' }, { name: 'Drive', v: 0.06, c: 'var(--blue)' }], 2, { title: 'iCloud+', right: '1.83 TB of 2 TB Used' })) }, { t: 'Manage Account Storage', go: 'icloudstorage' }] },
      { h: 'Saved to iCloud', rows: [{ t: 'Photos', icon: 'app:photos', d: 'On', go: 'icloudapp', arg: 'Photos' }, { t: 'iCloud Drive', icon: ['folder.fill', 'var(--blue)'], d: 'On', go: 'icloudapp', arg: 'iCloud Drive' }, { t: 'Passwords', icon: ['key', 'var(--gray)'], d: 'On', go: 'icloudapp', arg: 'Passwords' }, { t: 'Notes', icon: 'app:notes', d: 'On', go: 'icloudapp', arg: 'Notes' }, { t: 'Messages in iCloud', icon: 'app:messages', d: 'On', go: 'icloudapp', arg: 'Messages' }, { t: 'Show All', go: 'icloudall' }] },
      { h: 'Device Backups', rows: [{ t: 'iCloud Backup', d: K.pref('ic.backup', true) ? 'On' : 'Off', go: 'backup' }] },
      { h: 'iCloud+', rows: [{ t: 'Private Relay', pref: 'ic.relay', def: false }, { t: 'Hide My Email', alert: { title: 'Hide My Email', message: '3 addresses: lotus.root.400kg@icloud.com, …' }, chev: true }, { t: 'Custom Email Domain', d: 'lotuspier.yunmeng', alert: { title: 'Custom Email Domain', message: 'lotuspier.yunmeng is set up for you and A-Ling.' } }] },
      { rows: [{ t: 'Advanced Data Protection', d: 'Off', alert: { title: 'Advanced Data Protection', message: 'Turning this on requires the Apple Account password and a recovery contact.' } }, { t: 'Access iCloud Data on the Web', pref: 'ic.web', def: true }] },
    ],
  };
  P.icloudstorage = { title: 'iCloud Storage', path: 'iCloud', render: (K) => [{ rows: [{ t: 'Change Storage Plan', d: '2 TB', alert: { title: 'Storage Plan', message: 'You’re on the 2 TB plan. Upgrading requires the owner’s Apple Account password.' } }] }, { rows: [['Photos', '1.41 TB'], ['Backups', '220 GB'], ['Messages', '140 GB'], ['iCloud Drive', '60 GB'], ['Mail', '4.2 GB'], ['Notes', '380 MB'], ['Voice Memos', '210 MB']].map(([t, d]) => ({ t, d })) }] };
  P.icloudapp = { title: (n) => n, path: 'iCloud', noSearch: true, render: (K, n) => [{ rows: [{ t: 'Sync this iPhone', pref: 'ic.sync.' + n, def: true }], f: n + ' will be kept up to date across Jiang Cheng’s devices.' }] };
  P.icloudall = { title: 'Apps Using iCloud', path: 'iCloud', render: (K) => [{ rows: ['photos', 'mail', 'contacts', 'calendar', 'reminders', 'notes', 'messages', 'safari', 'stocks', 'health', 'wallet', 'voicememos', 'findmy', 'lotusleap', 'wavelet'].map((id) => ({ t: K.appName(id), icon: 'app:' + id, pref: 'ic.app.' + id, def: id !== 'wavelet' })) }] };
  let backupT = null, backupP = 0;
  P.backup = {
    title: 'iCloud Backup', path: 'iCloud', idx: ['Back Up Now'],
    render(K) {
      const last = K.pref('ic.last', null);
      return [
        { rows: [{ t: 'Back Up This iPhone', pref: 'ic.backup', def: true }, { t: 'Back Up Over Cellular', pref: 'ic.cell', def: false }], f: 'Automatically back up data such as accounts, documents, Home configuration, and settings when iPhone is connected to power, locked and on Wi-Fi.' },
        { rows: [backupT ? { t: 'Backing Up… ' + Math.round(backupP * 100) + '%', s: 'Estimating time remaining…', right: h('div.set-spin') } : { t: 'Back Up Now', tint: true, center: true, tap: () => {
          const wifi = S().wifi && S().wifiNet;
          if (!wifi && !K.pref('ic.cell', false)) { K.alert({ title: 'Unable to Back Up', message: 'Connect to Wi-Fi to back up this iPhone, or turn on Back Up Over Cellular.' }); return; }
          backupP = 0;
          backupT = setInterval(() => { backupP += 0.04; if (backupP >= 1) { clearInterval(backupT); backupT = null; K.setPref('ic.last', JC.time.now()); K.toast('Backup complete', 'checkmark.circle.fill'); } const t = K.top(); if (t && t.data && t.data.id === 'backup') t.render(); }, 300);
          K.render();
        } }], f: 'Last successful backup: ' + (last ? 'Today at ' + U.fmtTime(last) : 'Yesterday at 3:12 AM') },
      ];
    },
  };
  P.walletpay = {
    title: 'Wallet & Apple Pay', icon: ['creditcard.fill', '#1c1c1e'], idx: ['Apple Pay', 'Cards', 'Double-Click Side Button', 'Transaction Defaults'],
    render: (K) => [
      { h: 'Payment Cards', rows: [{ t: 'Yunmeng Commercial Bank', s: 'Credit ••4417', leading: h('div.set-card', { style: { background: 'linear-gradient(135deg,#7b4bd1,#3b2a74)' } }), tap: () => JC.os.open('wallet') }, { t: 'YMJ Corporate Card', s: 'Credit ••1992', leading: h('div.set-card', { style: { background: 'linear-gradient(135deg,#2c2c2e,#000)' } }), tap: () => JC.os.open('wallet') }, { t: 'Add Card', tint: true, tap: () => K.alert({ title: 'Add Card', message: 'Adding a card requires verification from Yunmeng Commercial Bank with a code sent to 95588. (That’s Jiang Cheng’s bank, not yours.)' }) }] },
      { rows: [{ t: 'Double-Click Side Button', pref: 'wal.dbl', def: true }, { t: 'Allow Payments on Mac', pref: 'wal.mac', def: true }], f: 'Get cards ready at any time from the Lock Screen by double-clicking the side button.' },
      { h: 'Transaction Defaults', rows: [{ t: 'Default Card', d: 'Yunmeng Commercial Bank' }, { t: 'Shipping Address', d: 'Lotus Pier, Yunmeng' }, { t: 'Email', d: 'jiang.cheng@lotuspier.yunmeng' }, { t: 'Phone', d: '+86 555 0716 0515' }] },
      { rows: [{ t: 'Open Wallet', tint: true, tap: () => JC.os.open('wallet') }] },
    ],
  };

  // ═══ Apple Account ═════════════════════════════════════════════
  P.appleid = {
    title: 'Apple Account', icon: ['person.crop.circle', 'var(--gray)'], idx: ['Sign Out', 'Family', 'Subscriptions', 'Devices', 'Find My iPhone'],
    render: (K) => [
      h('div.set-acct', JC.ui.avatar('me', 92), h('div.set-acct-n', 'Jiang Cheng'), h('div.set-acct-e', 'jiang.cheng@lotuspier.yunmeng')),
      { rows: [{ t: 'Personal Information', icon: ['person.crop.circle', 'var(--gray)'], go: 'acct.personal' }, { t: 'Sign-In & Security', icon: ['key', 'var(--gray)'], go: 'acct.security' }, { t: 'Payment & Shipping', icon: ['creditcard.fill', 'var(--green)'], d: 'Visa', go: 'acct.payment' }, { t: 'Subscriptions', icon: ['arrow.triangle.2.circlepath', 'var(--red)'], go: 'acct.subs' }] },
      { rows: [{ t: 'iCloud', icon: ['cloud.fill', 'var(--blue)'], d: '2 TB', go: 'icloud' }, { t: 'Family', icon: ['person.2.fill', 'var(--blue)'], d: 'A-Ling', go: 'acct.family' }, { t: 'Find My', icon: 'app:findmy', go: 'findmyset' }, { t: 'Media & Purchases', icon: ['bag.fill', 'var(--blue)'], tap: () => JC.ui.actionSheet({ title: 'Media & Purchases', actions: [{ text: 'View Account', onTap: () => K.alert({ title: 'View Account', message: 'Enter the Apple Account password to view account.' }) }, { text: 'Password Settings', onTap: () => K.alert({ title: 'Password Settings', message: 'Require password: Always.' }) }, { text: 'Sign Out', style: 'destructive', onTap: () => K.alert({ title: 'Sign Out', message: 'Requires the Apple Account password.' }) }] }) }, { t: 'Sign in with Apple', icon: ['person.crop.circle', 'var(--gray)'], alert: { title: 'Sign in with Apple', message: 'Apps using Sign in with Apple: Wavelet, Swift Ride, Lotus Eats.' } }] },
      { h: 'Devices', rows: [
        { t: 'Jiang Cheng’s iPhone', s: 'This iPhone 17 Pro', icon: ['iphone', 'var(--gray)'], go: 'acct.device', arg: 'iphone' },
        { t: 'Jiang Cheng’s MacBook Pro', s: 'MacBook Pro 14″', icon: ['laptopcomputer', 'var(--gray)'], go: 'acct.device', arg: 'mac' },
        { t: 'Jiang Cheng’s Apple Watch', s: 'Apple Watch Series 11', icon: ['clock', 'var(--gray)'], go: 'acct.device', arg: 'watch' },
        { t: 'iPad', s: 'iPad Pro · Lotus Pier Residence', icon: ['ipad', 'var(--gray)'], go: 'acct.device', arg: 'ipad' },
      ] },
      { rows: [{ t: 'Sign Out', danger: true, center: true, tap: () => JC.ui.alert({ title: 'Apple Account Password', message: 'Enter the password for “jiang.cheng@lotuspier.yunmeng” to turn off Find My iPhone.', input: { placeholder: 'Password', type: 'password' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Turn Off', style: 'default' }] }).then((r) => { if (r.index === 1) setTimeout(() => K.alert({ title: 'Incorrect Password', message: 'The password you entered is incorrect.' }), 400); }) }] },
    ],
  };
  P['acct.personal'] = { title: 'Personal Information', path: 'Apple Account', render: (K) => [{ rows: [{ t: 'Name', d: 'Jiang Cheng' }, { t: 'Birthday', d: '15/05/1992' }] }, { rows: [{ t: 'Communication Preferences', alert: { title: 'Communication Preferences', message: 'Announcements: Off. Apps, Music, TV & More: Off. Jiang Cheng unsubscribed from everything.' }, chev: true }, { t: 'Legacy Contact', d: 'A-Ling', alert: { title: 'Legacy Contact', message: 'A-Ling (Jin Ling) can access Jiang Cheng’s account data after his death. Added on A-Ling’s 16th birthday.' } }] }] };
  P['acct.security'] = { title: 'Sign-In & Security', path: 'Apple Account', render: (K) => [{ h: 'Email & Phone Numbers', rows: [{ t: 'jiang.cheng@lotuspier.yunmeng', s: 'Apple Account' }, { t: '+86 555 0716 0515', s: 'Phone' }] }, { rows: [{ t: 'Change Password', tint: true, tap: () => K.gate('Change Apple Account Password', () => { K.back(); setTimeout(() => K.alert({ title: 'Security Delay', message: 'Stolen Device Protection requires a 1-hour security delay before changing the Apple Account password away from familiar locations.' }), 400); }) }] }, { rows: [{ t: 'Two-Factor Authentication', d: 'On' }, { t: 'Account Recovery', d: 'Tang Mei (EA)', alert: { title: 'Account Recovery', message: 'Recovery Contact: Tang Mei.' } }, { t: 'Security Keys', d: 'None' }] }] };
  P['acct.payment'] = { title: 'Payment & Shipping', path: 'Apple Account', render: (K) => [{ h: 'Payment Method', rows: [{ t: 'Visa ••0716', s: 'Yunmeng Commercial Bank' }, { t: 'Add Payment Method', tint: true, tap: () => K.alert({ title: 'Add Payment Method', message: 'Requires the Apple Account password.' }) }] }, { h: 'Shipping Address', rows: [{ t: 'Jiang Cheng', s: 'Lotus Pier, Lakeside Rd 1, Yunmeng' }] }] };
  P['acct.subs'] = { title: 'Subscriptions', path: 'Apple Account', render: (K) => [{ h: 'Active', rows: [{ t: 'Apple Music Family', s: 'Renews November 3 · ¥17/month', tap: () => JC.os.open('music', { tab: 'library' }) }, { t: 'iCloud+ 2 TB', s: 'Renews November 21 · ¥68/month' }, { t: 'Koi Tower TV+', s: 'Renews October 18 · Added by A-Ling', tap: () => K.alert({ title: 'Koi Tower TV+', message: 'A-Ling subscribed using your account. It renews on his birthday.' }) }] }, { h: 'Expired', rows: [{ t: 'Wavelet Premium', s: 'Expired August 2, 2026' }] }] };
  P['acct.family'] = { title: 'Family', path: 'Apple Account', render: (K) => [{ h: 'Members', rows: [{ t: 'Jiang Cheng (Me)', s: 'Organizer', avatar: 'me' }, { t: 'A-Ling', s: 'Jin Ling · Teen (17)', avatar: 'jl', go: 'acct.aling' }] }, { rows: [{ t: 'Add Member', tint: true, tap: () => K.alert({ title: 'Add Member', message: 'Invite someone to your family? (You’re not Jiang Cheng. Probably don’t.)' }) }] }, { h: 'Shared With Your Family', rows: [{ t: 'Subscriptions', d: 'Apple Music, iCloud+' }, { t: 'Location Sharing', d: 'A-Ling' }, { t: 'Purchase Sharing', d: 'On' }] }] };
  P['acct.aling'] = { title: 'A-Ling', path: 'Family', noSearch: true, render: (K) => [h('div.set-acct', JC.ui.avatar('jl', 80), h('div.set-acct-n', 'A-Ling'), h('div.set-acct-e', 'Turns 18 on Sunday')), { rows: [{ t: 'Ask to Buy', pref: 'fam.atb', def: false }, { t: 'Screen Time', d: '9h 12m daily avg', alert: { title: 'A-Ling’s Screen Time', message: 'Daily average: 9 hours 12 minutes. Most used: Lotus Leap, Wavelet, Messages.' } }, { t: 'Location Sharing', d: 'On' }], f: 'When A-Ling turns 18 on Sunday, he’ll be able to leave the family group. He says he won’t.' }] };
  P.findmyset = { title: 'Find My', path: 'Apple Account', idx: ['Find My iPhone', 'Lost Mode', 'Send Last Location'], render: (K) => [{ rows: [{ t: 'Find My iPhone', d: 'On', go: 'findmyiphone' }] }, { h: 'Location Sharing', rows: [{ t: 'Share My Location', pref: 'loc.share', def: true }, { t: 'My Location', d: 'This Device' }], f: 'Share your location with family and friends.' }, { rows: [{ t: 'Open Find My', tint: true, tap: () => JC.os.open('findmy') }] }] };
  P.findmyiphone = { title: 'Find My iPhone', path: 'Find My', render: (K) => [{ rows: [{ t: 'Find My iPhone', locked: true, lockMsg: 'Turning off Find My iPhone requires the Apple Account password.' }], f: 'Locate, lock, or erase this iPhone and supported accessories. iPhone can be found even when powered off.' }, { rows: [{ t: 'Find My network', locked: true, lockMsg: 'Find My network can’t be turned off without the Apple Account password.' }, { t: 'Send Last Location', pref: 'fm.last', def: true }] }] };
  P['acct.device'] = {
    title: (d) => ({ iphone: 'Jiang Cheng’s iPhone', mac: 'Jiang Cheng’s MacBook Pro', watch: 'Jiang Cheng’s Apple Watch', ipad: 'iPad' }[d]), path: 'Apple Account', noSearch: true,
    render: (K, d) => [{ rows: [{ t: 'Model', d: { iphone: 'iPhone 17 Pro', mac: 'MacBook Pro 14″', watch: 'Apple Watch Series 11', ipad: 'iPad Pro 13″' }[d] }, { t: 'Version', d: { iphone: 'iOS 26.0.1', mac: 'macOS 26.0', watch: 'watchOS 26.0', ipad: 'iPadOS 26.0' }[d] }, { t: 'Location', d: { iphone: 'This iPhone', mac: 'Golden Peony Hotel', watch: 'With Jiang Cheng', ipad: 'Lotus Pier Residence' }[d] }] }, d !== 'iphone' ? { rows: [{ t: 'Show in Find My', tint: true, tap: () => JC.os.open('findmy', { tab: 'devices' }) }, { t: 'Remove from Account', danger: true, tap: () => K.alert({ title: 'Remove from Account', message: 'Removing devices requires the Apple Account password.' }) }] } : null],
  };

  // ═══ Apps ══════════════════════════════════════════════════════
  P.apps = {
    title: 'Apps', icon: ['square.grid.2x2.fill', 'var(--indigo)'], idx: ['Default Apps', 'Hidden Apps'],
    render(K, a, page) {
      const q = (page && page._q) || '';
      const ids = K.apps().filter((id) => !q || K.appName(id).toLowerCase().includes(q));
      const groups = {};
      ids.forEach((id) => { const L = K.appName(id)[0].toUpperCase(); (groups[L] = groups[L] || []).push(id); });
      return [
        h('div.set-pw-search', JC.ui.search({ placeholder: 'Search Apps', onInput: (v) => { const t = K.top(); t._q = v.trim().toLowerCase(); t.render(); setTimeout(() => { const inp = t.el.querySelector('.set-pw-search input'); if (inp) { inp.focus(); inp.value = v; } }, 0); } })),
        q ? null : { rows: [{ t: 'Default Apps', go: 'defaultapps' }, { t: 'Hidden Apps', go: 'hiddenapps' }] },
      ].concat(Object.keys(groups).sort().map((L) => ({ h: L, rows: groups[L].map((id) => ({ t: K.appName(id), icon: 'app:' + id, go: 'app', arg: id })) })));
    },
  };
  P.defaultapps = { title: 'Default Apps', path: 'Apps', render: (K) => [{ rows: [{ t: 'Email', d: 'Mail', pick: { pref: 'def.mail', def: 'mail', options: [['mail', 'Mail']] } }, { t: 'Messaging', d: 'Messages', pick: { pref: 'def.msg', def: 'messages', options: [['messages', 'Messages']] } }, { t: 'Calling', d: 'Phone', pick: { pref: 'def.call', def: 'phone', options: [['phone', 'Phone']] } }, { t: 'Browser App', d: 'Safari', pick: { pref: 'def.web', def: 'safari', options: [['safari', 'Safari']] } }, { t: 'Navigation', d: 'Maps', pick: { pref: 'def.nav', def: 'maps', options: [['maps', 'Maps']] } }] }] };
  P.hiddenapps = { title: 'Hidden Apps', path: 'Apps', render: (K) => [JC.ui.empty({ icon: 'eye.slash', title: 'No Hidden Apps', text: 'Apps you hide appear here.' })] };
  const APPSET = {
    messages: (K) => [
      { rows: [{ t: 'iMessage', pref: 'm.imessage', def: true }], f: 'iMessages can be sent between iPhone, iPad, iPod touch and Mac. (Except to A-Jie’s number. That one never delivers.)' },
      { rows: [{ t: 'Show Contact Photos', pref: 'm.photos', def: true, after: (v) => K.act('msgPhotos', v) }, { t: 'Text Message Forwarding', d: '1 Device', alert: { title: 'Text Message Forwarding', message: 'Jiang Cheng’s MacBook Pro receives forwarded SMS. It is at the Golden Peony Hotel. It is also receiving everything you’re reading.' } }, { t: 'Send Read Receipts', pref: 'm.receipts', def: true, after: (v) => K.act('readReceipts', v) }, { t: 'Send as Text Message', pref: 'm.sms', def: true }], f: 'When this is on, people are notified when you have read their messages. (Everyone knows when Jiang Cheng leaves them on read.)' },
      { rows: [{ t: 'Share Name and Photo', d: 'Contacts Only', alert: { title: 'Share Name and Photo', message: 'Jiang Cheng · photo: none. Shared with contacts only.' } }, { t: 'Shared with You', pref: 'm.swy', def: true }] },
      { h: 'SMS/MMS', rows: [{ t: 'MMS Messaging', pref: 'm.mms', def: true }, { t: 'Show Subject Field', pref: 'm.subject', def: false }, { t: 'Character Count', pref: 'm.count', def: false }, { t: 'Blocked Contacts', go: 'blocked' }] },
      { h: 'Message History', rows: [{ t: 'Keep Messages', d: 'Forever', pick: { pref: 'm.keep', def: 'forever', options: [['30', '30 Days'], ['365', '1 Year'], ['forever', 'Forever']], confirm: (v, ok) => (v === 'forever' ? ok() : JC.ui.alert({ title: 'Delete older messages?', message: 'This will permanently delete messages older than ' + (v === '30' ? '30 days' : '1 year') + ' — including everything from A-Jie.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onTap: () => K.alert({ title: 'Not Now', message: 'You can’t bring yourself to do it. The setting stays on Forever.' }) }] })) } }] },
      { h: 'Audio Messages', rows: [{ t: 'Expire', d: 'Never', pick: { pref: 'm.audioexp', def: 'never', options: [['2m', 'After 2 Minutes'], ['never', 'Never']] } }, { t: 'Raise to Listen', pref: 'm.raise', def: true }] },
      { rows: [{ t: 'Low Quality Image Mode', pref: 'm.lowq', def: false }] },
      { h: 'Story', rows: [{ t: 'Show Suspicion Meter', core: 'showSus', rerender: false }, { t: 'Message Speed', pick: { core: 'speed', options: [[0.7, 'Relaxed'], [1, 'Normal'], [1.6, 'Fast']] } }] },
    ],
    phone: (K) => [{ rows: [{ t: 'My Number', d: '+86 555 0716 0515' }] }, { h: 'Calls', rows: [{ t: 'Announce Calls', pick: { pref: 'ph.announce', def: 'never', options: [['always', 'Always'], ['headphones', 'Headphones & Car'], ['never', 'Never']] } }, { t: 'Respond with Text', go: 'respondtext' }, { t: 'Call Blocking & Identification', go: 'blocked' }, { t: 'Silence Unknown Callers', pref: 'ph.silence', def: false }, { t: 'Live Voicemail', pref: 'ph.livevm', def: true }] }, { rows: [{ t: 'Change Voicemail Password', tint: true, tap: () => K.alert({ title: 'Voicemail Password', message: 'Enter the current voicemail password. (It isn’t 181008. Jiang Cheng is not that predictable about everything.)' }) }, { t: 'Dial Assist', pref: 'ph.assist', def: true }] }],
    music: (K) => [{ rows: [{ t: 'Apple Music', pref: 'mu.am', def: true }, { t: 'Show Star Ratings', pref: 'mu.stars', def: false }, { t: 'Sync Library', pref: 'mu.sync', def: true }] }, { h: 'Downloads', rows: [{ t: 'Automatic Downloads', pref: 'mu.autodl', def: false }, { t: 'Optimize Storage', d: 'Off', alert: { title: 'Optimize Storage', message: 'Off. Downloaded music stays on this iPhone.' } }] }, { h: 'Audio', rows: [{ t: 'Dolby Atmos', pick: { pref: 'mu.atmos', def: 'auto', options: [['auto', 'Automatic'], ['on', 'Always On'], ['off', 'Off']] } }, { t: 'Audio Quality', d: 'Lossless', alert: { title: 'Audio Quality', message: 'Lossless streaming on Wi-Fi and cellular.' } }, { t: 'EQ', d: { off: 'Off', bass: 'Bass Booster', treble: 'Treble Booster', 'late-night': 'Late Night', acoustic: 'Acoustic', vocal: 'Vocal Booster', 'small-speakers': 'Small Speakers', rock: 'Rock', piano: 'Piano', loudness: 'Loudness' }[K.core('musicEQ') || 'off'], pick: { core: 'musicEQ', get: () => K.core('musicEQ') || 'off', set: (v) => JC.state.setting('musicEQ', v), options: [['off', 'Off'], ['acoustic', 'Acoustic'], ['bass', 'Bass Booster'], ['bass-reducer', 'Bass Reducer'], ['late-night', 'Late Night'], ['loudness', 'Loudness'], ['piano', 'Piano'], ['rock', 'Rock'], ['small-speakers', 'Small Speakers'], ['treble', 'Treble Booster'], ['treble-reducer', 'Treble Reducer'], ['vocal', 'Vocal Booster']], footer: 'The EQ changes how Music sounds right now — try it while something is playing.', after: () => JC.music && JC.music.applyEQ && JC.music.applyEQ() } }, { t: 'Sound Check', pref: 'mu.soundcheck', def: true }, { t: 'Crossfade', pref: 'mu.xfade', def: false }] }, { rows: [{ t: 'Use Listening History', pref: 'mu.history', def: true }, { t: 'Open Music', tint: true, tap: () => JC.os.open('music') }] }],
    lotusleap: (K) => [{ h: 'Game', rows: [{ t: 'Sound Effects', pref: 'll.sfx', def: true }, { t: 'Haptics', pref: 'll.haptics', def: true }, { t: 'Rhythm Ring', pref: 'll.ring', def: true }] }, { rows: [{ t: 'Reset High Score', danger: true, tap: () => JC.ui.alert({ title: 'Reset High Score?', message: 'Your best Lotus Leap score on this iPhone goes back to 1,203.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Reset', style: 'destructive', onTap: () => { if (JC.store.get('lotusleap', 'me')) JC.store.update('lotusleap', 'me', { best: 1203 }); K.toast('High score reset', 'arrow.counterclockwise'); } }] }) }, { t: 'Open Lotus Leap', tint: true, tap: () => JC.os.open('lotusleap') }], f: 'Lotus Leap by Koi Tower Games · Version 2.4.1 · “made by a-ling’s friend, best game, no ads” — App Store review by rulan_jin' }],
    safari: (K) => [{ h: 'Search', rows: [{ t: 'Search Engine', pick: { pref: 'sf.engine', def: 'baidu', options: [['baidu', 'Baidu'], ['bing', 'Bing'], ['sogou', 'Sogou'], ['google', 'Google'], ['ddg', 'DuckDuckGo']] } }, { t: 'Search Engine Suggestions', pref: 'sf.sugg', def: true }, { t: 'Safari Suggestions', pref: 'sf.ssugg', def: true }] }, { h: 'General', rows: [{ t: 'AutoFill', pref: 'sf.autofill', def: true }, { t: 'Block Pop-ups', pref: 'sf.popups', def: true }, { t: 'Hide IP Address', pick: { pref: 'sf.ip', def: 'trackers', options: [['trackers', 'From Trackers'], ['off', 'Off']] } }] }, { rows: [{ t: 'Clear History and Website Data', tint: true, tap: () => JC.ui.alert({ title: 'Clear History and Website Data?', message: 'Clearing will remove history, cookies and other browsing data. History will be cleared from devices signed in to Jiang Cheng’s iCloud account. (Including “how to say thank you to your brother without saying thank you”.)', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Clear History and Data', style: 'destructive', onTap: () => { try { if (JC.store.hasSeed('history')) JC.store.set('history', []); } catch (e) { /* ignore */ } K.act('clearHistory', true); K.toast('History cleared', 'trash'); } }] }) }] }],
    health: (K) => [{ rows: [{ t: 'Health Data', tint: true, tap: () => JC.os.open('health') }, { t: 'Medical ID', tint: true, tap: () => JC.os.open('health', { page: 'medicalid' }) }] }, { rows: [{ t: 'Share iPhone & Watch Analytics', pref: 'hl.analytics', def: false }] }],
    stocks: (K) => [{ h: 'Stocks', rows: [{ t: 'Show Currency', pref: 'stk.cur', def: false }, { t: 'Red for Gains', pref: 'stk.redup', def: false }], f: 'Red for Gains shows rising prices in red and falling prices in green, as is customary on mainland exchanges.' }, { rows: [{ t: 'Open Stocks', tint: true, tap: () => JC.os.open('stocks') }] }],
    camera: (K) => [{ rows: [{ t: 'Camera Settings', tint: true, tap: () => K.go('camera') }] }],
    photos: (K) => [{ rows: [{ t: 'iCloud Photos', pref: 'ph.icloud', def: true }, { t: 'Optimize iPhone Storage', check: () => true }, { t: 'Shared Albums', pref: 'ph.shared', def: true }, { t: 'Show Holiday Events', pref: 'ph.holidays', def: true }, { t: 'Show Featured Content', pref: 'ph.featured', def: true }] }],
    mail: (K) => [{ rows: [{ t: 'Preview', d: '2 Lines', pick: { pref: 'ml.prev', def: 2, options: [[0, 'None'], [1, '1 Line'], [2, '2 Lines'], [3, '3 Lines']] } }, { t: 'Show To/Cc Labels', pref: 'ml.tocc', def: false }, { t: 'Ask Before Deleting', pref: 'ml.ask', def: false }, { t: 'Signature', d: 'Jiang Cheng · CEO, YMJ', alert: { title: 'Signature', message: 'Jiang Cheng\nChief Executive Officer\nYunmeng Jiang Group\n\n(No “Sent from my iPhone”. He turned it off on day one.)' } }] }],
    wavelet: (K) => [{ rows: [{ t: 'Private Account', pref: 'wv.private', def: true }, { t: 'Activity Status', pref: 'wv.activity', def: false }, { t: 'Sensitive Content', pref: 'wv.sens', def: true }] }],
    swift: (K) => [{ rows: [{ t: 'Ride Receipts by SMS', pref: 'sw.sms', def: true }, { t: 'Share Trip Status', pref: 'sw.share', def: false }] }],
  };
  P.app = {
    title: (id) => JC.os.appNames[id] || id, path: 'Apps', noSearch: true,
    render(K, id) {
      const access = [];
      if (['maps', 'swift', 'lotuseats', 'weather', 'findmy', 'camera', 'photos', 'wavelet', 'safari'].includes(id)) access.push({ t: 'Location', icon: ['location.fill', 'var(--blue)'], d: LOC_L[K.pref('loc.' + id, (LOC_APPS.find((x) => x[0] === id) || [0, 'using'])[1])], pick: { pref: 'loc.' + id, def: (LOC_APPS.find((x) => x[0] === id) || [0, 'using'])[1], options: Object.keys(LOC_L).map((k) => [k, LOC_L[k]]) } });
      if (['wavelet', 'messages', 'lotuseats', 'mail', 'notes'].includes(id)) access.push({ t: 'Photos', icon: ['photo.fill', 'var(--orange)'], d: 'Full Access', pick: { pref: 'perm.photos.' + id, def: 'full', options: [['none', 'None'], ['limited', 'Limited Access'], ['full', 'Full Access']] } });
      access.push({ t: 'Siri & Search', icon: ['sparkles', 'var(--purple)'], go: 'appsiri', arg: id });
      access.push({ t: 'Notifications', icon: ['bell.fill', 'var(--red)'], s: (K.pref('notif.' + id, {}).allow === false) ? 'Off' : 'Banners, Sounds, Badges', go: 'notifapp', arg: id });
      access.push({ t: 'Background App Refresh', icon: ['arrow.triangle.2.circlepath', 'var(--gray)'], pref: 'bgr.' + id, def: id !== 'lotusleap' });
      access.push({ t: 'Cellular Data', icon: ['antenna.radiowaves.left.and.right', 'var(--green)'], pref: 'cell.' + id, def: true });
      const extra = APPSET[id] ? APPSET[id](K) : [];
      return [
        h('div.set-apphead', JC.appIcon(id, 64), h('div.set-apphead-n', K.appName(id)), h('div.set-apphead-s', id === 'lotusleap' ? 'Koi Tower Games · 2.4.1' : id === 'wavelet' ? 'Wavelet Inc.' : id === 'swift' ? 'Swift Ride Holdings' : id === 'lotuseats' ? 'Lotus Eats Ltd.' : 'Apple'), h('div.set-apphead-open.tap', { onTap: () => JC.os.open(id) }, 'Open')),
        { h: 'Allow ' + K.appName(id) + ' to Access', rows: access },
      ].concat(extra);
    },
  };
  P.appsiri = { title: 'Siri & Search', path: 'Apps', noSearch: true, render: (K, id) => [{ rows: [{ t: 'Learn from this App', pref: 'siri.learn.' + id, def: true }, { t: 'Show in App Library', pref: 'siri.lib.' + id, def: true }, { t: 'Show App in Search', pref: 'sr.app.' + id, def: true }, { t: 'Suggest App', pref: 'siri.sugg.' + id, def: true }] }] };
  P.blocked = { title: 'Blocked Contacts', path: 'Messages', render: (K) => [{ rows: K.pref('blocked', [['Wen Chao', '+86 555 0000 1009'], ['Koi Tower Valet', '+86 555 3311 0808'], ['Unknown', '+86 555 9999 0000']]).map(([n, num]) => ({ t: n, s: num, swipe: [{ text: 'Unblock', color: 'var(--red)', onTap: () => { K.setPref('blocked', K.pref('blocked', [['Wen Chao', '+86 555 0000 1009'], ['Koi Tower Valet', '+86 555 3311 0808'], ['Unknown', '+86 555 9999 0000']]).filter((x) => x[1] !== num)); K.render(); } }] })).concat([{ t: 'Add New…', tint: true, tap: () => K.alert({ title: 'Add New', message: 'Choose a contact to block from Contacts.' }) }]), f: 'You will not receive phone calls, messages, or FaceTime from people on the block list. Swipe left to unblock.' }] };
  P.respondtext = { title: 'Respond with Text', path: 'Phone', render: (K) => [{ h: 'Respond With:', rows: [['rt1', 'Can’t talk right now.'], ['rt2', 'Later.'], ['rt3', 'What.']].map(([k, d]) => ({ t: K.pref('ph.' + k, d), tap: () => JC.ui.alert({ title: 'Respond with Text', input: { value: K.pref('ph.' + k, d) }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Save', style: 'default' }] }).then((r) => { if (r.index === 1 && r.value) { K.setPref('ph.' + k, r.value); K.render(); } }) })), f: 'Jiang Cheng customized these. “What.” is his favourite.' }] };
})();
