import { describe, expect, it } from 'vitest';
import { landlordLinks, landlordMessage } from '../../../../../src/widgets/landlords/model/landlord-links';
import { configFixture, projectDictionaries } from '../../../../fixtures/site-config-fixture';

const config = configFixture();
const dictionaries = projectDictionaries();

describe('landlord links', () => {
  it('landlordMessage_inRussian_addsVietnameseCopyForOperator', () => {
    const message = landlordMessage(config, dictionaries, 'ru');

    expect(message).toBe(
      'Здравствуйте! Я сдаю квартиры, хочу обсудить регулярную доставку воды.\n\n---\nChào anh/chị! Tôi cho thuê căn hộ và muốn trao đổi về việc giao nước định kỳ.',
    );
  });

  it('landlordMessage_inVietnamese_hasNoCopy', () => {
    expect(landlordMessage(config, dictionaries, 'vi')).not.toContain('---');
  });

  it('landlordLinks_followLanguageOrderAndPrefillWhereSupported', () => {
    const links = landlordLinks(config, dictionaries, 'ru');

    expect(links.map((link) => link.id)).toEqual(['telegram', 'whatsapp', 'zalo']);
    expect(links[0]?.href.startsWith('https://t.me/mywater_danang_demo?text=')).toBe(true);
    expect(links[2]?.href).toBe('https://zalo.me/0000000000');
  });
});
