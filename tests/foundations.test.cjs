const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

function node(tag='div') {
  return {tag,attrs:{},children:[],listeners:{},style:{},textContent:'',value:'',disabled:false,
    setAttribute(k,v){this.attrs[k]=String(v);},appendChild(child){this.children.push(child);return child;},
    replaceChildren(...children){this.children=children;},addEventListener(k,fn){this.listeners[k]=fn;}};
}
function app(){
  const saved=new Map();
  const c=vm.createContext({document:{addEventListener(){},getElementById(){return node();},createElement:node,createElementNS:(ns,tag)=>node(tag)},localStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)}});
  vm.runInContext(fs.readFileSync(process.env.BAKERY_SOURCE||'index.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1].replace(/renderLevelSelect\(\);\s*$/,''),c);
  return c;
}
function fixture(c,skill,n=0){return c.makeFoundationProblem({skill},n);}
function descendants(root){return root.children.flatMap(child=>[child,...descendants(child)]);}

test('foundation pathways provide meaningful practice throughout grades 1–4',()=>{
  const c=app();assert.ok(c.FOUNDATION_PATHWAYS,'foundation curriculum is available');
  const ids=[];
  for(const name of ['place','time']){
    const path=c.FOUNDATION_PATHWAYS[name];assert.equal(path.grades.length,4);
    path.grades.forEach(skills=>{assert.ok(skills.length>=3&&skills.length<=5);skills.forEach(s=>{assert.ok(s[1]&&s[2]);ids.push(s[0]);});});
  }
  assert.equal(new Set(ids).size,ids.length);
  for(const skill of ids)for(let n=0;n<24;n++){
    const p=fixture(c,skill,n);assert.ok(p&&p.story&&p.hintText&&p.explanation&&p.visual,skill);
    assert.equal(typeof p.answer,'string');assert.deepEqual(p,fixture(c,skill,n));
    if(p.choices){assert.equal(new Set(p.choices).size,p.choices.length);assert.ok(p.choices.includes(p.answer));}
    if(p.widget){assert.equal(c.matchFoundationAnswer(p,p.widget.solution),true,skill+' '+n);assert.equal(c.matchFoundationAnswer(p,'nonsense'),false);}
  }
  assert.equal(c.makeFoundationProblem({skill:'not-a-foundation-skill'},0),null);
  assert.equal(c.matchFoundationAnswer({answer:'4'},'4'),null);
});

test('place-value generators respect grade bounds and rounding midpoint rules',()=>{
  const c=app();assert.equal(typeof c.makeFoundationProblem,'function');
  for(let n=0;n<24;n++){
    const count=fixture(c,'pv_count120',n);assert.ok(+count.answer>=1&&+count.answer<=120);assert.equal(+count.answer,count.visual.start+count.visual.steps);
    const build=fixture(c,'pv_build_tens',n);assert.ok(build.widget.target>=10&&build.widget.target<=99);
    const hundreds=fixture(c,'pv_hundreds',n);assert.ok(hundreds.widget.target>=100&&hundreds.widget.target<=999);
    const big=fixture(c,'pv_million',n);assert.ok(big.widget.target>=1000&&big.widget.target<=1000000);
    for(const skill of ['pv_round1000','pv_round_large']){
      const p=fixture(c,skill,n),v=p.visual;
      assert.equal(+p.answer,+p.answer%v.unit===0?Math.floor((v.value+v.unit/2)/v.unit)*v.unit:NaN);
    }
  }
  assert.equal(fixture(c,'pv_round1000',0).answer,'30','25 rounds up to 30');
  assert.equal(fixture(c,'pv_million',23).widget.target,1000000);
});

test('base-ten operations and contextual time/money work have independently checkable quantities',()=>{
  const c=app();assert.equal(typeof c.makeFoundationProblem,'function');
  for(let n=0;n<24;n++){
    for(const skill of ['pv_add1000','pv_sub1000','pv_tens_product']){
      const p=fixture(c,skill,n),v=p.visual;
      const want=skill==='pv_add1000'?v.a+v.b:skill==='pv_sub1000'?v.a-v.b:v.a*v.b;
      assert.equal(p.widget?p.widget.target:+p.answer,want,skill+' '+n);
      assert.ok(want>=0&&want<=1000);
    }
    const more=fixture(c,'pv_ten_change',n);assert.equal(+more.answer,more.visual.value+more.visual.change);
    const skip=fixture(c,'pv_skip_count',n);assert.equal(+skip.answer,skip.visual.start+skip.visual.step*skip.visual.jumps);
    const elapsed=fixture(c,'tm_elapsed',n);assert.equal(+elapsed.answer,elapsed.visual.end-elapsed.visual.start);
    const finish=fixture(c,'tm_finish',n);assert.equal(finish.widget.targetMinutes,(finish.visual.start+finish.visual.duration)%720);
    const money=fixture(c,'tm_money_steps',n);assert.equal(money.widget.target,money.visual.paid-money.visual.price*money.visual.count);
    const measurement=fixture(c,'tm_measure_steps',n);assert.equal(+measurement.answer,measurement.visual.amount*measurement.visual.factor-measurement.visual.used);
    const time=fixture(c,'tm_time_steps',n);assert.equal(+time.answer,time.visual.total-time.visual.first-time.visual.second);
  }
});

test('place workbenches require the right value and exchange goal, while coins accept equivalent amounts',()=>{
  const c=app();assert.equal(typeof c.matchFoundationAnswer,'function');
  const build=fixture(c,'pv_build_tens');assert.equal(build.widget.target,34);
  assert.equal(c.matchFoundationAnswer(build,'[3,4]'),true);assert.equal(c.matchFoundationAnswer(build,'[2,14]'),false);
  assert.equal(c.matchFoundationAnswer(build,'[3,-4]'),false);assert.equal(c.matchFoundationAnswer(build,'[3,4,0]'),false);
  const exchange=fixture(c,'pv_exchange');assert.equal(exchange.widget.target,134);
  assert.equal(c.matchFoundationAnswer(exchange,'[0,13,4]'),true);
  assert.equal(c.matchFoundationAnswer(exchange,'[1,3,4]'),false,'unchanged value without requested trade is incomplete');
  const coins=fixture(c,'tm_coins');assert.equal(coins.widget.target,30);
  assert.equal(c.matchFoundationAnswer(coins,'[1,0,1,0]'),true,'quarter and nickel');
  assert.equal(c.matchFoundationAnswer(coins,'[0,3,0,0]'),true,'three dimes');
  assert.equal(c.matchFoundationAnswer(coins,'[0,0,0,30]'),true,'thirty pennies');
  for(const bad of ['[1,0,0,0]','[-1,5,1,0]','[0,0,0,30.5]','[0,3]','{"target":30}'])assert.equal(c.matchFoundationAnswer(coins,bad),false,bad);
});

test('clock questions distinguish hour/minute positions and reject impossible times',()=>{
  const c=app();assert.equal(typeof c.makeFoundationProblem,'function');
  for(let n=0;n<24;n++){
    for(const skill of ['tm_hour','tm_half','tm_five','tm_minute']){
      const p=fixture(c,skill,n),v=p.visual;
      assert.equal(p.answer,v.hour+':'+String(v.minute).padStart(2,'0'));
      assert.equal(v.hourAngle,(v.hour%12)*30+v.minute/2);
      assert.equal(v.minuteAngle,v.minute*6);
      assert.ok(v.hour>=1&&v.hour<=12&&v.minute>=0&&v.minute<60);
    }
  }
  const p=fixture(c,'tm_set_half');
  assert.equal(c.matchFoundationAnswer(p,p.widget.solution),true);
  assert.equal(c.matchFoundationAnswer(p,'{"hour":13,"minute":30}'),false);
  assert.equal(c.matchFoundationAnswer(p,'{"hour":0,"minute":30}'),false);
  assert.equal(c.matchFoundationAnswer(p,'{"hour":3,"minute":60}'),false);
  const root=node();c.renderFoundationVisual(root,{kind:'fd_clock',hour:3,minute:30,hourAngle:105,minuteAngle:180},false);
  const hand=descendants(root).find(el=>el.attrs['data-hand']==='hour');
  assert.ok(hand,'rendered hour hand is identifiable');assert.ok(+hand.attrs.y2>125,'3:30 hour hand moves beyond 3');
});

test('time reading uses clock choices rather than an unusable numeric-only time entry',()=>{
  const c=app();assert.equal(typeof c.makeFoundationProblem,'function');
  for(const skill of ['tm_hour','tm_half','tm_five','tm_minute'])for(let n=0;n<24;n++){
    const p=fixture(c,skill,n);assert.ok(p.choices);assert.equal(p.choices.length,4);assert.equal(new Set(p.choices).size,4);assert.ok(p.choices.includes(p.answer));
  }
});

test('visual descriptions expose the model to assistive technology and use correct unit names',()=>{
  const c=app();assert.equal(typeof c.renderFoundationVisual,'function');
  for(const path of Object.values(c.FOUNDATION_PATHWAYS))for(const skills of path.grades)for(const [skill] of skills){
    const p=fixture(c,skill),root=node();assert.equal(c.renderFoundationVisual(root,p.visual,false),true);
    const description=root.children[0].attrs['aria-label'];assert.ok(description.length>20);assert.ok(!description.includes('fd_'),skill);
  }
  const clock=node();c.renderFoundationVisual(clock,fixture(c,'tm_half').visual,false);
  assert.ok(clock.children[0].attrs['aria-label'].includes('30 minute marks'));
  const units=node();c.renderFoundationVisual(units,fixture(c,'tm_measure_steps',3).visual,false);
  assert.ok(descendants(units).some(el=>el.textContent==='1 foot = 12 inches'));
});

test('interactive controls submit actual edits and revealed examples disable editing',()=>{
  const c=app();assert.equal(typeof c.renderFoundationAnswer,'function');
  const p=fixture(c,'pv_build_tens'),root=node();let submitted;
  assert.equal(c.renderFoundationAnswer(root,p,raw=>submitted=raw,false),true);
  let controls=descendants(root);
  const addTens=controls.find(el=>el.attrs['aria-label']==='Add one ten');
  const addOnes=controls.find(el=>el.attrs['aria-label']==='Add one one');
  assert.ok(addTens&&addOnes);
  for(let i=0;i<3;i++)addTens.listeners.click();for(let i=0;i<4;i++)addOnes.listeners.click();
  controls.find(el=>el.textContent==='Check my model').listeners.click();assert.equal(c.matchFoundationAnswer(p,submitted),true);
  for(const skill of ['pv_build_tens','pv_exchange','tm_set_half','tm_coins']){
    const example=node();c.renderFoundationAnswer(example,fixture(c,skill),()=>assert.fail('worked example submitted'),true);
    const inputs=descendants(example).filter(el=>['button','input','select'].includes(el.tag));assert.ok(inputs.length);assert.ok(inputs.every(el=>el.disabled),skill);
  }
  const untouched=node();untouched.appendChild(node('existing'));
  assert.equal(c.renderFoundationAnswer(untouched,{answer:'2'},()=>{},false),false);assert.equal(untouched.children[0].tag,'existing');
  assert.equal(c.renderFoundationVisual(untouched,{kind:'unknown'},false),false);assert.equal(untouched.children[0].tag,'existing');
});
