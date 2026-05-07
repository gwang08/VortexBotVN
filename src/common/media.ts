import { InputMediaPhoto } from 'telegraf/types';
import { IMAGES } from './constants';
import * as fs from 'fs';

// Helper to create InputMediaPhoto from file path
function photo(filePath: string, caption?: string): InputMediaPhoto {
  if (!fs.existsSync(filePath)) {
    return { type: 'photo', media: filePath, caption };
  }
  return {
    type: 'photo',
    media: { source: filePath },
    caption,
  };
}

// PU Prime IB transfer guide (4 photos from grok/5-8.jpg)
export function puPrimeTransferMedia(): InputMediaPhoto[] {
  return [
    photo(IMAGES.grok.transfer1),
    photo(IMAGES.grok.transfer2),
    photo(IMAGES.grok.transfer3),
    photo(IMAGES.grok.transfer4),
  ];
}
