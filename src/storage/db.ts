import pg from 'pg';
export const pool = (url: string) => new pg.Pool({ connectionString: url });
