export type CsvRow = Record<string, string>;

const normalizeHeader = (value: string) => value.trim().replace(/\s+/g, '').toLowerCase();

export function parseCSV(text: string): CsvRow[] {
  const rows: string[][] = [];
  let current = '';
  let row: string[] = [];
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(current.trim());
      current = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(current.trim());
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      current = '';
    } else {
      current += char;
    }
  }

  row.push(current.trim());
  if (row.some((cell) => cell.length > 0)) rows.push(row);

  const [headers, ...dataRows] = rows;
  if (!headers?.length) return [];

  const normalizedHeaders = headers.map(normalizeHeader);

  return dataRows.map((cells) =>
    normalizedHeaders.reduce<CsvRow>((record, header, index) => {
      record[header] = cells[index]?.trim() ?? '';
      return record;
    }, {}),
  );
}

export async function parseCSVFile(file: File) {
  if (!file.name.toLowerCase().endsWith('.csv')) {
    throw new Error('Please choose a CSV file.');
  }

  const text = await file.text();
  const rows = parseCSV(text);

  if (!rows.length) {
    throw new Error('The selected CSV file does not contain any rows.');
  }

  if (rows.length > 1000) {
    throw new Error('Please import 1,000 rows or fewer at a time.');
  }

  return rows;
}

export function missingFields(row: CsvRow, fields: string[]) {
  return fields.filter((field) => !row[normalizeHeader(field)]);
}

export function csvValue(row: CsvRow, field: string) {
  return row[normalizeHeader(field)] ?? '';
}
