const { execFile, spawn } = require("child_process");
const STREAM_PORT = process.env.STREAM_PORT;

const childrenProcess = [];

exports.childrenProcess = childrenProcess;

exports.openUsingScriptFile = (pathToScriptFile, rtspLink, streamKey) => {
  try {
    let streamLink = `http://localhost:${STREAM_PORT}/${streamKey}`;

    const spawnParams = [pathToScriptFile, rtspLink, streamLink];
    const spawnOpts = {
      detached: true
      // Allows killing of all of child's descendants.
      // cf. http://azimi.me/2014/12/31/kill-child_process-node-js.html
      //     https://github.com/nodejs/node-v0.x-archive/issues/1811
    };

    const child = spawn("bash", spawnParams, spawnOpts);

    child.stdout.on("data", function(data) {
      // console.log(`stdout: ${data}`);
    });

    child.stderr.on("data", function(data) {
      // console.error(`stderr: ${data}`);
    });

    child.on("close", function(code, signal) {
      console.log(
        `child process exited with code ${code} and signal ${signal}`
      );
    });

    childrenProcess.push(child);

    console.log(childrenProcess.map(child => child.pid));
  } catch (err) {
    console.log(err);
  }
};
