import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.spec.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: [
        'src/entities/**/*.ts',
        'src/features/*/model/**/*.ts',
        'src/widgets/*/model/**/*.ts',
        'src/shared/config/**/*.ts',
        'src/shared/i18n/**/*.ts',
        'src/shared/lib/**/*.ts',
      ],
      reporter: ['text-summary', 'json-summary'],
      thresholds: { statements: 90, branches: 84, functions: 94, lines: 90 },
    },
  },
});
