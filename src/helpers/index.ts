import { NUMBER_REGEX } from '~/constants';
export const createEvent = <T>(event: string, detail: T): CustomEvent<T> => {
  return new CustomEvent(event, {
    bubbles: true,
    detail,
  });
};

export function getBooleanValue(value: string, reserveValue: boolean): boolean {
  switch (value) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      return reserveValue;
  }
}

export function getNumberValue(value: string, reserveValue: number): number {
  return NUMBER_REGEX.test(value) ? +value : reserveValue;
}

export function getProxy<T extends object>(
  obj: T,
  hanlderFunc: (prop: string | symbol, value: T[keyof T]) => void
): T {
  return new Proxy(obj, {
    set: (target: T, prop: string | symbol, value: T[keyof T]) => {
      hanlderFunc(prop, value);
      return Reflect.set(target, prop, value);
    },
  });
}
