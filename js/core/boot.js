/* JC.boot — start everything once all scripts have registered. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});

  function start(hotData) {
    JC.state.init(hotData && hotData.v ? hotData : null);
    JC.time.start();
    JC.os.build();
    JC.story.init();
    JC.os.start();
    JC.bus.emit('boot');
    JC.story.begin();
    if (window.claude && window.claude.hot && window.claude.hot.snapshot) {
      try { window.claude.hot.snapshot(() => JC.state.d); } catch (e) { /* ignore */ }
    }
  }

  JC.boot = () => {
    try {
      if (window.claude && window.claude.hot && window.claude.hot.ready) window.claude.hot.ready(start);
      else start(window.claude && window.claude.hot ? window.claude.hot.data : null);
    } catch (e) {
      console.error('boot failed', e);
      const st = document.getElementById('stage');
      if (st) st.innerHTML = '<div style="color:#fff;padding:24px;font:15px -apple-system,sans-serif">The phone failed to start: ' + (e && e.message) + '</div>';
    }
  };
})();
