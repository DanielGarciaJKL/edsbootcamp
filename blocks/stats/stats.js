import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Splits a row into its value (big number) and label.
 * Preferred authoring is two cells: | 25K+ | Happy customers |.
 * A single cell is also accepted: the first paragraph/heading is the value,
 * everything after it is the label.
 * @param {Element} row
 * @returns {{ value: Node[], label: Node[] }}
 */
function readRow(row) {
  const cells = [...row.children];
  if (cells.length >= 2) {
    return { value: [...cells[0].childNodes], label: [...cells[1].childNodes] };
  }
  const cell = cells[0];
  if (!cell) return { value: [], label: [] };
  const [first, ...rest] = [...cell.children];
  // Plain text cell with no wrapping elements: the whole text is the value
  if (!first) return { value: [...cell.childNodes], label: [] };
  return { value: [...first.childNodes], label: rest };
}

/**
 * Stats block: one item per row, big number + label.
 * Variant: "Stats (dark)" adds the `dark` class for a dark background.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  // list-style: none drops list semantics in Safari/VoiceOver; restore them explicitly
  ul.setAttribute('role', 'list');

  [...block.children].forEach((row) => {
    const { value, label } = readRow(row);
    if (!value.length && !label.length) return;

    const li = document.createElement('li');
    li.className = 'stats-item';
    moveInstrumentation(row, li);

    const valueEl = document.createElement('p');
    valueEl.className = 'stats-value';
    valueEl.append(...value);
    li.append(valueEl);

    if (label.length) {
      const labelEl = document.createElement('div');
      labelEl.className = 'stats-label';
      labelEl.append(...label);
      // unwrap a single <p> so the label doesn't carry default paragraph margins
      if (labelEl.children.length === 1 && labelEl.firstElementChild.tagName === 'P') {
        labelEl.replaceChildren(...labelEl.firstElementChild.childNodes);
      }
      li.append(labelEl);
    }

    // the value may arrive wrapped in a single <p>/heading; flatten it to keep valid markup
    const inner = valueEl.firstElementChild;
    if (valueEl.children.length === 1 && /^(P|H[1-6])$/.test(inner.tagName)) {
      valueEl.replaceChildren(...inner.childNodes);
    }

    ul.append(li);
  });

  block.replaceChildren(ul);
}
