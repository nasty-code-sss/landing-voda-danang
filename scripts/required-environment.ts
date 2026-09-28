export function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(`${name} is not set, see .env.example`);
  }
  return value;
}
