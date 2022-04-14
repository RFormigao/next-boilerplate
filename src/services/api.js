import axios from 'axios';
import { setCookie, parseCookies } from 'nookies';

const failedRequestsQueue = {};
const isRefreshing = {};

let cookies = {};

const forceLogout = (error) => {
  if (process.browser) {
    // WIP: Force Logout on browser
    return null;
  }

  return Promise.reject(error);
};

export const setupApi = (ctx = undefined) => {
  cookies = parseCookies(ctx);

  const cookieMaxAge = 60 * 60 * 24 * 30; // 30 days
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${cookies.auth_token}`,
    Origin: process?.browser ? window.location.origin : `${ctx?.req?.headers?.host}`,
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json',

  };

  const baseURL = process.env.NEXT_PUBLIC_API_CLIENT_URL;

  const api = axios.create({ baseURL, headers });

  api.interceptors.response.use((response) => response, (error) => {
    const { status } = error.response;

    if (status === 401) {
      const originalConfig = error.config;

      cookies = parseCookies(ctx);
      const { refresh_token: refreshToken } = cookies;

      if (!refreshToken) {
        return forceLogout(error);
      }

      const config = {
        headers: {
          authorization: `Bearer ${refreshToken}`,
        },
      };

      if (!isRefreshing[refreshToken]) {
        isRefreshing[refreshToken] = true;

        if (!failedRequestsQueue[refreshToken]) {
          failedRequestsQueue[refreshToken] = [];
        }

        api.get('/refresh-token', config)
          .then((response) => {
            if (response.status !== 200) throw response; // trigger catch
            const updatedToken = response?.data?.token;

            setCookie(ctx, 'auth_token', updatedToken, {
              path: '/',
              maxAge: cookieMaxAge,
              sameSite: 'lax',
            });

            api.defaults.headers.authorization = `Bearer ${updatedToken}`;
            failedRequestsQueue[refreshToken].forEach((request) => request.onSuccess(updatedToken));
          })
          .catch((err) => {
            failedRequestsQueue[refreshToken].forEach((request) => request.onFailure(err));
            forceLogout(err);
          })
          .finally(() => {
            isRefreshing[refreshToken] = false;
            failedRequestsQueue[refreshToken] = [];
          });
      }

      return new Promise((resolve, reject) => {
        failedRequestsQueue[refreshToken].push({
          onSuccess: (token) => {
            originalConfig.headers.authorization = `Bearer ${token}`;
            resolve(api(originalConfig));
          },
          onFailure: (err) => {
            reject(err);
          },
        });
      });
    }

    return error;
  });

  return api;
};

export const request = async ({
  method, url, params, config, ctx = undefined,
}) => {
  try {
    const api = setupApi(ctx);
    const req = {
      get: () => api.get(url, config),
      post: () => api.post(url, params, config),
      put: () => api.put(url, params, config),
      patch: () => api.patch(url, params, config),
      delete: () => api.delete(url, params, config),
    };

    const statusSuccess = [200, 201, 204];
    const response = await req[`${method.toLowerCase()}`]();

    if (statusSuccess.includes(response.status)) {
      return response?.data;
    }

    throw response;
  } catch (e) {
    const json = e?.response?.data;

    return {
      errors: json.errors || [{ message: 'default error' }],
    };
  }
};

export default {};
