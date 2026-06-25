function csvCell(val: unknown): string {
  if (val === null || val === undefined) return '';
  const s = Array.isArray(val) ? val.join('|') : String(val);
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function downloadCSV(filename: string, rows: Record<string, unknown>[]): void {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.map(csvCell).join(','),
    ...rows.map(row => headers.map(h => csvCell(row[h])).join(',')),
  ];
  triggerDownload(filename + '.csv', lines.join('\r\n'), 'text/csv;charset=utf-8;');
}

export function downloadSQL(filename: string, table: string, rows: Record<string, unknown>[]): void {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const cols = headers.map(h => `"${h}"`).join(', ');
  const statements = rows.map(row => {
    const vals = headers.map(h => {
      const v = row[h];
      if (v === null || v === undefined) return 'NULL';
      if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
      if (typeof v === 'number') return String(v);
      if (Array.isArray(v)) return `'${v.join('|').replace(/'/g, "''")}'`;
      return `'${String(v).replace(/'/g, "''")}'`;
    });
    return `INSERT INTO "${table}" (${cols}) VALUES (${vals.join(', ')});`;
  });
  const sql = `-- Export: ${table} (${rows.length} rows)\n-- Generated: ${new Date().toISOString()}\n\n` + statements.join('\n');
  triggerDownload(filename + '.sql', sql, 'text/sql;charset=utf-8;');
}

function triggerDownload(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
