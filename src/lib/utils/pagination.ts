/**
 * Números de página visibles en la paginación: primera, última y las
 * vecinas de la actual. `null` representa un salto ("…").
 */
export function getPageWindow(current: number, total: number, siblings = 1): (number | null)[] {
  if (total <= 1) return [1];
  const pages = new Set<number>([1, total]);
  for (let page = current - siblings; page <= current + siblings; page++) {
    if (page >= 1 && page <= total) pages.add(page);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | null)[] = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push(null);
    result.push(page);
  });
  return result;
}
