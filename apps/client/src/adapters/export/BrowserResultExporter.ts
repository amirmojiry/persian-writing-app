import { PDFDocument } from 'pdf-lib';
import {
  createCompositionSvg,
  getCompositionMetrics,
  type ResultFile,
  type ResultFileFormat,
  type WritingSession
} from '@persian-writing/core';

export class BrowserResultExporter {
  createSvgFile(session: WritingSession): ResultFile {
    return Object.freeze({
      name: this.fileName(session, 'svg'),
      mimeType: 'image/svg+xml;charset=utf-8',
      format: 'svg',
      bytes: new TextEncoder().encode(createCompositionSvg(session))
    });
  }

  async createPngBlob(session: WritingSession): Promise<Blob> {
    const metrics = getCompositionMetrics(session.graphemes.length, {}, session.layout);
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

  async createPngFile(session: WritingSession): Promise<ResultFile> {
    return Object.freeze({
      name: this.fileName(session, 'png'),
      mimeType: 'image/png',
      format: 'png',
      bytes: new Uint8Array(await (await this.createPngBlob(session)).arrayBuffer())
    });
  }

  async createPdfBlob(session: WritingSession): Promise<Blob> {
    const metrics = getCompositionMetrics(session.graphemes.length, {}, session.layout);
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

  async createPdfFile(session: WritingSession): Promise<ResultFile> {
    return Object.freeze({
      name: this.fileName(session, 'pdf'),
      mimeType: 'application/pdf',
      format: 'pdf',
      bytes: new Uint8Array(await (await this.createPdfBlob(session)).arrayBuffer())
    });
  }

  async createFile(session: WritingSession, format: ResultFileFormat): Promise<ResultFile> {
    if (format === 'svg') {
      return this.createSvgFile(session);
    }
    return format === 'png'
      ? await this.createPngFile(session)
      : await this.createPdfFile(session);
  }

  fileName(session: WritingSession, extension: ResultFileFormat): string {
    const safeName = session.logicalName
      .normalize('NFC')
      .replace(/[\\/:*?"<>|\s]+/gu, '-')
      .replace(/^-+|-+$/gu, '') || 'persian-name';
    return `${safeName}-writing.${extension}`;
  }
}
