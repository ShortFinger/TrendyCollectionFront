import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: '39.105.194.247',
  port: 3306,
  user: 'trendy',
  password: 'WhWrcxRmJt8kKaRF',
  database: 'trendy',
  connectTimeout: 30000,
});

console.log('Connected to database');

// ── 1. Check/Insert Users ──────────────────────────────────────────
const [existingUsers] = await conn.execute('SELECT id, user_no, nickname FROM user WHERE is_delete = 0 LIMIT 10');
let userIds = existingUsers.map(u => u.id);

if (userIds.length < 3) {
  const users = [
    { id: '100001', user_no: 'U20260301', nickname: '小明', phone: '13800000001', gender: 1 },
    { id: '100002', user_no: 'U20260302', nickname: '小红', phone: '13800000002', gender: 2 },
    { id: '100003', user_no: 'U20260303', nickname: '张三', phone: '13800000003', gender: 1 },
    { id: '100004', user_no: 'U20260304', nickname: '李四', phone: '13800000004', gender: 2 },
    { id: '100005', user_no: 'U20260305', nickname: '王五', phone: '13800000005', gender: 1 },
  ];
  for (const u of users) {
    try {
      await conn.execute(
        `INSERT INTO user (id, user_no, nickname, phone, gender, user_status, user_type, is_delete)
         VALUES (?, ?, ?, ?, ?, 1, 0, 0)`,
        [u.id, u.user_no, u.nickname, u.phone, u.gender]
      );
      console.log(`  Inserted user: ${u.nickname}`);
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') console.log(`  User ${u.nickname} already exists, skipping`);
      else throw e;
    }
  }
  userIds = users.map(u => u.id);
} else {
  console.log(`Found ${userIds.length} existing users: ${existingUsers.map(u => u.nickname || u.user_no).join(', ')}`);
  userIds = userIds.slice(0, 5);
  while (userIds.length < 5) userIds.push(userIds[0]);
}

// ── 2. Insert Activities ───────────────────────────────────────────
console.log('\nInserting activities...');
const activities = [
  {
    id: '200001', uuid: 'act-uuid-001', title: '春季限定福袋', thumb: 'https://picsum.photos/seed/act1/200/200',
    moneyPrice: 29.90, scorePrice: 299, stock: 500, sales: 128, status: 1, actType: 1,
  },
  {
    id: '200002', uuid: 'act-uuid-002', title: '连击赏·动漫手办', thumb: 'https://picsum.photos/seed/act2/200/200',
    moneyPrice: 59.90, scorePrice: 599, stock: 200, sales: 76, status: 1, actType: 2,
  },
  {
    id: '200003', uuid: 'act-uuid-003', title: '欧皇专属盲盒', thumb: 'https://picsum.photos/seed/act3/200/200',
    moneyPrice: 99.00, scorePrice: 990, stock: 100, sales: 42, status: 1, actType: 4,
  },
  {
    id: '200004', uuid: 'act-uuid-004', title: '能量池·航海王', thumb: 'https://picsum.photos/seed/act4/200/200',
    moneyPrice: 39.90, scorePrice: 399, stock: 300, sales: 165, status: 0, actType: 5,
  },
  {
    id: '200005', uuid: 'act-uuid-005', title: '卡牌大师系列', thumb: 'https://picsum.photos/seed/act5/200/200',
    moneyPrice: 19.90, scorePrice: 199, stock: 1000, sales: 530, status: 1, actType: 6,
  },
  {
    id: '200006', uuid: 'act-uuid-006', title: '夏日清凉福袋', thumb: 'https://picsum.photos/seed/act6/200/200',
    moneyPrice: 49.90, scorePrice: 499, stock: 0, sales: 400, status: 0, actType: 1,
  },
];

for (const a of activities) {
  try {
    await conn.execute(
      `INSERT INTO activity
       (id, uuid, title, thumb, images, detail_images, money_price, score_price,
        visit_total, base_total, per_user_limit, status, reward_level_id, stock, sales,
        multi_buy_discount, img_3d, tags, min_lucky_score,
        join_user_total, is_random_reward_enabled, random_reward_odds, random_reward_total,
        random_reward_id, bg_img, corner_mark, lower_left_corner_mark, upper_left_corner_mark,
        lower_right_corner_mark, act_type, is_taskplan, amount_limit, upper_right_corner_mark,
        activity_config, special_area_id, is_delete, created_at, updated_at)
       VALUES (?, ?, ?, ?, '', '', ?, ?,
               0, 0, 5, ?, '0', ?, ?,
               0, '', '', 0,
               0, 0, 0.00, 0,
               '0', '', '', '', '',
               '', ?, 0, 0, '',
               '{}', '0', 0, NOW(), NOW())`,
      [a.id, a.uuid, a.title, a.thumb, a.moneyPrice, a.scorePrice, a.status, a.stock, a.sales, a.actType]
    );
    console.log(`  Inserted activity: ${a.title}`);
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') console.log(`  Activity "${a.title}" already exists, skipping`);
    else throw e;
  }
}

// ── 3. Insert Orders ───────────────────────────────────────────────
console.log('\nInserting orders...');

const now = new Date();
function daysAgo(n) {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}
function hoursAgo(n) {
  const d = new Date(now);
  d.setHours(d.getHours() - n);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

const orders = [
  // ── 待付款 (payStatus=0, status=0) ──
  {
    id: '300001', number: 'ORD20260323001', userId: userIds[0],
    payMoneyPrice: 2990, payScorePrice: 0, orderMoneyPrice: 2990, orderScorePrice: 0,
    productMoneyPrice: 2990, productScorePrice: 0,
    status: 0, payStatus: 0, deliverStatus: 0,
    createdAt: hoursAgo(2),
  },
  {
    id: '300002', number: 'ORD20260323002', userId: userIds[1],
    payMoneyPrice: 5990, payScorePrice: 599, orderMoneyPrice: 5990, orderScorePrice: 599,
    productMoneyPrice: 5990, productScorePrice: 599,
    status: 0, payStatus: 0, deliverStatus: 0,
    createdAt: hoursAgo(5),
  },
  {
    id: '300003', number: 'ORD20260322003', userId: userIds[2],
    payMoneyPrice: 9900, payScorePrice: 0, orderMoneyPrice: 9900, orderScorePrice: 0,
    productMoneyPrice: 9900, productScorePrice: 0,
    status: 0, payStatus: 0, deliverStatus: 0,
    createdAt: daysAgo(1),
  },

  // ── 已付款·待发货 (payStatus=2, status=1, deliverStatus=0) ──
  {
    id: '300004', number: 'ORD20260322004', userId: userIds[0],
    payMoneyPrice: 3990, payScorePrice: 399, orderMoneyPrice: 3990, orderScorePrice: 399,
    productMoneyPrice: 3990, productScorePrice: 399,
    status: 1, payStatus: 2, deliverStatus: 0,
    createdAt: daysAgo(1), moneyPaidAt: daysAgo(1),
  },
  {
    id: '300005', number: 'ORD20260321005', userId: userIds[3],
    payMoneyPrice: 1990, payScorePrice: 199, orderMoneyPrice: 1990, orderScorePrice: 199,
    productMoneyPrice: 1990, productScorePrice: 199,
    status: 1, payStatus: 2, deliverStatus: 0,
    createdAt: daysAgo(2), moneyPaidAt: daysAgo(2),
  },
  {
    id: '300006', number: 'ORD20260320006', userId: userIds[4],
    payMoneyPrice: 14900, payScorePrice: 0, orderMoneyPrice: 14900, orderScorePrice: 0,
    productMoneyPrice: 14900, productScorePrice: 0,
    status: 1, payStatus: 2, deliverStatus: 0,
    createdAt: daysAgo(3), moneyPaidAt: daysAgo(3),
  },

  // ── 已付款·备货中 (payStatus=2, status=1, deliverStatus=1) ──
  {
    id: '300007', number: 'ORD20260319007', userId: userIds[1],
    payMoneyPrice: 4990, payScorePrice: 499, orderMoneyPrice: 4990, orderScorePrice: 499,
    productMoneyPrice: 4990, productScorePrice: 499,
    status: 1, payStatus: 2, deliverStatus: 1,
    createdAt: daysAgo(4), moneyPaidAt: daysAgo(4),
  },
  {
    id: '300008', number: 'ORD20260318008', userId: userIds[2],
    payMoneyPrice: 7980, payScorePrice: 0, orderMoneyPrice: 7980, orderScorePrice: 0,
    productMoneyPrice: 7980, productScorePrice: 0,
    status: 1, payStatus: 2, deliverStatus: 1,
    createdAt: daysAgo(5), moneyPaidAt: daysAgo(5),
  },

  // ── 已发货 (payStatus=2, status=1, deliverStatus=3) ──
  {
    id: '300009', number: 'ORD20260317009', userId: userIds[3],
    payMoneyPrice: 2990, payScorePrice: 299, orderMoneyPrice: 2990, orderScorePrice: 299,
    productMoneyPrice: 2990, productScorePrice: 299,
    status: 1, payStatus: 2, deliverStatus: 3,
    createdAt: daysAgo(6), moneyPaidAt: daysAgo(6), deliveredAt: daysAgo(4),
  },
  {
    id: '300010', number: 'ORD20260316010', userId: userIds[0],
    payMoneyPrice: 11970, payScorePrice: 0, orderMoneyPrice: 11970, orderScorePrice: 0,
    productMoneyPrice: 11970, productScorePrice: 0,
    status: 1, payStatus: 2, deliverStatus: 3,
    createdAt: daysAgo(7), moneyPaidAt: daysAgo(7), deliveredAt: daysAgo(5),
  },
  {
    id: '300011', number: 'ORD20260315011', userId: userIds[4],
    payMoneyPrice: 5990, payScorePrice: 599, orderMoneyPrice: 5990, orderScorePrice: 599,
    productMoneyPrice: 5990, productScorePrice: 599,
    status: 1, payStatus: 2, deliverStatus: 3,
    createdAt: daysAgo(8), moneyPaidAt: daysAgo(8), deliveredAt: daysAgo(6),
  },

  // ── 已完成 (payStatus=2, status=9, deliverStatus=3) ──
  {
    id: '300012', number: 'ORD20260314012', userId: userIds[1],
    payMoneyPrice: 9900, payScorePrice: 990, orderMoneyPrice: 9900, orderScorePrice: 990,
    productMoneyPrice: 9900, productScorePrice: 990,
    status: 9, payStatus: 2, deliverStatus: 3,
    createdAt: daysAgo(10), moneyPaidAt: daysAgo(10), deliveredAt: daysAgo(8), completedAt: daysAgo(3),
  },
  {
    id: '300013', number: 'ORD20260313013', userId: userIds[2],
    payMoneyPrice: 1990, payScorePrice: 0, orderMoneyPrice: 1990, orderScorePrice: 0,
    productMoneyPrice: 1990, productScorePrice: 0,
    status: 9, payStatus: 2, deliverStatus: 3,
    createdAt: daysAgo(12), moneyPaidAt: daysAgo(12), deliveredAt: daysAgo(10), completedAt: daysAgo(5),
  },
  {
    id: '300014', number: 'ORD20260312014', userId: userIds[3],
    payMoneyPrice: 3990, payScorePrice: 399, orderMoneyPrice: 3990, orderScorePrice: 399,
    productMoneyPrice: 3990, productScorePrice: 399,
    status: 9, payStatus: 2, deliverStatus: 3,
    createdAt: daysAgo(14), moneyPaidAt: daysAgo(14), deliveredAt: daysAgo(12), completedAt: daysAgo(7),
  },

  // ── 已关闭 (status=2) ──
  {
    id: '300015', number: 'ORD20260311015', userId: userIds[4],
    payMoneyPrice: 2990, payScorePrice: 0, orderMoneyPrice: 2990, orderScorePrice: 0,
    productMoneyPrice: 2990, productScorePrice: 0,
    status: 2, payStatus: 0, deliverStatus: 0,
    createdAt: daysAgo(15), closedAt: daysAgo(14),
  },
  {
    id: '300016', number: 'ORD20260310016', userId: userIds[0],
    payMoneyPrice: 5990, payScorePrice: 599, orderMoneyPrice: 5990, orderScorePrice: 599,
    productMoneyPrice: 5990, productScorePrice: 599,
    status: 2, payStatus: 2, deliverStatus: 0,
    createdAt: daysAgo(18), moneyPaidAt: daysAgo(18), closedAt: daysAgo(16),
  },

  // ── 部分发货 (payStatus=2, deliverStatus=2) ──
  {
    id: '300017', number: 'ORD20260319017', userId: userIds[1],
    payMoneyPrice: 19800, payScorePrice: 0, orderMoneyPrice: 19800, orderScorePrice: 0,
    productMoneyPrice: 19800, productScorePrice: 0,
    status: 1, payStatus: 2, deliverStatus: 2,
    createdAt: daysAgo(4), moneyPaidAt: daysAgo(4),
  },

  // ── Extra orders ──
  {
    id: '300018', number: 'ORD20260323018', userId: userIds[2],
    payMoneyPrice: 6990, payScorePrice: 699, orderMoneyPrice: 6990, orderScorePrice: 699,
    productMoneyPrice: 6990, productScorePrice: 699,
    status: 1, payStatus: 2, deliverStatus: 0,
    createdAt: hoursAgo(8), moneyPaidAt: hoursAgo(7),
  },
  {
    id: '300019', number: 'ORD20260323019', userId: userIds[4],
    payMoneyPrice: 1990, payScorePrice: 0, orderMoneyPrice: 1990, orderScorePrice: 0,
    productMoneyPrice: 1990, productScorePrice: 0,
    status: 0, payStatus: 0, deliverStatus: 0,
    createdAt: hoursAgo(1),
  },
  {
    id: '300020', number: 'ORD20260322020', userId: userIds[3],
    payMoneyPrice: 29900, payScorePrice: 2990, orderMoneyPrice: 29900, orderScorePrice: 2990,
    productMoneyPrice: 29900, productScorePrice: 2990,
    status: 9, payStatus: 2, deliverStatus: 3,
    createdAt: daysAgo(20), moneyPaidAt: daysAgo(20), deliveredAt: daysAgo(18), completedAt: daysAgo(10),
  },
];

for (const o of orders) {
  try {
    await conn.execute(
      `INSERT INTO orders
       (id, user_id, \`number\`, pay_type, product_total, sku_total,
        product_money_price, product_score_price, carriage,
        score_discount, redpack_discount, coupon_discount, other_discount,
        order_money_price, order_score_price, pay_money_price, pay_score_price,
        pay_num, pay_number, status, pay_status, deliver_status, aftersale_status,
        is_auto_delivered, is_visible, product_type, order_type, deliver_type,
        pay_number_third, transaction_id, purchase_price,
        refunded_money, is_add_sales, multi_buy_money_discount, multi_buy_score_discount,
        is_use_free_ticket, mxp_status, brokerage_status_new, level_score_status, send_data_status,
        money_paid_at, delivered_at, completed_at, closed_at,
        created_at, updated_at)
       VALUES
       (?, ?, ?, 'wechat', 1, 1,
        ?, ?, 0,
        0, 0, 0, 0,
        ?, ?, ?, ?,
        1, ?, ?, ?, ?, 0,
        0, 1, 0, 1, 1,
        '', '', 0,
        0, 1, 0, 0,
        0, 0, 0, 0, 0,
        ?, ?, ?, ?,
        ?, ?)`,
      [
        o.id, o.userId, o.number,
        o.productMoneyPrice, o.productScorePrice,
        o.orderMoneyPrice, o.orderScorePrice, o.payMoneyPrice, o.payScorePrice,
        o.number,
        o.status, o.payStatus, o.deliverStatus,
        o.moneyPaidAt || null, o.deliveredAt || null, o.completedAt || null, o.closedAt || null,
        o.createdAt, o.createdAt,
      ]
    );
    console.log(`  Inserted order: ${o.number} (status=${o.status}, pay=${o.payStatus}, deliver=${o.deliverStatus})`);
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') console.log(`  Order ${o.number} already exists, skipping`);
    else throw e;
  }
}

// ── Summary ────────────────────────────────────────────────────────
const [orderCount] = await conn.execute('SELECT COUNT(*) as cnt FROM orders WHERE id LIKE "3000%"');
const [actCount] = await conn.execute('SELECT COUNT(*) as cnt FROM activity WHERE id LIKE "2000%"');
const [userCount] = await conn.execute('SELECT COUNT(*) as cnt FROM user WHERE is_delete = 0');
console.log(`\nDone! ${userCount[0].cnt} users, ${actCount[0].cnt} activities, ${orderCount[0].cnt} orders in database`);

await conn.end();
