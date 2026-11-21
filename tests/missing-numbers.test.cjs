const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm');
function app(saved = {}) {
  const store = new Map([['bakery-quest-v2', JSON.stringify(saved)]]);
  const c = vm.createContext({document: {addEventListener(){}, getElementById(){return {addEventListener(){}};}},
    localStorage: {getItem:k=>store.get(k), setItem:(k,v)=>store.set(k,v)}});
  vm.runInContext(fs.readFileSync('index.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1].replace(/renderLevelSelect\(\);\s*$/,''),c);
  return c;
}
const tracks = ['addition', 'addition_missing_second', 'addition_missing_first',
  'subtraction', 'subtraction_missing_second', 'subtraction_missing_first'];

test('each missing-number form starts within 10 and progresses independently through 20 and 100', () => {
  const c=app({totalTips:42, upgrades:['oven'], unlockedLevels:['addition1','addition2','subtraction1'], sr:{'addition:add:3:4':{correct:8,wrong:0,box:3}}});
  const p=c.getProgress();
  for(const track of tracks) {
    assert.ok(c.TRACK_LEVELS[track], 'missing practice choice '+track);
    assert.deepEqual(Array.from(c.TRACK_LEVELS[track], l=>l.limit), [10,20,100]);
    assert.ok(p.unlockedLevels.includes(c.TRACK_LEVELS[track][0].id));
    if(track.includes('_missing_'))assert.ok(!p.unlockedLevels.includes(c.TRACK_LEVELS[track][1].id));
  }
  assert.ok(p.unlockedLevels.includes('addition2'));
  assert.equal(p.totalTips,42);assert.deepEqual(Array.from(p.upgrades),['oven']);
  assert.equal(p.sr['addition:add:3:4'].correct,8);
});

test('all generated equations are true when the answer replaces the only missing number, including zero and range endpoints', () => {
  const c=app();
  for(const track of tracks) {
    assert.ok(c.TRACK_LEVELS[track], 'missing practice choice '+track);
    for(const level of c.TRACK_LEVELS[track]) {
      const pool=c.buildFactsPool(track,level);assert.ok(pool.length);
      const positions=new Set(),answers=new Set();
      for(const {problem:p} of pool) {
        const parts=p.display.split(' '),unknown=parts.indexOf('?');
        assert.equal(parts.filter(s=>s==='?').length,1,p.display);
        positions.add(unknown);answers.add(Number(p.answer));
        const equation=parts.map(s=>s==='?'?Number(p.answer):s);
        const [a,op,b,,result]=equation;
        for(const value of [a,b,result])assert.ok(Number.isInteger(Number(value)) && Number(value)>=0 && Number(value)<=level.limit,p.display);
        assert.equal(op==='+'?Number(a)+Number(b):Number(a)-Number(b),Number(result),p.display+' answer '+p.answer);
        assert.ok(p.story && p.hintText && p.srKey);
      }
      assert.deepEqual([...positions], [track.endsWith('_first')?0:track.endsWith('_second')?2:4]);
      assert.ok(answers.has(0),'zero is a valid missing number');
      assert.ok(answers.has(level.limit),'range endpoint is a valid missing number');
    }
  }
});

test('missing-number stories and hints match the unknown instead of revealing it or using the wrong operation', () => {
  const c=app();
  const cases=[
    ['addition_missing_second','7 + ? = 12','5',['7','12'],/more/,/12.*7|7.*12/],
    ['addition_missing_first','? + 5 = 12','7',['5','12'],/start/,/12.*5|5.*12/],
    ['subtraction_missing_second','12 − ? = 7','5',['12','7'],/sell|sold/,/12.*7|7.*12/],
    ['subtraction_missing_first','? − 5 = 7','12',['5','7'],/start/,/7 \+ 5/]
  ];
  for(const [track,display,answer,known,storyMeaning,hintMeaning] of cases) {
    assert.ok(c.TRACK_LEVELS[track], 'missing practice choice '+track);
    const p=c.buildFactsPool(track,c.TRACK_LEVELS[track][1]).find(f=>f.problem.display===display)?.problem;
    assert.ok(p,display);assert.equal(p.answer,answer);
    assert.deepEqual(p.story.match(/\d+/g),known);
    assert.match(p.story,storyMeaning);assert.match(p.hintText,hintMeaning);
  }
});

test('success on the original fact does not give a missing-number form adaptive credit', () => {
  const c=app({sr:{'addition:add:3:4':{box:4,correct:10,wrong:0}}});
  const keys=[];
  for(const [track,display] of [['addition','3 + 4 = ?'],['addition_missing_second','3 + ? = 7'],['addition_missing_first','? + 4 = 7']]) {
    assert.ok(c.TRACK_LEVELS[track], 'missing practice choice '+track);
    const fact=c.buildFactsPool(track,c.TRACK_LEVELS[track][0]).find(f=>f.problem.display===display);
    assert.ok(fact);keys.push(fact.key);
    assert.equal(fact.weight,track==='addition'?1:5);
  }
  assert.equal(new Set(keys).size,3);
  assert.equal(keys[0],'addition:add:3:4');
});

test('reports keep all six forms separate, relabel old result-only history, and hide untried ranges', () => {
  const c=app({report:{version:1,startedAt:1,earlier:[],skills:{addition1:{id:'addition1',track:'addition',topic:'addition',label:'Level 1 · Within 10',grade:null,independent:6,supported:1,incorrect:0,timeouts:0,recent:Array(6).fill('independent'),firstSeen:1,lastSeen:1}}}});
  for(const track of tracks.slice(1)) {
    assert.ok(c.TRACK_LEVELS[track], 'missing practice choice '+track);
    const level=c.TRACK_LEVELS[track][0];
    Object.assign(c.state,{roundActive:true,track,levelId:level.id,reportRecorded:false,currentProblem:{type:level.topic}});
    c.recordReportOutcome('supported');
  }
  const r=c.buildReportData(c.getProgress());
  assert.equal(r.topics.length,2);assert.equal(r.questions,12);
  for(const topic of r.topics) {
    assert.equal(topic.skills.length,3);
    assert.equal(new Set(topic.skills.map(s=>s.label)).size,3);
    for(const skill of topic.skills)assert.match(skill.label,/Missing (result|second number|first number).*Within 10/);
  }
  assert.equal(r.topics.find(t=>t.id==='addition').skills.find(s=>s.id==='addition1').independent,6);
  const text=c.reportText(r);assert.match(text,/Missing first number/);assert.doesNotMatch(text,/Within 20|Within 100/);
});

test('report entries follow form and numeric difficulty order rather than placing 100 before 20', () => {
  const c=app();
  for(const track of ['addition_missing_first','addition_missing_second','addition']) {
    for(const level of Array.from(c.TRACK_LEVELS[track]).reverse()) {
      Object.assign(c.state,{roundActive:true,track,levelId:level.id,reportRecorded:false,currentProblem:{type:'addition'}});
      c.recordReportOutcome('independent');
    }
  }
  assert.deepEqual(Array.from(c.buildReportData(c.getProgress()).topics[0].skills,s=>s.id),[
    'addition1','addition2','addition3',
    'addition_missing_second1','addition_missing_second2','addition_missing_second3',
    'addition_missing_first1','addition_missing_first2','addition_missing_first3'
  ]);
});
