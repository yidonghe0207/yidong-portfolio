/* Inflated, closed two-sided glyph meshes. No texture sprites or external 3D runtime. */
(()=>{'use strict';
window.createPondBalloons=function(canvas){
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,depth:true});
 if(!gl)return null;
 const vertex=`attribute vec3 position;attribute vec3 normal;uniform vec2 viewport;uniform vec2 center;uniform float scale;uniform float angle;uniform vec2 tilt;varying vec3 N;varying vec3 P;
 vec3 rotate(vec3 p){float cx=cos(tilt.x),sx=sin(tilt.x),cy=cos(tilt.y),sy=sin(tilt.y),c=cos(angle),s=sin(angle);p=vec3(p.x,p.y*cx-p.z*sx,p.y*sx+p.z*cx);p=vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy);return vec3(p.x*c-p.y*s,p.x*s+p.y*c,p.z);}
 void main(){vec3 p=rotate(position);N=rotate(normal);P=p;vec2 screen=center+p.xy*scale;gl_Position=vec4(screen.x/viewport.x*2.-1.,1.-screen.y/viewport.y*2.,-p.z/200.,1.);}`;
 const fragment=`precision highp float;varying vec3 N;varying vec3 P;
 void main(){vec3 n=normalize(N);vec3 eye=vec3(0.,0.,1.);vec3 r=reflect(-eye,n);
 float diffuse=max(0.,dot(n,normalize(vec3(-.5,-.65,1.))));
 float fresnel=pow(1.-max(n.z,0.),3.);
 // Broad reflected sky strip + a smaller directional window, over dark latex.
 float sky=exp(-pow((r.y+.43)*3.2,2.))*smoothstep(-.8,.1,r.z)*(.3+.7*(1.-smoothstep(-.6,.9,r.x)));
 float strip=exp(-pow((r.x+r.y*.2+.38)*13.,2.))*smoothstep(.0,.65,r.z);
 float hot=pow(max(0.,dot(n,normalize(vec3(-.38,-.48,1.)))),90.);
 vec3 body=vec3(.035,.041,.035)+vec3(.075,.082,.071)*diffuse;
 vec3 col=body+vec3(.54,.57,.49)*sky*.68+vec3(.73,.75,.68)*strip*.5+vec3(.93,.94,.86)*hot*.7+vec3(.25,.29,.22)*fresnel;
 float seam=exp(-abs(P.z)*2.8);col*=1.-seam*.28;
 gl_FragColor=vec4(col,1.);}`;
 const shader=(type,src)=>{const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh;};
 const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 gl.useProgram(program);gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
 const loc=Object.fromEntries(['viewport','center','scale','angle','tilt'].map(n=>[n,gl.getUniformLocation(program,n)]));
 const pos=gl.getAttribLocation(program,'position'),norm=gl.getAttribLocation(program,'normal');gl.enableVertexAttribArray(pos);gl.enableVertexAttribArray(norm);
 const cache=new Map();let meshes=[];
 function mesh(shape){
  const mask=document.createElement('canvas');const unit=2.1,pad=5;mask.width=Math.ceil(shape.w*unit)+pad*2;mask.height=Math.ceil(58*unit)+pad*2;const c=mask.getContext('2d',{willReadFrequently:true});c.translate(pad,pad);c.scale(unit,unit);c.fillStyle='white';
  if(shape.path)c.fill(shape.path,'evenodd');else c.drawImage(shape.mask,0,0,shape.mask.width,shape.mask.height,0,0,shape.w,58);
  const width=mask.width,height=mask.height,data=c.getImageData(0,0,width,height).data,dist=new Float32Array(width*height);
  for(let i=0;i<dist.length;i++)dist[i]=data[i*4+3]>100?999:0;
  for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){let k=y*width+x;if(dist[k])dist[k]=Math.min(dist[k],dist[k-1]+1,dist[k-width]+1,dist[k-width-1]+1.414,dist[k-width+1]+1.414);}
  for(let y=height-2;y>0;y--)for(let x=width-2;x>0;x--){let k=y*width+x;if(dist[k])dist[k]=Math.min(dist[k],dist[k+1]+1,dist[k+width]+1,dist[k+width+1]+1.414,dist[k+width-1]+1.414);}
  const max=Math.max(...dist),z=new Float32Array(dist.length);for(let i=0;i<dist.length;i++){const q=Math.min(1,dist[i]/Math.max(1,max));z[i]=Math.sqrt(Math.max(0,1-(1-q)*(1-q)))*Math.min(11,max/unit*.9);}
  // Smooth the sampled height before normals to avoid raster stair-step highlights.
  for(let pass=0;pass<7;pass++){const copy=z.slice();for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){let k=y*width+x;if(dist[k])z[k]=(copy[k]*4+copy[k-1]+copy[k+1]+copy[k-width]+copy[k+width])/8;}}
  const verts=[];
  function vertexAt(x,y,side){const k=y*width+x,zx=(z[k+1]-z[k-1])*unit*.5,zy=(z[k+width]-z[k-width])*unit*.5,len=Math.hypot(zx,zy,1);verts.push((x-pad)/unit-shape.w/2,(y-pad)/unit-29,z[k]*side,-zx/len,-zy/len,side/len);}
  function triangle(a,b,d,side){if(!dist[a[1]*width+a[0]]&&!dist[b[1]*width+b[0]]&&!dist[d[1]*width+d[0]])return;vertexAt(...a,side);vertexAt(...b,side);vertexAt(...d,side);}
  for(let y=1;y<height-2;y++)for(let x=1;x<width-2;x++){const a=[x,y],b=[x+1,y],d=[x,y+1],e=[x+1,y+1];triangle(a,b,d,1);triangle(b,e,d,1);triangle(d,b,a,-1);triangle(d,e,b,-1);}
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.STATIC_DRAW);return {buffer,count:verts.length/6};
 }
 return {setShapes(key,shapes){if(!cache.has(key))cache.set(key,shapes.map(mesh));meshes=cache.get(key);},resize(w,h,dpr){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(loc.viewport,w,h);},draw(letters,scale,active,elapsed){gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);letters.forEach(l=>{const mesh=meshes[l.i];if(!mesh)return;gl.clear(gl.DEPTH_BUFFER_BIT);gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);gl.vertexAttribPointer(pos,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(norm,3,gl.FLOAT,false,24,12);gl.uniform2f(loc.center,l.x,l.y+(l.bob||0));gl.uniform1f(loc.scale,scale);gl.uniform1f(loc.angle,l.angle);gl.uniform2f(loc.tilt,active?(l.tiltX||0):-.08,active?(l.tiltY||0):.07);gl.drawArrays(gl.TRIANGLES,0,mesh.count);});},get triangles(){return meshes.reduce((s,m)=>s+m.count/3,0);}};
};
})();
