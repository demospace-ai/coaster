import "@types/google.maps";

export {};

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize({}): void;
          prompt(): void;
          renderButton(parent: Element, configuration: {}): void;
        };
        oauth2: {
          initTokenClient(): void;
        };
      };
      maps: typeof google.maps;
    };
  }
}
