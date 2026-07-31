import { PointerInputAdapter } from '../src/adapters/input/PointerInputAdapter';

describe('PointerInputAdapter', () => {
  it('uses the same normalized path for mouse, pen and touch events', async () => {
    const target = document.createElement('div');
    Object.defineProperty(target, 'getBoundingClientRect', { value: () => ({ left: 10, top: 20, width: 200, height: 100, right: 210, bottom: 120, x: 10, y: 20, toJSON() {} }) });
    Object.defineProperty(target, 'setPointerCapture', { value: () => undefined });
    Object.defineProperty(target, 'releasePointerCapture', { value: () => undefined });
    const adapter = new PointerInputAdapter();
    const points: Array<{ source: string; x: number; y: number }> = [];
    adapter.onPoint((point) => points.push({ source: point.source, x: point.x, y: point.y }));
    await adapter.start(target);
    target.dispatchEvent(pointerEvent('pointerdown', { pointerId: 7, pointerType: 'pen', clientX: 110, clientY: 70, pressure: .5, timeStamp: 10 }));
    target.dispatchEvent(pointerEvent('pointerup', { pointerId: 7, pointerType: 'pen', clientX: 210, clientY: 120, pressure: .5, timeStamp: 20 }));
    expect(points[0]).toEqual({ source: 'pen', x: .5, y: .5 });
    expect(points[1]).toEqual({ source: 'pen', x: 1, y: 1 });
    await adapter.stop();
  });
});

function pointerEvent(type: string, values: Record<string, string | number>): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  for (const [key, value] of Object.entries(values)) Object.defineProperty(event, key, { value });
  Object.defineProperty(event, 'tiltX', { value: 0 });
  Object.defineProperty(event, 'tiltY', { value: 0 });
  return event;
}
