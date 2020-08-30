const { NodeVM } = require('vm2');

const vm = new NodeVM({
  sandbox: {code: null, fileName: null, cpDead: false, cp: null, out: {stdout: null, stderr: null} },
  require: {
    external: true,
    builtin: ["fs", "child_process"]
  }
});

vm.sandbox.code = process.argv[2];
vm.sandbox.fileName = process.argv[3];

[`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach(eventType => {
  process.on(eventType, _ => {
    if (vm.sandbox.cp !== null) {
      vm.sandbox.cp.kill();
    }
  });
});

const script = `
  const fs = require('fs');
  const exec = require('child_process').exec;

  module.exports = callback => {
    let status = 200;

    fs.writeFile(this.fileName, this.code, { flag: 'w' }, writeErr => {
      if (writeErr) {
        status = 500;
      }
  
      this.cp = exec('python ' + this.fileName, (execErr, stdout, stderr) => {
        if (execErr) {
          status = 500;
        }
  
        fs.unlink(this.fileName, unlinkErr => {
          if (unlinkErr) {
            status = 500;
          }
  
          callback(status, stdout, stderr);
        });
      });
    });
  };
`;

const runCode = vm.run(script);

runCode((status, stdout, stderr) => {
  if (status == 500) {
    process.send(stderr);
    return;
  }

  if (stdout !== null || stdout !== '') {
    process.send(stdout);
    return;
  }

  process.send(stderr);
});

/*const script = `
  const fs = require('fs');
  const execSync = require('child_process').execSync;
  fs.writeFileSync(this.fileName, this.code, {flag: 'w'});
  let output = '';
  try {
    output = execSync('python ' + this.fileName).toString();
  } catch(e) {
    output = e.stderr.toString();
  }
  fs.unlinkSync(this.fileName);
  module.exports = output;
`;*/