import { invoke } from '@tauri-apps/api/core';
import { save as saveDialog } from '@tauri-apps/plugin-dialog';
import { openPath } from '@tauri-apps/plugin-opener';
import type {
  FileDeliveryOutcome,
  ResultDeliveryPort,
  ResultFile
} from '@persian-writing/core';

export class TauriResultDeliveryAdapter implements ResultDeliveryPort {
  readonly runtime = 'desktop' as const;

  async save(file: ResultFile): Promise<FileDeliveryOutcome> {
    const path = await saveDialog({
      defaultPath: file.name,
      filters: [{
        name: labelFor(file),
        extensions: [file.format]
      }]
    });
    if (path === null) {
      return 'cancelled';
    }
    await invoke<string>('write_export_file', {
      path,
      bytes: Array.from(file.bytes)
    });
    return 'saved';
  }

  async print(file: ResultFile): Promise<FileDeliveryOutcome> {
    const path = await this.cache(file);
    try {
      await invoke('print_export', { path });
      return 'printed';
    } catch {
      await openPath(path);
      return 'opened';
    }
  }

  async share(file: ResultFile): Promise<FileDeliveryOutcome> {
    const path = await this.cache(file);
    await openPath(path);
    return 'opened';
  }

  private async cache(file: ResultFile): Promise<string> {
    return await invoke<string>('cache_export_file', {
      fileName: file.name,
      bytes: Array.from(file.bytes)
    });
  }
}

function labelFor(file: ResultFile): string {
  if (file.format === 'pdf') {
    return 'PDF document';
  }
  return file.format === 'png' ? 'PNG image' : 'SVG image';
}
