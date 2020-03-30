const { execFile, spawn } = require('child_process');
const STREAM_PORT = process.env.STREAM_PORT;

const childPids = [];

// Kill all child process
process.on('sigint', s => {
  for (let pid of childPids){
  //  Kill pid
    console.log(pid);
  }
});

exports.openUsingScriptFile = (pathToScriptFile, rtspLink, streamKey) => {
  try {
    let streamLink = `http://localhost:${STREAM_PORT}/${streamKey}`;
    const k = spawn(`bash ${pathToScriptFile}`, [rtspLink, streamLink] );
    childPids.push(k.pid);
    console.log(childPids);
  } catch (err) {
    console.log(err);
  }
};
