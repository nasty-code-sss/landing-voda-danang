import { describe, expect, it } from 'vitest';
import { escapeHtml, foreignText } from '../../../../src/shared/lib/html-escape';

describe('escapeHtml', () => {
  it('escapeHtml_withMarkup_escapesAllSpecialCharacters', () => {
    expect(escapeHtml(`<b class="x">Tom & Jerry's</b>`)).toBe('&lt;b class=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/b&gt;');
  });

  it('foreignText_wrapsEscapedTextInLanguageSpan', () => {
    expect(foreignText('Mỹ An & <Khuê Mỹ>', 'vi')).toBe('<span lang="vi">Mỹ An &amp; &lt;Khuê Mỹ&gt;</span>');
  });
});
