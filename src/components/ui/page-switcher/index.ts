import html from './template.html';
import './style.css';
import { createEvent, getNumberValue, getProxy } from '~/helpers';
import { ESwitchType } from '~/types/main';

type TView = {
  currentPage: number;
  totalPages: number;
};

const disabledClassName1 = 'page-switcher_btn-disabled-1';
const disabledClassName2 = 'page-switcher_btn-disabled-2';

function updateDisabledClass({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  if (!this.rootElem) return;
  if (currentPage === 1) this.rootElem.classList.add(disabledClassName1);
  else this.rootElem.classList.remove(disabledClassName1);

  if (currentPage === totalPages) this.rootElem.classList.add(disabledClassName2);
  else this.rootElem.classList.remove(disabledClassName2);
}

function emitClickEvent(type: ESwitchType) {
  if (
    (type === ESwitchType.PREVIOUS && this.view.currentPage === 1) ||
    (type === ESwitchType.NEXT && this.view.currentPage === this.view.totalPages)
  )
    return;

  const event = createEvent<{ type: ESwitchType }>('switch-page', { type });
  this.dispatchEvent(event);
}

export default class PageSwitcher extends HTMLElement {
  rootElem: Element | null;
  totalPagesElement: Element | null;
  currentPageElement: Element | null;
  previousButton: Element | null;
  nextButton: Element | null;

  view: TView;

  emitClickEvent = emitClickEvent;
  previousButtonClick = () => {
    this.emitClickEvent(ESwitchType.PREVIOUS);
  };

  nextButtonClick = () => {
    this.emitClickEvent(ESwitchType.NEXT);
  };
  updateDisabledClass = updateDisabledClass;

  constructor() {
    super();

    this.innerHTML = html;
    this.rootElem = this.getElementsByClassName('page-switcher')[0] || null;
    this.currentPageElement = this.getElementsByClassName('counter__current-page')[0] || null;
    this.totalPagesElement = this.getElementsByClassName('counter__total-pages')[0] || null;

    this.view = getProxy<TView>(
      { currentPage: 1, totalPages: 1 },
      (prop: string, value: TView[keyof TView]) => {
        const { currentPage, totalPages } = this.view;
        switch (prop) {
          case 'currentPage': {
            if (this.currentPageElement) {
              this.currentPageElement.textContent = value.toString();
              this.updateDisabledClass({ currentPage: value, totalPages });
            }
            break;
          }
          case 'totalPages': {
            if (this.totalPagesElement) {
              this.totalPagesElement.textContent = value.toString();
              this.updateDisabledClass({ currentPage, totalPages: value });
            }
          }
        }
      }
    );

    this.view.currentPage = getNumberValue(this.getAttribute('current-page'), 1);
    this.view.totalPages = getNumberValue(this.getAttribute('total-pages'), 1);

    this.previousButton = this.getElementsByClassName('page-switcher__button_previous')[0] || null;
    this.nextButton = this.getElementsByClassName('page-switcher__button_next')[0] || null;

    if (this.previousButton) {
      this.previousButton.addEventListener('click', this.previousButtonClick);
    }

    if (this.nextButton) {
      this.nextButton.addEventListener('click', this.nextButtonClick);
    }
  }

  static get observedAttributes() {
    return ['total-pages', 'current-page'];
  }

  attributeChangedCallback(attributeName: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    switch (attributeName) {
      case 'current-page': {
        this.view.currentPage = getNumberValue(newValue, 1);
        break;
      }
      case 'total-pages': {
        this.view.totalPages = getNumberValue(newValue, 1);
      }
    }
  }
  disconnectedCallback() {
    if (this.previousButton) {
      this.previousButton.removeEventListener('click', this.previousButtonClick);
    }

    if (this.nextButton) {
      this.nextButton.removeEventListener('click', this.nextButtonClick);
    }
  }
}
