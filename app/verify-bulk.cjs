const assert=require('node:assert/strict');
const {parsePartList,matchParts,parseCSV}=require('./app.js');
const list=parsePartList('\uFEFFDescription,Part Number\r\n"a, b",00123\r\nx,ABC\r\nx,abc\r\nx,missing\r\nx,\r\nx,FILTERED');
assert.equal(list.records[0][1],'00123');
const source=parseCSV('Part,WO #,Combo #,Manufacturing Work Center,Estimated Work,WO Quantity,Status\n00123,W1,C,Cut,1.5,10,Open\n00123,W1,C,Print,2,10,Open\nABC,W2,,Cut,4,3,Open\nFILTERED,W3,,Cut,9,2,Closed');
const index=new Map();for(const r of source){const k=r.Part.toLowerCase();if(!index.has(k))index.set(k,[]);index.get(k).push(r);}
const result=matchParts(list.records.map(r=>r[1]),index,'Open');
assert.equal(result.matched.length,2);assert.equal(result.duplicates,1);assert.equal(result.blank,1);assert.deepEqual(result.missing,['missing']);assert.deepEqual(result.excluded,['FILTERED']);assert.equal(result.matched[0].total,3.5);assert.equal(result.matched[0].quantity,10);
assert.equal(matchParts(['filtered'],index,'').matched.length,1);
assert.throws(()=>parsePartList('Part,Other\n123'));
assert.throws(()=>parsePartList('Part\n"123'));
assert.throws(()=>parseCSV('Part\n123'));
console.log('Bulk import matching, CSV validation, leading zeros, deduplication, filters, and totals passed.');

const {summaryEntry,groupRuns}=require('./app.js');
const infoSource=[
 {Part:'00123','WO #':'1',Status:'Open','Estimated Work':'2','WO Quantity':'5',COLORS:' Blue ',ITEMNO1:'00007','Label Width':'1.250',"Last 12 Month's Usage":'100'},
 {Part:'00123','WO #':'2',Status:'Closed','Estimated Work':'9',COLORS:'Red',ITEMNO1:'00007','Label Width':'1.250',"Last 12 Month's Usage":'100'},
 {Part:'00123','WO #':'3',Status:'Closed',COLORS:'Blue'}
];
const entry=summaryEntry(groupRuns(infoSource.filter(r=>r.Status==='Open')),infoSource,'Open');
assert.equal(entry.total,2);
assert.equal(entry.info.COLORS,'Blue · Red');
assert.equal(entry.info.ITEMNO1,'00007');
assert.equal(entry.info['Label Width'],'1.250');
assert.equal(entry.info["Last 12 Month's Usage"],'100');
assert.equal(entry.info.ITEMNO2,'');
infoSource[0].COLORS='Changed';assert.equal(entry.info.COLORS,'Blue · Red');
const bulkInfo=matchParts(['00123'],new Map([['00123',infoSource]]),'Open');
assert.equal(bulkInfo.matched[0].info.ITEMNO1,'00007');
console.log('Summary information snapshots, distinct values, missing values, bulk adds, and status independence passed.');
