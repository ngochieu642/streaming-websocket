const { execFile, spawn } = require("child_process");
const STREAM_PORT = process.env.STREAM_PORT;

const childrenProcess = [];

exports.childrenProcess = childrenProcess;

exports.openUsingScriptFile = (pathToScriptFile, rtspLink, streamKey) => {
  try {
    let streamLink = `http://localhost:${STREAM_PORT}/${streamKey}`;
    // const k = spawn(`bash ${pathToScriptFile}`, [rtspLink, streamLink] );
    const k = spawn("bash", ["hello.sh"]);

    k.stdout.on("data", data => {
      console.log(`stdout: ${data}`);
    });

    k.stderr.on("data", data => {
      console.error(`stderr: ${data}`);
    });

    k.on("close", code => {
      console.log(`child process exited with code ${code}`);
    });

    childrenProcess.push(k);
    console.log(childrenProcess.map(child => child.pid));
  } catch (err) {
    console.log(err);
  }
};
