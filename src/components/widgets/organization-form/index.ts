import html from './template.html';
import './style.css';
import { createEvent, getBooleanValue, getProxy } from '~/helpers';
import { EAddressKeys, EOrganizationKeys, TOrganization } from '~/types/main';
import { isEqual } from 'lodash-es';

type TFormFiledsKeys =
  | EAddressKeys.CITY
  | EAddressKeys.STREET
  | EAddressKeys.HOUSE
  | EOrganizationKeys.DIRECTOR
  | EOrganizationKeys.ORGANIZATION
  | EOrganizationKeys.PHONE;

type TFormFields = { [key in TFormFiledsKeys]: string };
type TFormFiledsValidation = { [key in TFormFiledsKeys]: boolean };

type TView = {
  heading: string;
  isValid: boolean;
  resetValidationDisplay: boolean;
  data: TOrganization | null;
  formValues: TFormFields;
  isShown: boolean;
  isFormFieldsValid: TFormFiledsValidation;
};

const typeList = [
  EAddressKeys.CITY,
  EAddressKeys.STREET,
  EAddressKeys.HOUSE,
  EOrganizationKeys.DIRECTOR,
  EOrganizationKeys.ORGANIZATION,
  EOrganizationKeys.PHONE,
];

const initialFormFieldsValidation: TFormFiledsValidation = {
  [EOrganizationKeys.ORGANIZATION]: false,
  [EOrganizationKeys.DIRECTOR]: false,
  [EOrganizationKeys.PHONE]: false,
  [EAddressKeys.CITY]: false,
  [EAddressKeys.STREET]: false,
  [EAddressKeys.HOUSE]: false,
};

const initialFormFields: TFormFields = {
  [EOrganizationKeys.ORGANIZATION]: '',
  [EOrganizationKeys.DIRECTOR]: '',
  [EOrganizationKeys.PHONE]: '',
  [EAddressKeys.CITY]: '',
  [EAddressKeys.STREET]: '',
  [EAddressKeys.HOUSE]: '',
};

const hiddenClassName = 'hidden';

function setInitialInputFieldValues(value: TFormFields) {
  Object.values(typeList).forEach((inputType: TFormFiledsKeys) => {
    const elem = this.inputElemConfig[inputType];
    if (!elem) return;
    elem.setAttribute('value', value[inputType].toString());
  });
}

function setInputResetValidationDisplay(value: boolean) {
  Object.values(typeList).forEach((inputType: TFormFiledsKeys) => {
    const elem = this.inputElemConfig[inputType];
    if (!elem) return;
    elem.setAttribute('reset-validation-display', value.toString());
  });
}

export default class OrganizationForm extends HTMLElement {
  inputElemConfig: { [key in TFormFiledsKeys]: Element | null } = {
    [EOrganizationKeys.ORGANIZATION]: null,
    [EOrganizationKeys.DIRECTOR]: null,
    [EOrganizationKeys.PHONE]: null,
    [EAddressKeys.CITY]: null,
    [EAddressKeys.STREET]: null,
    [EAddressKeys.HOUSE]: null,
  };
  buttonElementList: Element[];
  confirmButton: Element | null;
  closeButton: Element | null;
  headingElement: Element | null;
  view: TView;

  setInitialInputFieldValues = setInitialInputFieldValues;
  setInputResetValidationDisplay = setInputResetValidationDisplay;

  updateFieldValidationState = (e: CustomEvent<{ isValid: boolean }>) => {
    e.stopPropagation();
    const { target, detail } = e;
    if (!target) return;

    const type = (target as Element).getAttribute('id') as TFormFiledsKeys;
    this.view.isFormFieldsValid[type] = detail.isValid;
    this.view.isValid = Object.values(this.view.isFormFieldsValid).every(value => !!value);
    (target as Element).setAttribute('is-valid', detail.isValid.toString());
  };

  updateFieldsValue = (e: CustomEvent<{ value: string }>) => {
    e.stopPropagation();
    const { target, detail } = e;
    if (!target) return;

    const type = (target as Element).getAttribute('id') as TFormFiledsKeys;
    (target as Element).setAttribute('value', detail.value.toString());

    this.view.formValues[type] = detail.value;
  };

  confirmButtonClick = (e: CustomEvent<Record<string, never>>) => {
    e.stopPropagation();

    if (!this.view.isValid) return;
    const { formValues } = this.view;

    const item: Omit<TOrganization, 'id'> = {
      [EOrganizationKeys.ORGANIZATION]: formValues[EOrganizationKeys.ORGANIZATION].trim(),
      [EOrganizationKeys.DIRECTOR]: formValues[EOrganizationKeys.DIRECTOR].trim(),
      [EOrganizationKeys.PHONE]: formValues[EOrganizationKeys.PHONE].trim(),
      [EOrganizationKeys.ADDRESS]: {
        [EAddressKeys.CITY]: formValues[EAddressKeys.CITY].trim(),
        [EAddressKeys.STREET]: formValues[EAddressKeys.STREET].trim(),
        [EAddressKeys.HOUSE]: +formValues[EAddressKeys.HOUSE],
      },
    };
    let event;

    if (this.view.data) {
      const { id, ...data } = this.view.data;
      const isDataChanged = !isEqual(data, item);
      switch (isDataChanged) {
        case true: {
          event = createEvent<{ item: TOrganization }>('edit-item', {
            item: { ...item, id: this.view.data.id },
          });
          break;
        }
        case false: {
          event = createEvent<Record<string, never>>('close-modal', {});
        }
      }
    } else {
      event = createEvent<{ item: Omit<TOrganization, 'id'> }>('add-item', {
        item,
      });
    }
    this.dispatchEvent(event);
  };

  close = (e: CustomEvent<Record<string, never>>) => {
    e.stopPropagation();

    const event = createEvent<Record<string, never>>('close-modal', {});
    this.dispatchEvent(event);
  };

  constructor() {
    super();
    this.innerHTML = html;

    this.headingElement = this.getElementsByClassName('organization-form__heading')[0] || null;
    this.confirmButton =
      this.getElementsByClassName('organization-form__confirm-button')[0] || null;

    this.closeButton = this.getElementsByClassName('organization-form__close-button')[0] || null;

    Object.values(typeList).forEach((type: TFormFiledsKeys) => {
      this.inputElemConfig[type] =
        this.getElementsByClassName(`organization-form__input-field_${type}`)[0] || null;
    });

    this.view = getProxy<TView>(
      {
        heading: '',
        isValid: false,
        resetValidationDisplay: false,
        data: null,
        formValues: { ...initialFormFields },
        isShown: false,
        isFormFieldsValid: { ...initialFormFieldsValidation },
      },
      (prop: keyof TView, value: TView[keyof TView]) => {
        switch (prop) {
          case 'isShown': {
            if (value) this.classList.remove(hiddenClassName);
            else this.classList.add(hiddenClassName);
            break;
          }
          case 'isValid': {
            if (this.confirmButton) {
              this.confirmButton.setAttribute('disabled', (!value).toString());
            }
            break;
          }
          case 'resetValidationDisplay': {
            this.setInputResetValidationDisplay(value as boolean);
            break;
          }
          case 'heading': {
            if (this.headingElement) {
              this.headingElement.textContent = value as string;
            }
          }
        }
      }
    );

    this.addEventListener('isValid:updated', this.updateFieldValidationState);
    this.addEventListener('value:updated', this.updateFieldsValue);
    if (this.confirmButton) {
      this.confirmButton.addEventListener('action-button-click', this.confirmButtonClick);
    }
    if (this.closeButton) {
      this.closeButton.addEventListener('action-button-click', this.close);
    }
  }

  static get observedAttributes() {
    return ['is-shown'];
  }

  attributeChangedCallback(_attributeName: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    this.view.isShown = getBooleanValue(this.getAttribute('is-shown'), false);

    if (this.view.isShown) {
      this.view.resetValidationDisplay = false;
      this.view.data = JSON.parse(this.getAttribute('data'));

      this.view.formValues = this.view.data
        ? {
            [EOrganizationKeys.ORGANIZATION]: this.view.data[EOrganizationKeys.ORGANIZATION],
            [EOrganizationKeys.DIRECTOR]: this.view.data[EOrganizationKeys.DIRECTOR],
            [EOrganizationKeys.PHONE]: this.view.data[EOrganizationKeys.PHONE],
            [EAddressKeys.CITY]: this.view.data[EOrganizationKeys.ADDRESS][EAddressKeys.CITY],
            [EAddressKeys.STREET]: this.view.data[EOrganizationKeys.ADDRESS][EAddressKeys.STREET],
            [EAddressKeys.HOUSE]:
              this.view.data[EOrganizationKeys.ADDRESS][EAddressKeys.HOUSE].toString(),
          }
        : { ...initialFormFields };

      this.setInitialInputFieldValues(this.view.formValues);

      this.view.heading = `${this.view.data ? 'Редактировать' : 'Добавить'} организацию`;
    } else this.view.resetValidationDisplay = true;
  }

  disconnectedCallback() {
    this.removeEventListener('isValid:updated', this.updateFieldValidationState);
    this.removeEventListener('value:updated', this.updateFieldsValue);
    if (this.confirmButton) {
      this.confirmButton.removeEventListener('action-button-click', this.confirmButtonClick);
    }
    if (this.closeButton) {
      this.closeButton.removeEventListener('action-button-click', this.close);
    }
  }
}
