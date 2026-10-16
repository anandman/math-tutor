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
const saved = (tips=200, upgrades=[]) => ({totalTips:tips,upgrades,unlockedLevels:['m1','m2','d1'],sr:{'mul:3x4':{box:2,correct:4,wrong:1}}});
test('old purchases become visible decorations while tips and math progress survive', () => {
  const c=app(saved(42,['oven','flowers'])), p=c.getProgress();
  assert.ok(p.bakery, 'bakery layout added to old save');
  assert.deepEqual(Array.from(p.bakery.slots).filter(Boolean), ['oven','flowers']);
  assert.equal(p.totalTips,42); assert.ok(p.unlockedLevels.includes('m2')); assert.equal(p.sr['mul:3x4'].correct,4);
});
test('purchases use catalog prices, prevent duplicate charges, and immediately equip', () => {
  const c=app(saved());
  assert.equal(typeof c.purchasePrize,'function');
  assert.equal(c.purchasePrize('flowers',0),true);
  assert.equal(c.getProgress().totalTips,175);
  assert.ok(c.getProgress().bakery.slots.includes('flowers'));
  assert.equal(c.purchasePrize('flowers'),false);
  assert.equal(c.purchasePrize('missing'),false);
  assert.equal(c.getProgress().totalTips,175);
  const poor=app(saved(14)); assert.equal(poor.purchasePrize('ball'),false); assert.equal(poor.getProgress().totalTips,14);
});
test('decorations can move, swap, and return to storage without losing purchases or spending tips',()=>{
  const c=app(saved(42,['oven','flowers']));
  assert.equal(typeof c.placeDecoration,'function');
  assert.equal(c.placeDecoration('oven',1),true);
  assert.deepEqual(Array.from(c.getProgress().bakery.slots).slice(0,2),['flowers','oven']);
  assert.equal(c.placeDecoration('flowers',5),true);
  assert.equal(c.getProgress().bakery.slots[0],null);
  assert.equal(c.placeDecoration('chandelier',0),false);
  assert.equal(c.placeDecoration('oven',6),false);
  assert.equal(c.putAwayPrize('flowers'),true);
  const p=c.getProgress(); assert.ok(!p.bakery.slots.includes('flowers'));assert.ok(p.upgrades.includes('flowers'));assert.equal(p.totalTips,42);
});
test('pet accessories require adoption and equipped themes/accessories persist',()=>{
  const c=app(saved(300));
  assert.equal(typeof c.purchasePrize,'function');
  assert.equal(c.purchasePrize('ball'),false);
  assert.equal(c.purchasePrize('cat'),true);
  assert.equal(c.purchasePrize('ball'),true);
  assert.equal(c.purchasePrize('bow'),true);
  assert.equal(c.purchasePrize('mint'),true);
  let p=c.getProgress(); assert.equal(p.bakery.toy,'ball');assert.equal(p.bakery.hat,'bow');assert.equal(p.bakery.theme,'mint');
  const reloaded=app(p);assert.equal(reloaded.getProgress().bakery.toy,'ball');
  assert.equal(reloaded.equipPrize('crown'),false);
  assert.equal(reloaded.equipPrize('classic'),true);
  assert.equal(reloaded.getProgress().bakery.theme,'classic');
  const before=JSON.stringify(reloaded.getProgress());
  assert.match(reloaded.petReaction('play'),/ball/i);
  assert.equal(JSON.stringify(reloaded.getProgress()),before,'playing is free and does not change math progress');
});
test('saved layouts discard unowned items and duplicates while preserving intentional empty spots',()=>{
  const p=saved(42,['oven']);p.bakery={theme:'mint',slots:['oven','oven','flowers',null,null,null],hat:'crown',toy:'ball',bed:'bed'};
  const c=app(p), room=c.getProgress().bakery;
  assert.equal(room.theme,'classic');assert.deepEqual(Array.from(room.slots),['oven',null,null,null,null,null]);assert.equal(room.hat,null);assert.equal(room.toy,null);
  c.putAwayPrize('oven');assert.deepEqual(Array.from(c.getProgress().bakery.slots),[null,null,null,null,null,null]);
});
