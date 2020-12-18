const getNextElement = (cursorPosition, currentElement) => {
  const currentElementCoord = currentElement.getBoundingClientRect();
  const currentElementCenter = currentElementCoord.y + currentElementCoord.height / 2;

  // nextElement
  return (cursorPosition < currentElementCenter) ?
    currentElement :
    currentElement.nextElementSibling;
};

const resistorListResultElement = document.querySelector(`.resistors__list-result`)
const switcher = document.querySelector(`.switcher`)
const displayOhm = document.querySelector(`.display_ohm`)

const voltage = document.querySelector(`.display_voltage`)
const ampere = document.querySelector(`.display_ampere`)
const variant = document.querySelector(`.variant`)

const calculate = (bool) => {
  const resistor1 = +variant.value;
  const resistor2 = +resistorListResultElement.firstChild.dataset.value;
  if (bool) {
    voltage.value = voltage.dataset.default;
    const resistance = (resistor1 * resistor2) / (resistor1 + resistor2)
    console.log(resistor1, resistor2, resistance);

    ampere.value = voltage.value / resistance;
  } else {
    voltage.value = 0;
    ampere.value = 0;
  }
}

switcher.addEventListener('click', (evt) => {
  const enabled = evt.target.checked;

  for (const child of resistorListResultElement.children) {
    child.draggable = !enabled;
  }
  if (enabled) variant.disabled = true;
  else variant.removeAttribute(`disabled`);
  calculate(enabled);
})

for (const resistorListElement of document.querySelectorAll(`.resistors__list`)) {
  const taskElements = resistorListElement.querySelectorAll(`.resistors__item`);

  for (const task of taskElements) {
    task.draggable = true;
    task.setAttribute('aria-label', task.textContent);
  }

  resistorListElement.addEventListener(`dragstart`, (evt) => {
    const t = evt.target;
    t.classList.add(`selected`);
    t.textContent = t.getAttribute('aria-label');
  });

  resistorListElement.addEventListener(`dragleave`, (evt) => {
    if (evt.target.classList.contains(`resistors__list-result`)) {
      switcher.disabled = true;
    }
  });

  resistorListElement.addEventListener(`dragend`, (evt) => {
    const t = evt.target;
    t.classList.remove(`selected`);

    if (t.parentElement.classList.contains(`resistors__list-result`)) {
      if (displayOhm.checked)
        t.textContent = t.dataset.value + " Ом";
      switcher.removeAttribute(`disabled`);
    }
  });
  resistorListElement.addEventListener(`dragover`, (evt) => {
    evt.preventDefault();

    const activeElement = document.querySelector(`.selected`);
    const currentElement = evt.target;
    const isMovable = activeElement !== currentElement && (
      currentElement.classList.contains(`resistors__item`) ||
      currentElement.classList.contains(`resistors__list`)
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
  });
}