import { PDFDocument } from 'pdf-lib';
import {
  createCompositionSvg,
  getCompositionMetrics,
  type WritingSession
} from '@persian-writing/core';

export type ShareOutcome = 'shared' | 'downloaded';

export class BrowserResultExporter {
  async createPngBlob(session: WritingSession): Promise<Blob> {
    const metrics = getCompositionMetrics(session.graphemes.length);
    const svg = createCompositionSvg(session);
    const source = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const sourceUrl = URL.createObjectURL(source);

    try {
      const image = document.createElement('img');
      image.decoding = 'async';
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('The result image could not be rendered.'));
        image.src = sourceUrl;
      });

      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = metrics.width * scale;
      canvas.height = metrics.height * scale;
      const context = canvas.getContext('2d');
      if (context === null) {
        throw new Error('Canvas export is not available.');
      }
      context.setTransform(scale, 0, 0, scale, 0, 0);
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, metrics.width, metrics.height);
      context.drawImage(image, 0, 0, metrics.width, metrics.height);

      return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob === null) {
            reject(new Error('PNG export failed.'));
            return;
          }
          resolve(blob);
        }, 'image/png');
      });
    } finally {
      URL.revokeObjectURL(sourceUrl);
    }
  }

  async createPdfBlob(session: WritingSession): Promise<Blob> {
    const metrics = getCompositionMetrics(session.graphemes.length);
    const png = await this.createPngBlob(session);
    const pdf = await PDFDocument.create();
    const image = await pdf.embedPng(await png.arrayBuffer());
    const page = pdf.addPage([metrics.width, metrics.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: metrics.width,
      height: metrics.height
    });
    const bytes = await pdf.save({ useObjectStreams: false });
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    return new Blob([copy.buffer], { type: 'application/pdf' });
  }

  downloadSvg(session: WritingSession): void {
    this.downloadBlob(
      new Blob([createCompositionSvg(session)], { type: 'image/svg+xml;charset=utf-8' }),
      this.fileName(session, 'svg')
    );
  }

  async downloadPng(session: WritingSession): Promise<void> {
    this.downloadBlob(await this.createPngBlob(session), this.fileName(session, 'png'));
  }

  async downloadPdf(session: WritingSession): Promise<void> {
    this.downloadBlob(await this.createPdfBlob(session), this.fileName(session, 'pdf'));
  }

  async share(session: WritingSession): Promise<ShareOutcome> {
    const png = await this.createPngBlob(session);
    const file = new File([png], this.fileName(session, 'png'), { type: 'image/png' });
    const shareData: ShareData = {
      title: session.logicalName,
      text: session.logicalName,
      files: [file]
    };

    if (typeof navigator.share === 'function'
      && (typeof navigator.canShare !== 'function' || navigator.canShare(shareData))) {
      await navigator.share(shareData);
      return 'shared';
    }

    this.downloadBlob(png, file.name);
    return 'downloaded';
  }

  fileName(session: WritingSession, extension: 'svg' | 'png' | 'pdf'): string {
    const safeName = session.logicalName
      .normalize('NFC')
      .replace(/[\\/:*?"<>|\s]+/gu, '-')
      .replace(/^-+|-+$/gu, '') || 'persian-name';
    return `${safeName}-writing.${extension}`;
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.rel = 'noopener';
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}
