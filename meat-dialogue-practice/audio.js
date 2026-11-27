const cabinAudio = (() => {
  const voice = document.querySelector('#voice');
  const announcement = document.querySelector('#announcement');
  const toggle = document.querySelector('#sound-toggle');
  const label = document.querySelector('#sound-label');
  // The GURU feedback cues use two soft, rising or falling sine notes.
  const cues = {
    correct: [[523.25, 0.15], [783.99, 0.23]],
    incorrect: [[392, 0.14], [311.13, 0.21]],
  };
  const notes = new Set();
  let muted = false;
  let playingButton;
  let voiceRequest = 0;
  let context;

  function stopSpeech() {
    voiceRequest += 1;
    voice.pause();
    if (voice.readyState) voice.currentTime = 0;
    playingButton?.removeAttribute('data-playing');
    playingButton = null;
  }

  function stop() {
    stopSpeech();
    for (const note of notes) note.stop();
    notes.clear();
    announcement.textContent = '';
  }

  function speak(button) {
    if (muted) {
      announcement.textContent = 'Sound is off. Use the Sound button to turn it on.';
      return;
    }
    stop();
    const source = (globalThis.cabinAudioSources ?? {})[button.dataset.voice];
    if (!source) {
      announcement.textContent = 'Audio is unavailable. You can read the line on screen.';
      return;
    }
    const request = voiceRequest;
    playingButton = button;
    button.dataset.playing = '';
    button.setAttribute('aria-label', 'Replay line');
    button.querySelector('.listen-label').textContent = 'Replay';
    const url = new URL(`assets/audio/${source}`, document.baseURI).href;
    if (voice.src !== url) voice.src = url;
    voice.play().catch(() => {
      if (voiceRequest !== request) return;
      stopSpeech();
      announcement.textContent = 'Audio is unavailable. You can read the line on screen.';
    });
  }

  function feedback(correct) {
    if (muted) return;
    stop();
    const Context = globalThis.AudioContext ?? globalThis.webkitAudioContext;
    if (!Context) return;
    context ??= new Context();
    if (context.state !== 'running') context.resume().catch(() => {});
    const pattern = correct ? cues.correct : cues.incorrect;
    const now = context.currentTime;
    for (const [index, [frequency, duration]] of pattern.entries()) {
      const start = now + index * 0.10;
      const note = context.createOscillator();
      const envelope = context.createGain();
      note.frequency.value = frequency;
      envelope.gain.setValueAtTime(0.0001, start);
      envelope.gain.exponentialRampToValueAtTime(0.078, start + 0.012);
      envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      note.connect(envelope).connect(context.destination);
      notes.add(note);
      note.onended = () => {
        notes.delete(note);
        note.disconnect();
        envelope.disconnect();
      };
      note.start(start);
      note.stop(start + duration + 0.01);
    }
  }

  voice.addEventListener('ended', () => { if (voice.ended) stopSpeech(); });
  toggle.addEventListener('click', () => {
    muted = !muted;
    stop();
    toggle.setAttribute('aria-pressed', !muted);
    label.textContent = muted ? 'Sound off' : 'Sound on';
  });

  return { speak, feedback, stop };
})();
