const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function node(tag='div'){return {tag,attrs:{},children:[],listeners:{},style:{},textContent:'',value:'',disabled:false,setAttribute(k,v){this.attrs[k]=String(v);},appendChild(child){this.children.push(child);return child;},replaceChildren(...children){this.children=children;},addEventListener(k,fn){this.listeners[k]=fn;}};}
function app(){
  const saved=new Map();const c=vm.createContext({document:{addEventListener(){},getElementById(){return node();},createElement:node,createElementNS:(ns,tag)=>node(tag)},localStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)}});
  const source=fs.readFileSync(process.env.BAKERY_SOURCE||'index.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1].replace(/renderLevelSelect\(\);\s*$/,'');
  vm.runInContext(source,c);
  return c;
}
function descendants(root){return root.children.flatMap(child=>[child,...descendants(child)]);}
function fixture(c,skill,n=0){return c.makeFifthNumberProblem({skill},n);}
function fraction(s){const text=String(s);if(text.includes('/')){const [a,b]=text.split('/').map(Number);return [a,b];}const [a,b='']=text.split('.');return [Number(a+b),10**b.length];}
function assertFraction(actual,num,den,message){const [a,b]=fraction(actual);assert.equal(a*den,b*num,message);}
function skills(c){return Object.values(c.FIFTH_NUMBER_SKILLS).flat().map(s=>s[0]);}

test('grade 5 numbers provide 28 deterministic skills with 24 distinct tasks and exact validated answers',()=>{
 const c=app(),ids=skills(c);assert.equal(ids.length,28);assert.equal(new Set(ids).size,28);
 for(const skill of ids){const unique=new Set();for(let n=0;n<24;n++){
   const p=fixture(c,skill,n);assert.ok(p.story&&p.hintText&&p.explanation&&p.visual,skill);assert.equal(typeof p.answer,'string');assert.equal(p.skill,skill);assert.deepEqual(p,fixture(c,skill,n));unique.add(JSON.stringify([p.story,p.visual]));
   assert.equal(c.matchFifthNumberAnswer(p,p.answer),true,skill+' '+n);
   for(const raw of ['','nope','NaN','1/0','2junk','1e2','Infinity','[1]','-1','1/2/3','1..2'])assert.equal(c.matchFifthNumberAnswer(p,raw),false,skill+' malformed '+raw);
   if(p.choices){assert.equal(new Set(p.choices).size,p.choices.length);assert.ok(p.choices.includes(p.answer));}
   if(p.widget)assert.equal(p.widget.solution,p.answer);
 }assert.equal(unique.size,24,skill+' must offer 24 distinct tasks');}
 assert.equal(c.makeFifthNumberProblem({skill:'other'},0),null);assert.equal(c.matchFifthNumberAnswer({skill:'other',answer:'1'},'1'),null);assert.equal(c.matchFifthNumberAnswer({skill:'g5n_foreign',answer:'1'},'1'),null);
});

test('place values, powers, comparisons, and rounding match independent integer calculations',()=>{
 const c=app();for(let n=0;n<24;n++){
  let p=fixture(c,'g5n_digit',n),v=p.visual;const digit=Math.floor(v.units/10**(3-v.focus))%10;assertFraction(p.answer,digit,10**v.focus);assert.ok(p.decimalInput);
  p=fixture(c,'g5n_expanded',n);const digits=JSON.parse(p.answer);assert.equal(digits.reduce((s,d,i)=>s+d*10**(3-i),0),p.widget.target);assert.ok(p.widget.target<=9999);
  p=fixture(c,'g5n_compare',n);v=p.visual;assert.equal(p.answer,v.a===v.b?'=':v.a>v.b?'>':'<');
  p=fixture(c,'g5n_round',n);v=p.visual;const unit=v.high-v.low;assert.ok(v.units>=v.low&&v.units<v.high);assertFraction(p.answer,Math.floor((v.units+unit/2)/unit)*unit,1000);
  p=fixture(c,'g5n_powers',n);v=p.visual;assertFraction(p.answer,v.divide?v.value:v.value*10**v.power,v.divide?10**v.power:1);assert.ok(v.power>=1&&v.power<=3);
  p=fixture(c,'g5n_relationship',n);v=p.visual;const [a,b]=fraction(v.from),[x,y]=fraction(v.to);assert.equal(p.answer,x*b===10*a*y?'ten times as much':'one tenth as much');assert.ok(x*b===10*a*y||10*x*b===a*y);
 }
});

test('whole operations, grouped expressions, and related patterns preserve grade 5 bounds',()=>{
 const c=app();for(let n=0;n<24;n++){
  let p=fixture(c,'g5n_multiply',n),v=p.visual;assert.equal(+p.answer,v.a*v.b);assert.equal(v.tens+v.ones,v.b);assert.ok(v.a>=100&&v.a<=999&&v.b>=10&&v.b<100);
  p=fixture(c,'g5n_divide',n);v=p.visual;assert.equal(+p.answer*v.size,v.total);assert.ok(v.total>=1000&&v.total<=9999);assert.ok(v.size>=10&&v.size<=99);
  p=fixture(c,'g5n_expression',n);v=p.visual;if(p.choices){assert.equal(p.answer,'('+v.a+' + '+v.b+') × '+v.c+' − '+v.d);assert.equal(v.operation,'expression_plan');assert.ok(!v.labels.includes(p.answer));}else assert.equal(+p.answer,v.mode===1?(v.a+v.b*v.c)*v.d:(v.a+v.b)*v.c-v.d);
  p=fixture(c,'g5n_patterns',n);v=p.visual;assert.equal(+p.answer,v.step*v.stepB);assert.equal(v.stepB%v.stepA,0);
 }
});

test('decimal arithmetic and multi-step bills use exact scaled units',()=>{
 const c=app();for(let n=0;n<24;n++){
  for(const op of ['add','subtract','multiply','divide']){
   const p=fixture(c,'g5n_decimal_'+op,n),v=p.visual,A=10**v.placesA,B=10**v.placesB;assert.ok(v.placesA<=2&&v.placesB<=2);assert.ok(p.decimalInput);
   const num=op==='add'?v.a*B+v.b*A:op==='subtract'?v.a*B-v.b*A:op==='multiply'?v.a*v.b:v.a*B;
   const den=op==='divide'?A*v.b:A*B;assertFraction(p.answer,num,den,op+' '+n);assert.ok(/^\d+\.\d{1,2}$/.test(p.answer));
   const [a,b]=fraction(p.answer);assert.equal(c.matchFifthNumberAnswer(p,(a*2)+'/'+(b*2)),true);assert.equal(c.matchFifthNumberAnswer(p,(a+1)+'/'+b),false);
  }
  const p=fixture(c,'g5n_shopping',n),v=p.visual;assertFraction(p.answer,v.a*v.b+v.c,100);
  const pack=fixture(c,'g5n_packages',n),z=pack.visual;assert.equal(+pack.answer,Math.ceil(z.total/z.size));assert.ok(z.remainder>0&&z.remainder<z.size);assert.ok(z.total>=1000&&z.total<10000);
 }
});

test('fraction work uses unlike units, exact products, mixed numbers, and grade 5 division only',()=>{
 const c=app();for(let n=0;n<24;n++){
  for(const skill of ['g5n_fraction_add','g5n_fraction_subtract','g5n_mixed','g5n_recipe']){
   const p=fixture(c,skill,n),v=p.visual;assert.notEqual(v.b,v.d);assert.equal(v.common%v.b,0);assert.equal(v.common%v.d,0);
   const want=v.operation==='subtract'?v.a*v.d-v.c*v.b:v.a*v.d+v.c*v.b;assert.ok(want>=0);assertFraction(p.answer,want,v.b*v.d);assert.ok(p.fractionInput);
   const [a,b]=fraction(p.answer);assert.equal(c.matchFifthNumberAnswer(p,(a*3)+'/'+(b*3)),true);if(a>b&&a%b)assert.equal(c.matchFifthNumberAnswer(p,Math.floor(a/b)+' '+a%b+'/'+b),true);
   if(skill==='g5n_mixed')assert.match(p.story,/\d+ \d+\/\d+/);
  }
  let p=fixture(c,'g5n_fraction_division',n),v=p.visual;assertFraction(p.answer,v.numerator,v.groups);
  p=fixture(c,'g5n_batches',n);v=p.visual;assertFraction(p.answer,v.a*v.c,v.b*v.d);assert.ok(v.a<v.b&&v.c<v.d);
  p=fixture(c,'g5n_fraction_product',n);v=p.visual;assert.deepEqual(JSON.parse(p.answer),[v.a,v.c]);assert.ok(!v.showOverlap,'independent area model starts unfilled');
  p=fixture(c,'g5n_scaling',n);v=p.visual;assert.equal(p.answer,v.numerator<v.denominator?'smaller':v.numerator===v.denominator?'the same':'greater');
  for(const skill of ['g5n_unit_divide','g5n_whole_divide','g5n_sharing']){p=fixture(c,skill,n);v=p.visual;if(v.operation==='count_portions'){assert.equal(v.denominator,1);assertFraction(p.answer,v.numerator*v.groups,1);}else{assert.equal(v.numerator,1);assertFraction(p.answer,1,v.denominator*v.groups);}}
  p=fixture(c,'g5n_benchmark',n);v=p.visual;const sum=v.a*v.d+v.c*v.b,den=v.b*v.d;assert.equal(p.answer,sum*2<den?'less than 1/2':sum*2===den?'exactly 1/2':sum<den?'between 1/2 and 1':sum===den?'exactly 1':'greater than 1');
 }
});

test('decimal model accepts valid unit exchanges and fraction model checks both factors',()=>{
 const c=app();for(let n=0;n<24;n++){
  const p=fixture(c,'g5n_expanded',n),arr=JSON.parse(p.answer);const exchanged=arr.slice();exchanged[0]--;exchanged[1]+=10;assert.equal(c.matchFifthNumberAnswer(p,JSON.stringify(exchanged)),true);
  for(const raw of ['[1,2,3]','[1,2,3,4,5]','[1,-2,3,4]','[1,2.5,3,4]','[1,21,3,4]','["1",2,3,4]','{"0":1}'])assert.equal(c.matchFifthNumberAnswer(p,raw),false);
  const area=fixture(c,'g5n_fraction_product',n),w=area.widget;assert.equal(c.matchFifthNumberAnswer(area,JSON.stringify([w.a,w.c+1])),false);assert.equal(c.matchFifthNumberAnswer(area,JSON.stringify([w.a,w.c,0])),false);
 }
});

test('all number diagrams expose meaningful descriptions and finite in-bounds SVG geometry',()=>{
 const c=app(),visuals=new Set();for(const skill of skills(c))for(let n=0;n<24;n++){
  const p=fixture(c,skill,n),root=node();assert.equal(c.renderFifthNumberVisual(root,p.visual,false),true);visuals.add(p.visual.kind);
  const svg=root.children[0];assert.equal(svg.attrs.viewBox,'0 0 400 260');assert.equal(svg.attrs.role,'img');assert.ok(svg.attrs['aria-label'].length>35,skill);assert.ok(!svg.attrs['aria-label'].includes('g5n_'));
  for(const el of descendants(svg)){
   for(const name of ['x','y','x1','x2','y1','y2','cx','cy','width','height','r'])if(el.attrs[name]!==undefined){const val=+el.attrs[name];assert.ok(Number.isFinite(val)&&val>=0,skill+' '+name+' '+val);assert.ok(val<=(['y','y1','y2','cy','height'].includes(name)?260:400));}
   if(el.tag==='rect'){assert.ok(+el.attrs.x+ +el.attrs.width<=400.01,skill+' rectangle x');assert.ok(+el.attrs.y+ +el.attrs.height<=260.01,skill+' rectangle y');}
  }
  if(p.visual.kind==='g5n_fraction_operation'){const bars=descendants(svg).filter(el=>el.tag==='rect');const first=bars.find(el=>el.attrs.y==='55'),second=bars.find(el=>el.attrs.y==='142');assert.ok(Math.abs(+first.attrs.width*p.visual.b- +second.attrs.width*p.visual.d)<0.00001,'fraction operand models use equal-size wholes');}
  if(p.visual.kind==='g5n_area'){const cells=descendants(svg).filter(el=>el.tag==='rect');assert.equal(cells.length,p.visual.b*p.visual.d);assert.ok(cells.every(cell=>cell.attrs.width===cell.attrs.height),'area model cells are square');assert.equal(cells.filter(cell=>cell.attrs['data-overlap']==='true').length,p.visual.showOverlap?p.visual.a*p.visual.c:0);}
 }
 assert.equal(visuals.size,16);
 const root=node();root.appendChild(node('existing'));assert.equal(c.renderFifthNumberVisual(root,{kind:'foreign'},false),false);assert.equal(root.children[0].tag,'existing');
});

test('actual model controls submit edits and solved reveals disable all interactions',()=>{
 const c=app();for(const skill of ['g5n_expanded','g5n_fraction_product'])for(let n=0;n<24;n++){
  const p=fixture(c,skill,n),root=node();let sent;assert.equal(c.renderFifthNumberAnswer(root,p,raw=>sent=raw,false),true);
  const labels=skill==='g5n_expanded'?['ones','tenths','hundredths','thousandths']:['columns','rows'];const answer=JSON.parse(p.answer);let controls=descendants(root);
  labels.forEach((label,i)=>{const add=controls.find(el=>el.attrs['aria-label']==='Add one '+label);assert.ok(add);for(let step=0;step<answer[i];step++)add.listeners.click();});
  controls.find(el=>el.textContent==='Check my model').listeners.click();assert.equal(c.matchFifthNumberAnswer(p,sent),true);
  const shown=node();c.renderFifthNumberAnswer(shown,p,()=>assert.fail('revealed model submitted'),true);const buttons=descendants(shown).filter(el=>el.tag==='button');assert.ok(buttons.every(el=>el.disabled));const before=JSON.stringify(shown.children);buttons.forEach(button=>button.listeners.click());assert.equal(JSON.stringify(shown.children),before);
  if(skill==='g5n_fraction_product'){const overlaps=descendants(shown).filter(el=>el.attrs['data-overlap']==='true');assert.equal(overlaps.length,p.widget.a*p.widget.c);}
 }
 const root=node();root.appendChild(node('existing'));assert.equal(c.renderFifthNumberAnswer(root,{answer:'2'},()=>{},false),false);assert.equal(root.children[0].tag,'existing');
});

test('new number pathways preserve the shared equivalent-answer input formats',()=>{const c=app();const decimal=fixture(c,'g5n_digit',0);assert.equal(c.matchFifthNumberAnswer(decimal,'.2'),true);assert.equal(c.matchFifthNumberAnswer(decimal,'0.20'),true);const fraction=fixture(c,'g5n_fraction_add',0);assert.equal(c.matchFifthNumberAnswer(fraction,'7 / 12'),true);assert.equal(c.matchFifthNumberAnswer(fraction,'14 / 24'),true);for(const skill of Object.values(c.FIFTH_NUMBER_SKILLS).flat().map(s=>s[0]))for(let n=0;n<24;n++){const p=fixture(c,skill,n);if(p.widget||p.choices)continue;for(const raw of ['1.','1 2/2','0 1 / 2','.25'])assert.equal(c.matchFifthNumberAnswer(p,raw),c.answersMatch(raw,p.answer),skill+' input '+raw);}});
