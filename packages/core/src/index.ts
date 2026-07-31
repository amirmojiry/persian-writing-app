export * from './composition';
export * from './ports';
export * from './repositories';
export * from './session';
export * from './settings';
export * from './strokes';
export * from './types';

export interface AppMetadata {
  readonly name: string;
  readonly version: string;
  readonly offlineFirst: true;
}

export const appMetadata: AppMetadata = Object.freeze({
  name: 'Persian Name Writing App',
  version: '0.4.0',
  offlineFirst: true
});
