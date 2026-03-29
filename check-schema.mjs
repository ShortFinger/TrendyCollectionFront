import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: '39.105.194.247',
  port: 3306,
  user: 'trendy',
  password: 'WhWrcxRmJt8kKaRF',
  database: 'trendy',
});

const [actCols] = await conn.execute('DESCRIBE activity');
console.log('=== activity table columns ===');
actCols.forEach(c => console.log(`  ${c.Field} (${c.Type}) ${c.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${c.Default !== null ? 'DEFAULT ' + c.Default : ''}`));

const [ordCols] = await conn.execute('DESCRIBE orders');
console.log('\n=== orders table columns ===');
ordCols.forEach(c => console.log(`  ${c.Field} (${c.Type}) ${c.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${c.Default !== null ? 'DEFAULT ' + c.Default : ''}`));

await conn.end();
