// Utility to create a slug from a string
export function slugify(str: string): string {
  return str.replace(/[^a-zA-Z0-9]+/g, '-').replace(/(^-|-$)/g, '').toLowerCase();
}
