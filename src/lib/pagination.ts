export const WORKSPACE_PAGE_SIZE = 24;

export function parsePage(value: unknown) {
  const page = typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value;
  return typeof page === "number" && Number.isSafeInteger(page) && page >= 1 && page <= 10000 ? page : 1;
}

export function pageBounds(total: number, page: number, size = WORKSPACE_PAGE_SIZE) {
  const pages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(Math.max(1, page), pages);
  return { page: current, pages, start: total ? (current - 1) * size + 1 : 0, end: Math.min(current * size, total) };
}
