/* Frontend API client */

const API_BASE = '/api';

const API = {
  _token: localStorage.getItem('token') || null,

  setToken(t) {
    this._token = t;
    if (t) localStorage.setItem('token', t);
    else localStorage.removeItem('token');
  },

  async request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (this._token) headers['Authorization'] = 'Bearer ' + this._token;
    const res = await fetch(API_BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status, data });
    return data;
  },

  get:    (path)        => API.request('GET',    path),
  post:   (path, body)  => API.request('POST',   path, body),
  put:    (path, body)  => API.request('PUT',    path, body),
  delete: (path)        => API.request('DELETE', path),
};

Object.assign(window, { API });
