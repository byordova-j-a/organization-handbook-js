import html from './template.html';
import './style.css';
import { createEvent, getBooleanValue, getProxy } from '~/helpers';
import { EColor } from '~/types/main';

type TView = {
  disabled: boolean;
};

const disabledClassName = 'button_disabled';

function emitClickEvent() {
  if (this.disabled) return;

  const event = createEvent<Record<string, never>>('action-button-click', {});
  this.dispatchEvent(event);
}

export default class ActionButton extends HTMLElement {
  button: Element;
  view: TView;

  emitClickEvent = emitClickEvent;

  constructor() {
    super();
    this.innerHTML = html;

    this.button = this.getElementsByClassName('button')[0] || null;

    this.view = getProxy<TView>({ disabled: false }, (prop: 'disabled', value: boolean) => {
      if (value) {
        this.button.classList.add(disabledClassName);
      } else this.button.classList.remove(disabledClassName);
    });

    if (this.button) {
      this.button.textContent = this.getAttribute('text') || '';
      const color = (this.getAttribute('color') as EColor) || EColor.BLUE;
      this.button.classList.add(`button_${color}`);
    }
    this.addEventListener('click', this.emitClickEvent);
  }

  static get observedAttributes() {
    return ['disabled'];
  }

  attributeChangedCallback(_attributeName: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;
    this.view.disabled = getBooleanValue(newValue, false);
  }

  disconnectedCallback() {
    this.removeEventListener('click', emitClickEvent);
  }
}
