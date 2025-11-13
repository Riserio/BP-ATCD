import { neon } from '@netlify/neon';

// Usa automaticamente a variável NETLIFY_DATABASE_URL
// (definida no painel do Netlify OU criada automaticamente pelo Netlify DB)
export const sql = neon();
