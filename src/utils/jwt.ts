import { JwtDecodeOptions, jwtDecode } from 'jwt-decode';

export const decodeJwt = (token: string, option: { complete?: boolean }) => {
  if (!token) return null;

  const options: JwtDecodeOptions | undefined = option.complete
    ? { header: true }
    : { header: false };

  try {
    return jwtDecode(token, options) || null;
  } catch (error) {
    return null;
  }
};

export const isAuthenticatedJwt = (token: string) => {
  return !!token;

  // const decoder: any = decodeJwt(token, {
  //   complete: false,
  // });

  // if (Date.now() >= decoder?.exp * 1000) {
  //   return false;
  // }

  // return true;
};
