// Run with: node tests/gates.cjs. Test the real gate logic without browser packages.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const logic=html.slice(html.indexOf('let current = 0;'),html.indexOf('const pad2 ='));
const controls={};
function control(){return {checked:false,disabled:false,textContent:'',setAttribute(){},addEventListener(name,fn){this[name]=fn;}};}
const context={$:id=>controls[id]||(controls[id]=control()),WORK:{},nextBtn:control(),stageEl:{},scenes:Array(12),persistWork(){},assert};
vm.runInNewContext(logic+`
updateGate(); assert.equal(nextBtn.disabled,true);
requireTask('a','First example'); requireTask('b','Second example');
gateFor().notebook=true; finishTask('a'); assert.equal(canAdvance(),false);
finishTask('b'); assert.equal(canAdvance(),true); assert.equal(nextBtn.disabled,false);
setTask('a',false); assert.equal(canAdvance(),false); assert.equal(nextBtn.disabled,true);
finishTask('a'); gateFor().notebook=false; updateGate(); assert.equal(canAdvance(),false);
notebookDone.checked=true; notebookDone.change(); assert.equal(canAdvance(),true);
// Rebuilding the same step retains completed interactions.
requiredTasks=new Map(); requireTask('a','First example'); requireTask('b','Second example');
assert.equal(canAdvance(),true);
// A new step never inherits completion from the previous step.
current=1;requiredTasks=new Map();requireTask('a','New example');
assert.equal(nextBtn.disabled,true);assert.equal(gateFor().tasks.a,undefined);
// Late events from another step cannot unlock the current one.
finishTask('a',0);assert.equal(canAdvance(),false);
`,context);
assert.match(html,/if\(i>current && !canAdvance\(\)\)return/);
assert.match(html,/if\(canAdvance\(\)\)setScene\(current\+1,true\)/);
assert.match(html,/if\(next.disabled\)return/);
assert.match(html,/q.checked && norm\(q.answer\)===r.formula && q.solutionSeen/);
console.log('PASS: all requirements, notebook confirmation, relocking, saved work, navigation guards, and step isolation.');
