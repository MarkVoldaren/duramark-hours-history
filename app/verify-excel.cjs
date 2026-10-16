const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
const {build}=require('./excel-export.js');
const entries=[{Part:'00123',Description:'=Example & <test>',Status:'Open',runs:2,combos:1,quantity:10,total:3.5,work:{Cut:1.5,Print:2},info:{ITEMNO1:'00007','Label Width':'1.250'}},{Part:'ABC',Description:'Other',Status:'All statuses',runs:1,combos:0,quantity:0,total:4,work:{Cut:4},info:{}}];
assert.throws(()=>build([],[],''));
const file=path.join(os.tmpdir(),'hours-export-'+Date.now()+'.xlsx');
try{fs.writeFileSync(file,build(entries,[['ITEMNO1','ITEMNO1'],['Label Width','Label width']],'Test history'));
const script=`import sys,zipfile,xml.etree.ElementTree as ET
from openpyxl import load_workbook
p=sys.argv[1]
with zipfile.ZipFile(p) as z:
 assert z.testzip() is None
 for n in z.namelist(): ET.fromstring(z.read(n))
w=load_workbook(p,data_only=False)
assert w.sheetnames==['Summary','Parts']
s=w['Parts']
assert s['A2'].value=='00123' and s['A2'].data_type=='s'
assert s['B2'].value=='=Example & <test>' and s['B2'].data_type=='s'
assert s['C2'].value=='00007'
assert s['D2'].value==1.25 and s['D2'].data_type=='n'
assert s['H2'].value==10 and s['K2'].value==3.5
assert w['Summary']['B8'].value==\"SUM('Parts'!K2:K3)\" or w['Summary']['B8'].value==\"=SUM('Parts'!K2:K3)\"
c=load_workbook(p,data_only=True)
assert c['Summary']['B8'].value==7.5
assert c['Summary']['B9'].value==10
assert c['Summary']['B10'].value==0.75
assert c['Summary']['B16'].value==5.5
assert abs(c['Summary']['C16'].value-5.5/7.5)<1e-12
assert w['Summary']['C16'].number_format=='0.00%'
assert s.auto_filter.ref=='A1:K3'
assert s.freeze_panes=='A2'
print('Excel ZIP/XML, typed cells, leading zeros, cached formulas, totals, percentage formats, filters, and panes passed.')`;
const result=cp.spawnSync('C:/Users/objec/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',['-c',script,file],{encoding:'utf8'});process.stdout.write(result.stdout);process.stderr.write(result.stderr);assert.equal(result.status,0);
}finally{fs.rmSync(file,{force:true});}
