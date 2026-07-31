import type {
  FileDeliveryOutcome,
  ResultDeliveryPort,
  ResultFile
} from '@persian-writing/core';

export class BrowserResultDeliveryAdapter implements ResultDeliveryPort {
  readonly runtime = 'browser' as const;

  async save(file: ResultFile): Promise<FileDeliveryOutcome> {
    downloadFile(file);
    return 'saved';
  }

  async print(_file: ResultFile): Promise<FileDeliveryOutcome> {
    window.print();
    return 'printed';
  }

  async share(file: ResultFile): Promise<FileDeliveryOutcome> {
    const browserFile = new File([copyBuffer(file.bytes)], file.name, { type: file.mimeType });
    const shareData: ShareData = {
      title: file.name,
      files: [browserFile]
    };

    if (typeof navigator.share === 'function'
      && (typeof navigator.canShare !== 'function' || navigator.canShare(shareData))) {
      await navigator.share(shareData);
      return 'shared';
    }

    downloadFile(file);
    return 'saved';
  }
}

function downloadFile(file: ResultFile): void {
  const blob = new Blob([copyBuffer(file.bytes)], { type: file.mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.rel = 'noopener';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function copyBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}
