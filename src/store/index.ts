import { data } from '~/store/data';
import { type TOrganization, type TSortParams } from '~/types/main';

const ruCollator = new Intl.Collator('ru-RU');
let initialData = data;

export type TStore = { organizationList: TOrganization[]; unicId: number; totalItems: number };

const state: TStore = {
  organizationList: [],
  unicId: initialData.length + 1,
  totalItems: initialData.length,
};

export const createStore = (handler: ProxyHandler<TStore>) => {
  const storeState = new Proxy(state, handler);

  return {
    getOrganizationList: () => storeState.organizationList,
    getTotalItems: () => storeState.totalItems,

    fetchOrganizationList(page: number, sortParam: TSortParams, filterValue: string) {
      const regex = new RegExp(filterValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

      const { type, order } = sortParam;

      const list = initialData
        .filter(({ director }) => {
          return regex.test(director);
        })
        .sort((a, b) => order * ruCollator.compare(a[type], b[type]));

      storeState.totalItems = list.length;

      storeState.organizationList = list.slice((page - 1) * 10, page * 10);
    },

    addOrganization(newOrganizationData: Omit<TOrganization, 'id'>) {
      const newOrganization = { ...newOrganizationData, id: storeState.unicId };
      initialData.push(newOrganization);
      storeState.unicId++;
      storeState.totalItems++;
    },

    updateOrganization(updatedOrganization: TOrganization) {
      initialData = initialData.map(organization => {
        if (organization.id === updatedOrganization.id) return updatedOrganization;
        return organization;
      });
    },

    deleteOrganization(id: number) {
      initialData = initialData.filter(organization => organization.id !== id);
      storeState.totalItems--;
    },
  };
};
