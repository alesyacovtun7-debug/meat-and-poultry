const game = document.querySelector('#game');
const gameHeader = document.querySelector('#game-header');
const play = document.querySelector('#play');
const menuCard = document.querySelector('#menu');
const scenarioButtons = document.querySelector('.scenario-buttons');
const restart = document.querySelector('#restart');
const help = document.querySelector('#help');

const roles = { crew: 'Cabin crew', passenger: 'Passenger' };
const statuses = { offered: 'Main option', ask: 'On request', sold: 'Sold out' };
const opposite = role => role === 'crew' ? 'passenger' : 'crew';
const capitalize = text => text[0].toUpperCase() + text.slice(1);
const arrow = '<span aria-hidden="true">→</span>';

function newProgress() {
  return { round: 0, step: 0, answer: null, hint: false, order: null, orders: [], history: [], roundComplete: false };
}

const progress = { standard: newProgress(), soldOut: newProgress() };
let activeScenario = 'standard';

function lineMarkup(role, line, player = false) {
  return `<div class="dialogue-line">
    <span class="avatar" data-speaker="${role}" aria-hidden="true"></span>
    <div class="line-body">
      <div><span class="line-heading">${roles[role]}${player ? ' · you' : ''}</span><p class="line-text">${line}</p></div>
      <button class="listen" type="button" aria-label="Play line" data-voice="${role}-${voiceKey(role, line)}"><span class="speaker" aria-hidden="true"></span><span class="listen-label">Play</span></button>
    </div>
  </div>`;
}

function transcriptMarkup(history) {
  if (!history.length) return '';
  const lines = history.map(({ role, line, player }) => lineMarkup(role, line, player)).join('');
  return `<details class="transcript"><summary>Earlier lines</summary><div class="transcript-lines">${lines}</div></details>`;
}

function renderHeader(round, state) {
  const accepted = Number(state.answer !== null && round.turns[state.step]?.choices[state.answer].correct === true);
  const total = round.turns.length;
  const complete = state.roundComplete ? total : state.step + accepted;
  const segments = round.turns.map((_, index) => {
    const color = index < complete ? 'is-done' : index === complete ? 'is-current' : '';
    return `<span class="segment ${color}" aria-hidden="true"></span>`;
  }).join('');
  const roleLabel = round.role === 'crew' ? 'You’re cabin crew' : 'You’re the passenger';
  gameHeader.innerHTML = `<div class="round-info"><span class="round-number">Round ${state.round + 1} of 2</span><span class="role-chip" data-role="${round.role}">${roleLabel}</span></div>
    <div class="turn-progress" role="progressbar" aria-label="Replies in this round" aria-valuenow="${complete}" aria-valuemax="${total}">${segments}</div>`;
}

function renderMenu(round, state) {
  const revealed = round.role === 'crew' || state.step > 0 || state.roundComplete;
  const rows = round.menu.map(meal => {
    const status = meal.status === 'sold' && !revealed ? '' : meal.status;
    return `<li class="menu-item">
      <div><strong class="dish-name">${meal.name}</strong><span class="dish-description">${meal.description}</span></div>
      ${status ? `<span class="dish-status" data-status="${status}">${statuses[status]}</span>` : ''}
    </li>`;
  }).join('');
  menuCard.innerHTML = `<header class="menu-heading">
      <span class="cloche-tile" aria-hidden="true"><span class="cloche"></span></span>
      <div><h2>Onboard menu</h2><p>Seat ${round.seat}</p></div>
      <a class="menu-return" href="#game">Back to dialogue</a>
    </header>
    <ul class="menu-list">${rows}</ul>
    <div class="menu-brief"><h3>Your task</h3><p>${round.brief}</p></div>`;
}

function renderTurn(round, state) {
  const turn = round.turns[state.step];
  const choices = turn.choices.map((choice, index) => `<button type="button" class="choice" data-answer="${index}" aria-pressed="false">
      <span class="choice-key" aria-hidden="true">${'ABC'[index]}</span>
      <span>${choice.line}</span>
      <span class="choice-mark" aria-hidden="true"></span>
    </button>`).join('');
  const nextLabel = state.step === round.turns.length - 1 ? 'Finish round' : 'Next';
  play.innerHTML = `<div class="play-content">
    ${lineMarkup(opposite(round.role), turn.line)}
    <h2 class="task" id="turn-task" tabindex="-1">${turn.task}</h2>
    <div class="choices" role="group" aria-labelledby="turn-task">${choices}</div>
    <p class="feedback" id="feedback" role="status" hidden></p>
    <div class="hint-box" id="hint-box" ${state.hint ? '' : 'hidden'}><p>${turn.hint}</p>${turn.tip}</div>
    <div class="actions">
      <div class="aux-actions"><button class="hint-button" type="button" data-action="hint" aria-controls="hint-box" aria-expanded="${state.hint}"><span class="hint-symbol" aria-hidden="true">✧</span>Hint</button><a class="menu-jump" href="#menu">Menu</a></div>
      <button class="primary" type="button" data-action="advance" disabled>${nextLabel} ${arrow}</button>
    </div>
    ${transcriptMarkup(state.history)}
  </div>`;
  updateAnswer(round, state);
}

function updateAnswer(round, state) {
  if (state.answer === null) return;
  const answer = round.turns[state.step].choices[state.answer];
  for (const button of play.querySelectorAll('[data-answer]')) {
    const chosen = Number(button.dataset.answer) === state.answer;
    button.setAttribute('aria-pressed', chosen);
    button.disabled = answer.correct === true && !chosen;
    button.classList.toggle('is-right', chosen && answer.correct === true);
    button.classList.toggle('is-wrong', chosen && !answer.correct);
    button.querySelector('.choice-mark').textContent = chosen ? (answer.correct ? '✓' : '×') : '';
  }
  const feedback = play.querySelector('#feedback');
  feedback.classList.toggle('is-wrong', !answer.correct);
  feedback.hidden = false;
  feedback.textContent = answer.feedback || 'That reply fits.';
  play.querySelector('[data-action="advance"]').disabled = !answer.correct;
}

function renderResult(scenario, round, state) {
  const finished = state.round === scenario.rounds.length - 1;
  const orders = state.orders.map(({ seat, name }) => `<li><span class="order-seat">${seat}</span><strong>${capitalize(name)}</strong></li>`).join('');
  const heading = finished ? 'Two orders taken' : 'Order confirmed';
  const total = scenario.rounds.reduce((count, item) => count + item.turns.length, 0);
  const message = finished ? `You completed all ${total} replies.` : 'In the next round, you’ll play the passenger.';
  play.innerHTML = `<div class="result">
    <h2 id="turn-task" tabindex="-1">${heading}</h2>
    <p>${message}</p>
    ${lineMarkup(opposite(round.role), round.closing(state.order))}
    <ul class="order-list" aria-label="Confirmed orders">${orders}</ul>
    <button class="primary" type="button" data-action="${finished ? 'restart' : 'switch-role'}">${finished ? 'Play again' : 'Switch roles'} ${finished ? '<span aria-hidden="true">↻</span>' : arrow}</button>
    ${transcriptMarkup(state.history)}
  </div>`;
}

function render() {
  const scenario = cabinScenarios[activeScenario];
  const state = progress[activeScenario];
  const round = scenario.rounds[state.round];
  for (const button of scenarioButtons.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', button.dataset.scenario === activeScenario);
  }
  restart.hidden = state.step === 0 && state.round === 0 && state.answer === null;
  renderHeader(round, state);
  renderMenu(round, state);
  if (state.roundComplete) renderResult(scenario, round, state);
  else renderTurn(round, state);
}

function moveFocus() {
  const task = play.querySelector('#turn-task');
  const top = game.getBoundingClientRect().top;
  if (top < 0 || task.getBoundingClientRect().bottom > window.innerHeight - 16) game.scrollIntoView({ block: 'start' });
  task.focus({ preventScroll: true });
}

function resetScenario() {
  cabinAudio.stop();
  progress[activeScenario] = newProgress();
  render();
  moveFocus();
}

scenarioButtons.addEventListener('click', event => {
  const button = event.target.closest('[data-scenario]');
  if (!button || button.dataset.scenario === activeScenario) return;
  cabinAudio.stop();
  activeScenario = button.dataset.scenario;
  render();
});

play.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  const state = progress[activeScenario];
  const round = cabinScenarios[activeScenario].rounds[state.round];
  const turn = round.turns[state.step];

  if (button.dataset.voice) {
    cabinAudio.speak(button);
    return;
  }
  if (button.dataset.answer !== undefined) {
    if (turn.choices[state.answer]?.correct) return;
    state.answer = Number(button.dataset.answer);
    cabinAudio.feedback(turn.choices[state.answer].correct === true);
    updateAnswer(round, state);
    renderHeader(round, state);
    restart.hidden = false;
    return;
  }
  if (button.dataset.action === 'hint') {
    state.hint = !state.hint;
    play.querySelector('#hint-box').hidden = !state.hint;
    button.setAttribute('aria-expanded', state.hint);
    return;
  }
  if (button.dataset.action === 'restart') {
    resetScenario();
    return;
  }
  if (button.dataset.action === 'advance') {
    const choice = turn.choices[state.answer];
    if (!choice?.correct) return;
    state.history.push({ role: opposite(round.role), line: turn.line }, { role: round.role, line: choice.line, player: true });
    state.answer = null;
    state.hint = false;
    if (state.step === round.turns.length - 1) {
      state.roundComplete = true;
      state.order = choice.dish;
      const meal = round.menu.find(item => item.dish === choice.dish);
      state.orders.push({ seat: round.seat, name: meal.name });
    } else {
      state.step += 1;
    }
  }
  if (button.dataset.action === 'switch-role') {
    state.history.push({ role: opposite(round.role), line: round.closing(state.order) });
    state.round += 1;
    state.step = 0;
    state.order = null;
    state.roundComplete = false;
  }
  cabinAudio.stop();
  render();
  moveFocus();
});

restart.addEventListener('click', resetScenario);
document.querySelector('#open-help').addEventListener('click', () => help.showModal());
document.querySelector('#close-help').addEventListener('click', () => help.close());
document.querySelector('#dismiss-help').addEventListener('click', () => {
  help.close();
  moveFocus();
});
render();
