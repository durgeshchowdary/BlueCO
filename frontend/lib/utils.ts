export function downloadCSV(data: Array<Record<string, any>>, filename: string) {
  const rows = data.map((item) =>
    Object.values(item)
      .map((value) => {
        const encoded = String(value ?? '').replace(/"/g, '""');
        return `"${encoded}"`;
      })
      .join(',')
  );

  const header = Object.keys(data[0] ?? {}).map((key) => `"${key}"`).join(',');
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
