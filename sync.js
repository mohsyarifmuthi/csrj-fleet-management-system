fetch('http://localhost:3000/api/database/sync-all', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(res => res.json())
.then(data => {
  console.log('✅ SYNC BERHASIL!');
  console.log(JSON.stringify(data, null, 2));
})
.catch(err => console.error('❌ ERROR:', err));