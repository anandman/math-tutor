const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function app(saved) {
  const storage = new Map(saved ? [['bakery-quest-v2', JSON.stringify(saved)]] : []);
  const context = vm.createContext({ document: { addEventListener() {}, getElementById() { return { addEventListener() {} }; } },
    localStorage: { getItem: k => storage.get(k), setItem: (k,v) => storage.set(k,v) } });
  const script = fs.readFileSync('index.html', 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
  vm.runInContext(script.replace(/renderLevelSelect\(\);\s*$/, ''), context);
  return context;
}
test('new learners and existing saves can start every new skill without losing rewards', () => {
  const old = { totalTips: 42, unlockedLevels: ['m1','m2','d1'], upgrades: ['oven'], sr: { 'mul:3x4': { box: 2, correct: 3 } } };
  for (const saved of [undefined, old]) {
    const c = app(saved), p = c.getProgress();
    for (const topic of ['addition', 'subtraction', 'decimals', 'fractions']) {
      const tracks = Object.keys(c.TRACK_LEVELS).filter(k => k.startsWith(topic));
      assert.ok(tracks.length, `missing ${topic}`);
      for (const track of tracks) assert.ok(p.unlockedLevels.includes(c.TRACK_LEVELS[track][0].id));
    }
    if (saved) { assert.equal(p.totalTips,42); assert.ok(p.unlockedLevels.includes('m2')); assert.equal(p.sr['mul:3x4'].box,2); assert.equal(p.upgrades[0],'oven'); }
  }
});
test('answer validation accepts equivalents and rejects truncated or malformed input', () => {
  const c = app();
  assert.equal(typeof c.answersMatch, 'function');
  for (const [input, answer] of [['2/4','1/2'], ['0.50','1/2'], ['0.3','0.30'], ['4/2','2'], ['<','<'], ['=','='], ['>','>']]) assert.equal(c.answersMatch(input,answer),true, input);
  for (const [input,answer] of [['1.9','1'],['1/0','1'],['1/2/3','1/2'],['','0'],['2cats','2'],['0.33','1/3'],['>','<'],['Infinity','1']]) assert.equal(c.answersMatch(input,answer),false,input);
});
test('all new levels generate correct, nonnegative arithmetic and comparison problems', () => {
  const c = app();
  assert.ok(c.TRACK_LEVELS.fractions_compare, 'fraction comparison is available');
  const val = s => { const parts = String(s).split('/').map(Number); return parts.length === 2 ? parts[0]/parts[1] : parts[0]; };
  const operations = { '+': (a,b)=>a+b, '−': (a,b)=>a-b, '×': (a,b)=>a*b, '÷': (a,b)=>a/b };
  for (const [track,levels] of Object.entries(c.TRACK_LEVELS)) {
    for (const level of levels) {
      const pool = c.buildFactsPool(track,level);
      assert.ok(pool.length, `${track} ${level.id} empty`);
      for (const fact of pool) {
        c.state.factsPool = [fact];
        const p = c.generateProblem();
        const parts = p.display.split(' '), a=val(parts[0]), b=val(parts[2]);
        assert.ok(Number.isFinite(a) && Number.isFinite(b), p.display);
        if (parts[1] === '?') assert.equal(p.answer, a < b ? '<' : a > b ? '>' : '=');
        else { const expected = operations[parts[1]](a,b); assert.ok(Number.isFinite(expected)); assert.ok(Math.abs(val(p.answer)-expected)<1e-9, p.display+' -> '+p.answer); assert.ok(val(p.answer)>=0); }
        assert.ok(p.hintText && p.story && p.srKey);
      }
    }
  }
});
