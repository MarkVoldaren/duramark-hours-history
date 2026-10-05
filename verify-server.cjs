const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const os=require('node:os');
const path=require('node:path');
(async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'hours-history-test-'));process.env.DATA_DIR=dir;
 const {createServer}=require('./server.cjs');let server;
 const start=async()=>{server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));return 'http://127.0.0.1:'+server.address().port;};
 const stop=()=>new Promise(resolve=>server.close(resolve));
 try{let base=await start();assert.equal((await fetch(base+'/api/csv')).status,404);
 const csv=await fs.readFile(process.argv[2],'utf8');let response=await fetch(base+'/api/csv?name=production.csv',{method:'PUT',body:csv});assert.equal(response.status,200);assert.equal((await response.json()).name,'production.csv');
 let snapshot=await (await fetch(base+'/api/csv')).json();assert.equal(snapshot.csv,csv);
 assert.equal((await fetch(base+'/api/csv',{method:'PUT',body:'invalid'})).status,400);assert.equal((await (await fetch(base+'/api/csv')).json()).csv,csv);
 assert.equal((await fetch(base+'/api/csv',{method:'PUT',headers:{Origin:'https://other.example'},body:csv})).status,403);
 await stop();base=await start();assert.equal((await (await fetch(base+'/api/csv')).json()).csv,csv);
 assert.equal((await fetch(base+'/app.js')).status,200);assert.equal((await fetch(base+'/data/latest.json')).status,404);
 console.log('Shared upload, second visitor, restart persistence, invalid-upload preservation, and static serving passed.');
 }finally{if(server?.listening)await stop();await fs.rm(dir,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
