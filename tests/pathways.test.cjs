const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
function app(){const saved=new Map();const c=vm.createContext({document:{addEventListener(){},getElementById(){return {addEventListener(){}}}},localStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)}});vm.runInContext(fs.readFileSync('index.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1].replace(/renderLevelSelect\(\);\s*$/,''),c);return c;}
test('all three pathways offer directly accessible entry points in grades 1 through 4',()=>{const c=app();assert.ok(c.PATHWAYS);for(const topic of ['shapes','measurement','data'])for(let g=1;g<=4;g++){const levels=c.TRACK_LEVELS[topic+'_g'+g];assert.ok(levels.length>=3);for(const l of levels)assert.equal(l.open,true);}});
test('every visual skill produces complete, valid questions with unique choices',()=>{const c=app();assert.ok(c.PATHWAYS);let count=0;for(const levels of Object.values(c.TRACK_LEVELS))for(const l of levels){if(!l.pathway)continue;const pool=c.buildFactsPool(l.track,l);assert.ok(pool.length>=10);for(const f of pool){const p=f.problem;assert.ok(p.visual && p.story && p.hintText && p.explanation);assert.equal(c.pathAnswerMatches(p,String(p.answer)),true);assert.equal(c.pathAnswerMatches(p,'nonsense'),false);if(p.choices){assert.equal(new Set(p.choices).size,p.choices.length);assert.equal(p.choices.filter(v=>v===String(p.answer)).length,1);}assert.ok(f.key.startsWith('path:'));}count++;}assert.ok(count>=36);});
test('ruler offsets, scaled graphs, fractional plots, and conversion answers are mathematically correct',()=>{const c=app();assert.equal(typeof c.makePathProblem,'function');const fixture=(skill,n=0)=>c.makePathProblem({id:skill,skill,pathway:'test',grade:4},n);
 assert.equal(fixture('ruler_offset',0).answer,'3');
 assert.equal(fixture('scaled_bars',0).answer,'8');
 assert.equal(fixture('plot_range',0).answer,'3/8');
 assert.equal(fixture('convert_units',0).answer,'200');
 assert.equal(fixture('area_missing',0).answer,'3');
 assert.equal(fixture('angle_measure',0).answer,'30');
 assert.equal(fixture('shape_name',0).answer,'Triangle');
});
test('skill recommendations distinguish independent answers from hinted success and preserve rewards',()=>{const c=app();assert.equal(typeof c.recordPathResult,'function');let p=c.getProgress();p.totalTips=40;c.saveProgressData(p);const levels=c.TRACK_LEVELS.shapes_g2;
 c.recordPathResult(levels[0],10,5);assert.equal(c.getProgress().pathProgress[levels[0].id].ready,false);
 c.recordPathResult(levels[0],9,8);assert.equal(c.getProgress().pathProgress[levels[0].id].ready,true);assert.equal(c.getProgress().totalTips,40);
 const next=c.nextPathSkill(levels[levels.length-1]);assert.equal(next.grade,3);
});
test('starting check recommends the earliest grade with a gap without treating it as placement',()=>{const c=app();assert.equal(typeof c.suggestPathGrade,'function');assert.equal(c.suggestPathGrade([2,1,2,2]),2);assert.equal(c.suggestPathGrade([0,0,0,0]),1);assert.equal(c.suggestPathGrade([2,2,2,2]),4);});
test('all visual arithmetic answers match the quantities in the diagram',()=>{const c=app();for(const levels of Object.values(c.TRACK_LEVELS))for(const level of levels){if(!level.pathway)continue;for(let n=0;n<24;n++){const p=c.makePathProblem(level,n),v=p.visual;let expected;
 const val=x=>{const a=String(x).split('/').map(Number);return a.length===2?a[0]/a[1]:a[0];};
 if(v.kind==='ruler')expected=v.end-v.start;
 if(v.kind==='grid')expected=v.rows*v.cols;
 if(level.skill==='area_missing')expected=v.area/v.height;
 if(level.skill==='perimeter')expected=2*(v.width+v.height);
 if(level.skill==='compound_area')expected=(v.left+v.right)*v.height;
 if(level.skill==='angle_measure')expected=v.degrees;
 if(level.skill==='plot_range'){const occupied=v.counts.map((x,i)=>x?i:null).filter(x=>x!==null);expected=(occupied.at(-1)-occupied[0])/v.denominator;}
 if(level.skill==='plot_total')expected=v.counts.reduce((sum,count,i)=>sum+count*(v.base+i)/v.denominator,0);
 if(level.skill==='unit_fraction'||level.skill==='shaded_fraction')expected=v.shaded/v.parts;
 if(['picture_count','bars_read','scaled_bars','scaled_picture'].includes(level.skill))expected=v.values[n%3];
 if(level.skill==='picture_difference')expected=v.values[0]-v.values[1];
 if(expected!==undefined)assert.equal(val(p.answer),expected,level.skill+' variant '+n);
 }}});
test('symmetry hints draw actual fold lines rather than labeling corners',()=>{
 const c=app();function node(){return {attrs:{},children:[],setAttribute(k,v){this.attrs[k]=v;},appendChild(child){this.children.push(child);},replaceChildren(){this.children=[];}};}
 c.document.createElementNS=()=>node();
 for(const [shape,want] of [['Square',4],['Rectangle',2],['Triangle',3],['Scalene triangle',0]]){
  const root=node();c.renderPathVisual(root,{kind:'shape',shape,symmetry:true},true);
  const folds=root.children[0].children.filter(el=>el.attrs['data-fold']==='true');assert.equal(folds.length,want,shape);
  for(const fold of folds)assert.ok([fold.attrs.x1,fold.attrs.y1,fold.attrs.x2,fold.attrs.y2].every(Number.isFinite));
 }
});
