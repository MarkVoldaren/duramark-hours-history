const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { parseCSV } = require('./app/app.js');
const directory = process.env.DATA_DIR || path.join(__dirname, 'data');
const limit = 40 * 1024 * 1024;
function createServer() {
  let writes = Promise.resolve();
  return http.createServer(async (req, res) => {
    const send = (status, body, type = 'application/json') => { res.writeHead(status, {'Content-Type':type, 'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(typeof body === 'string' ? body : JSON.stringify(body)); };
    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname === '/api/csv' && req.method === 'GET') {
        try { send(200, await fs.readFile(path.join(directory, 'latest.json'), 'utf8')); }
        catch (e) { if(e.code === 'ENOENT')send(404,{error:'No shared CSV has been uploaded yet.'});else throw e; }
        return;
      }
      if (url.pathname === '/api/csv' && req.method === 'PUT') {
        if(req.headers.origin && new URL(req.headers.origin).host !== req.headers.host){send(403,{error:'Upload must come from this app.'});return;}
        let size=0;const chunks=[];
        for await(const chunk of req){size+=chunk.length;if(size>limit){send(413,{error:'CSV must be smaller than 40 MB.'});return;}chunks.push(chunk);}
        const csv=Buffer.concat(chunks).toString('utf8');
        let parsed;try{parsed=parseCSV(csv);if(!parsed.some(r=>r.Part&&r['WO #']))throw new Error('No rows contain both a part number and a work order.');}catch(e){send(400,{error:e.message});return;}
        const snapshot={name:(url.searchParams.get('name')||'shared.csv').slice(0,255),uploadedAt:new Date().toISOString(),csv};
        const save=async()=>{await fs.mkdir(directory,{recursive:true});const temp=path.join(directory,randomUUID()+'.tmp');try{await fs.writeFile(temp,JSON.stringify(snapshot));await fs.rename(temp,path.join(directory,'latest.json'));}finally{await fs.rm(temp,{force:true});}};
        const saved=writes.then(save);writes=saved.catch(()=>{});await saved;
        send(200,{name:snapshot.name,uploadedAt:snapshot.uploadedAt});return;
      }
      if(req.method!=='GET'&&req.method!=='HEAD'){send(405,{error:'Method not allowed.'});return;}
      const assets={'/':'index.html','/index.html':'index.html','/styles.css':'styles.css','/app.js':'app.js'};
      const asset=assets[url.pathname];if(!asset){send(404,{error:'Not found.'});return;}
      const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};
      const content=await fs.readFile(path.join(__dirname,'app',asset));res.writeHead(200,{'Content-Type':types[path.extname(asset)],'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:content);
    }catch(e){console.error(e);if(!res.headersSent)send(500,{error:'Unable to read or save the shared CSV. Please try again.'});else res.end();}
  });
}
if(require.main===module)createServer().listen(Number(process.env.PORT)||80,'0.0.0.0');
module.exports={createServer};
