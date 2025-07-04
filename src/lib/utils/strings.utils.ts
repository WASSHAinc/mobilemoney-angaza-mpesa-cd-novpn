
export function formatString(input: string, ...args: any[]): string {
  return input.replace(/{(\d+)}/g, (match, number) => {
    return typeof args[number] !== 'undefined' ? args[number] : match;
  });
}
