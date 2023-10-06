export const get = (key: string, defaultValue: any = null) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};
    
export const set = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};
    
export const clear = (key: string) => {
  localStorage.removeItem(key);
};