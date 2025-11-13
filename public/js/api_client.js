<!-- public/js/api_client.js -->
<script>
(function(){
  const API_BASE = (window.API_BASE || '/.netlify/functions').replace(/\/+$/,'');
  const USE_COOKIES = false; // mude para true se a API usar cookie de sessão

  async function request(path, { method='GET', headers={}, body=null, credentials } = {}){
    const url = path.startsWith('http') ? path : `${API_BASE}/${path.replace(/^\/+/,'')}`;
    const opts = { method, headers: { ...headers }, body };
    if (credentials || USE_COOKIES) opts.credentials = 'include';

    if (body && !opts.headers['Content-Type']) {
      opts.headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, opts);
    const ct = res.headers.get('content-type') || '';
    const text = await res.text();

    // tenta parsear JSON sempre que possível
    let data = null;
    if (ct.includes('application/json') || /^[\[\{]/.test(text.trim())){
      try { data = JSON.parse(text); } catch {}
    }

    if (!res.ok) {
      const msg = (data && (data.error || data.message)) ? (data.error || data.message) : text.slice(0,200);
      const err = new Error(`HTTP ${res.status}: ${msg}`);
      err.status = res.status;
      err.body = text;
      throw err;
    }
    return (data ?? text);
  }

  // ---------- AUTH ----------
  async function login(email, pwd){
    return await request('auth_login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pwd })
    });
  }
  async function me(){ return await request('auth_me'); }
  async function logout(){
    await request('auth_logout', { method: 'POST' });
    return true;
  }

  // ---------- USERS ----------
  async function usersList(){ return await request('users_list'); }
  async function usersInsert({ name, email, password, role='User' }){
    return await request('users_insert', { method: 'POST', body: JSON.stringify({ name, email, password, role }) });
  }
  async function usersUpdate(payload){ // {id, name?, email?, role? ...}
    return await request('users_update', { method: 'POST', body: JSON.stringify(payload) });
  }
  async function usersDelete({ id }){
    return await request('users_delete', { method: 'POST', body: JSON.stringify({ id }) });
  }

  // ---------- CORRETORAS ----------
  async function corretorasList(){ return await request('corretoras_list'); }
  async function corretorasInsert(payload){
    return await request('corretoras_insert', { method: 'POST', body: JSON.stringify(payload) });
  }
  async function corretorasUpdate(payload){
    return await request('corretoras_update', { method: 'POST', body: JSON.stringify(payload) });
  }
  async function corretorasDelete({ id }){
    return await request('corretoras_delete', { method: 'POST', body: JSON.stringify({ id }) });
  }

  // ---------- ATENDIMENTOS ----------
  async function atendimentosList(){ return await request('atendimentos_list'); }
  async function atendimentosInsert(payload){
    return await request('atendimentos_insert', { method: 'POST', body: JSON.stringify(payload) });
  }
  async function atendimentosUpdate(payload){
    return await request('atendimentos_update', { method: 'POST', body: JSON.stringify(payload) });
  }
  async function atendimentosDelete({ id }){
    return await request('atendimentos_delete', { method: 'POST', body: JSON.stringify({ id }) });
  }

  // ---------- LEADS (se você usar no front) ----------
  async function leadsList(){ return await request('leads_list'); }
  async function leadsInsert(payload){
    return await request('leads_insert', { method: 'POST', body: JSON.stringify(payload) });
  }

  const api = {
    // auth
    login, me, logout,
    // users
    usersList, usersInsert, usersUpdate, usersDelete,
    // corretoras
    corretorasList, corretorasInsert, corretorasUpdate, corretorasDelete,
    // atendimentos
    atendimentosList, atendimentosInsert, atendimentosUpdate, atendimentosDelete,
    // leads
    leadsList, leadsInsert,
  };

  // expõe nos dois nomes para compatibilidade
  window.API = api;
  window.api = api;
})();
</script>

