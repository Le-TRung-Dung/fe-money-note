import { v4 as uuidv4 } from 'uuid';

export const createId = (prefix: string) => {
  return `${prefix}_${uuidv4()}`;
};