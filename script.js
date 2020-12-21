const getNextElement = (cursorPosition, currentElement) => {
  const currentElementCoord = currentElement.getBoundingClientRect();
  const currentElementCenter = currentElementCoord.y + currentElementCoord.height / 2;

  // nextElement
  return (cursorPosition < currentElementCenter) ?
    currentElement :
    currentElement.nextElementSibling;
};

const resistorListResultElement = document.querySelector(`.js-resistors__list--result`)
const switcher = document.querySelector(`.switcher`)

const voltage = document.querySelector(`.display_voltage`)
const ampere = document.querySelector(`.display_ampere`)
const variant = document.querySelector(`.variant`)

const variantResistor = document.querySelector(`.resistors__item--variant .resistors__item--text`)

const setResistance = () => {
  variantResistor.textContent = variant.value + " Ом";
}
setResistance();

const calculate = (bool) => {
  const resistor1 = +variant.value;
  let resistance;

  if (resistorListResultElement.firstChild) {
    const resistor2 = +resistorListResultElement.firstChild.dataset.value;
    resistance = (resistor1 * resistor2) / (resistor1 + resistor2)
  } else resistance = resistor1;

  if (bool) {
    voltage.value = voltage.dataset.default;
    ampere.value = voltage.value / resistance;
  } else {
    voltage.value = 0;
    ampere.value = 0;
  }
}

variant.addEventListener('change', setResistance, false);

switcher.addEventListener('click', (evt) => {
  const enabled = evt.target.checked;
  if (enabled) document.body.classList.add(`active`);
  else document.body.classList.remove(`active`);

  for (const child of resistorListResultElement.children) {
    child.draggable = !enabled;
  }

  if (enabled) variant.disabled = true;
  else variant.removeAttribute(`disabled`);

  calculate(enabled);
})

const dragstart = (evt) => {
  const t = evt.target;
  t.classList.add(`selected`);
}
const dragend = (evt) => {
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

  resistorListElement.addEventListener(`dragstart`, dragstart, false);
  resistorListElement.addEventListener(`dragend`, dragend, false);
  resistorListElement.addEventListener(`dragover`, dragover, false);


  resistorListElement.addEventListener(`touchstart`, dragstart, false);
  resistorListElement.addEventListener(`touchend`, dragend, false);
  resistorListElement.addEventListener(`touchmove`, dragover, false);


}