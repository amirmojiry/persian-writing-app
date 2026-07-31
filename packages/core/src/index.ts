export interface AppMetadata {
  readonly name: string;
  readonly version: string;
  readonly offlineFirst: true;
}

export const appMetadata: AppMetadata = Object.freeze({
  name: 'Persian Name Writing App',
  version: '0.1.0',
  offlineFirst: true
});
