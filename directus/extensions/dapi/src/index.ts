import { defineEndpoint } from '@directus/extensions-sdk';
import { Router } from 'express';

export default defineEndpoint((router: Router, context) => {
  const { database, logger } = context;

  // GET /dapi/schema/tables - List all tables with row counts
  router.get('/schema/tables', async (_req, res) => {
    try {
      const tables = await database.raw(`
        SELECT
          t.table_schema as schema,
          t.table_name as name,
          t.table_type as type,
          COALESCE(s.n_live_tup, 0)::integer as row_count
        FROM information_schema.tables t
        LEFT JOIN pg_stat_user_tables s
          ON t.table_name = s.relname
          AND t.table_schema = s.schemaname
        WHERE t.table_schema NOT IN ('pg_catalog', 'information_schema')
          --AND t.table_name NOT LIKE 'directus_%'
        ORDER BY t.table_schema, t.table_name
      `);

      res.json({
        tables: tables.rows
      });
    } catch (error) {
      logger.error('Error fetching tables:', error);
      res.status(500).json({ error: 'Failed to fetch tables' });
    }
  });

  // GET /dapi/schema/tables/:tableName - Get table structure
  router.get('/schema/tables/:tableName', async (req, res) => {
    const { tableName } = req.params;
    const schema = (req.query.schema as string) || 'public';

    try {
      // Get columns
      const columns = await database.raw(`
        SELECT
          c.column_name as name,
          c.data_type as type,
          c.udt_name as udt_type,
          c.character_maximum_length as max_length,
          c.numeric_precision as precision,
          c.numeric_scale as scale,
          c.is_nullable = 'YES' as is_nullable,
          c.column_default as default_value,
          c.ordinal_position as position,
          (
            SELECT col_description(oid, c.ordinal_position)
            FROM pg_class
            WHERE relname = c.table_name
              AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = c.table_schema)
          ) as comment
        FROM information_schema.columns c
        WHERE c.table_schema = ?
          AND c.table_name = ?
        ORDER BY c.ordinal_position
      `, [schema, tableName]);

      if (columns.rows.length === 0) {
        res.status(404).json({ error: `Table '${tableName}' not found in schema '${schema}'` });
        return;
      }

      // Get constraints (primary keys, foreign keys, unique)
      const constraints = await database.raw(`
        SELECT
          tc.constraint_name as name,
          tc.constraint_type as type,
          kcu.column_name,
          ccu.table_schema as foreign_table_schema,
          ccu.table_name as foreign_table_name,
          ccu.column_name as foreign_column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        LEFT JOIN information_schema.constraint_column_usage ccu
          ON tc.constraint_name = ccu.constraint_name
          AND tc.constraint_type = 'FOREIGN KEY'
        WHERE tc.table_schema = ?
          AND tc.table_name = ?
        ORDER BY tc.constraint_type, tc.constraint_name
      `, [schema, tableName]);

      // Get indexes
      const indexes = await database.raw(`
        SELECT
          indexname as name,
          indexdef as definition
        FROM pg_indexes
        WHERE schemaname = ?
          AND tablename = ?
        ORDER BY indexname
      `, [schema, tableName]);

      // Organize constraints by type
      const primaryKey: string[] = [];
      const foreignKeys: Array<{
        name: string;
        column: string;
        references: { schema: string; table: string; column: string };
      }> = [];
      const uniqueConstraints: Array<{ name: string; columns: string[] }> = [];

      const uniqueMap = new Map<string, string[]>();

      for (const constraint of constraints.rows) {
        switch (constraint.type) {
          case 'PRIMARY KEY':
            primaryKey.push(constraint.column_name);
            break;
          case 'FOREIGN KEY':
            foreignKeys.push({
              name: constraint.name,
              column: constraint.column_name,
              references: {
                schema: constraint.foreign_table_schema,
                table: constraint.foreign_table_name,
                column: constraint.foreign_column_name
              }
            });
            break;
          case 'UNIQUE':
            if (!uniqueMap.has(constraint.name)) {
              uniqueMap.set(constraint.name, []);
            }
            uniqueMap.get(constraint.name)!.push(constraint.column_name);
            break;
        }
      }

      for (const [name, cols] of uniqueMap) {
        uniqueConstraints.push({ name, columns: cols });
      }

      res.json({
        schema,
        table: tableName,
        columns: columns.rows,
        primaryKey,
        foreignKeys,
        uniqueConstraints,
        indexes: indexes.rows
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error fetching table structure for ${tableName}: ${errorMessage}`);
      res.status(500).json({ error: 'Failed to fetch table structure', details: errorMessage });
    }
  });
});
