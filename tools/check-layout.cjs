// Build the actual town with a lightweight scene adapter and check plant clearances.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const nodes = [];
const make = tag => {
  const node = {tag, attrs:{}, children:[], setAttribute(k,v){this.attrs[k]=v;},
    appendChild(child){child.parent=this;this.children.push(child);},
    setObject3D(_name,mesh){this.mesh=mesh;},addEventListener(){}};
  nodes.push(node);return node;
};
class Shape { constructor(){this.points=[];} moveTo(x,y){this.points.push([x,y]);} lineTo(x,y){this.points.push([x,y]);} closePath(){} }
class Geometry {constructor(shape,options){this.shape=shape;this.options=options;}}
class Mesh {constructor(geometry){this.geometry=geometry;}}
const context = vm.createContext({URLSearchParams,location:{search:''},document:{createElement:make,getElementById:()=>make('ui')},
  AFRAME:{THREE:{Shape,ExtrudeGeometry:Geometry,Mesh,MeshStandardMaterial:class{}}}});
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../shared/town.js'),'utf8'),context);
vm.runInContext('buildTown(null)',context);
const xyz = v => String(v || '0 0 0').split(' ').map(Number);
function position(node){const p=xyz(node.attrs.position);if(node.parent){const a=position(node.parent);return p.map((v,i)=>v+a[i]);}return p;}
function bounds(node){
  const p=position(node);let lo,hi;
  if(node.mesh){const g=node.mesh.geometry;lo=[Math.min(...g.shape.points.map(p=>p[0])),0,0];hi=[Math.max(...g.shape.points.map(p=>p[0])),Math.max(...g.shape.points.map(p=>p[1])),g.options.depth];}
  else {const size=node.tag==='a-sphere'?xyz(node.attrs.scale || '1 1 1').map(v=>2*v*node.attrs.radius):[node.attrs.width,node.attrs.height,node.attrs.depth];lo=size.map(v=>-v/2);hi=size.map(v=>v/2);}
  return {lo:lo.map((v,i)=>v+p[i]),hi:hi.map((v,i)=>v+p[i])};
}
const overlaps=(a,b)=>a.lo.every((v,i)=>v<b.hi[i]-1e-6 && a.hi[i]>b.lo[i]+1e-6);
const leaves=nodes.filter(n=>n.tag==='a-sphere' && n.attrs.radius===.22);
const obstacles=nodes.filter(n=>n.tag==='a-box' || n.mesh);
assert.equal(leaves.length,5);
for(const leaf of leaves){
  const a=bounds(leaf);
  for(const obstacle of obstacles) assert.ok(!overlaps(a,bounds(obstacle)),`Tree intersects ${obstacle.tag} at ${position(obstacle)}`);
  assert.ok(a.lo[0]>-1.64 && a.hi[0]<1.64 && a.lo[2]>-1.64 && a.hi[2]<1.64,'Tree crosses lawn boundary');
}
for(let i=0;i<leaves.length;i++)for(let j=i+1;j<leaves.length;j++)assert.ok(!overlaps(bounds(leaves[i]),bounds(leaves[j])));
console.log('PASS: all 5 tree canopies clear buildings, roof, fences and roads.');
