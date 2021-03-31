const getNextElement = (cursorPosition, currentElement) => {
  const currentElementCoord = currentElement.getBoundingClientRect();
  const currentElementCenter = currentElementCoord.y + currentElementCoord.height / 2;

  // nextElement
  return (cursorPosition < currentElementCenter) ?
    currentElement :
    currentElement.nextElementSibling;
};

const ROUND = 10 ** 4;
const scaleWidth = 1100;
const scaleHeight = 700;
const params = new URLSearchParams(window.location.search);
const scale = +params.get('scale') || 1;


const u = document.body.parentElement

u.dataset.scale = scale.toString();

if (1 > scale && scale > 0) {
  u.style.transform = `scale(${scale})`;
  u.style.transformOrigin = 'top left'
  u.dataset.width = (scaleWidth * scale).toString();
  u.dataset.height = (scaleHeight * scale).toString();
}
// console.log(window.frameElement
//   ? 'embedded in iframe or object'
//   : 'not embedded or cross-origin')

const resistorListResultElement = document.querySelector(`.js-resistors__list--result`)
const switcher = document.querySelector(`.switcher`)
const board = document.querySelector(`.board`)

const voltage = document.querySelector(`.display_voltage`)
const ampere = document.querySelector(`.display_ampere`)
const variant = document.querySelector(`.variant`)

const variantResistor = document.querySelector(`.resistors__item--variant .resistors__item--text`)

for (let i = 0; i < variant.children.length; i++) {
  let opt = variant.children[i]
  opt.textContent = `№${i + 1} (${opt.value} Ом)`
}

const setResistance = () => {
  variantResistor.textContent = variant.value + " Ом";
}
setResistance();

const calculate = (bool) => {
  const resistor1 = +variant.value;

  if (bool) {
    voltage.value = +voltage.dataset.default;
    if (resistorListResultElement.firstChild) {
      const resistor2 = +resistorListResultElement.firstChild.dataset.value;

      ampere.value = Math.ceil((
        (voltage.value * (resistor1 + resistor2)) / (resistor1 * resistor2)
      ) * ROUND) / ROUND;
    } else ampere.value = voltage.value / resistor1

  } else {
    voltage.value = 0;
    ampere.value = 0;
  }
}

variant.addEventListener('change', setResistance, false);

switcher.addEventListener('click', (evt) => {
  const enabled = evt.target.checked;
  if (enabled) board.classList.add(`active`);
  else board.classList.remove(`active`);

  for (const child of resistorListResultElement.children) {
    child.draggable = !enabled;
  }

  if (enabled) variant.disabled = true;
  else variant.removeAttribute(`disabled`);

  calculate(enabled);
})

const dragstart = (evt) => {
  if (evt.cancelable) evt.preventDefault();
  const t = evt.target;
  t.classList.add(`selected`);
}
const dragend = (evt) => {
  if (evt.cancelable) evt.preventDefault();
  const t = evt.target;
  t.classList.remove(`selected`);
}

const dragover = (evt) => {
  evt.preventDefault();

  const activeElement = document.querySelector(`.selected`);
  const currentElement = evt.target;
  const isMovable = activeElement !== currentElement && (
    currentElement.classList.contains(`resistors__item`) ||
    currentElement.classList.contains(`js-resistors__list`)
  );

  const parentElement = currentElement.classList.contains(`resistors__item`) ?
    currentElement.parentNode : currentElement;

  if (!isMovable) {
    return;
  }

  const children = +parentElement.dataset.children || -1;
  if (children !== -1) {
    if (children >= parentElement.children.length + 1) {
      parentElement.appendChild(activeElement)
    }
    return;
  }

  if (currentElement !== parentElement) {
    const nextElement = getNextElement(evt.clientY, currentElement);

    if (
      nextElement &&
      activeElement === nextElement.previousElementSibling ||
      activeElement === nextElement
    ) return;

    parentElement.insertBefore(activeElement, nextElement);
  }
}

for (const resistorListElement of document.querySelectorAll(`.js-resistors__list`)) {
  for (const resistor of resistorListElement.querySelectorAll(`.resistors__item`)) {
    resistor.classList.remove(`active`);
  }

  resistorListElement.addEventListener(`dragstart`, dragstart, {passive: true});
  resistorListElement.addEventListener(`dragend`, dragend, {passive: true});
  resistorListElement.addEventListener(`dragover`, dragover);

  resistorListElement.addEventListener(`touchstart`, dragstart, {passive: true});
  resistorListElement.addEventListener(`touchend`, dragend, {passive: true});
  resistorListElement.addEventListener(`touchmove`, dragover);
}
