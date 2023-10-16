import { StorageKeys } from '../../consts';
import { clear, get, set } from '../../modules';

export const getUserToken = () => get(StorageKeys.User);
  
export const setUserToken = (data: any) => set(StorageKeys.User, data);
  
export const clearUserToken = () => clear(StorageKeys.User);