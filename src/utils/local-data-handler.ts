import { Storage } from '../contstants/storage';
import { deleteCookie } from './storage/cookie-storage';

export const deleteLocalData = (options?: { redirectUrl?: string }) => {
  deleteCookie(Storage.token);
  deleteCookie(Storage.refresh_token);

  if (options?.redirectUrl) {
    window.location.href = options?.redirectUrl;
  } else {
    window.location.reload();
  }
};
