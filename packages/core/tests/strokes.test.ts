import { normalizePointerSample } from '../src';

describe('pointer normalization', () => {
  it('normalizes and clamps pointer data independent of canvas size', () => {
    expect(normalizePointerSample({
      clientX: 150,
      clientY: 50,
      elapsedMs: 20,
      source: 'pen',
      pressure: 1.4,
      tiltX: 12
    }, {
      left: 50,
      top: 0,
      width: 200,
      height: 100
    })).toEqual({
      x: 0.5,
      y: 0.5,
      t: 20,
      source: 'pen',
      pressure: 1,
      tiltX: 12
    });
  });
});
