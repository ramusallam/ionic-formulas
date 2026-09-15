// Run with: node tests/formulas.cjs. No packages or network required.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m => m[1]);
scripts.forEach(script => new vm.Script(script));
const data = scripts[0].slice(scripts[0].indexOf('const CATIONS'), scripts[0].indexOf('// build the copy-down'));
const tests = `
const fixtures = [
 ['Sodium','Chloride','NaCl'], ['Calcium','Oxide','CaO'],
 ['Aluminum','Oxide','Al2O3'], ['Iron(II)','Oxide','FeO'],
 ['Iron(III)','Oxide','Fe2O3'], ['Tin(IV)','Oxide','SnO2'],
 ['Calcium','Nitrate','Ca(NO3)2'], ['Ammonium','Sulfate','(NH4)2SO4'],
 ['Calcium','Phosphate','Ca3(PO4)2'], ['Aluminum','Sulfate','Al2(SO4)3']
];
fixtures.forEach(([c,a,f]) => {
 assert.equal(solve(c,a).formula,f);
 assert.equal(assessFormula(f,c,a).state,'ok');
});
assert.equal(assessFormula('Al₂O₃','Aluminum','Oxide').state,'ok');
assert.equal(assessFormula(' Ca (NO₃)₂ ','Calcium','Nitrate').state,'ok');
for (const f of ['al2o3','Al3O2','Al2O3+','']) assert.equal(assessFormula(f,'Aluminum','Oxide').state,'no');
assert.equal(assessFormula('Ca2O2','Calcium','Oxide').state,'no');
assert.equal(assessFormula('CaNO32','Calcium','Nitrate').state,'no');
assert.equal(assessFormula('Sn2O4','Tin(IV)','Oxide').state,'no');
let pairs=0;
for (const c of Object.keys(CATIONS).concat('Ammonium')) {
 for (const a of Object.keys(ANIONS).concat(Object.keys(POLY).filter(n=>!POLY[n].cat))) {
  const r=solve(c,a);
  assert.equal(r.nc*r.cat.charge+r.na*r.an.charge,0);
  assert.equal(gcd(r.nc,r.na),1);
  pairs++;
 }
}
console.log('PASS: script syntax, fixtures, input formats, incorrect answers, and '+pairs+' balanced ion pairs.');
`;
vm.runInNewContext(data + tests, {assert,console});
