const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cp = require('child_process');
const path = require("path");
const jsonParser = bodyParser.json();

app.get('/', (req, res) => {
  res.send("Welcome to the api.");
});

app.post('/runcode', jsonParser, (req, res) => {
  console.log('hit');
  const code = req.body.code;
  const fileName = req.body.fileName;
  const child = cp.fork(path.join(__dirname, './worker.js'), [code, fileName]);
  let running = true;

  setTimeout(_ => {
    if (running) {
      child.kill();
      running = false;
      return res.json({output: 'code timed out!'});
    }
  }, 5000);

  child.on('message', codeOutput => {
    if (!running) {
      return;
    }    
    running = false;
    return res.json({output: codeOutput});
  });
});

app.listen(process.argv[2], _ => {
  console.log("Running on port: " + process.argv[2]);
});
