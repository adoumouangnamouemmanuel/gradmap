const formatters = new Map<string, Intl.DateTimeFormat>();
function formatter(timezone: string, clock = false) {
  const key = (clock ? "clock:" : "day:") + timezone;
  const cached = formatters.get(key); if (cached) return cached;
  const value = new Intl.DateTimeFormat("en-GB", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", ...(clock ? { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" } as const : {}) });
  if (formatters.size >= 32) { const first = formatters.keys().next().value; if (first) formatters.delete(first); }
  formatters.set(key, value); return value;
}

export function validTimezone(value: string): boolean {
  try {
    formatter(value).format();
    return true;
  } catch {
    return false;
  }
}

export function dateKey(value: Date | string, timezone: string): string {
  const parts = formatter(timezone).formatToParts(new Date(value));
  const part = (type: string) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function clockParts(value: Date, timezone: string) {
  const parts = formatter(timezone, true).formatToParts(value);
  const part = (type: string) => Number(parts.find((item) => item.type === type)?.value);
  return Date.UTC(
    part("year"),
    part("month") - 1,
    part("day"),
    part("hour"),
    part("minute"),
    part("second"),
  );
}

/** Convert a wall-clock entry in the selected IANA timezone, rejecting DST ambiguity. */
export function localToInstant(value: string, timezone: string): string {
  if (!validTimezone(timezone)) throw new Error("Choose a valid timezone.");
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/.test(value)) {
    const wallDate = new Date(`${value.slice(0, 10)}T00:00:00Z`);
    if (
      !Number.isFinite(wallDate.getTime()) ||
      wallDate.toISOString().slice(0, 10) !== value.slice(0, 10)
    )
      throw new Error("Choose a valid date and time.");
    const instant = new Date(value);
    if (!Number.isFinite(instant.getTime())) throw new Error("Choose a valid date and time.");
    return instant.toISOString();
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!match) throw new Error("Choose a valid date and time.");
  const [year, month, day, hour, minute, second] = match.slice(1).map((part) => Number(part || 0));
  const wall = Date.UTC(year, month - 1, day, hour, minute, second);
  if (
    new Date(wall).toISOString().slice(0, 19) !==
    `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${String(second).padStart(2, "0")}`
  )
    throw new Error("Choose a valid date and time.");
  const candidates = new Set<number>();
  for (const shift of [-86400000, 0, 86400000]) {
    const sample = wall + shift;
    const candidate = wall - (clockParts(new Date(sample), timezone) - sample);
    if (clockParts(new Date(candidate), timezone) === wall) candidates.add(candidate);
  }
  if (candidates.size !== 1)
    throw new Error(
      candidates.size
        ? "This time occurs twice when clocks change. Choose an unambiguous time."
        : "This time does not exist when clocks change. Choose another time.",
    );
  return new Date([...candidates][0]).toISOString();
}

export function monthDays(month: string): string[] {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error("Invalid calendar month.");
  const [year, number] = month.split("-").map(Number);
  const first = new Date(Date.UTC(year, number - 1, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, index) =>
    new Date(first.getTime() + (index - offset) * 86400000).toISOString().slice(0, 10),
  );
}

export function moveMonth(month: string, amount: number): string {
  const [year, number] = month.split("-").map(Number);
  return new Date(Date.UTC(year, number - 1 + amount, 1)).toISOString().slice(0, 7);
}
