type QueryValue = string | number | boolean | null | undefined;

export type QueryParams = Record<string, QueryValue | QueryValue[]>;

export function buildQueryString(params: QueryParams = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    const values = Array.isArray(value) ? value : [value];

    values.forEach((item) => {
      if (item === null || item === undefined || item === "") {
        return;
      }

      searchParams.append(key, String(item));
    });
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}
