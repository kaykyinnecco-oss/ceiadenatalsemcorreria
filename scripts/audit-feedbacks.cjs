const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sharp=require('./runtime.cjs').dependency('sharp');
const root=path.resolve(__dirname,'..'),directory=path.join(root,'depoimentos');
async function audit(){
 const names=fs.readdirSync(directory).filter(n=>/\.(webp|png|jpe?g)$/i.test(n)).sort(),files=[];
 for(const name of names){
  const buffer=fs.readFileSync(path.join(directory,name)),metadata=await sharp(buffer).metadata();
  const pixels=await sharp(buffer).flatten({background:'#fff'}).resize(9,8,{fit:'fill'}).greyscale().raw().toBuffer();
  let hash=0n;for(let y=0;y<8;y++)for(let x=0;x<8;x++)hash=(hash<<1n)|BigInt(pixels[y*9+x]>pixels[y*9+x+1]);
  files.push({name,sha256:crypto.createHash('sha256').update(buffer).digest('hex'),dHash:hash.toString(16).padStart(16,'0'),bytes:buffer.length,width:metadata.width,height:metadata.height});
 }
 const parents=files.map((_,i)=>i),find=i=>parents[i]===i?i:parents[i]=find(parents[i]),pairs=[];
 for(let a=0;a<files.length;a++)for(let b=a+1;b<files.length;b++){
  let diff=BigInt('0x'+files[a].dHash)^BigInt('0x'+files[b].dHash),distance=0;while(diff){distance++;diff&=diff-1n;}
  const exact=files[a].sha256===files[b].sha256,duplicate=exact||distance<=5;
  pairs.push({a:files[a].name,b:files[b].name,distance,exact,duplicate});if(duplicate)parents[find(b)]=find(a);
 }
 const groups=new Map();files.forEach((file,i)=>{const id=find(i);if(!groups.has(id))groups.set(id,[]);groups.get(id).push(file.name);});
 const duplicates=[...groups.values()].flatMap(group=>group.slice(1));
 return{method:'SHA-256 + dHash 9×8 grayscale, distância de Hamming ≤5; primeiro nome em ordem lexical mantido',before:files.length,duplicateCount:duplicates.length,remaining:files.length-duplicates.length,groups:[...groups.values()],duplicates,files,pairs};
}
if(require.main===module)audit().then(result=>{const out=process.env.CEIA_FEEDBACK_AUDIT||path.join(root,'tests/reports/feedback-hashes.json');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2));console.log(JSON.stringify(result));}).catch(e=>{console.error(e);process.exitCode=1});
module.exports={audit};
