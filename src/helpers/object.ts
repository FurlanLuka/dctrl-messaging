export function deduplicate(
  first: Record<string, unknown>,
  second: Record<string, unknown>
) {
  Object.keys(second).forEach((val) => {
    if (first[val] === undefined) {
      first[val] = second[val];
    }
  });

  return first;
}
