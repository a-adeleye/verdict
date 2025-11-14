export function formatInitials(displayName: string): string {
  return displayName
    .split(' ')
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2);
}
