export function pad(value: string | number, width: number): string {
    const s = String(value);
    return s + ' '.repeat(Math.max(0, width - s.length));
}

/**
 * Renders a GFM-style Markdown table, column-padded so it's also legible unrendered
 * (a terminal, a .snap file, a plain-text diff).
 */
export function markdownTable(
    headers: string[],
    rows: (string | number)[][]
): string {
    const widths = headers.map((h, i) =>
        Math.max(h.length, ...rows.map((r) => String(r[i]).length))
    );
    const line = (cells: (string | number)[]) =>
        `| ${cells.map((c, i) => pad(c, widths[i])).join(' | ')} |`;
    const sep = `|${widths.map((w) => '-'.repeat(w + 2)).join('|')}|`;
    return [line(headers), sep, ...rows.map(line)].join('\n');
}
