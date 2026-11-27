const cabinScenarios = (() => {
  const meals = {
    lamb: ['lamb meatballs', 'Small balls of minced lamb'],
    chicken: ['roast chicken breast', 'A cut of chicken cooked in the oven'],
    goose: ['roast goose', 'Goose cooked in the oven'],
    pork: ['pork schnitzel', 'A thin cut of pork fried in breadcrumbs'],
    lasagna: ['beef lasagna', 'Layers of pasta and minced beef'],
    wings: ['barbecued chicken wings', 'Grilled chicken wings'],
    duck: ['roast duck', 'Duck cooked in the oven'],
    turkey: ['turkey schnitzel', 'A thin cut of turkey fried in breadcrumbs'],
    beef: ['beef meatballs', 'Small balls of minced beef'],
  };

  const name = dish => meals[dish][0];
  const menu = entries => entries.map(([dish, status]) => ({ dish, name: name(dish), description: meals[dish][1], status }));
  const offer = (first, second) => `Would you like the ${name(first)} or the ${name(second)}?`;
  const ask = dish => `Have you got ${name(dish)}?`;
  const order = dish => `I’d like the ${name(dish)}, please.`;
  const confirm = dish => `Certainly. One order of ${name(dish)}.`;
  const soldOut = dish => `I’m sorry, we’ve sold out of ${name(dish)}.`;
  const good = (line, dish) => ({ line, correct: true, dish });
  const retry = (line, feedback) => ({ line, feedback });
  const turn = (line, task, hint, tip, choices) => ({ line, task, hint, tip, choices });
  const chooseTwo = 'Offer both main dishes on the menu.';
  const repeatDish = 'Check what the passenger asked for and repeat their order.';

  return {
    standard: {
      rounds: [
        {
          role: 'crew', seat: '12A',
          brief: 'Offer two dishes, answer the passenger’s question and confirm their order.',
          menu: menu([['lamb', 'offered'], ['chicken', 'offered'], ['goose', 'ask']]),
          closing: () => 'Thank you!',
          turns: [
            turn('Good afternoon!', 'Offer the passenger two main dishes.',
              'Would you like the … or the …?', 'Use “or” to give the passenger a choice.', [
                retry('Would you like the roast goose?', chooseTwo),
                good(offer('lamb', 'chicken')),
                retry('Have you got lamb meatballs?', 'To offer food, start with “Would you like …?”'),
              ]),
            turn(ask('goose'), 'Tell the passenger that roast goose is available.',
              'Yes, we have.', 'You can use this short answer when the dish is available.', [
                good('Yes, we have.'),
                retry('I’m sorry, we’ve sold out of roast goose.', 'Roast goose is available today. Tell the passenger they can order it.'),
                retry('I’d like the roast goose, please.', 'The passenger uses “I’d like” to order. As cabin crew, answer their question about availability.'),
              ]),
            turn(order('goose'), 'Confirm the order and name the dish.',
              'Certainly. One order of …', 'Repeat the dish the passenger chose.', [
                retry(confirm('chicken'), repeatDish),
                retry('Have you got roast goose?', 'The passenger has already ordered. Confirm the order with “Certainly. One order of …”'),
                good(confirm('goose'), 'goose'),
              ]),
          ],
        },
        {
          role: 'passenger', seat: '12C',
          brief: 'Ask about barbecued chicken wings and choose a dish for lunch.',
          menu: menu([['pork', 'offered'], ['lasagna', 'offered'], ['wings', 'ask']]),
          closing: confirm,
          turns: [
            turn(offer('pork', 'lasagna'), 'Ask if barbecued chicken wings are available.',
              'Have you got …?', 'Add the name of the dish to ask if it’s available.', [
                retry('Have you got roast goose?', 'In this round, ask about barbecued chicken wings.'),
                retry('Yes, we have.', 'Ask about the dish with “Have you got …?”'),
                good(ask('wings')),
              ]),
            turn('Yes, we have.', 'Order any of the three available dishes.',
              'I’d like the …, please.', 'Name your chosen dish and finish with “please”.', [
                good(order('wings'), 'wings'),
                good(order('lasagna'), 'lasagna'),
                good(order('pork'), 'pork'),
              ]),
          ],
        },
      ],
    },
    soldOut: {
      rounds: [
        {
          role: 'crew', seat: '14A',
          brief: 'Offer lunch. If a dish has sold out, help the passenger choose another one.',
          menu: menu([['lasagna', ''], ['pork', ''], ['lamb', ''], ['duck', 'sold'], ['chicken', '']]),
          closing: () => 'Thank you!',
          turns: [
            turn('Hello!', 'Offer the passenger lunch.',
              'Would you like some lunch?', 'Use “Would you like …?” to make a polite offer.', [
                good('Would you like some lunch?'),
                retry('I’d like the roast duck, please.', 'As cabin crew, start by offering the passenger lunch.'),
                retry('Certainly. One order of beef lasagna.', 'Offer lunch first so the passenger can place an order.'),
              ]),
            turn('I’d like the roast duck, please.', 'Politely explain that the roast duck has sold out.',
              'I’m sorry, we’ve sold out of …', 'Name the dish you’ve run out of.', [
                retry(confirm('duck'), 'Check the menu. The roast duck has sold out.'),
                good(soldOut('duck')),
                retry(soldOut('lasagna'), 'The passenger asked for duck. Let them know the duck has sold out.'),
              ]),
            turn('I don’t eat pork. What else is available?', 'Offer two available dishes without pork.',
              'Would you like the … or the … instead?', 'Use “instead” when suggesting a replacement.', [
                retry(offer('pork', 'lasagna'), 'The passenger doesn’t eat pork. Offer two other dishes.'),
                retry(offer('duck', 'chicken'), 'Duck has sold out. Offer two dishes you can serve.'),
                good('Would you like the lamb meatballs or the roast chicken breast instead?'),
              ]),
            turn(order('chicken'), 'Confirm the order and name the chosen dish.',
              'Certainly. One order of …', 'Repeat the dish the passenger chose.', [
                good(confirm('chicken'), 'chicken'),
                retry(confirm('lamb'), repeatDish),
                retry(confirm('duck'), repeatDish),
              ]),
          ],
        },
        {
          role: 'passenger', seat: '14C',
          brief: 'Ask for turkey schnitzel. You don’t eat chicken. If the turkey has sold out, choose something else.',
          menu: menu([['turkey', 'sold'], ['wings', ''], ['beef', ''], ['goose', '']]),
          closing: confirm,
          turns: [
            turn('Would you like some lunch?', 'Ask if turkey schnitzel is available.',
              'Have you got …?', 'Add the name of the dish you’d like.', [
                retry(ask('pork'), 'Ask about the turkey schnitzel.'),
                good(ask('turkey')),
                retry('I’m sorry, we’ve sold out of turkey schnitzel.', 'As the passenger, ask if the crew has your dish.'),
              ]),
            turn('I’m sorry, we’ve sold out of turkey schnitzel. Would you like the barbecued chicken wings instead?',
              'Say you don’t eat chicken and ask what else is available.',
              'I don’t eat chicken. What else is available?', 'State what you can’t eat before asking for another option.', [
                retry('I don’t eat pork. What else is available?', 'In this round, you don’t eat chicken. Say “I don’t eat chicken.”'),
                retry(order('wings'), 'The wings are chicken. Ask what else you can order.'),
                good('I don’t eat chicken. What else is available?'),
              ]),
            turn(offer('beef', 'goose'), 'Choose one of the two dishes offered.',
              'I’d like the …, please.', 'Use this phrase to order either of the dishes on offer.', [
                good(order('goose'), 'goose'),
                retry(order('wings'), 'You don’t eat chicken. Pick one of the two dishes the crew just offered.'),
                good(order('beef'), 'beef'),
              ]),
          ],
        },
      ],
    },
  };
})();

function voiceKey(role, line) {
  let hash = 2166136261;
  for (const character of `${role}:${line}`) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  }
  return (hash >>> 0).toString(36);
}
