import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, expect, it } from 'vitest';
import WritingCanvas from '../src/components/WritingCanvas.vue';

describe('WritingCanvas pointer completion', () => {
  it('commits reactive pointer samples as a plain emitted stroke', async () => {
    const wrapper = mount(WritingCanvas, {
      props: { letter: 'ل', initialStrokes: [] }
    });
    await nextTick();

    const surface = wrapper.get<HTMLElement>('[data-testid="writing-surface"]').element;
    Object.defineProperty(surface, 'getBoundingClientRect', {
      value: () => ({
        left: 0,
        top: 0,
        width: 200,
        height: 100,
        right: 200,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON() {}
      })
    });
    Object.defineProperty(surface, 'setPointerCapture', { value: () => undefined });
    Object.defineProperty(surface, 'releasePointerCapture', { value: () => undefined });

    surface.dispatchEvent(pointerEvent('pointerdown', {
      pointerId: 1,
      pointerType: 'touch',
      clientX: 20,
      clientY: 20,
      pressure: 0.5,
      timeStamp: 10
    }));
    surface.dispatchEvent(pointerEvent('pointermove', {
      pointerId: 1,
      pointerType: 'touch',
      clientX: 100,
      clientY: 50,
      pressure: 0.5,
      timeStamp: 20
    }));
    surface.dispatchEvent(pointerEvent('pointerup', {
      pointerId: 1,
      pointerType: 'touch',
      clientX: 180,
      clientY: 80,
      pressure: 0.5,
      timeStamp: 30
    }));
    await nextTick();

    const emitted = wrapper.emitted('update:strokes')?.[0]?.[0];
    expect(emitted).toHaveLength(1);
    expect(() => structuredClone(emitted)).not.toThrow();
    expect(wrapper.findAll('.child-stroke')).toHaveLength(1);
  });
});

function pointerEvent(type: string, values: Record<string, string | number>): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  for (const [key, value] of Object.entries(values)) {
    Object.defineProperty(event, key, { value });
  }
  Object.defineProperty(event, 'tiltX', { value: 0 });
  Object.defineProperty(event, 'tiltY', { value: 0 });
  return event;
}
