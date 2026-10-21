# Avaliações

Avaliação anual dos técnicos pelos engenheiros.

- Cada engenheiro avalia todos os técnicos (6 critérios ponderados, escala Mau → Excelente, comentário por critério).
- Nota final /7, com a mesma fórmula da folha Excel: `Σ(desempenho × peso) × 7 / 100`.
- As avaliações podem ser editadas até ao prazo do período.
- Só o administrador vê os resultados: média de todos os engenheiros, distribuição por critério, comentários e a avaliação de cada engenheiro. Exportação para Excel.
- Os técnicos não têm acesso.

## Stack

Next.js 14 · Supabase (base de dados + login por email) · Vercel

## Setup

### 1. Supabase (projecto novo)

1. Criar um projecto novo em [supabase.com](https://supabase.com).
2. **SQL Editor** → colar e correr `supabase/migrations/001_init.sql`.
3. **SQL Editor** → colar e correr `supabase/seed.sql` (período 2026, critérios da folha actual e lista de técnicos).
4. **Authentication → Users → Add user** → criar o teu utilizador com o teu email.
5. **SQL Editor** → tornar-te administrador:
   ```sql
   update profiles set role = 'admin', name = 'O teu nome' where email = 'o-teu@email.pt';
   ```
6. **Authentication → URL Configuration** → em *Site URL* pôr o endereço do Vercel (passo 2) e em *Redirect URLs* adicionar `https://<o-teu-site>.vercel.app/auth/callback` e `http://localhost:3000/auth/callback`.
7. **Project Settings → API** → copiar *Project URL*, *anon key* e *service_role key*.

### 2. Vercel (projecto novo)

1. **Add New → Project** → importar o repositório `evals`.
2. Em *Environment Variables* adicionar:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Deploy.

### 3. Usar

1. Entrar no site com o teu email (recebes um link).
2. **Equipa** → adicionar os engenheiros (nome + email).
3. **Períodos** → confirmar o prazo e os pesos.
4. Enviar o endereço do site aos engenheiros: entram com o email e avaliam.
5. **Resultados** → acompanhar o progresso e ver as notas.

Para o ano seguinte: **Períodos → Criar período** (copia os critérios e pesos do último).

## Desenvolvimento local

```bash
npm install
cp .env.local.example .env.local   # preencher com as chaves do Supabase
npm run dev
```
