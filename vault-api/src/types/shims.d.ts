declare module "chanfana" {
  export class OpenAPIRoute {
    schema?: any;
    getValidatedData<T = any>(): Promise<any>;
  }
}

declare module "zod" {
  export const z: any;
}
