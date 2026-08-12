(function () {
  'use strict';

  var NS = 'urn:x-cast:pl.bingotorlingo.state';
  var context = cast.framework.CastReceiverContext.getInstance();

  var state = {
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

  function byId(id) {
    return document.getElementById(id);
  }

  function safeParse(data) {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        return null;
      }
    }

    if (data && typeof data === 'object') {
      return data;
    }

    return null;
  }

  function copyState(target, source) {
    var key;

    for (key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  function letterFor75(number) {
    if (number <= 15) { return 'B'; }
    if (number <= 30) { return 'I'; }
    if (number <= 45) { return 'N'; }
    if (number <= 60) { return 'G'; }
    return 'O';
  }

  function renderLatest() {
    var latest = [];
    var i;
    var html = '';

    for (i = state.drawnNumbers.length - 1; i >= 0 && latest.length < 10; i--) {
      latest.push(state.drawnNumbers[i]);
    }

    if (latest.length === 0) {
      byId('latest').innerHTML = '<span class="empty">—</span>';
      return;
    }

    for (i = 0; i < latest.length; i++) {
      html += '<div class="ball' + (i === 0 ? ' current' : '') + '">' + latest[i] + '</div>';
    }

    byId('latest').innerHTML = html;
  }

  function renderCurrent() {
    var n = state.currentNumber;
    var letter;

    byId('current').textContent =
      (n === null || typeof n === 'undefined') ? '—' : String(n);

    if (state.mode === 75 && n !== null && typeof n !== 'undefined') {
      letter = letterFor75(n);
      byId('current-label').textContent = letter + '-' + n;
      byId('current-subtitle').textContent = 'KOLUMNA ' + letter;
    } else {
      byId('current-label').textContent =
        (n === null || typeof n === 'undefined') ? '—' : String(n);
      byId('current-subtitle').textContent = 'BINGO ' + state.mode;
    }
  }

  function renderStatus() {
    var el = byId('status');
    var icon = byId('status-icon');

    byId('remaining').textContent = String(state.remainingCount);
    byId('remaining-of').textContent = 'Z ' + state.maxNumber;
    byId('tempo').textContent = state.intervalSeconds + ' sekund';

    byId('countdown').textContent =
      (state.autoDrawEnabled && !state.autoPaused && !state.gameEnded)
        ? ('Następny za ' + state.remainingSeconds + ' s')
        : '';

    el.className = 'status';
    icon.className = 'status-icon';

    if (state.gameEnded) {
      el.textContent = 'ZAKOŃCZONE';
      el.className += ' ended';
      icon.textContent = '■';
      icon.className += ' ended';
    } else if (state.autoDrawEnabled && state.autoPaused) {
      el.textContent = 'PAUZA';
      el.className += ' pause';
      icon.textContent = 'Ⅱ';
      icon.className += ' pause';
    } else if (state.autoDrawEnabled) {
      el.textContent = 'AKTYWNE';
      el.className += ' active';
      icon.textContent = '▶';
    } else {
      el.textContent = 'RĘCZNE';
      el.className += ' manual';
      icon.textContent = '▶';
    }
  }

  function isDrawn(number) {
    return state.drawnNumbers.indexOf(number) !== -1;
  }

  function cell(number, drawn, current) {
    var cls = current ? 'cell current' : (drawn ? 'cell drawn' : 'cell');
    return '<div class="' + cls + '"><span>' + number + '</span></div>';
  }

  function renderBoard75() {
    var board = byId('board');
    var html = '';
    var headers = [
      ['B', 'b'], ['I', 'i'], ['N', 'n'], ['G', 'g'], ['O', 'o']
    ];
    var i;
    var row;
    var nums;
    var j;

    board.className = 'board b75';

    for (i = 0; i < headers.length; i++) {
      html += '<div class="header ' + headers[i][1] + '">' + headers[i][0] + '</div>';
    }

    for (row = 1; row <= 15; row++) {
      nums = [row, row + 15, row + 30, row + 45, row + 60];

      for (j = 0; j < nums.length; j++) {
        html += cell(nums[j], isDrawn(nums[j]), nums[j] === state.currentNumber);
      }
    }

    board.innerHTML = html;
  }

  function renderBoard90() {
    var board = byId('board');
    var html = '';
    var col;
    var row;
    var start;
    var end;
    var number;

    board.className = 'board b90';

    for (col = 1; col <= 9; col++) {
      start = (col - 1) * 10 + 1;
      end = col === 9 ? 90 : col * 10;
      html += '<div class="header range">' + start + '-' + end + '</div>';
    }

    for (row = 0; row < 10; row++) {
      for (col = 0; col < 9; col++) {
        number = col * 10 + row + 1;
        html += cell(number, isDrawn(number), number === state.currentNumber);
      }
    }

    board.innerHTML = html;
  }

  function render() {
    renderLatest();
    renderCurrent();
    renderStatus();

    if (state.mode === 90) {
      renderBoard90();
    } else {
      renderBoard75();
    }
  }

  // ------------------------------------------------------------
  // TEST AUDIO MP3
  // Po uruchomieniu Receivera odtwarza plik audio/pl/42.mp3.
  // Ten test służy wyłącznie do sprawdzenia dźwięku na telewizorze.
  // ------------------------------------------------------------
  var testAudio = null;

  function testTelevisionAudio() {
    try {
      testAudio = new Audio();
      testAudio.preload = 'auto';
      testAudio.volume = 1.0;
      testAudio.src = 'audio/pl/42.mp3?v=1';

      testAudio.oncanplay = function () {
        console.log('AUDIO_TEST: plik 42.mp3 gotowy do odtworzenia');
      };

      testAudio.onplay = function () {
        console.log('AUDIO_TEST: rozpoczęto odtwarzanie 42.mp3');
      };

      testAudio.onended = function () {
        console.log('AUDIO_TEST: zakończono odtwarzanie 42.mp3');
      };

      testAudio.onerror = function () {
        var err = testAudio && testAudio.error ? testAudio.error.code : 'unknown';
        console.log('AUDIO_TEST: błąd odtwarzania, kod:', err);
      };

      var playPromise = testAudio.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function (error) {
          console.log('AUDIO_TEST: play() odrzucone:', error);
        });
      }
    } catch (e) {
      console.log('AUDIO_TEST: wyjątek:', e);
    }
  }

  context.addCustomMessageListener(NS, function (event) {
    var data = safeParse(event.data);

    if (!data || data.type !== 'gameState') {
      return;
    }

    copyState(state, data);
    state.drawnNumbers = Array.isArray(data.drawnNumbers) ? data.drawnNumbers : [];
    render();
  });

  context.addEventListener(
    cast.framework.system.EventType.SENDER_CONNECTED,
    function (event) {
      try {
        context.sendCustomMessage(
          NS,
          event.senderId,
          JSON.stringify({ type: 'receiverReady' })
        );
      } catch (e) {
        // Kolejna zmiana stanu gry zsynchronizuje ekran.
      }
    }
  );

  var options = new cast.framework.CastReceiverOptions();
  options.disableIdleTimeout = true;
  options.statusText = 'Bingo Torlingo';

  context.start(options);

  setTimeout(testTelevisionAudio, 3000);

  render();
}());
