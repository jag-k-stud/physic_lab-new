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

switcher.addEventListener('click', (evt) => {
  const enabled = evt.target.checked;

  for (const child of resistorListResultElement.children) {
    child.draggable = !enabled;
    if (enabled) child.classList.add(`active`);
    else child.classList.remove(`active`);
  }
  if (enabled) {
    variant.disabled = true;
  }
  else {
    variant.removeAttribute(`disabled`);
  }
  calculate(enabled);
})

for (const resistorListElement of document.querySelectorAll(`.resistors__list`)) {
  const taskElements = resistorListElement.querySelectorAll(`.resistors__item`);

  for (const task of taskElements) {
    task.draggable = true;
    task.classList.remove(`active`);
    task.setAttribute('aria-label', task.textContent);
    task.dataset.html = task.innerHTML;
  }

  resistorListElement.addEventListener(`dragstart`, (evt) => {
    const t = evt.target;
    t.classList.add(`selected`);
    t.innerHTML = t.dataset.html;
  });

  resistorListElement.addEventListener(`dragend`, (evt) => {
    const t = evt.target;
    t.classList.remove(`selected`);

    if (t.parentElement.classList.contains(`resistors__list-result`))
      if (displayOhm.checked)
        t.textContent = t.dataset.value + " Ом";
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