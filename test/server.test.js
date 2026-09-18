const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const temp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'scanclick-')), 'store.json');
process.env.DATA_FILE = temp;
process.env.ADMIN_KEY = 'test-admin';
const app = require('../server');
const UserSystem = require('../core/User_Manager');

function request(method, route, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const port = server.address().port;
      const http = require('node:http');
      const req = http.request({ port, method, path: route, headers: { 'content-type': 'application/json', ...headers } }, res => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => { server.close(); resolve({ status: res.statusCode, body: JSON.parse(data) }); });
      });
      req.on('error', error => { server.close(); reject(error); });
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  });
}

test('health endpoint is available', async () => {
  const result = await request('GET', '/health');
  assert.equal(result.status, 200);
  assert.equal(result.body.ok, true);
});

test('chat requires a valid API key and returns a completion', async () => {
  const users = new UserSystem(temp);
  const key = Object.keys(users.state.keys)[0];
  const result = await request('POST', '/api/v1/chat/completions', { prompt: 'สวัสดี' }, { 'x-api-key': key });
  assert.equal(result.status, 200);
  assert.equal(result.body.object, 'chat.completion');
  assert.match(result.body.choices[0].message.content, /สวัสดี/);
});

test('admin endpoint rejects an invalid admin key', async () => {
  const result = await request('GET', '/api/v1/users', null, { 'x-admin-key': 'wrong' });
  assert.equal(result.status, 403);
});
