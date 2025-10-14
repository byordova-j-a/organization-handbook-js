import html from './template.html';
import './style.css';
import { getProxy } from '~/helpers';
import { ESortType, ESwitchType, TOrganization, TSortParams } from '~/types/main';
import { createStore, type TStore } from '~/store';

type TView = {
  items: TOrganization[];
  currentPage: number;
  totalPages: number;
  sortParams: TSortParams | null;
  filterInputValue: string;
  isModalShown: boolean;
  data: TOrganization | null;
};

function fetchOrganizationList(
  currentPage: number,
  sortParams: TSortParams,
  filterInputValue: string
) {
  this.store.fetchOrganizationList(currentPage, sortParams, filterInputValue);
}

function switchPage(e: CustomEvent<{ type: ESwitchType }>) {
  e.stopPropagation();

  const { type } = e.detail;

  if (type === ESwitchType.NEXT) {
    this.view.currentPage++;
  } else {
    this.view.currentPage--;
  }

  this.fetchOrganizationList(
    this.view.currentPage,
    this.view.sortParams,
    this.view.filterInputValue
  );
}

function updateSortParams(e: CustomEvent<{ params: TSortParams }>) {
  e.stopPropagation();

  const { params } = e.detail;
  this.view.sortParams = params;
}

function getTotalPages(totalItems: number): number {
  return Math.trunc((totalItems - 1) / 10) + 1;
}

export default class ControllerComponent extends HTMLElement {
  pageSwitcher: Element | null;
  tableHandbook: Element | null;
  filterInput: Element | null;
  addButton: Element | null;
  modalWindow: Element | null;

  view: TView;
  store: ReturnType<typeof createStore>;

  switchPage = switchPage;
  fetchOrganizationList = fetchOrganizationList;
  updateSortParams = updateSortParams;

  deleteOrganization = (e: CustomEvent<{ id: number }>) => {
    e.stopPropagation();

    const { id } = e.detail;
    this.store.deleteOrganization(id);
    if (this.view.totalPages < this.view.currentPage) this.view.currentPage--;

    this.store.fetchOrganizationList(
      this.view.currentPage,
      this.view.sortParams,
      this.view.filterInputValue
    );
  };

  openEditModal = (e: CustomEvent<{ item: TOrganization }>) => {
    e.stopPropagation();
    this.view.data = e.detail.item;
    this.view.isModalShown = true;
  };

  openCreateModal = (e: CustomEvent<Record<string, never>>) => {
    e.stopPropagation();

    this.view.isModalShown = true;
  };

  addItem = (e: CustomEvent<{ item: Omit<TOrganization, 'id'> }>) => {
    e.stopPropagation();

    const { item } = e.detail;
    this.view.isModalShown = false;

    this.store.addOrganization(item);
    this.store.fetchOrganizationList(
      this.view.currentPage,
      this.view.sortParams,
      this.view.filterInputValue
    );
  };

  editItem = (e: CustomEvent<{ item: TOrganization }>) => {
    e.stopPropagation();

    const { item } = e.detail;
    this.view.isModalShown = false;
    this.view.data = null;

    this.store.updateOrganization(item);
    this.store.fetchOrganizationList(
      this.view.currentPage,
      this.view.sortParams,
      this.view.filterInputValue
    );
  };

  setFilterInputValue = (e: CustomEvent<{ value: string }>) => {
    e.stopPropagation();

    const { value } = e.detail;
    this.view.filterInputValue = value;
  };

  closeModal = (e: CustomEvent<Record<string, never>>) => {
    e.stopPropagation();

    this.view.isModalShown = false;
    this.view.data = null;
  };

  constructor() {
    super();
    this.innerHTML = html;

    this.tableHandbook = this.getElementsByTagName('table-handbook')[0];
    this.pageSwitcher = this.getElementsByTagName('page-switcher')[0];
    this.filterInput = this.getElementsByClassName('search-field')[0];
    this.addButton = this.getElementsByClassName('add-button')[0];
    this.modalWindow = this.getElementsByTagName('organization-form')[0];

    this.view = getProxy<TView>(
      {
        items: [],
        currentPage: 0,
        totalPages: 0,
        sortParams: null,
        filterInputValue: '',
        isModalShown: false,
        data: null,
      },
      (prop: keyof TView, value: TView[keyof TView]) => {
        switch (prop) {
          case 'items': {
            if (this.tableHandbook) this.tableHandbook.setAttribute('items', JSON.stringify(value));

            break;
          }
          case 'currentPage': {
            if (this.pageSwitcher) this.pageSwitcher.setAttribute('current-page', value.toString());
            break;
          }
          case 'totalPages': {
            if (this.pageSwitcher) this.pageSwitcher.setAttribute('total-pages', value.toString());
            break;
          }
          case 'sortParams': {
            if (this.tableHandbook) {
              const params = JSON.stringify(value);
              this.tableHandbook.setAttribute('sort-params', params);

              this.view.currentPage = 1;

              this.fetchOrganizationList(
                this.view.currentPage,
                value as TSortParams,
                this.view.filterInputValue
              );
            }
            break;
          }
          case 'filterInputValue': {
            if (this.filterInput) {
              const inputValue = value.toString();
              this.filterInput.setAttribute('value', inputValue);
              this.view.currentPage = 1;

              this.fetchOrganizationList(this.view.currentPage, this.view.sortParams, inputValue);
            }
            break;
          }
          case 'isModalShown': {
            if (this.modalWindow) this.modalWindow.setAttribute('is-shown', value.toString());
            break;
          }
          case 'data': {
            if (this.modalWindow) this.modalWindow.setAttribute('data', JSON.stringify(value));
          }
        }
      }
    );

    this.store = createStore({
      set: (store: TStore, property: keyof TStore, value: TStore[keyof TStore]) => {
        if (property === 'organizationList') {
          this.view.items = value as TOrganization[];
        }
        if (property === 'totalItems') {
          this.view.totalPages = getTotalPages(value as number);
        }

        return Reflect.set(store, property, value);
      },
    });

    this.view.currentPage = 1;
    this.view.isModalShown = false;
    this.view.sortParams = { type: ESortType.ORGANIZATION, order: 1 };

    this.fetchOrganizationList(
      this.view.currentPage,
      this.view.sortParams,
      this.view.filterInputValue
    );

    if (this.filterInput) {
      this.filterInput.addEventListener('value:updated', this.setFilterInputValue);
    }
    this.tableHandbook.addEventListener('delete-item', this.deleteOrganization);
    this.tableHandbook.addEventListener('edit-item', this.openEditModal);

    this.addButton.addEventListener('action-button-click', this.openCreateModal);
    this.addEventListener('add-item', this.addItem);
    this.addEventListener('edit-item', this.editItem);

    this.addEventListener('close-modal', this.closeModal);
    this.addEventListener('switch-page', this.switchPage);
    this.addEventListener('sortItems', this.updateSortParams);
  }

  disconnectedCallback() {
    if (this.filterInput) {
      this.filterInput.removeEventListener('value:updated', this.setFilterInputValue);
    }
    this.tableHandbook.removeEventListener('delete-item', this.deleteOrganization);
    this.tableHandbook.removeEventListener('edit-item', this.openEditModal);

    this.addButton.removeEventListener('action-button-click', this.openCreateModal);
    this.removeEventListener('add-item', this.addItem);
    this.removeEventListener('edit-item', this.editItem);

    this.removeEventListener('close-modal', this.closeModal);
    this.removeEventListener('switch-page', this.switchPage);
    this.removeEventListener('sortItems', this.updateSortParams);
  }
}
