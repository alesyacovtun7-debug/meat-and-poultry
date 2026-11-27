'use strict';

// Prices, totals and budgets are always integer pence.
const DEPARTMENTS = [
  { id: 'fresh', title: 'Fresh Poultry' },
  { id: 'cuts', title: 'Chicken Cuts' },
  { id: 'prepared', title: 'Ready-to-Cook & Prepared Food' },
];
const PRODUCTS = [
  { id: 'sausage', name: 'Sausage', item: 'sausages', price: 350, pack: '400 g pack', dept: 'prepared' },
  { id: 'mince', name: 'Mince', price: 450, pack: '500 g pack', dept: 'prepared' },
  { id: 'roast-breast', name: 'Roast chicken breast', price: 590, pack: '300 g pack', dept: 'prepared' },
  { id: 'meatballs', name: 'Meatballs', price: 420, pack: '400 g pack', dept: 'prepared' },
  { id: 'lasagna', name: 'Lasagna', price: 550, pack: '450 g pack', dept: 'prepared', countable: 'lasagnas' },
  { id: 'schnitzel', name: 'Schnitzel', price: 480, pack: '350 g pack', dept: 'prepared' },
  { id: 'barbecue', name: 'Barbecue', item: 'barbecue meat', price: 650, pack: '400 g pack', dept: 'prepared' },
  { id: 'drumsticks', name: 'Drumsticks', price: 320, pack: '500 g pack', dept: 'cuts' },
  { id: 'breast-fillet', name: 'Breast fillet', price: 520, pack: '500 g pack', dept: 'cuts' },
  { id: 'thighs', name: 'Thighs', price: 380, pack: '500 g pack', dept: 'cuts' },
  { id: 'wings', name: 'Wings', price: 290, pack: '500 g pack', dept: 'cuts' },
  { id: 'legs', name: 'Legs', price: 420, pack: '600 g pack', dept: 'cuts' },
  { id: 'chicken', name: 'Chicken', price: 750, pack: 'Whole chicken', dept: 'fresh', countable: 'chickens' },
  { id: 'goose', name: 'Goose', price: 1990, pack: 'Whole goose', dept: 'fresh', countable: 'geese' },
  { id: 'duck', name: 'Duck', price: 1250, pack: 'Whole duck', dept: 'fresh', countable: 'ducks' },
  { id: 'turkey', name: 'Turkey', price: 1490, pack: 'Whole turkey', dept: 'fresh', countable: 'turkeys' },
];
const PRODUCT_BY_ID = Object.fromEntries(PRODUCTS.map(product => [product.id, product]));
const CUT_CLUES = [
  { id: 'drumsticks', text: 'Find the lower part of a chicken leg.' },
  { id: 'thighs', text: 'Find the upper part of a chicken leg.' },
  { id: 'breast-fillet', text: 'Find some boneless breast meat.' },
  { id: 'legs', text: 'Find a whole chicken leg.' },
];
const SCENARIOS = [
  {
    title: 'A BBQ Party', budget: 3000, items: { sausage: 2, wings: 2, drumsticks: 1, barbecue: 1 },
    message: "Hey! We're having a BBQ tonight. There will be six of us. Could you get two packs of sausages, two packs of chicken wings, a pack of drumsticks and some barbecue meat? Don't forget we only have £30. Thanks!",
    note: '“Some barbecue meat” means one pack in this message.',
  },
  {
    title: 'A Family Dinner', budget: 2500, items: { chicken: 1, thighs: 2, schnitzel: 1 },
    message: "Hi! We're all coming for dinner. Please get one whole chicken, two packs of chicken thighs and one pack of schnitzel. You have £25. See you later!",
  },
  {
    title: 'Sunday Lunch', budget: 3400, items: { goose: 1, mince: 1, legs: 1 },
    message: "We're making Sunday lunch at home. Could you buy one whole goose, one pack of mince and one pack of chicken legs? The budget is £34. Thank you!",
  },
  {
    title: 'A Birthday Party', budget: 3600, items: { turkey: 1, meatballs: 2, lasagna: 2 },
    message: "It's Sam's birthday this weekend. Please pick up one whole turkey, two packs of meatballs and two lasagnas. We've got £36 for the food. Thanks!",
  },
  {
    title: 'A Romantic Dinner', budget: 2400, items: { duck: 1, 'roast-breast': 1, 'breast-fillet': 1 },
    message: "Hi love! Can you get one whole duck, one pack of roast chicken breast and one pack of breast fillet? Let's spend no more than £24. See you tonight!",
  },
];
const LEVELS = [
  {
    id: 1, title: 'Your First Shopping Trip', description: 'Learn the names and shop from a short list.',
    image: 'sausage', dept: 'prepared', items: { sausage: 1, mince: 1, meatballs: 1, lasagna: 1 },
  },
  {
    id: 2, title: "At the Butcher's", description: 'Recognise chicken cuts by sight and description.',
    image: 'drumsticks', dept: 'cuts', hide: 'all', productHints: true, clues: CUT_CLUES,
    items: { drumsticks: 2, 'breast-fillet': 1, thighs: 1, wings: 2, legs: 1 },
  },
  {
    id: 3, title: 'Shopping on a Budget', description: 'Buy the right quantities with £25 to spend.',
    image: 'schnitzel', dept: 'prepared', budget: 2500,
    items: { sausage: 2, mince: 1, meatballs: 1, wings: 1, schnitzel: 1 },
  },
  {
    id: 4, title: 'Hosting a BBQ Party', description: 'Turn a message from a friend into a shopping list.',
    image: 'barbecue', dept: 'prepared', scenario: true,
  },
  {
    id: 5, title: 'Shopping Like a Local', description: 'Remember the list and find a substitute.',
    image: 'duck', dept: 'cuts', timer: true, budget: 3000,
    hide: ['wings', 'drumsticks', 'breast-fillet', 'duck', 'thighs', 'legs'],
    descriptions: { 'breast-fillet': 'Find some boneless chicken breast meat.', mince: 'Find finely ground meat.', duck: 'Find a whole bird from the water that says “quack”.' },
    items: { wings: 2, 'breast-fillet': 1, mince: 1, duck: 1 },
    replacement: { soldOut: 'wings', alternative: 'drumsticks',
      text: "You need to buy chicken wings, but they're sold out. Your friend said chicken drumsticks would also be fine." },
  },
];
const QUESTIONS = [
  'What did you buy?', 'How much did you spend?', 'What was the most expensive product?',
  'What was the cheapest product?', 'How much money have you got left?', 'What are you going to cook?',
  'What do you usually buy at the supermarket?', 'Would you buy a duck or a chicken? Why?',
];
const PHRASES = [
  "I'd like some mince, please.", 'Can I have two packs of chicken wings?', 'How much is it?',
  'How much are the chicken thighs?', 'Have you got any drumsticks?', 'Do you have anything cheaper?',
  "That's everything, thank you.", "I'll pay by card.", 'Can I have the receipt, please?',
];
const STORAGE_KEY = 'guru-supermarket.v1';
const MAX_QUANTITY = 20;
const money = pence => (pence < 0 ? '−' : '') + '£' + (Math.abs(pence) / 100).toFixed(2);
const productName = id => PRODUCT_BY_ID[id].item || PRODUCT_BY_ID[id].name.toLowerCase();
const countWord = count => ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'][count] ?? String(count);

function purchaseLine(id, quantity, useWords = false) {
  const product = PRODUCT_BY_ID[id];
  const count = useWords ? countWord(quantity) : quantity;
  if (product.countable) return count + ' ' + (quantity === 1 ? productName(id) : product.countable);
  return count + (quantity === 1 ? ' pack of ' : ' packs of ') + productName(id);
}

function basketTotal(basket) {
  return Object.entries(basket).reduce((total, [id, count]) => total + PRODUCT_BY_ID[id].price * count, 0);
}

function effectiveItems(task) {
  if (!task.replacement) return task.items;
  const { soldOut, alternative } = task.replacement;
  const items = { ...task.items };
  items[alternative] = (items[alternative] || 0) + items[soldOut];
  delete items[soldOut];
  return items;
}

function validateBasket(task, basket) {
  const expected = effectiveItems(task);
  const missing = Object.keys(expected).filter(id => (basket[id] || 0) < expected[id]);
  const wrong = Object.keys(basket).filter(id => !expected[id]);
  const excess = Object.keys(expected).filter(id => (basket[id] || 0) > expected[id]);
  const total = basketTotal(basket);
  const over = task.budget != null && total > task.budget;
  const categories = [];
  if (missing.length) categories.push('You forgot something.');
  if (excess.length) categories.push("You've bought too many items.");
  if (wrong.length) categories.push("You've bought the wrong product.");
  if (over) categories.push("You're over budget.");
  const details = [];
  if (missing.includes('drumsticks') && basket.thighs > (expected.thighs || 0)) {
    details.push('You bought thighs instead of drumsticks.');
  }
  for (const id of missing) {
    details.push(basket[id]
      ? 'You need ' + purchaseLine(id, expected[id], true) + ', not ' + countWord(basket[id]) + '.'
      : 'You forgot to buy ' + productName(id) + '. You need ' + purchaseLine(id, expected[id], true) + '.');
  }
  for (const id of excess) details.push('You only need ' + purchaseLine(id, expected[id], true) + '.');
  for (const id of wrong) details.push('Remove ' + productName(id) + ' from your basket.');
  if (over) details.push('Remove something from your basket. You are ' + money(total - task.budget) + ' over budget.');
  const expectedCount = Object.values(expected).reduce((sum, count) => sum + count, 0);
  const boughtCount = Object.values(basket).reduce((sum, count) => sum + count, 0);
  const matched = Object.keys(expected).reduce((sum, id) => sum + Math.min(expected[id], basket[id] || 0), 0);
  return { ok: categories.length === 0, over, categories, details, total, accuracy: matched / (expectedCount + boughtCount - matched) };
}

function challenge(level, visit = 0, scenarioIndex = 0) {
  const config = LEVELS[level - 1];
  if (level === 4) {
    return { ...config, ...SCENARIOS[scenarioIndex], title: config.title, scenarioIndex };
  }
  if (level !== 3 || !visit) return { ...config };
  // Every replay changes the mix. Only accept candidates that fit the budget.
  const pools = [
    ['sausage', 'meatballs', 'barbecue', 'wings', 'thighs'],
    ['mince', 'lasagna', 'drumsticks', 'wings', 'schnitzel'],
    ['roast-breast', 'drumsticks', 'thighs', 'wings', 'sausage'],
    ['meatballs', 'breast-fillet', 'legs', 'wings', 'mince'],
    ['chicken', 'schnitzel', 'sausage', 'wings', 'thighs'],
  ];
  const pool = pools[(visit - 1) % pools.length];
  const start = Math.floor((visit - 1) / pools.length) % pool.length;
  for (let offset = 0; offset < pool.length; offset++) {
    const doubled = (start + offset) % pool.length;
    const items = Object.fromEntries(pool.map((id, index) => [id, index === doubled ? 2 : 1]));
    if (basketTotal(items) <= config.budget) return { ...config, items };
  }
  return { ...config };
}

function parseBudget(value) {
  const clean = value.trim();
  if (!clean) return null;
  if (!/^\d{1,5}(?:\.\d{0,2})?$/.test(clean)) return undefined;
  const [pounds, pence = ''] = clean.split('.');
  return Number(pounds) * 100 + Number(pence.padEnd(2, '0'));
}

function freshProgress() {
  return { completed: [], mastered: [], attempts: 0, accuracySum: 0, budgetAttempts: 0, budgetSuccess: 0, hints: 0, visits: {}, sound: true };
}

function loadProgress() {
  const empty = freshProgress();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !Array.isArray(saved.completed) || !Array.isArray(saved.mastered)) return empty;
    return { ...empty, ...saved };
  } catch {
    return empty;
  }
}


if (typeof document !== 'undefined') initialise();

function initialise() {
  const main = document.querySelector('#main');
  const dialog = document.querySelector('#dialog');
  const announcement = document.querySelector('#announcement');
  let progress = loadProgress();
  let trip = null;
  let screen = 'home';
  let timerId;
  let hintId;
  let dialogOpener;
  let announcementId;
  let dismissAnnouncementId;
  const audio = new Map();
  function h(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[character]);
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { /* Play continues if storage is blocked. */ }
  }

  function announce(text, visible = false) {
    clearTimeout(announcementId);
    clearTimeout(dismissAnnouncementId);
    announcement.className = 'sr-only';
    announcement.textContent = '';
    announcementId = setTimeout(() => {
      announcement.textContent = text;
      if (visible) {
        announcement.className = 'announcement-toast';
        dismissAnnouncementId = setTimeout(() => { announcement.className = 'sr-only'; }, 3600);
      }
    }, 40);
  }

  function playSound(name) {
    if (!progress.sound) return;
    if (!audio.has(name)) {
      const sound = new Audio('assets/sounds/' + name + '.wav');
      sound.volume = 0.45;
      audio.set(name, sound);
    }
    const sound = audio.get(name);
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

  function say(text) {
    const synth = window.speechSynthesis;
    if (!progress.sound || !synth || !window.SpeechSynthesisUtterance) {
      announce(progress.sound ? 'Pronunciation audio is unavailable on this device.' : 'Turn sound on to listen.', true);
      return;
    }
    synth.cancel();
    const voice = synth.getVoices().find(option => option.lang.replace('_', '-').toLowerCase() === 'en-gb');
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) utterance.voice = voice;
    utterance.lang = 'en-GB';
    utterance.rate = 0.88;
    utterance.onerror = event => {
      if (!['canceled', 'interrupted'].includes(event.error)) announce('Pronunciation audio is unavailable on this device.', true);
    };
    synth.speak(utterance);
  }

  function updateSound() {
    const button = document.querySelector('.sound-toggle');
    button.setAttribute('aria-pressed', String(progress.sound));
    button.querySelector('span').textContent = progress.sound ? 'Sound On' : 'Sound Off';
    button.classList.toggle('muted', !progress.sound);
  }

  function listen(text, label) {
    return '<button class="listen" type="button" data-action="speak" data-say="' + h(text)
      + '" aria-label="' + h('Listen: ' + (label || text)) + '"><i class="sound-icon" aria-hidden="true"></i><span>Listen</span></button>';
  }

  function photo(id, className = '', eager = false) {
    return '<img class="' + className + '" alt="" src="assets/products/' + id + '.webp" decoding="async"'
      + (eager ? '' : ' loading="lazy"') + '>';
  }

  function navigation(next, markup, focus = true) {
    window.speechSynthesis?.cancel();
    clearInterval(timerId);
    clearTimeout(hintId);
    screen = next;
    main.className = 'screen screen-' + next;
    main.innerHTML = markup;
    window.scrollTo(0, 0);
    if (focus) (main.querySelector('h1') || main).focus({ preventScroll: true });
  }

  function modal(title, body, actions) {
    dialogOpener = document.activeElement;
    dialog.innerHTML = '<h2 id="dialog-title">' + h(title) + '</h2><p>' + h(body) + '</p><div class="button-row">' + actions + '</div>';
    dialog.showModal();
  }

  function percent(sum, count) {
    return count ? Math.round(sum / count * 100) + '%' : '—';
  }

  function stats() {
    return [
      ['Levels completed', progress.completed.length + ' / 5'],
      ['Products mastered', progress.mastered.length + ' / ' + PRODUCTS.length],
      ['Shopping accuracy', percent(progress.accuracySum, progress.attempts)],
      ['Budget accuracy', percent(progress.budgetSuccess, progress.budgetAttempts)],
      ['Hints used', progress.hints],
    ];
  }

  function unlocked(level) {
    return level === 1 || progress.completed.includes(level - 1);
  }

  function nextCampaignLevel() {
    return LEVELS.find(level => !progress.completed.includes(level.id) && unlocked(level.id))?.id;
  }

  function renderHome(focus = true) {
    const next = nextCampaignLevel();
    const startAction = next ? 'start' : 'final';
    const buttonText = !next ? 'View Shopper Card' : progress.completed.length ? 'Continue Shopping' : 'Start Shopping';
    const levelCards = LEVELS.map(level => {
      const done = progress.completed.includes(level.id);
      const open = unlocked(level.id);
      const status = done ? 'Completed' : open ? 'Ready to play' : 'Locked';
      return '<li><button type="button" class="level-card ' + (open ? '' : 'locked') + '" ' + (open ? '' : 'disabled')
        + ' data-action="start" data-level="' + level.id + '"><span class="level-photo">'
        + photo(level.image) + '<span class="level-number">Level 0' + level.id + '</span></span>'
        + '<span class="level-copy"><strong>' + h(level.title) + '</strong><span>' + h(level.description) + '</span>'
        + '<span class="level-state ' + (open ? 'level-state-open' : '') + '">' + (done ? '✓ ' : '') + status
        + (open ? '<span aria-hidden="true"> ↗</span>' : '') + '</span></span></button></li>';
    }).join('');
    navigation('home',
      '<section class="hero" aria-labelledby="hero-title"><div class="hero-content">'
      + '<p class="hero-kicker"><span></span> GURU Supermarket</p>'
      + '<h1 id="hero-title" tabindex="-1">Meat and<br>Poultry</h1>'
      + '<p class="hero-tagline">Shop smart. Speak English.</p>'
      + '<p class="hero-description">Five shopping trips to practise everyday English in a British supermarket.</p>'
      + '<button type="button" class="button button-lime hero-button" data-action="' + startAction + '" data-level="' + (next || '') + '">'
      + buttonText + ' <span aria-hidden="true">↗</span></button></div>'
      + '<div class="hero-caption">A1–A2 <span></span> Food shopping</div></section>'
      + '<section class="levels-section" id="levels" aria-labelledby="levels-title">'
      + '<div class="section-heading"><div><h2 id="levels-title" tabindex="-1">Choose a level</h2>'
      + '<p>Complete each trip to unlock the next.</p></div><div class="progress-compact"><b>'
      + progress.completed.length + ' of 5 levels completed</b><progress max="5" value="' + progress.completed.length + '" aria-label="Levels completed"></progress></div></div>'
      + '<ol class="level-grid">' + levelCards + '</ol></section>'
      + '<section class="stats-section" aria-labelledby="stats-title"><h2 id="stats-title">Your Progress</h2><dl class="stats-grid">'
      + stats().map(([label, value]) => '<div><dt>' + label + '</dt><dd>' + value + '</dd></div>').join('')
      + '</dl></section>', focus);
  }

  function startTrip(level, teacherOptions, scenarioIndex = 0) {
    if (!teacherOptions && !unlocked(level)) return;
    const visit = progress.visits[level] || 0;
    const standard = challenge(level, teacherOptions ? 0 : visit, scenarioIndex);
    const task = teacherOptions ? { ...standard, ...teacherOptions } : standard;
    if (!teacherOptions) {
      progress.visits[level] = visit + 1;
      save();
    }
    trip = {
      task, teacherOptions, basket: {}, dept: task.dept, note: '', hints: task.hints !== false,
      deadline: task.timer ? Date.now() + 20000 : null, revealedUntil: 0,
      hintProduct: null, hintUntil: 0, clueIndex: -1, clueSolved: false, clueFeedback: '', paid: false,
    };
    renderShop();
  }

  function hiddenName(id) {
    const hide = trip.task.hide;
    return hide === 'all' || (Array.isArray(hide) && hide.includes(id));
  }

  function displayName(id) {
    return hiddenName(id) ? 'Product ' + (PRODUCTS.findIndex(product => product.id === id) + 1) : PRODUCT_BY_ID[id].name;
  }

  function levelHeading(step) {
    const task = trip.task;
    return '<div class="trip-heading"><div><p class="eyebrow"><button class="text-button" type="button" data-action="levels">All levels</button>'
      + ' <span aria-hidden="true">/</span> ' + (trip.teacherOptions ? 'Teacher Mode · ' : '') + (task.custom ? 'Custom assignment' : 'Level 0' + task.id)
      + '</p><h1 tabindex="-1">' + h(step === 'shop' ? task.title : step === 'checkout' ? 'Checkout' : 'Your Receipt') + '</h1></div>'
      + '<ol class="trip-steps" aria-label="Shopping steps">'
      + [['shop', 'Shop'], ['checkout', 'Checkout'], ['receipt', 'Receipt']].map(([key, label], index) =>
        '<li' + (key === step ? ' aria-current="step"' : '') + '><span>' + (index + 1) + '</span> ' + label + '</li>').join('')
      + '</ol></div>';
  }

  function renderShop() {
    navigation('shop', levelHeading('shop')
      + '<div class="shop-grid"><aside class="task-panel" aria-label="Shopping task"><div id="task-content"></div></aside>'
      + '<section class="shelf-panel" aria-labelledby="shelf-title"><div class="shelf-heading"><div><h2 id="shelf-title" tabindex="-1">Supermarket</h2>'
      + '<p>Choose a department and add products to your basket.</p></div></div><div id="departments"></div><div id="shelf"></div></section>'
      + '<aside class="basket-panel" id="basket-panel" aria-labelledby="basket-title"><h2 id="basket-title" tabindex="-1"><i class="basket-icon" aria-hidden="true"></i>Your Basket</h2>'
      + '<div id="basket"></div></aside></div><div class="mobile-basket" id="mobile-basket"></div>');
    paintTask();
    paintShelf();
    paintBasket();
    if (trip.deadline) timerId = setInterval(updateClock, 200);
  }

  function listVisible() {
    return !trip.deadline || Date.now() < Math.max(trip.deadline, trip.revealedUntil);
  }

  function taskList() {
    const task = trip.task;
    if (!listVisible()) return '<p class="memory-hidden">Your list is hidden. Shop from memory.</p>'
      + (trip.hints ? '<button class="button button-outline full" type="button" data-action="list-hint">Need a Hint?</button>' : '');
    const allowChecks = task.id <= 3 || task.custom;
    const found = Object.entries(task.items).filter(([id, count]) => trip.basket[id] === count).length;
    return (trip.deadline ? '<p class="memory-tip">Remember the items, quantities and substitution.</p>' : '')
      + '<ul class="shopping-lines">' + Object.entries(task.items).map(([id, count]) => {
        const checked = allowChecks && trip.basket[id] === count;
        const line = task.descriptions?.[id];
        const unit = PRODUCT_BY_ID[id].dept === 'fresh' ? 'whole bird' : 'pack';
        return '<li class="' + (checked ? 'checked' : '') + '"><span class="' + (allowChecks ? 'check-box' : 'list-bullet') + '" aria-hidden="true">' + (checked ? '✓' : '') + '</span>'
          + '<span>' + (checked ? '<span class="sr-only">Found: </span>' : '')
          + (line ? '<span class="quantity-line">' + count + ' ' + unit + (count === 1 ? '' : 's') + '</span>' + h(line) : h(purchaseLine(id, count)))
          + '</span></li>';
      }).join('') + '</ul>'
      + (allowChecks ? '<p class="found">' + found + ' of ' + Object.keys(task.items).length + ' products found</p>' : '')
      + (task.replacement ? '<p class="substitution">' + h(task.replacement.text) + '</p>' : '');
  }

  function paintTask() {
    const task = trip.task;
    const panel = document.querySelector('#task-content');
    if (task.scenario) {
      panel.innerHTML = '<div class="task-header"><h2>Message from a Friend</h2>'
        + (trip.deadline ? '<span class="timer" id="timer"></span>' : '') + '</div>'
        + (trip.teacherOptions ? '<p class="scenario-label">' + h(SCENARIOS[task.scenarioIndex].title) + '</p>'
          : '<label class="scenario-label">Scenario<select id="scenario" aria-label="Scenario">' + SCENARIOS.map((option, index) =>
          '<option value="' + index + '"' + (index === task.scenarioIndex ? ' selected' : '') + '>' + h(option.title) + '</option>').join('')
        + '</select></label>') + '<div id="list-content">' + phoneContent() + '</div>'
        + '<label class="notepad">My Shopping List<textarea id="notebook" rows="5" placeholder="Write your list in English…"></textarea></label>';
      panel.querySelector('#notebook').value = trip.note;
      if (trip.deadline) updateClock();
      return;
    }
    panel.innerHTML = '<div class="clipboard"><div class="clip" aria-hidden="true"></div><div class="task-header"><h2>Shopping List</h2>'
      + (trip.deadline ? '<span class="timer" id="timer"></span>' : '') + '</div>'
      + (task.budget != null ? '<div class="budget-label">Available Budget <strong>' + money(task.budget) + '</strong></div>' : '')
      + '<div id="list-content">' + taskList() + '</div></div>'
      + (task.clues ? '<section class="clue-panel" id="clue-panel"></section>' : '');
    if (task.clues) paintClue();
    if (trip.deadline) updateClock();
  }

  function phoneContent() {
    const task = trip.task;
    if (!listVisible()) return '<p class="memory-hidden">Your message is hidden. Shop from memory or use your notes.</p>'
      + (trip.hints ? '<button class="button button-outline full" type="button" data-action="list-hint">Need a Hint?</button>' : '');
    return '<div class="phone"><span class="phone-camera"></span><div class="phone-head">Messages <span>Friend</span></div>'
      + '<p class="message">' + h(task.message) + '</p>' + listen(task.message, 'message from a friend') + '</div>'
      + (task.note ? '<p class="scenario-note">' + h(task.note) + '</p>' : '');
  }

  function updateClock() {
    const clock = document.querySelector('#timer');
    if (!clock) return;
    const seconds = Math.max(0, Math.ceil((Math.max(trip.deadline, trip.revealedUntil) - Date.now()) / 1000));
    clock.textContent = seconds ? '0:' + String(seconds).padStart(2, '0') : '0:00';
    clock.setAttribute('aria-label', seconds + ' seconds left to read the list');
    const showing = document.querySelector('.memory-hidden') === null;
    if (listVisible() !== showing) {
      document.querySelector('#list-content').innerHTML = trip.task.scenario ? phoneContent() : taskList();
      announce(seconds ? 'Shopping list reopened.' : 'The shopping list is now hidden.');
    }
  }

  function paintClue() {
    const clues = trip.task.clues;
    const clue = clues[trip.clueIndex];
    const body = clue
      ? '<p><span class="clue-position">' + (trip.clueIndex + 1) + ' / ' + clues.length + '</span> ' + h(clue.text) + '</p>'
      : '<p>Read a clue and choose a product.</p>';
    document.querySelector('#clue-panel').innerHTML = '<h3>Find by Description</h3>' + body
      + (trip.clueFeedback ? '<p class="clue-feedback" role="status">' + h(trip.clueFeedback) + '</p>' : '')
      + (trip.clueIndex < 0 || trip.clueSolved
        ? '<button type="button" class="button button-outline full" data-action="clue-next">'
          + (trip.clueIndex < 0 ? 'Try a Description' : trip.clueIndex >= clues.length - 1 ? 'Try the Clues Again' : 'Next Description') + '</button>'
        : '<p class="muted-text">Use “Choose Product” on the shelf.</p>');
  }

  function paintShelf() {
    const tabs = document.querySelector('#departments');
    const shelf = document.querySelector('#shelf');
    const dept = DEPARTMENTS.find(department => department.id === trip.dept);
    tabs.innerHTML = '<div class="departments" role="group" aria-label="Departments">'
      + DEPARTMENTS.map(department => '<button type="button" data-action="department" data-id="' + department.id
        + '" aria-pressed="' + (department.id === trip.dept) + '">' + h(department.title) + '</button>').join('') + '</div>';
    shelf.innerHTML = '<div class="case-top"><span class="case-light" aria-hidden="true"></span><h3>' + h(dept.title) + '</h3><span>'
      + PRODUCTS.filter(product => product.dept === dept.id).length + ' products</span></div><div class="product-grid">'
      + PRODUCTS.filter(product => product.dept === dept.id).map(product => {
        const { id, name, pack, price } = product;
        const hide = hiddenName(id);
        const soldOut = trip.task.replacement?.soldOut === id;
        const label = displayName(id);
        const hints = hide && trip.hints && trip.task.productHints;
        const clueActive = trip.clueIndex >= 0 && !trip.clueSolved && dept.id === 'cuts';
        const shelfPack = hide && product.dept === 'fresh' ? '1 whole bird' : pack;
        return '<article class="product-card' + (soldOut ? ' sold-out' : '') + '" data-product="' + id + '"><div class="product-photo">'
          + photo(id, '', true) + (soldOut ? '<span class="sold-label">Sold Out</span>' : '') + '</div>'
          + '<div class="product-info"><div class="product-meta"><span>' + h(shelfPack) + '</span><strong>' + money(price) + '</strong></div>'
          + '<h4 class="' + (hide ? 'sr-only' : '') + '">' + h(label) + '</h4>'
          + '<div class="product-extras">' + (!hide ? listen(name) : hints
            ? '<button class="listen" type="button" data-action="product-hint" data-id="' + id + '" aria-label="Need a Hint? ' + h(label)
              + '"><span aria-hidden="true">?</span> Hint</button>' : '') + '</div>'
          + '<div class="hint-popover" id="hint-' + id + '" hidden></div>'
          + '<button class="button add-button" type="button" data-action="add" data-id="' + id + '" aria-label="Add to Basket: '
          + h(label) + '"' + (soldOut ? ' disabled' : '') + '><span aria-hidden="true">+</span> Add to Basket</button>'
          + (clueActive ? '<button class="button button-outline choose-product full" type="button" data-action="clue-answer" data-id="' + id
            + '" aria-label="Choose Product: ' + h(label) + '">Choose Product</button>' : '') + '</div></article>';
      }).join('') + '</div>';
    if (trip.hintProduct && trip.hintUntil > Date.now()) paintProductHint(trip.hintProduct);
  }

  function paintProductHint(id) {
    const box = document.getElementById('hint-' + id);
    if (!box) return;
    const name = PRODUCT_BY_ID[id].name;
    box.hidden = false;
    box.innerHTML = '<b>' + h(name) + '</b>' + listen(name);
  }

  function paintBasket() {
    const rows = Object.entries(trip.basket);
    const count = rows.reduce((sum, [, quantity]) => sum + quantity, 0);
    const total = basketTotal(trip.basket);
    const budget = trip.task.budget;
    const remaining = budget == null ? null : budget - total;
    const over = remaining != null && remaining < 0;
    const basket = document.querySelector('#basket');
    basket.innerHTML = '<p class="basket-count">' + count + (count === 1 ? ' item' : ' items') + '</p>'
      + (!count ? '<div class="basket-empty"><i class="basket-icon" aria-hidden="true"></i><p>Your basket is empty.</p><small>Add a product from the shelf.</small></div>'
        : '<ul class="basket-rows">' + rows.map(([id, quantity]) => {
          const product = PRODUCT_BY_ID[id];
          const label = displayName(id);
          return '<li><div class="basket-item">' + photo(id, 'basket-image', true) + '<div><strong>' + h(label)
            + '</strong><span>' + money(product.price * quantity) + '</span></div></div>'
            + '<div class="basket-controls"><div class="quantity"><button type="button" data-action="minus" data-id="' + id
            + '" aria-label="Decrease quantity: ' + h(label) + '">−</button><span aria-label="Quantity">' + quantity + '</span>'
            + '<button type="button" data-action="plus" data-id="' + id + '" aria-label="Increase quantity: ' + h(label) + '">+</button></div>'
            + '<button type="button" class="text-button remove-button" data-action="remove" data-id="' + id + '" aria-label="Remove: ' + h(label) + '">Remove</button></div></li>';
        }).join('') + '</ul>')
      + '<dl class="basket-totals">' + (remaining != null ? '<div><dt>Available Budget</dt><dd>' + money(budget) + '</dd></div>' : '')
      + '<div class="basket-total"><dt>Total</dt><dd>' + money(total) + '</dd></div>'
      + (remaining != null ? '<div class="' + (over ? 'over-budget' : 'remaining') + '"><dt>Remaining Budget</dt><dd>' + money(remaining) + '</dd></div>' : '') + '</dl>'
      + (over ? '<p class="budget-alert" role="status">You’re over budget. Remove something from your basket.</p>' : '')
      + '<button class="button button-dark full checkout-button" type="button" data-action="checkout">Checkout <span aria-hidden="true">↗</span></button>';
    document.querySelector('#mobile-basket').innerHTML = '<button type="button" class="button button-outline" data-action="basket-jump">Basket · ' + count
      + ' <span>' + money(total) + '</span></button><button type="button" class="button button-dark" data-action="checkout">Checkout</button>';
  }

  function addAnimation(card) {
    if (!card || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const target = document.querySelector('.mobile-basket').getClientRects().length
      ? document.querySelector('.mobile-basket') : document.querySelector('#basket-title');
    const from = card.querySelector('img').getBoundingClientRect();
    const to = target.getBoundingClientRect();
    if (!from.width || !to.width || typeof card.animate !== 'function') return;
    card.animate([{ transform: 'scale(.985)' }, { transform: 'scale(1)' }], { duration: 290 });
    if (to.top < 0 || to.top > window.innerHeight) return;
    const moving = card.querySelector('img').cloneNode();
    moving.className = 'flying-image';
    moving.style.left = from.left + from.width * 0.5 - 30 + 'px';
    moving.style.top = from.top + from.height * 0.5 - 25 + 'px';
    document.body.append(moving);
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    const animation = moving.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 0.95 },
      { transform: 'translate(' + dx + 'px, ' + dy + 'px) scale(.25)', opacity: 0.22 },
    ], { duration: 430, easing: 'cubic-bezier(.25,.65,.3,1)' });
    animation.finished.then(() => moving.remove(), () => moving.remove());
  }

  function changeBasket(id, delta, button) {
    if (trip.task.replacement?.soldOut === id) return;
    const previous = trip.basket[id] || 0;
    const next = Math.max(0, Math.min(MAX_QUANTITY, previous + delta));
    if (previous === next) {
      if (next === MAX_QUANTITY) announce('You can add up to ' + MAX_QUANTITY + ' of each product.');
      return;
    }
    if (next) trip.basket[id] = next;
    else delete trip.basket[id];
    if (delta > 0) {
      playSound('basket');
      addAnimation(button.closest('.product-card'));
    }
    if (!trip.task.scenario) document.querySelector('#list-content').innerHTML = taskList();
    paintBasket();
    if (!button.isConnected) {
      const replacement = document.querySelector('.basket-rows [data-action="' + button.dataset.action + '"][data-id="' + id + '"]');
      (replacement || document.querySelector('#basket [data-action="checkout"]')).focus({ preventScroll: true });
    }
    const remaining = trip.task.budget == null ? '' : ' Remaining budget ' + money(trip.task.budget - basketTotal(trip.basket)) + '.';
    announce((next ? displayName(id) + ': quantity ' + next : displayName(id) + ' removed') + '.' + remaining);
  }


  function startCheckout() {
    const result = validateBasket(trip.task, trip.basket);
    trip.hintProduct = null;
    trip.hintUntil = 0;
    const signature = JSON.stringify(Object.entries(trip.basket).sort());
    if (!trip.teacherOptions && trip.lastChecked !== signature) {
      trip.lastChecked = signature;
      progress.attempts++;
      progress.accuracySum += result.accuracy;
      if (trip.task.budget != null) {
        progress.budgetAttempts++;
        if (!result.over) progress.budgetSuccess++;
      }
      save();
    }
    const packages = Object.entries(trip.basket).flatMap(([id, count]) => Array(count).fill(id));
    const checkout = { result, packages, index: 0, total: 0, method: '', scanned: false, paying: false };
    trip.checkout = checkout;
    const feedback = result.ok
      ? '<div class="checkout-feedback success"><h3>Perfect! You’ve got everything.</h3>'
        + (trip.task.budget != null ? '<p>Well done! You stayed within your budget.</p>' : '') + '</div>'
      : '<div class="checkout-feedback error"><h3>Check your shopping list again.</h3><ul>'
        + [...result.categories, ...result.details].map(line => '<li>' + h(line) + '</li>').join('') + '</ul>'
        + '<button class="button button-outline" type="button" data-action="back-shop">Try Again</button></div>';
    navigation('checkout', levelHeading('checkout')
      + '<div class="checkout-grid"><div class="till-stage"><div class="stage-top"><span class="lantern"></span> CHECKOUT 01</div>'
      + '<div class="scan-machine" aria-hidden="true"><div class="scan-window"></div></div>'
      + '<div class="scan-track" id="scan-track" aria-hidden="true"></div>'
      + '<div class="stage-bottom"><i class="lantern" aria-hidden="true"></i><span id="scan-message">Ready to scan</span></div></div>'
      + '<section class="till-panel" aria-labelledby="till-title"><h2 id="till-title">At the Till</h2>'
      + '<div class="till-display" aria-label="Till display"><span id="till-count">0 / ' + packages.length + ' scanned</span>'
      + '<strong id="till-total">' + money(0) + '</strong></div>' + feedback
      + (result.ok ? '<div class="terminal" id="terminal"><div class="terminal-label"><span class="terminal-dot"></span> PAYMENT TERMINAL</div>'
        + '<p id="terminal-message" role="status">Please wait while your items are scanned.</p><div class="payment-methods">'
        + '<button class="button" type="button" data-action="method" data-id="card" aria-pressed="false" disabled>Pay by Card</button>'
        + '<button class="button" type="button" data-action="method" data-id="cash" aria-pressed="false" disabled>Pay in Cash</button></div>'
        + '<button class="button button-lime full" type="button" data-action="pay" disabled>Pay Now</button></div>' : '')
      + '<button class="button button-outline full" type="button" data-action="back-shop">Back to Shopping</button></section></div>');
    scanNext(checkout);
  }

  function scanNext(checkout) {
    if (screen !== 'checkout' || trip?.checkout !== checkout) return;
    const track = document.querySelector('#scan-track');
    const message = document.querySelector('#scan-message');
    const machine = document.querySelector('.scan-machine');
    if (checkout.index === checkout.packages.length) {
      checkout.scanned = true;
      track.innerHTML = '';
      machine.classList.remove('scanning');
      message.textContent = checkout.packages.length ? 'All items scanned.' : 'Your basket is empty.';
      if (checkout.result.ok) {
        document.querySelectorAll('[data-action="method"]').forEach(button => { button.disabled = false; });
        document.querySelector('#terminal-message').textContent = 'Choose how you’d like to pay.';
        announce('Scanning complete. Choose how you’d like to pay.');
      }
      return;
    }
    const id = checkout.packages[checkout.index++];
    checkout.total += PRODUCT_BY_ID[id].price;
    const pace = Math.max(100, Math.min(380, 7000 / checkout.packages.length));
    track.style.setProperty('--scan-duration', pace + 'ms');
    track.innerHTML = photo(id, 'scanning-product', true);
    machine.classList.add('scanning');
    message.textContent = 'Scanning ' + displayName(id).toLowerCase() + '…';
    document.querySelector('#till-count').textContent = checkout.index + ' / ' + checkout.packages.length + ' scanned';
    document.querySelector('#till-total').textContent = money(checkout.total);
    playSound('scan');
    setTimeout(() => scanNext(checkout), pace);
  }

  function choosePayment(method) {
    const checkout = trip.checkout;
    if (!checkout.scanned || checkout.paying) return;
    checkout.method = method;
    document.querySelectorAll('[data-action="method"]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.id === method));
    });
    document.querySelector('#terminal-message').textContent = method === 'card'
      ? 'Tap to pay ' + money(checkout.total) + ' by card.'
      : 'Hand the cashier ' + money(checkout.total) + ' in cash.';
    document.querySelector('[data-action="pay"]').disabled = false;
  }

  function pay() {
    const { checkout, task } = trip;
    if (checkout.paying || !checkout.scanned || !checkout.method || !checkout.result.ok) return;
    checkout.paying = true;
    trip.paid = true;
    trip.receipt = { items: { ...trip.basket }, total: checkout.total, budget: task.budget, method: checkout.method, date: new Date() };
    if (!trip.teacherOptions) {
      if (!progress.completed.includes(task.id)) progress.completed.push(task.id);
      progress.mastered = [...new Set([...progress.mastered, ...Object.keys(trip.basket)])];
      save();
    }
    document.querySelectorAll('.till-panel button').forEach(button => { button.disabled = true; });
    document.querySelector('#terminal-message').textContent = 'Payment approved. Printing your receipt…';
    playSound('terminal');
    const paidTrip = trip;
    setTimeout(() => {
      if (trip === paidTrip && screen === 'checkout') renderReceipt();
    }, 420);
  }

  function receiptEntries(receipt) {
    return Object.entries(receipt.items).map(([id, count]) => [
      PRODUCT_BY_ID[id].name + ' x' + count, money(PRODUCT_BY_ID[id].price * count),
    ]);
  }

  function receiptTotals(receipt) {
    const totals = [['TOTAL', money(receipt.total)]];
    if (receipt.budget != null) {
      totals.push(['BUDGET', money(receipt.budget)], ['MONEY LEFT', money(receipt.budget - receipt.total)]);
    }
    return totals;
  }

  function receiptDate(receipt) {
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(receipt.date);
  }

  function receiptMarkup(receipt) {
    const pairs = pairs => pairs.map(([label, value]) => '<div><dt>' + h(label) + '</dt><dd>' + h(value) + '</dd></div>').join('');
    return '<article class="receipt-paper" aria-label="Printed receipt"><header><span class="receipt-logo">GURU SUPERMARKET</span>'
      + '<p>THANK YOU FOR SHOPPING!</p><time datetime="' + receipt.date.toISOString() + '">' + h(receiptDate(receipt)) + '</time></header>'
      + '<dl class="receipt-items">' + pairs(receiptEntries(receipt)) + '</dl><dl class="receipt-totals">' + pairs(receiptTotals(receipt)) + '</dl>'
      + '<p class="approved">PAYMENT APPROVED · ' + (receipt.method === 'card' ? 'CARD' : 'CASH') + '</p>'
      + '<div class="barcode" aria-hidden="true"></div><p class="receipt-farewell">HAVE A NICE DAY!</p></article>';
  }

  function renderReceipt() {
    const receipt = trip.receipt;
    const completion = trip.task.id === 1 && !trip.task.custom
      ? "Great job! You've bought everything on your shopping list."
      : receipt.budget != null ? 'Well done! You stayed within your budget.' : "Perfect! You've got everything.";
    const campaignComplete = progress.completed.length === LEVELS.length;
    const nextLevel = trip.teacherOptions ? 'teacher' : trip.task.id < LEVELS.length ? 'next' : 'final';
    navigation('receipt', levelHeading('receipt')
      + '<div class="receipt-grid"><section class="receipt-station" aria-label="Receipt printer"><div class="printer"><b>GURU</b><span>RECEIPT PRINTER</span></div>'
      + '<div class="printing-area">' + receiptMarkup(receipt) + '</div></section><div class="after-shop">'
      + '<section class="result-panel"><div class="result-mark" aria-hidden="true">✓</div><h2>Payment Approved</h2><p>' + h(completion) + '</p>'
      + '<p class="result-detail">Paid ' + money(receipt.total) + (receipt.method === 'card' ? ' by card.' : ' in cash.') + '</p>'
      + '<div class="result-actions"><button type="button" class="button button-dark" data-action="' + nextLevel + '">'
      + (trip.teacherOptions ? 'Teacher Mode' : nextLevel === 'final' && campaignComplete ? 'View Shopper Card' : 'Next Level') + '</button>'
      + '<button type="button" class="button button-outline" data-action="download">Download Receipt <span aria-hidden="true">↓</span></button>'
      + '<button type="button" class="button button-outline" data-action="vocabulary">Review Vocabulary</button>'
      + '<button type="button" class="button button-outline" data-action="again">Shop Again</button></div></section>'
      + '<section class="speaking" aria-labelledby="speaking-title"><h2 id="speaking-title">Speaking Practice</h2>'
      + '<p>Say your answers out loud. Use your receipt to help.</p><ol class="questions">'
      + QUESTIONS.map(question => '<li>' + h(question) + '</li>').join('') + '</ol>'
      + '<details><summary>Useful shopping phrases</summary><ul class="phrases">'
      + PHRASES.map(phrase => '<li><span>' + h(phrase) + '</span>' + listen(phrase) + '</li>').join('')
      + '</ul></details></section></div></div>');
    playSound('print');
    setTimeout(() => { if (screen === 'receipt' && trip?.receipt === receipt) playSound('success'); }, 570);
  }

  function downloadReceipt() {
    const receipt = trip.receipt;
    const entries = receiptEntries(receipt);
    const totals = receiptTotals(receipt);
    const canvas = document.createElement('canvas');
    canvas.width = 820;
    canvas.height = 454 + entries.length * 45 + totals.length * 45;
    const context = canvas.getContext('2d');
    if (!context) {
      announce('Could not create the receipt image.');
      return;
    }
    context.fillStyle = '#fffdf4';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#222522';
    function centre(text, y, size, weight = '') {
      context.textAlign = 'center';
      context.font = weight + ' ' + size + 'px monospace';
      context.fillText(text, canvas.width / 2, y);
    }
    function rule(y) {
      context.strokeStyle = '#66695f';
      context.setLineDash([8, 8]);
      context.beginPath();
      context.moveTo(55, y);
      context.lineTo(canvas.width - 55, y);
      context.stroke();
    }
    function row([label, value], y, bold = false) {
      context.textAlign = 'left';
      context.font = (bold ? 'bold ' : '') + '30px monospace';
      context.fillText(label, 55, y, 545);
      context.textAlign = 'right';
      context.fillText(value, canvas.width - 55, y);
    }
    centre('GURU SUPERMARKET', 78, 45, 'bold');
    centre('THANK YOU FOR SHOPPING!', 117, 28);
    centre(receiptDate(receipt), 151, 23);
    rule(180);
    let y = 226;
    for (const pair of entries) {
      row(pair, y);
      y += 45;
    }
    rule(y - 20);
    y += 25;
    for (const [index, pair] of totals.entries()) {
      row(pair, y, index === 0);
      y += 45;
    }
    rule(y - 20);
    y += 20;
    centre('PAYMENT APPROVED · ' + receipt.method.toUpperCase(), y, 25, 'bold');
    for (let i = 0, x = 198; x < 620; i++) {
      const width = [4, 10, 3, 6, 11, 3, 7, 3][i % 8];
      context.fillRect(x, y + 29, width, 58);
      x += width + (i % 3 ? 4 : 7);
    }
    centre('HAVE A NICE DAY!', y + 127, 27);
    canvas.toBlob(blob => {
      if (!blob) {
        announce('Could not create the receipt image.');
        return;
      }
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = 'guru-supermarket-receipt.png';
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      announce('Receipt downloaded.');
    }, 'image/png');
  }

  function vocabulary() {
    dialogOpener = document.activeElement;
    dialog.innerHTML = '<div class="dialog-head"><h2 id="dialog-title">Review Vocabulary</h2>'
      + '<button class="button button-outline" type="button" data-action="close-dialog">Close</button></div>'
      + DEPARTMENTS.map(department => '<section class="vocab-dept"><h3>' + h(department.title) + '</h3><ul>'
        + PRODUCTS.filter(product => product.dept === department.id).map(product =>
          '<li>' + photo(product.id, 'vocab-photo') + '<div><strong>' + h(product.name) + '</strong>'
          + (trip.receipt.items[product.id] ? '<small>On your receipt</small>' : '') + '</div>' + listen(product.name) + '</li>').join('')
        + '</ul></section>').join('');
    dialog.showModal();
  }

  function renderFinal() {
    navigation('final', '<section class="final-screen"><div class="final-message"><p class="eyebrow">GURU SUPERMARKET</p>'
      + '<h1 tabindex="-1">Shopping Challenge Completed</h1><p>You can now shop in English!</p>'
      + '<div class="button-row"><button class="button button-lime" type="button" data-action="levels">Shop Again</button></div></div>'
      + '<article class="shopper-card"><div class="shopper-card-top"><b>GURU<span>.</span></b><span>SHOPPER CARD</span></div>'
      + '<div class="shopper-card-chip" aria-hidden="true"></div><h2>GURU Shopper</h2>'
      + '<dl>' + stats().map(([label, value]) => '<div><dt>' + label + '</dt><dd>' + value + '</dd></div>').join('')
      + '</dl></article></section>');
  }


  function renderTeacher() {
    navigation('teacher', '<div class="teacher-heading"><p class="eyebrow"><button type="button" class="text-button" data-action="levels">All levels</button></p>'
      + '<h1 tabindex="-1">Teacher Mode</h1><p>Open any level or build a shopping assignment for your learner.</p></div>'
      + '<form id="teacher-form" class="teacher-form"><section class="teacher-settings"><h2>Assignment setup</h2>'
      + '<label>Assignment<select name="assignment" id="assignment"><option value="preset">Use a level</option><option value="custom">Build a custom list</option></select></label>'
      + '<label id="teacher-level-wrap">Level<select name="level" id="teacher-level">' + LEVELS.map(level =>
        '<option value="' + level.id + '">Level ' + level.id + ' · ' + h(level.title) + '</option>').join('') + '</select></label>'
      + '<label id="teacher-scenario-wrap" hidden>Scenario<select name="scenario" id="teacher-scenario">' + SCENARIOS.map((scenario, index) =>
        '<option value="' + index + '">' + h(scenario.title) + '</option>').join('') + '</select></label>'
      + '<label>Available Budget (£)<input name="budget" id="teacher-budget" inputmode="decimal" autocomplete="off" placeholder="No budget limit"></label>'
      + '<label>Product names<select name="names" id="teacher-names"><option value="level">Use level setting</option><option value="show">Show names</option><option value="hide">Hide names</option></select></label>'
      + '<label class="toggle"><input type="checkbox" name="timer" id="teacher-timer">20-second list timer</label>'
      + '<label class="toggle"><input type="checkbox" name="hints" id="teacher-hints" checked>Allow hints</label>'
      + '<p class="teacher-error" id="teacher-error" role="alert" hidden></p>'
      + '</section>'
      + '<section class="teacher-list" aria-labelledby="teacher-list-heading"><h2 id="teacher-list-heading">Shopping List</h2><div id="teacher-preview"></div>'
      + '<div id="teacher-products" hidden><p>Set the number of packs or whole items to buy.</p>'
      + DEPARTMENTS.map(department => '<fieldset><legend>' + h(department.title) + '</legend>'
        + PRODUCTS.filter(product => product.dept === department.id).map(product =>
          '<label class="teacher-product">' + photo(product.id) + '<span>' + h(product.name) + '<small>' + money(product.price)
          + '</small></span><input type="number" name="quantity-' + product.id + '" min="0" max="' + MAX_QUANTITY
          + '" step="1" value="0" aria-label="Quantity: ' + h(product.name) + '"></label>').join('') + '</fieldset>').join('')
      + '</div></section><button class="button button-dark full teacher-launch" type="submit">Start Shopping <span aria-hidden="true">↗</span></button></form>');
    teacherSelection();
  }

  function teacherSelection() {
    const form = document.querySelector('#teacher-form');
    const custom = form.elements.assignment.value === 'custom';
    const level = Number(form.elements.level.value);
    const scenario = Number(form.elements.scenario.value);
    const task = challenge(level, 0, scenario);
    document.querySelector('#teacher-level-wrap').hidden = custom;
    document.querySelector('#teacher-scenario-wrap').hidden = custom || !task.scenario;
    document.querySelector('#teacher-preview').hidden = custom;
    document.querySelector('#teacher-products').hidden = !custom;
    document.querySelector('#teacher-error').hidden = true;
    form.elements.budget.value = custom || task.budget == null ? '' : (task.budget / 100).toFixed(2);
    form.elements.names.value = custom ? 'show' : 'level';
    form.elements.timer.checked = !custom && !!task.timer;
    const expected = effectiveItems(task);
    document.querySelector('#teacher-preview').innerHTML = '<p>' + h(task.description) + '</p><ul class="teacher-preview-list">'
      + Object.entries(expected).map(([id, count]) => '<li>' + h(purchaseLine(id, count)) + '</li>').join('') + '</ul>'
      + '<p>Minimum basket total <strong>' + money(basketTotal(expected)) + '</strong></p>'
      + (task.scenario ? '<p>The learner receives the assignment as a message.</p>' : '');
  }

  function launchTeacher(form) {
    const custom = form.elements.assignment.value === 'custom';
    const selectedLevel = Number(form.elements.level.value);
    const scenario = Number(form.elements.scenario.value);
    const standard = challenge(selectedLevel, 0, scenario);
    const names = form.elements.names.value;
    const budget = parseBudget(form.elements.budget.value);
    const error = document.querySelector('#teacher-error');
    function fail(message, field) {
      error.textContent = message;
      error.hidden = false;
      (field || error).focus();
    }
    error.tabIndex = -1;
    if (budget === undefined) {
      fail('Enter a budget in pounds with up to two decimal places.', form.elements.budget);
      return;
    }
    const settings = {
      budget, timer: form.elements.timer.checked, hints: form.elements.hints.checked,
      hide: names === 'level' ? standard.hide : names === 'hide' ? 'all' : false,
      productHints: names === 'hide' || standard.productHints,
    };
    if (custom) {
      const items = Object.fromEntries(PRODUCTS.map(({ id }) => [id, Number(form.elements['quantity-' + id].value)])
        .filter(([, quantity]) => quantity > 0));
      if (!Object.keys(items).length) {
        fail('Add at least one product to your shopping list.');
        return;
      }
      Object.assign(settings, { title: 'Custom Shopping Trip', custom: true, items, dept: PRODUCT_BY_ID[Object.keys(items)[0]].dept });
    } else if (standard.scenario) {
      settings.message = budget == null
        ? standard.message.replace(/[^.!?]*£\d+[^.!?]*[.!?]\s*/g, ' ')
        : standard.message.replace(/£\d+/, money(budget));
    }
    const checkTask = { ...(custom ? LEVELS[0] : standard), ...settings };
    const requiredTotal = basketTotal(effectiveItems(checkTask));
    if (budget != null && requiredTotal > budget) {
      fail('This list costs at least ' + money(requiredTotal) + '. Raise the budget or change the list.', form.elements.budget);
      return;
    }
    startTrip(custom ? 1 : selectedLevel, settings, scenario);
  }

  function recordHint() {
    if (!trip.teacherOptions) {
      progress.hints++;
      save();
    }
  }

  function productHint(button) {
    if (!trip.hints) return;
    if (trip.hintProduct === button.dataset.id && trip.hintUntil > Date.now()) return;
    document.querySelectorAll('.hint-popover').forEach(box => { box.hidden = true; });
    trip.hintProduct = button.dataset.id;
    trip.hintUntil = Date.now() + 8000;
    recordHint();
    paintProductHint(trip.hintProduct);
    announce(PRODUCT_BY_ID[trip.hintProduct].name + '. Hint visible for 8 seconds.');
    clearTimeout(hintId);
    const activeTrip = trip;
    hintId = setTimeout(() => {
      if (trip !== activeTrip || screen !== 'shop') return;
      const box = document.querySelector('.hint-popover:not([hidden])');
      if (box?.contains(document.activeElement)) button.focus({ preventScroll: true });
      if (box) box.hidden = true;
      trip.hintProduct = null;
    }, 8000);
  }

  function listHint() {
    if (!trip.hints || listVisible()) return;
    trip.revealedUntil = Date.now() + 12000;
    recordHint();
    updateClock();
    const list = document.querySelector('#list-content');
    list.tabIndex = -1;
    list.focus({ preventScroll: true });
  }

  function levelMenu() {
    renderHome();
    document.querySelector('#levels-title').focus();
    document.querySelector('#levels').scrollIntoView();
  }

  function shouldConfirmLeave() {
    return trip && (screen === 'shop' || screen === 'checkout') && !trip.paid && (Object.keys(trip.basket).length || trip.note.trim());
  }

  function exitTrip(target) {
    if (shouldConfirmLeave()) {
      modal('Leave this shopping trip?', 'Your basket and notes for this trip will be cleared.',
        '<button class="button button-outline" type="button" data-action="close-dialog" autofocus>Keep Shopping</button>'
        + '<button class="button button-dark" type="button" data-action="confirm-leave" data-id="' + target + '">Leave Trip</button>');
      return;
    }
    trip = null;
    if (target === 'teacher') renderTeacher();
    else if (target === 'levels') levelMenu();
    else renderHome();
  }

  function setDepartment(id) {
    if (id === trip.dept) return;
    trip.dept = id;
    paintShelf();
    document.querySelector('[data-action="department"][data-id="' + id + '"]').focus({ preventScroll: true });
  }

  document.addEventListener('input', event => {
    if (event.target.id === 'notebook' && trip) trip.note = event.target.value;
  });

  document.addEventListener('change', event => {
    const id = event.target.id;
    if (['assignment', 'teacher-level', 'teacher-scenario'].includes(id)) teacherSelection();
    if (id === 'scenario') {
      const scenario = Number(event.target.value);
      if (shouldConfirmLeave()) {
        event.target.value = trip.task.scenarioIndex;
        modal('Change scenario?', 'Switching scenarios starts a new basket and notebook.',
          '<button class="button button-outline" type="button" data-action="close-dialog" autofocus>Keep Scenario</button>'
          + '<button class="button button-dark" type="button" data-action="confirm-scenario" data-id="' + scenario + '">Change Scenario</button>');
      } else {
        switchScenario(scenario);
      }
    }
  });

  function switchScenario(scenario) {
    startTrip(4, null, scenario);
    document.querySelector('#scenario').focus({ preventScroll: true });
  }

  document.addEventListener('submit', event => {
    if (event.target.id !== 'teacher-form') return;
    event.preventDefault();
    launchTeacher(event.target);
  });

  dialog.addEventListener('close', () => {
    window.speechSynthesis?.cancel();
    if (dialogOpener?.isConnected) dialogOpener.focus({ preventScroll: true });
    dialogOpener = null;
  });

  document.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button || button.disabled) return;
    const { action, id, level } = button.dataset;
    switch (action) {
      case 'sound':
        progress.sound = !progress.sound;
        if (!progress.sound) {
          window.speechSynthesis?.cancel();
          audio.forEach(sound => sound.pause());
        }
        updateSound();
        save();
        break;
      case 'speak': say(button.dataset.say); break;
      case 'home':
      case 'levels':
      case 'teacher': exitTrip(action); break;
      case 'confirm-leave':
        trip = null;
        dialog.close();
        exitTrip(id);
        break;
      case 'start': startTrip(Number(level)); break;
      case 'department': setDepartment(id); break;
      case 'add':
      case 'plus': changeBasket(id, 1, button); break;
      case 'minus': changeBasket(id, -1, button); break;
      case 'remove': changeBasket(id, -trip.basket[id], button); break;
      case 'basket-jump':
        document.querySelector('#basket-title').focus();
        document.querySelector('#basket-panel').scrollIntoView({ block: 'start' });
        break;
      case 'product-hint': productHint(button); break;
      case 'list-hint': listHint(); break;
      case 'clue-next':
        trip.clueIndex = (trip.clueIndex + 1) % trip.task.clues.length;
        trip.clueSolved = false;
        trip.clueFeedback = '';
        trip.dept = 'cuts';
        paintClue();
        paintShelf();
        announce(trip.task.clues[trip.clueIndex].text);
        document.querySelector('[data-action="clue-answer"]').focus();
        break;
      case 'clue-answer': {
        const clue = trip.task.clues[trip.clueIndex];
        trip.clueSolved = clue.id === id;
        trip.clueFeedback = trip.clueSolved ? 'Correct! ' + PRODUCT_BY_ID[id].name + '.' : 'Take another look and try again.';
        paintClue();
        if (trip.clueSolved) {
          paintShelf();
          document.querySelector('[data-action="clue-next"]').focus();
        }
        announce(trip.clueFeedback);
        break;
      }
      case 'confirm-scenario':
        dialog.close();
        switchScenario(Number(id));
        break;
      case 'checkout': startCheckout(); break;
      case 'back-shop': renderShop(); break;
      case 'method': choosePayment(id); break;
      case 'pay': pay(); break;
      case 'download': downloadReceipt(); break;
      case 'vocabulary': vocabulary(); break;
      case 'next': startTrip(trip.task.id + 1); break;
      case 'again': startTrip(trip.task.id, trip.teacherOptions, trip.task.scenarioIndex); break;
      case 'final': renderFinal(); break;
      case 'reset':
        modal('Reset your progress?', 'This clears your completed levels, shopping results and hints.',
          '<button class="button button-outline" type="button" data-action="close-dialog" autofocus>Keep Progress</button>'
          + '<button class="button button-dark" type="button" data-action="confirm-reset">Reset Progress</button>');
        break;
      case 'close-dialog': dialog.close(); break;
      case 'confirm-reset':
        progress = { ...freshProgress(), sound: progress.sound };
        trip = null;
        save();
        dialog.close();
        renderHome();
        announce('Progress reset.');
        break;
    }
  });

  updateSound();
  renderHome(false);
}

