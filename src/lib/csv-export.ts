export type CsvColumn<T> = {
  key: keyof T;
  header: string;
  transform?: (value: unknown, row: T) => string;
};

function escapeCsvCell(value: unknown) {
  if (value == null) return "";
  const text = String(value);
  const escaped = text.replace(/"/g, '""');
  if (/[",\n]/.test(escaped)) {
    return `"${escaped}"`;
  }
  return escaped;
}

export function downloadCSV<T>(
  data: T[],
  columns: CsvColumn<T>[],
  filename: string
) {
  const headerRow = columns.map((column) => escapeCsvCell(column.header)).join(",");
  const bodyRows = data.map((row) =>
    columns
      .map((column) => {
        const rawValue = row[column.key];
        const value = column.transform ? column.transform(rawValue, row) : rawValue;
        return escapeCsvCell(value);
      })
      .join(",")
  );

  const csv = `\ufeff${[headerRow, ...bodyRows].join("\n")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
