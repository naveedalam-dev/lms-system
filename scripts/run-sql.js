const fs = require('fs');

const token = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';
const projectRef = 'emhdxgimolrwqaduczok';

async function runSql(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('Error executing SQL:', data);
    process.exit(1);
  }
  return data;
}

const fileOrQuery = process.argv[2];
if (!fileOrQuery) {
  console.log('Usage: node scripts/run-sql.js "<query>" or node scripts/run-sql.js file.sql');
  process.exit(0);
}

let sql = fileOrQuery;
if (fs.existsSync(fileOrQuery)) {
  sql = fs.readFileSync(fileOrQuery, 'utf8');
}

runSql(sql)
  .then(res => {
    console.log('SQL executed successfully:', JSON.stringify(res, null, 2));
  })
  .catch(err => {
    console.error('Execution error:', err);
    process.exit(1);
  });
