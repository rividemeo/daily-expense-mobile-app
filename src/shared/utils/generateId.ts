let counter = 0;

export function generateId(prefix: string = 'id'): string {
  counter += 1;
  return `${prefix}_${Date.now()}_${counter}_${Math.random().toString(36).substr(2, 6)}`;
}
