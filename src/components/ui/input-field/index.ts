import html from './template.html';
import './style.css';
import { createEvent, getBooleanValue, getProxy } from '~/helpers';
import { EInputType } from '~/types/main';
import { debounce } from 'lodash-es';
import { NUMBER_REGEX, PHONE_NUMBER_REGEX } from '~/constants';

type TView = {
  inputWasInteracted: boolean;
  isValid: boolean;
  resetValidationDisplay: boolean;
  value: string;
};

const disabledClassName = 'input_invalid';

function updateInvalidClass({ isValid, inputWasInteracted }: Record<string, boolean>) {
  if (!this.inputElement) return;

  if (!isValid && inputWasInteracted) {
    this.inputElement.classList.add(disabledClassName);
  } else {
    this.inputElement.classList.remove(disabledClassName);
  }
}

function emitValueEvent(value: string) {
  const event = createEvent<{ value: string }>('value:updated', { value });
  this.dispatchEvent(event);
}

const debouncedEmitValueEvent = debounce(emitValueEvent, 400);

function setInputValue() {
  this.inputElement.value = this.value;
}

function validate(value: string) {
  let isValid: boolean;

  switch (this.type) {
    case EInputType.NUMBER: {
      isValid = NUMBER_REGEX.test(value);
      break;
    }
    case EInputType.PHONE: {
      isValid = PHONE_NUMBER_REGEX.test(value);
      break;
    }
    default: {
      isValid = !!value.trim();
    }
  }

  const event = createEvent<{ isValid: boolean }>('isValid:updated', { isValid });
  this.dispatchEvent(event);
}

export default class InputField extends HTMLElement {
  inputElement: HTMLInputElement | null;
  type: EInputType;
  inputType: EInputType.NUMBER | EInputType.TEXT | EInputType.SEARCH;

  view: TView;

  updateInvalidClass = updateInvalidClass;
  setInputValue = setInputValue;
  validate = validate;

  emitValueEvent = emitValueEvent;
  debouncedEmitValueEvent = debouncedEmitValueEvent;

  inputHandler = (e: Event) => {
    const { value } = e.target as HTMLInputElement;

    if (this.type === EInputType.SEARCH) {
      this.debouncedEmitValueEvent(value);
    } else {
      this.emitValueEvent(value);
    }
  };

  setValidationDisplay = () => {
    if (this.type === EInputType.SEARCH || this.view.inputWasInteracted) return;

    this.view.inputWasInteracted = true;
  };

  constructor() {
    super();

    this.innerHTML = html;
    this.inputElement = this.getElementsByTagName('input')[0] || null;

    this.view = getProxy<TView>(
      {
        inputWasInteracted: false,
        isValid: false,
        resetValidationDisplay: false,
        value: '',
      },
      (prop: string, value: TView[keyof TView]) => {
        const { isValid, inputWasInteracted } = this.view;
        switch (prop) {
          case 'inputWasInteracted': {
            this.updateInvalidClass({
              isValid,
              inputWasInteracted: value as boolean,
            });
            break;
          }
          case 'isValid': {
            this.updateInvalidClass({
              isValid: value as boolean,
              inputWasInteracted,
            });
            break;
          }
          case 'resetValidationDisplay': {
            if (value) {
              this.view.inputWasInteracted = false;
            }
            break;
          }
          case 'value': {
            if (this.inputElement) {
              const newValue = value as string;
              this.inputElement.value = newValue;
              this.validate(newValue);
            }
          }
        }
      }
    );

    this.view.isValid = getBooleanValue(this.getAttribute('is-valid'), true);

    this.view.resetValidationDisplay = getBooleanValue(
      this.getAttribute('reset-validation-display'),
      false
    );
    this.view.value = this.getAttribute('value') || '';

    this.type = this.getAttribute('type') as EInputType;
    this.inputType = this.type === EInputType.PHONE ? EInputType.TEXT : this.type;

    if (this.inputElement) {
      this.inputElement.placeholder = this.getAttribute('placeholder') || '';
      this.inputElement.type = this.inputType;

      this.inputElement.addEventListener('input', this.inputHandler);
      this.inputElement.addEventListener('blur', this.setValidationDisplay);
    }
  }

  static get observedAttributes() {
    return ['is-valid', 'reset-validation-display', 'value'];
  }

  attributeChangedCallback(attributeName: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    switch (attributeName) {
      case 'is-valid': {
        this.view.isValid = getBooleanValue(newValue, true);
        break;
      }
      case 'reset-validation-display': {
        this.view.resetValidationDisplay = getBooleanValue(newValue, false);
        break;
      }

      case 'value': {
        this.view.value = newValue;
      }
    }
  }

  disconnectedCallback() {
    if (this.inputElement) {
      this.inputElement.removeEventListener('input', this.inputHandler);
      this.inputElement.removeEventListener('blur', this.setValidationDisplay);
    }
  }
}
