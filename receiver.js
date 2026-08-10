(() => {
  'use strict';

  const NS = 'urn:x-cast:pl.bingotorlingo.state';
  const context = cast.framework.CastReceiverContext.getInstance();

  let state = {
    mode: 75,
    maxNumber: 75,
    drawnNumbers: [],
    currentNumber: null,
    remainingCount: 75,
    autoDrawEnabled: false,
    autoPaused: false,
    gameEnded: false,
    intervalSeconds: 5,
    remainingSeconds: 5
  };

  const $ = id => document.getElementById(id);

  function safeParse(data) {
    if (typeof data === 'string') {
      try { return JSON.parse(data); } catch (_) { return null; }
    }
    return data && typeof data === 'object' ? data : null;
  }

  function letterFor75(number) {
    if (number <= 15) return 'B';
    if (number <= 30) return 'I';
    if (number <= 45) return 'N';
    if (number <= 60) return 'G';
    return 'O';
  }

  function renderLatest() {
    const latest = [...state.drawnNumbers].reverse().slice(0, 10);
    $('latest').innerHTML = latest.length
      ? latest.map((n, i) => `<div class="ball ${i === 0 ? 'current' : ''}">${n}</div>`).join('')
      : '<span class="empty">—</span>';
  }

  function renderCurrent() {
    const n = state.currentNumber;
    $('current').textContent = n ?? '—';
    if (state.mode === 75 && n != null) {
      const letter = letterFor75(n);
      $('current-label').textContent = `${letter}-${n}`;
      $('current-subtitle').textContent = `KOLUMNA ${letter}`;
    } else {
      $('current-label').textContent = n ?? '—';
      $('current-subtitle').textContent = `BINGO ${state.mode}`;
    }
  }

  function renderStatus() {
    $('remaining').textContent = state.remainingCount;
    $('remaining-of').textContent = `Z ${state.maxNumber}`;
    $('tempo').textContent = `${state.intervalSeconds} sekund`;
    $('countdown').textContent = state.autoDrawEnabled && !state.autoPaused && !state.gameEnded
      ? `Następny za ${state.remainingSeconds} s`
      : '';

    const el = $('status');
    const icon = $('status-icon');
    el.className = 'status';
    icon.className = 'status-icon';

    if (state.gameEnded) {
      el.textContent = 'ZAKOŃCZONE'; el.classList.add('ended');
      icon.textContent = '■'; icon.classList.add('ended');
    } else if (state.autoDrawEnabled && state.autoPaused) {
      el.textContent = 'PAUZA'; el.classList.add('pause');
      icon.textContent = 'Ⅱ'; icon.classList.add('pause');
    } else if (state.autoDrawEnabled) {
      el.textContent = 'AKTYWNE'; el.classList.add('active');
      icon.textContent = '▶';
    } else {
      el.textContent = 'RĘCZNE'; el.classList.add('manual');
      icon.textContent = '▶';
    }
  }

  function cell(number, drawn, current) {
    const cls = current ? 'cell current' : drawn ? 'cell drawn' : 'cell';
    return `<div class="${cls}"><span>${number}</span></div>`;
  }

  function renderBoard75() {
    const board = $('board');
    board.className = 'board b75';
    const drawn = new Set(state.drawnNumbers);
    const headers = [
      ['B', 'b'], ['I', 'i'], ['N', 'n'], ['G', 'g'], ['O', 'o']
    ];
    let html = headers.map(([t, c]) => `<div class="header ${c}">${t}</div>`).join('');
    for (let row = 1; row <= 15; row++) {
      [row, row + 15, row + 30, row + 45, row + 60].forEach(number => {
        html += cell(number, drawn.has(number), number === state.currentNumber);
      });
    }
    board.innerHTML = html;
  }

  function renderBoard90() {
    const board = $('board');
    board.className = 'board b90';
    const drawn = new Set(state.drawnNumbers);
    let html = '';
    for (let col = 1; col <= 9; col++) {
      const start = (col - 1) * 10 + 1;
      const end = col === 9 ? 90 : col * 10;
      html += `<div class="header range">${start}-${end}</div>`;
    }
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
        const number = col * 10 + row + 1;
        html += cell(number, drawn.has(number), number === state.currentNumber);
      }
    }
    board.innerHTML = html;
  }

  function render() {
    renderLatest();
    renderCurrent();
    renderStatus();
    if (state.mode === 90) renderBoard90(); else renderBoard75();
  }

  context.addCustomMessageListener(NS, event => {
    const data = safeParse(event.data);
    if (!data || data.type !== 'gameState') return;
    state = { ...state, ...data };
    state.drawnNumbers = Array.isArray(data.drawnNumbers) ? data.drawnNumbers : [];
    render();
  });

  context.addEventListener(cast.framework.system.EventType.SENDER_CONNECTED, event => {
    try {
      context.sendCustomMessage(NS, event.senderId, JSON.stringify({ type: 'receiverReady' }));
    } catch (_) {
      // Następna zmiana stanu gry również zsynchronizuje ekran.
    }
  });

  const options = new cast.framework.CastReceiverOptions();
  options.disableIdleTimeout = true;
  options.statusText = 'Bingo Torlingo';
  context.start(options);

  render();
})();
