# Agregar columna criteria_list a tabla modules

## Opción 1: Via Supabase Console (Recomendado)

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Va a **SQL Editor** (en el panel izquierdo)
4. Copia y pega este SQL:

```sql
ALTER TABLE modules ADD COLUMN IF NOT EXISTS criteria_list jsonb;
```

5. Haz click en **Run** (o presiona Ctrl+Enter)
6. Deberías ver: `Success. No rows returned`

## Opción 2: Via pgAdmin (si tienes acceso)

1. Conéctate a tu base de datos Postgres
2. Ejecuta el mismo SQL anterior

## Después de agregar la columna:

Una vez agregada, ejecuta:

```bash
node scripts/updateModulesContent.mjs
```

Para actualizar los módulos con los criteria_list:

```bash
node scripts/seedChallenges.mjs
```

## Verificación

```bash
node scripts/verifyModules.js
```

Deberías ver los módulos con sus criterios de completación.
