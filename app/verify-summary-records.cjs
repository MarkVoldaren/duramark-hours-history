const assert=require('node:assert/strict');
const {summaryEntry,groupRuns,toggleSummaryRecord,summaryDetailHTML}=require('./app.js');
const source=[
 {Part:'001','WO #':'W1','Combo #':'C1','Estimated Work':'2','WO Quantity':'10','Manufacturing Work Center':'Cut',Status:'Open',COLORS:'Blue'},
 {Part:'001','WO #':'W1','Combo #':'C1','Estimated Work':'3','WO Quantity':'10','Manufacturing Work Center':'Print',Status:'Open'},
 {Part:'001','WO #':'W1','Combo #':'C2','Estimated Work':'1000','WO Quantity':'20','Manufacturing Work Center':'Cut',Status:'Open'},
 {Part:'001','WO #':'W2','Combo #':'C2','Estimated Work':'4','WO Quantity':'30','Manufacturing Work Center':'Cut',Status:'Open'}
];
const entry=summaryEntry(groupRuns(source),source,'Open');
assert.equal(entry.records.length,3);
const clean=toggleSummaryRecord(entry,1);
assert.equal(clean.total,9);assert.equal(clean.quantity,40);assert.equal(clean.runs,2);assert.equal(clean.combos,2);assert.deepEqual(clean.work,{Cut:6,Print:3});assert.equal(clean.info.COLORS,'Blue');assert.equal(entry.total,1009);
assert.equal(toggleSummaryRecord(clean,2).combos,1);
let empty=toggleSummaryRecord(toggleSummaryRecord(clean,0),2);
assert.equal(empty.total,0);assert.equal(empty.quantity,0);assert.equal(empty.runs,0);assert.equal(empty.combos,0);assert.deepEqual(empty.work,{});
const restored=toggleSummaryRecord(clean,1);assert.equal(restored.total,entry.total);assert.deepEqual(restored.excluded,[]);
source[0]['Estimated Work']='900';assert.equal(entry.records[0].total,5);
assert.equal(toggleSummaryRecord(entry,-1),entry);
assert.match(summaryDetailHTML(clean,0),/Restore record/);
const malicious={...clean,records:[{...clean.records[0],'WO #':'<script>'}]};assert(!summaryDetailHTML(malicious,0).includes('<script>'));
assert.deepEqual(summaryEntry(groupRuns(source),source,'Open').excluded,[]);
console.log('Summary exclusion/restoration, grouped operations, overlapping counts, empty totals, snapshots, and escaped detail passed.');
