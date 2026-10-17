const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
function app(saved={}) {
 const storage=new Map([['bakery-quest-v2',JSON.stringify(saved)]]), intervals=new Map(), timeouts=new Map(), elements=new Map();let id=0;
 const element=key=>{if(!elements.has(key))elements.set(key,{style:{},classList:{contains:()=>false},addEventListener(){}});return elements.get(key);};
 const c=vm.createContext({document:{getElementById:element,addEventListener(){}},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},setInterval:fn=>{intervals.set(++id,fn);return id;},clearInterval:id=>intervals.delete(id),setTimeout:fn=>{timeouts.set(++id,fn);return id;},clearTimeout:id=>timeouts.delete(id)});
 vm.runInContext(fs.readFileSync('index.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1].replace(/renderLevelSelect\(\);\s*$/,''),c);
 return {c,intervals,timeouts,element};
}
test('pace persists and invalid settings fall back to 20 seconds',()=>{
 const {c}=app(); assert.equal(c.getProgress().timerSeconds,20);
 c.setPace(60);assert.equal(c.getProgress().timerSeconds,60);
 c.setPace(0);assert.equal(c.getProgress().timerSeconds,0);
 c.setPace(-1);assert.equal(c.getProgress().timerSeconds,0);
 assert.equal(app({timerSeconds:123}).c.getProgress().timerSeconds,20);
});
test('untimed play creates no countdown, while timed play uses the selected limit',()=>{
 const {c,intervals}=app({timerSeconds:0});c.startPatience();assert.equal(intervals.size,0);
 c.setPace(60);c.startPatience();assert.equal(c.state.patienceRemaining,60);assert.equal(intervals.size,1);
 c.setPace(0);c.startPatience();assert.equal(intervals.size,0);
});
test('timeouts do not demote mastery, and pending order changes can be cancelled',()=>{
 const {c,timeouts}=app({sr:{'mul:3x4':{box:3,correct:5,wrong:0}}});
 c.state.roundActive=true;c.state.currentProblem={display:'3 × 4 = ?',answer:12,srKey:'mul:3x4'};
 c.timeUp();assert.equal(c.getProgress().sr['mul:3x4'].box,3);assert.equal(c.getProgress().sr['mul:3x4'].wrong,0);
 c.showScreen=()=>{};c.quitGame();assert.equal(timeouts.size,0);
});
test('quitting banks earned tips once without unlocking levels or leaving pending callbacks',()=>{
 const {c,intervals,timeouts}=app({totalTips:10,unlockedLevels:['m1','d1']});
 c.showScreen=()=>{};c.state.roundActive=true;c.state.tips=9;c.state.currentOrder=4;
 c.state.patienceTimer=c.setInterval(()=>{},100);c.state.nextOrderTimer=c.setTimeout(()=>{},1500);
 c.quitGame();c.quitGame();
 assert.equal(c.getProgress().totalTips,19);assert.ok(!c.getProgress().unlockedLevels.includes('m2'));
 assert.equal(intervals.size,0);assert.equal(timeouts.size,0);assert.equal(c.state.roundActive,false);
 const before=c.state.currentOrder;c.nextOrder();assert.equal(c.state.currentOrder,before);
});
