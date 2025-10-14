import html from './template.html';
import './style.css';
import { createEvent } from '~/helpers';
import {
  EAddressKeys,
  EOrganizationKeys,
  ESortType,
  TOrganization,
  TSortOrder,
  TSortParams,
} from '~/types/main';

const idxArray = Array.from(Array(10).keys());

function emitDeleteEvent(e: CustomEvent<{ id: number }>) {
  e.stopPropagation();

  const event = createEvent<{ id: number }>('delete-item', { id: e.detail.id });
  this.dispatchEvent(event);
}

function emitEditEvent(e: CustomEvent<{ item: TOrganization }>) {
  e.stopPropagation();

  const { item } = e.detail;
  const event = createEvent<{ item: TOrganization }>('edit-item', { item });
  this.dispatchEvent(event);
}

function headerCellClick(type: string) {
  if (type !== ESortType.ORGANIZATION && type !== ESortType.DIRECTOR) return;

  let sortType: ESortType = this.sortParams.type;
  let sortOrder: TSortOrder = this.sortParams.order;

  if (type === this.sortParams.type) sortOrder = (-1 * this.sortParams.order) as TSortOrder;
  else {
    sortType = type;
    sortOrder = 1;
  }
  const event = createEvent<{ params: TSortParams }>('sortItems', {
    params: { type: sortType, order: sortOrder },
  });
  this.dispatchEvent(event);
}

function displayItems() {
  this.items = JSON.parse(this.getAttribute('items')) || [];
  this.items.forEach((item: TOrganization, idx: number) => {
    this.tableRowElemList[idx].classList.remove('table-row_hidden');

    Object.values(EOrganizationKeys).forEach((field: EOrganizationKeys) => {
      if (field !== EOrganizationKeys.ADDRESS) {
        this.tableRowElemList[idx].setAttribute(field, item[field]);
      }

      if (field === EOrganizationKeys.ADDRESS) {
        Object.values(EAddressKeys).forEach((addressField: EAddressKeys) => {
          this.tableRowElemList[idx].setAttribute(
            addressField,
            item[field][addressField].toString()
          );
        });
      }
    });
  });

  idxArray.slice(this.items.length, 10).forEach(idx => {
    this.tableRowElemList[idx].classList.add('table-row_hidden');
  });
}

function setSortParams() {
  this.sortParams = JSON.parse(this.getAttribute('sort-params')) || {
    type: ESortType.ORGANIZATION,
    order: 1,
  };

  if (!this.headerElem) return;

  let addedClass1 = 'header_sort';
  let removedClass1 = 'header_sort_reverse';

  if (this.sortParams.order === -1) {
    addedClass1 = 'header_sort_reverse';
    removedClass1 = 'header_sort';
  }
  const addedClass2 = `header_sort_${this.sortParams.type}`;
  const removedClass2 = `header_sort_${this.sortParams.type === ESortType.ORGANIZATION ? ESortType.DIRECTOR : ESortType.ORGANIZATION}`;

  this.headerElem.classList.remove(removedClass1, removedClass2);
  this.headerElem.classList.add(addedClass1, addedClass2);
}

export default class TableHandbook extends HTMLElement {
  tableRowElemList: Element[];
  headerElem: Element | null;
  headerOrganizationElem: Element | null;
  headerDirectorElem: Element | null;

  items: TOrganization[];
  sortParams: TSortParams;

  displayItems = displayItems;
  setSortParams = setSortParams;
  headerCellClick = headerCellClick;
  headerOrganizationElemClick = () => {
    this.headerCellClick(ESortType.ORGANIZATION);
  };
  headerDirectorElemClick = () => {
    this.headerCellClick(ESortType.DIRECTOR);
  };

  constructor() {
    super();
    this.innerHTML = html;
    this.headerElem = this.getElementsByClassName('header')[0] || null;
    this.tableRowElemList = [...this.getElementsByTagName('table-row')];

    this.headerOrganizationElem =
      this.getElementsByClassName('header-cell_organization')[0] || null;

    this.headerDirectorElem = this.getElementsByClassName('header-cell_director')[0] || null;

    if (this.headerOrganizationElem) {
      this.headerOrganizationElem.addEventListener('click', this.headerOrganizationElemClick);
    }

    if (this.headerDirectorElem) {
      this.headerDirectorElem.addEventListener('click', this.headerDirectorElemClick);
    }

    this.addEventListener('delete', emitDeleteEvent);
    this.addEventListener('edit', emitEditEvent);
  }

  static get observedAttributes() {
    return ['items', 'sort-params'];
  }

  attributeChangedCallback(attributeName: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    switch (attributeName) {
      case 'items': {
        this.displayItems();
        break;
      }
      case 'sort-params': {
        this.setSortParams();
      }
    }
  }
  disconnectedCallback() {
    if (this.headerOrganizationElem) {
      this.headerOrganizationElem.removeEventListener('click', this.headerOrganizationElemClick);
    }

    if (this.headerDirectorElem) {
      this.headerDirectorElem.removeEventListener('click', this.headerDirectorElemClick);
    }
    this.removeEventListener('delete', emitDeleteEvent);
    this.removeEventListener('edit', emitEditEvent);
  }
}
