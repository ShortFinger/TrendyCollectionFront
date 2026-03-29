import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: '39.105.194.247',
  port: 3306,
  user: 'trendy',
  password: 'WhWrcxRmJt8kKaRF',
  database: 'trendy',
  connectTimeout: 30000,
});

const [activities] = await conn.execute(
  'SELECT id, title, status, is_delete, deleted_at, created_at FROM activity WHERE id LIKE "2000%" LIMIT 10'
);
console.log('=== Activities ===');
activities.forEach(a => console.log(`  ${a.id} | ${a.title} | status=${a.status} | is_delete=${a.is_delete} | deleted_at=${a.deleted_at} | created_at=${a.created_at}`));

const [orders] = await conn.execute(
  'SELECT id, `number`, status, pay_status, deliver_status, deleted_at, created_at FROM orders WHERE id LIKE "3000%" LIMIT 5'
);
console.log('\n=== Orders (first 5) ===');
orders.forEach(o => console.log(`  ${o.id} | ${o.number} | status=${o.status} pay=${o.pay_status} deliver=${o.deliver_status} | deleted_at=${o.deleted_at} | created_at=${o.created_at}`));

await conn.end();
