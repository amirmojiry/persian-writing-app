import {
  normalizePointerSample,
  type InputAdapter,
  type StrokePoint,
  type StrokeSource,
  type StrokeState,
  type Unsubscribe
} from '@persian-writing/core';

export class PointerInputAdapter implements InputAdapter<HTMLElement> {
  readonly id = 'pointer' as const;
  private target: HTMLElement | null = null;
  private activePointerId: number | null = null;
  private startedAt = 0;
  private readonly pointListeners = new Set<(point: StrokePoint) => void>();
  private readonly stateListeners = new Set<(state: StrokeState) => void>();

  async start(target: HTMLElement): Promise<void> {
    await this.stop();
    this.target = target;
    target.addEventListener('pointerdown', this.handlePointerDown);
    target.addEventListener('pointermove', this.handlePointerMove);
    target.addEventListener('pointerup', this.handlePointerUp);
    target.addEventListener('pointercancel', this.handlePointerCancel);
  }

  async stop(): Promise<void> {
    if (this.target !== null) {
      this.target.removeEventListener('pointerdown', this.handlePointerDown);
      this.target.removeEventListener('pointermove', this.handlePointerMove);
      this.target.removeEventListener('pointerup', this.handlePointerUp);
      this.target.removeEventListener('pointercancel', this.handlePointerCancel);
    }
    this.target = null;
    this.activePointerId = null;
  }

  onPoint(listener: (point: StrokePoint) => void): Unsubscribe {
    this.pointListeners.add(listener);
    return () => this.pointListeners.delete(listener);
  }

  onStrokeState(listener: (state: StrokeState) => void): Unsubscribe {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (this.target === null || this.activePointerId !== null) {
      return;
    }
    event.preventDefault();
    this.activePointerId = event.pointerId;
    this.startedAt = event.timeStamp;
    this.target.setPointerCapture?.(event.pointerId);
    this.emitState('down');
    this.emitPoint(event);
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (event.pointerId !== this.activePointerId) {
      return;
    }
    event.preventDefault();
    this.emitState('move');
    this.emitPoint(event);
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    if (event.pointerId !== this.activePointerId) {
      return;
    }
    event.preventDefault();
    this.emitPoint(event);
    this.emitState('up');
    this.target?.releasePointerCapture?.(event.pointerId);
    this.activePointerId = null;
  };

  private readonly handlePointerCancel = (event: PointerEvent): void => {
    if (event.pointerId !== this.activePointerId) {
      return;
    }
    this.emitState('up');
    this.activePointerId = null;
  };

  private emitPoint(event: PointerEvent): void {
    if (this.target === null) {
      return;
    }
    const bounds = this.target.getBoundingClientRect();
    const point = normalizePointerSample({
      clientX: event.clientX,
      clientY: event.clientY,
      elapsedMs: event.timeStamp - this.startedAt,
      source: pointerSource(event.pointerType),
      ...(event.pressure > 0 ? { pressure: event.pressure } : {}),
      ...(event.pointerType === 'pen' ? { tiltX: event.tiltX, tiltY: event.tiltY } : {})
    }, bounds);
    for (const listener of this.pointListeners) {
      listener(point);
    }
  }

  private emitState(state: StrokeState): void {
    for (const listener of this.stateListeners) {
      listener(state);
    }
  }
}

function pointerSource(pointerType: string): StrokeSource {
  if (pointerType === 'pen' || pointerType === 'touch') {
    return pointerType;
  }
  return 'mouse';
}
