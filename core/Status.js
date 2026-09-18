class Status {
  getUptime() {
    return {
      system: 'ScanClick_Platform',
      userId: 'Rufio244',
      isRunning: true,
      uptime: process.uptime(),
      autoResetCount: global.resetCount || 0,
      lastJob: new Date().toISOString(),
      mode: 'LEARN_FOREVER',
      dualId: 'Rufio244 <-> Super244s CONNECTED'
    };
  }
}
module.exports = Status;
