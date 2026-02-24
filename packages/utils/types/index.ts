export type LocalStorageStoreOptions = {
  key:string,
  initData:()=>Record<string, unknown>
}
export type TBaseType = string | number | boolean | null | undefined
export type TNoop = (...rest: any[]) => Promise<any> | any
