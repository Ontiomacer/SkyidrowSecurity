
export class DownloadService {
  static downloadJSON(data: any, filename: string) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    this.downloadBlob(blob, `${filename}.json`);
  }

  static downloadCSV(data: any, filename: string) {
    let csvContent = '';
    
    if (Array.isArray(data)) {
      // Handle array of objects
      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        csvContent = headers.join(',') + '\n';
        
        data.forEach(row => {
          const values = headers.map(header => {
            const value = row[header];
            return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
          });
          csvContent += values.join(',') + '\n';
        });
      }
    } else {
      // Handle single object
      csvContent = 'Key,Value\n';
      Object.entries(data).forEach(([key, value]) => {
        const stringValue = typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        csvContent += `"${key}",${stringValue}\n`;
      });
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    this.downloadBlob(blob, `${filename}.csv`);
  }

  static downloadTXT(data: any, filename: string) {
    let textContent = '';
    
    if (typeof data === 'string') {
      textContent = data;
    } else {
      textContent = JSON.stringify(data, null, 2);
    }
    
    const blob = new Blob([textContent], { type: 'text/plain' });
    this.downloadBlob(blob, `${filename}.txt`);
  }

  private static downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static generateFilename(tool: string, target: string): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const cleanTarget = target.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
    return `${tool}_${cleanTarget}_${timestamp}`;
  }
}
