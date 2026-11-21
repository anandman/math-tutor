const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function node(tag='div') {return {tag,attrs:{},children:[],listeners:{},style:{},textContent:'',disabled:false,
  setAttribute(k,v){this.attrs[k]=String(v);},appendChild(child){this.children.push(child);return child;},replaceChildren(...children){this.children=children;},addEventListener(k,f){this.listeners[k]=f;}};}
function app(){
  const saved=new Map(),c=vm.createContext({document:{addEventListener(){},getElementById(){return node();},createElement:node,createElementNS:(ns,tag)=>node(tag)},localStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)}});
  let source=fs.readFileSync(process.env.BAKERY_SOURCE||'index.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1].replace(/renderLevelSelect\(\);\s*$/,'');
  vm.runInContext(source,c);return c;
}
function fixture(c,skill,n=0){return c.makeEarlyProblem({skill},n);}
function descendants(root){return root.children.flatMap(child=>[child,...descendants(child)]);}
function click(root,label){const b=descendants(root).find(el=>el.tag==='button'&&el.attrs['aria-label']===label);assert.ok(b,'Button exists: '+label);assert.equal(b.disabled,false);b.listeners.click();}
function shownText(root){return [root.textContent,...descendants(root).map(el=>el.textContent)].filter(Boolean).join(' ');}

test('Kindergarten supplies 26 bounded deterministic activities with real answer controls',()=>{
  const c=app();assert.deepEqual(Object.keys(c.EARLY_PATHWAY_SKILLS).sort(),['data','measurement','place','shapes','stories','strategies']);
  const skills=Object.values(c.EARLY_PATHWAY_SKILLS).flat();assert.equal(skills.length,26);assert.equal(new Set(skills.map(s=>s[0])).size,26);
  for(const group of Object.values(c.EARLY_PATHWAY_SKILLS))assert.ok(group.length>=3&&group.length<=6);
  for(const [skill,name,desc] of skills){assert.ok(name&&desc);for(let n=0;n<24;n++){
    const p=fixture(c,skill,n);assert.deepEqual(p,fixture(c,skill,n));assert.ok(p.story&&p.hintText&&p.explanation&&p.visual,skill);assert.equal(typeof p.answer,'string');
    assert.ok(p.choices||p.widget,skill+' has age-appropriate controls');assert.ok(!p.fractionInput&&!p.decimalInput);
    const visual=node();assert.equal(c.renderEarlyVisual(visual,p.visual,false),true);assert.ok(visual.children[0].attrs['aria-label'].length>10);
    if(p.choices){assert.equal(new Set(p.choices).size,p.choices.length,skill);assert.ok(p.choices.includes(p.answer),skill);}
    if(p.widget){assert.equal(c.matchEarlyAnswer(p,p.answer),true,skill+' '+n);assert.equal(c.matchEarlyAnswer(p,p.widget.solution),true);assert.equal(c.matchEarlyAnswer(p,'nonsense'),false);}
  }}
  assert.equal(fixture(c,'foreign'),null);assert.equal(c.matchEarlyAnswer({answer:'2'},'2'),null);
});

test('counting distinguishes 0–20 regular layouts, scattered sets to 10, and counted-out sets',()=>{
  const c=app(),counts=new Set(),scattered=new Set();
  for(let n=0;n<24;n++)for(const skill of ['k_count20','k_scattered']){
    const p=fixture(c,skill,n),root=node();c.renderEarlyVisual(root,p.visual,false);
    assert.equal(descendants(root).filter(e=>e.attrs['data-cookie']==='true').length,+p.answer);
    (skill==='k_count20'?counts:scattered).add(+p.answer);assert.ok(+p.answer>=0&&+p.answer<=(skill==='k_count20'?20:10));
    const visible=shownText(root);assert.ok(!new RegExp('\\b'+p.answer+'\\b').test(visible),'No total labels in independent counting picture');
    for(const circle of descendants(root).filter(e=>e.attrs['data-cookie']==='true')){
      const [,x,y]=circle.attrs.transform.match(/translate\(([-.\d]+) ([-.\d]+)\)/);assert.ok(+x>=44&&+x<=356);assert.ok(+y>=39&&+y<=206,'Cookies stay inside the tray');
    }
  }
  assert.equal(counts.size,21);assert.equal(scattered.size,11);
  const empty=fixture(c,'k_count_out',0);assert.equal(c.matchEarlyAnswer(empty,'[]'),true);assert.equal(c.matchEarlyAnswer(empty,'[0]'),false);
  const p=fixture(c,'k_count_out',3);assert.equal(c.matchEarlyAnswer(p,'[2,8,19]'),true,'Any three distinct slots work');
  for(const bad of ['[1,1,2]','[1,2,20]','[-1,2,3]','[1,2,3.5]','[1,2]','["1",2,3]','null','{}'])assert.equal(c.matchEarlyAnswer(p,bad),false,bad);
});

test('count-along models stop at 100 and teen building requires a ten plus ones',()=>{
  const c=app();let endpoint=false;
  for(let n=0;n<24;n++){
    const p=fixture(c,'k_count100',n),v=p.visual;assert.equal(+p.answer,v.start+v.step*v.jumps);assert.ok(+p.answer<=100&&v.start>=0);assert.ok(v.step===1||v.step===10);if(v.step===10)assert.equal(v.start%10,0);endpoint||=+p.answer===100;
    const root=node();c.renderEarlyVisual(root,v,false);assert.ok(!new RegExp('\\b'+p.answer+'\\b').test(shownText(root)),'Final sequence number remains hidden');
    const teen=fixture(c,'k_teen',n),a=JSON.parse(teen.answer);assert.ok(teen.widget.target>=11&&teen.widget.target<=19);assert.equal(a[0],1);assert.equal(a[0]*10+a[1],teen.widget.target);assert.equal(c.matchEarlyAnswer(teen,JSON.stringify([0,teen.widget.target])),false);
  }
  assert.equal(endpoint,true);
});

test('concrete arithmetic and stories remain within 5 or 10 without negative answers',()=>{
  const c=app();
  for(let n=0;n<24;n++)for(const skill of ['k_add5','k_take5','k_add10','k_take10','k_join_story','k_leave_story','k_parts_story']){
    const p=fixture(c,skill,n),v=p.visual,max=/5$/.test(skill)?5:10,want=v.take?v.a-v.b:v.a+v.b;
    assert.equal(+p.answer,want);assert.ok(want>=0&&want<=max);assert.ok(v.a>=0&&v.a<=max&&v.b>=0&&v.b<=max);
    const root=node();c.renderEarlyVisual(root,v,false);const items=descendants(root).filter(e=>e.attrs['data-cookie']==='true');assert.equal(items.length,v.take?v.a:v.a+v.b);
    if(v.take)assert.equal(descendants(root).filter(e=>e.tag==='line'&&e.attrs.stroke==='#a33b41').length,v.b*2);
    assert.ok(!shownText(root).includes(p.answer),'Independent arithmetic model does not print its result');
  }
  for(let n=0;n<24;n++){
    const p=fixture(c,'k_make10',n);assert.equal(p.visual.filled+(+p.answer),10);
    const parts=fixture(c,'k_parts',n);for(let a=0;a<=parts.widget.target;a++)assert.equal(c.matchEarlyAnswer(parts,JSON.stringify([a,parts.widget.target-a])),true);
    assert.equal(c.matchEarlyAnswer(parts,JSON.stringify([parts.widget.target,1])),false);assert.equal(c.matchEarlyAnswer(parts,'[-1,3]'),false);
  }
});

test('comparison prompts match their models, including equal and empty categories',()=>{
  const c=app();
  for(let n=0;n<24;n++){
    const p=fixture(c,'k_compare',n),v=p.visual,more=/more|greater/.test(p.story);assert.equal(p.answer,v.a===v.b?'Same number':((more?v.a>v.b:v.a<v.b)?'A':'B'));assert.ok(v.a<=10&&v.b<=10);
    const count=fixture(c,'k_category_count',n);assert.equal(+count.answer,/circles/.test(count.story)?count.visual.a:count.visual.b);
    const compare=fixture(c,'k_category_compare',n),q=compare.visual;assert.equal(compare.answer,q.a===q.b?'Same number':((/more/.test(compare.story)?q.a>q.b:q.a<q.b)?'Circles':'Triangles'));
  }
});

test('shape outlines, composition targets, and measurement diagrams have faithful geometry',()=>{
  const c=app(),rotations=new Set(),solidNames=new Set();
  for(let n=0;n<24;n++){
    const p=fixture(c,'k_shape_names',n);assert.equal(p.answer,p.visual.shape);rotations.add(p.visual.rotation);
    const solid=fixture(c,'k_solid_shapes',n);if(!['Flat','Solid'].includes(solid.answer))solidNames.add(solid.answer);
    const composition=fixture(c,'k_compose',n),a=JSON.parse(composition.answer);assert.equal(a.length,2);assert.ok(a.every(x=>x===(composition.widget.targetShape==='square'?0:1)));
    for(const skill of ['k_length','k_height','k_weight']){
      const p=fixture(c,skill,n),v=p.visual,more=/longer|taller|heavier/.test(p.story);assert.equal(p.answer,v.a===v.b?'Same':((more?v.a>v.b:v.a<v.b)?'A':'B'));
      const root=node();c.renderEarlyVisual(root,v,false);const nodes=descendants(root);
      if(skill==='k_length'){const [a,b]=nodes.filter(e=>e.attrs['data-object']);assert.equal(a.attrs.x,b.attrs.x);assert.equal(Math.sign(+a.attrs.width-+b.attrs.width),Math.sign(v.a-v.b));}
      if(skill==='k_height'){const [a,b]=nodes.filter(e=>e.attrs['data-object']);assert.equal(+a.attrs.y+(+a.attrs.height),+b.attrs.y+(+b.attrs.height));assert.equal(Math.sign(+a.attrs.height-+b.attrs.height),Math.sign(v.a-v.b));}
      if(skill==='k_weight'){const beam=nodes.find(e=>e.attrs['data-balance']);assert.equal(Math.sign(+beam.attrs.y1-+beam.attrs.y2),Math.sign(v.a-v.b),'Heavier side is visibly lower');}
    }
  }
  assert.ok(rotations.size>=3);assert.equal(solidNames.size,4);
});

test('sorting validates the chosen attribute while irrelevant size and color vary',()=>{
  const c=app();
  for(let n=0;n<24;n++){
    const p=fixture(c,'k_sort',n),w=p.widget,solution=JSON.parse(w.solution);assert.ok(w.items.length>=4&&w.items.length<=10);assert.equal(new Set(w.items.map(i=>i.size)).size,2);
    w.items.forEach((item,i)=>assert.equal(w.groups[solution[i]],item[w.attribute]));
    assert.equal(c.matchEarlyAnswer(p,JSON.stringify(solution.map((x,i)=>i===0?1-x:x))),false);
    for(const bad of ['[]','[-1,0]','[true,0]','{}'])assert.equal(c.matchEarlyAnswer(p,bad),false);
  }
});

test('hands-on controls submit actual edited models and reveal mode disables all editing',()=>{
  const c=app();
  for(const skill of ['k_count_out','k_teen','k_parts','k_compose','k_sort']){
    const p=fixture(c,skill,7),root=node();let submitted;
    assert.equal(c.renderEarlyAnswer(root,p,raw=>submitted=raw,false),true);
    if(skill==='k_count_out')for(let i=0;i<p.widget.target;i++)click(root,'Cookie spot '+(20-i));
    if(skill==='k_teen'){click(root,'Add one full tray of ten');for(let i=0;i<p.widget.target-10;i++)click(root,'Add one single cookie');}
    if(skill==='k_parts')for(let i=0;i<p.widget.target;i++)click(root,'Add one cookie on plate B');
    if(skill==='k_compose')for(let i=1;i<=2;i++){const b=descendants(root).find(e=>e.tag==='button'&&e.textContent.startsWith('Piece '+i+':'));for(let tap=0;tap<(p.widget.targetShape==='square'?1:2);tap++)b.listeners.click();}
    if(skill==='k_sort'){
      const bs=descendants(root).filter(e=>e.tag==='button'&&e.attrs['aria-label'].includes('cookie. Group:'));
      JSON.parse(p.widget.solution).forEach((group,i)=>{for(let j=0;j<=group;j++)bs[i].listeners.click();});
    }
    click(root,'Check my work');assert.equal(c.matchEarlyAnswer(p,submitted),true,skill+' submitted constructed state');
    const solved=node();c.renderEarlyAnswer(solved,p,()=>assert.fail('Revealed answer submitted'),true);const controls=descendants(solved).filter(e=>['button','input','select'].includes(e.tag));assert.ok(controls.length);assert.ok(controls.every(e=>e.disabled));assert.ok(controls.every(e=>!e.listeners.click));
  }
  const untouched=node();untouched.appendChild(node('existing'));
  assert.equal(c.renderEarlyAnswer(untouched,{answer:'2'},()=>{},false),false);assert.equal(c.renderEarlyVisual(untouched,{kind:'foreign'},false),false);assert.equal(untouched.children[0].tag,'existing');
});

test('sorting keeps keyboard focus on the cookie when it moves between groups',()=>{const c=app(),p=fixture(c,'k_sort',0),root=node();c.renderEarlyAnswer(root,p,()=>{},false);const cookie=descendants(root).find(el=>el.tag==='button'&&(el.attrs['aria-label']||'').includes('cookie. Group:'));for(const el of [root,...descendants(root)]){const replace=el.replaceChildren;el.replaceChildren=function(...children){if(descendants(this).includes(c.document.activeElement))c.document.activeElement=null;replace.apply(this,children);};}cookie.focus=()=>{c.document.activeElement=cookie;};cookie.focus();cookie.listeners.click();assert.equal(c.document.activeElement,cookie);cookie.listeners.click();assert.equal(c.document.activeElement,cookie);});
