export enum EColor {
  BLUE = 'blue',
  RED = 'red',
}

export enum EInputType {
  SEARCH = 'search',
  NUMBER = 'number',
  PHONE = 'phone',
  TEXT = 'text',
}

export enum ESortType {
  ORGANIZATION = 'organization',
  DIRECTOR = 'director',
}

export enum EOrganizationKeys {
  ID = 'id',
  ORGANIZATION = 'organization',
  DIRECTOR = 'director',
  PHONE = 'phone',
  ADDRESS = 'address',
}

export enum EAddressKeys {
  CITY = 'city',
  STREET = 'street',
  HOUSE = 'house',
}

export type TOrganization = {
  id: number;
  organization: string;
  director: string;
  phone: string;
  address: {
    city: string;
    street: string;
    house: number;
  };
};

export type TSortOrder = 1 | -1;
export type TSortParams = {
  type: ESortType;
  order: TSortOrder;
};

export enum ESwitchType {
  PREVIOUS = 'previous',
  NEXT = 'next',
}
