declare module "svgo/dist/svgo.browser.js" {
  export type Config = {
    multipass?: boolean;
    plugins: Array<string | { name: string; params?: unknown }>;
  };
  export function optimize(
    svg: string,
    config?: Config
  ): { data: string; info?: unknown };
}

