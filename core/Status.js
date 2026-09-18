class Status {
  constructor(users) { this.users = users; }
  getUptime() { return { system: 'ScanClick_Platform', isRunning: true, uptime: process.uptime(), node: process.version, users: this.users.listUsers().length, time: new Date().toISOString() }; }
}
module.exports = Status;
