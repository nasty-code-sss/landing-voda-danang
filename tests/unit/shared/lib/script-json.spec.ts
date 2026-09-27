import { describe, expect, it } from 'vitest';
import { scriptJson } from '../../../../src/shared/lib/script-json';

describe('scriptJson', () => {
  it('scriptJson_withClosingScriptTag_escapesOpeningBracket', () => {
    const serialized = scriptJson({ text: '</script><script>alert(1)</script>' });

    expect(serialized).not.toContain('</script>');
    expect(JSON.parse(serialized)).toEqual({ text: '</script><script>alert(1)</script>' });
  });
});
