import html from './template.html';
import './style.css';
import { createEvent, getNumberValue, getProxy } from '~/helpers';
import { EAddressKeys, EOrganizationKeys, TOrganization } from '~/types/main';

type TRowFields =
  | EOrganizationKeys.DIRECTOR
  | EOrganizationKeys.ORGANIZATION
  | EOrganizationKeys.PHONE
  | EOrganizationKeys.ADDRESS;

type TView = {
  [key in TRowFields]: string;
};

function emitEditEvent() {
  const { director, organization, phone } = this.view;

  const event = createEvent<{ item: TOrganization }>('edit', {
    item: {
      director,
      organization,
      phone,
      [EOrganizationKeys.ID]: getNumberValue(this.getAttribute('id'), 0),

      address: { ...this.address },
    },
  });

  this.dispatchEvent(event);
}

function getAddress() {
  return `г. ${this.address.city}, ул. ${this.address.street}, д. ${this.address.house}`;
}

export default class TableRow extends HTMLElement {
  deleteElement: Element | null;

  rowFieldElementsConfig: {
    [key in TRowFields]: Element | null;
  } = {
    [EOrganizationKeys.ORGANIZATION]: null,
    [EOrganizationKeys.DIRECTOR]: null,
    [EOrganizationKeys.PHONE]: null,
    [EOrganizationKeys.ADDRESS]: null,
  };

  view: TView;
  address: TOrganization[EOrganizationKeys.ADDRESS];

  getAddress = getAddress;

  emitDeveteEvent = (e: Event) => {
    e.stopPropagation();
    const event = createEvent<{ id: number }>('delete', {
      id: getNumberValue(this.getAttribute('id'), 0),
    });
    this.dispatchEvent(event);
  };

  emitEditEvent = emitEditEvent;

  constructor() {
    super();
    this.innerHTML = html;
    [
      EOrganizationKeys.ORGANIZATION,
      EOrganizationKeys.DIRECTOR,
      EOrganizationKeys.PHONE,
      EOrganizationKeys.ADDRESS,
    ].forEach((value: TRowFields) => {
      this.rowFieldElementsConfig[value] =
        this.getElementsByClassName(`table-row__cell_${value}`)[0] || null;
      if (!this.rowFieldElementsConfig[value]) return;
    });

    this.view = getProxy<TView>(
      {
        [EOrganizationKeys.ORGANIZATION]: '',
        [EOrganizationKeys.DIRECTOR]: '',
        [EOrganizationKeys.PHONE]: '',
        [EOrganizationKeys.ADDRESS]: '',
      },
      (prop: TRowFields, value: TView[keyof TView]) => {
        if (this.rowFieldElementsConfig[prop]) {
          this.rowFieldElementsConfig[prop].textContent = value;
        }
      }
    );
    this.address = {
      [EAddressKeys.CITY]: '',
      [EAddressKeys.STREET]: '',
      [EAddressKeys.HOUSE]: 1,
    };

    this.deleteElement = this.getElementsByClassName('table-row__cell_delete')[0] || null;
    if (this.deleteElement) {
      this.deleteElement.addEventListener('click', this.emitDeveteEvent);
    }
    this.addEventListener('click', emitEditEvent);
  }

  static get observedAttributes() {
    return [
      EOrganizationKeys.ORGANIZATION,
      EOrganizationKeys.DIRECTOR,
      EOrganizationKeys.PHONE,
      EAddressKeys.CITY,
      EAddressKeys.STREET,
      EAddressKeys.HOUSE,
    ];
  }

  attributeChangedCallback(attributeName: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    switch (attributeName) {
      case EAddressKeys.CITY:
      case EAddressKeys.STREET:
      case EAddressKeys.HOUSE: {
        if (attributeName === EAddressKeys.HOUSE) {
          this.address[attributeName] = getNumberValue(newValue, 1);
        } else {
          this.address[attributeName] = newValue;
        }

        this.view[EOrganizationKeys.ADDRESS] = this.getAddress();
        break;
      }

      case EOrganizationKeys.ORGANIZATION:
      case EOrganizationKeys.DIRECTOR:
      case EOrganizationKeys.PHONE: {
        this.view[attributeName] = newValue;
      }
    }
  }
  disconnectedCallback() {
    if (this.deleteElement) {
      this.deleteElement.removeEventListener('click', this.emitDeveteEvent);
    }
    this.removeEventListener('click', emitEditEvent);
  }
}
