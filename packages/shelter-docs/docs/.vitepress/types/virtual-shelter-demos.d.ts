declare module "virtual:shelter-demos" {
  export function mountDemo(demoName: string, container: HTMLElement): () => void;
}
