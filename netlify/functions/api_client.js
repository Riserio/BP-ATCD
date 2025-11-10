/**
 * api_client.js
 * Cliente de API para o front-end (Netlify Functions).
 * Ajustado para usar /.netlify/functions/* e tratar erros com detalhes.
 */
(function(){
  const API_BASE = window.API_BASE || '/.netlify/functions';
  const USE_COOKIES = false; // true se sua API setar cookie de sessão

  async function responseToError(res){
    let body = '';
    try { body = await res.text(); } catch {}
    const trimmed = (body || '').slice(0, 300);
    const msg = `HTTP ${res.status} ${res.statusText}${trimmed ? ' – ' + trimmed : ''}`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = trimmed;
    return err;
  }

  const api = {
    async login(email, senha){
      // Fallback DEV aceito no backend: admin/admin
      const res = await fetch(`${API_BASE}/auth_login`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        credentials: USE_COOKIES ? 'include' : 'same-origin',
        body: JSON.stringify({ email, senha })
      });
      if (!res.ok) throw await responseToError(res);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Falha de login');
      if (!data.token && !USE_COOKIES) throw new Error('Login OK, mas não veio token.');
      return data;
    },

    async logout(){
      const res = await fetch(`${API_BASE}/auth_logout`, {
        method: 'POST',
        credentials: USE_COOKIES ? 'include' : 'same-origin'
      });
      if (!res.ok) throw await responseToError(res);
      return true;
    },

    // Exemplos de chamadas já compatíveis com suas funções existentes
    async listarCorretoras(){
      const res = await fetch(`${API_BASE}/corretoras_list`);
      if (!res.ok) throw await responseToError(res);
      return res.json();
    },
    async inserirCorretora(payload){
      const res = await fetch(`${API_BASE}/corretoras_insert`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw await responseToError(res);
      return res.json();
    },
    async atualizarCorretora(payload){
      const res = await fetch(`${API_BASE}/corretoras_update`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw await responseToError(res);
      return res.json();
    },
    async deletarCorretora(id){
      const res = await fetch(`${API_BASE}/corretoras_delete`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw await responseToError(res);
      return res.json();
    },
    async listarLeads(){
      const res = await fetch(`${API_BASE}/leads_list`);
      if (!res.ok) throw await responseToError(res);
      return res.json();
    },
    async inserirLead(payload){
      const res = await fetch(`${API_BASE}/leads_insert`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw await responseToError(res);
      return res.json();
    }
  };

  // expõe globalmente
  window.api = api;
})();
