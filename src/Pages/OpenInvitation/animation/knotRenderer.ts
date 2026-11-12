import { CLOTH_POINTS, CLOTH_SAMPLES, MATERIAL } from './knotPhysics'
import type { KnotPose } from './knotPhysics'

const ACROSS = 32
const SHADOW_SIZE = 512
const vertex = `
precision highp float;
attribute vec4 a_curve;
attribute float a_across;
uniform vec3 u_points[15], u_tangents[15], u_frames[15];
uniform float u_time, u_red, u_shadowPass;
uniform vec2 u_view;
varying vec3 v_normal, v_tangent, v_shadow;
varying vec2 v_uv;
varying float v_fold;
vec3 lightPosition(vec3 p) {
 return vec3(dot(p,vec3(.912,0.,.410))/2.9,dot(p,vec3(.228,.831,-.507))/1.8,-dot(p,normalize(vec3(-.45,.67,1.)))/3.0);
}
void main() {
 int k=int(a_curve.x);float t=a_curve.y,span=a_curve.z,s=a_curve.w,a=a_across;
 float t2=t*t,t3=t2*t;
 vec3 p=(2.*t3-3.*t2+1.)*u_points[k]+(t3-2.*t2+t)*u_tangents[k]*span
       +(-2.*t3+3.*t2)*u_points[k+1]+(t3-t2)*u_tangents[k+1]*span;
 vec3 tangent=normalize((6.*t2-6.*t)*u_points[k]+(3.*t2-4.*t+1.)*u_tangents[k]*span
       +(-6.*t2+6.*t)*u_points[k+1]+(3.*t2-2.*t)*u_tangents[k+1]*span);
 vec3 across=mix(u_frames[k],u_frames[k+1],t);
 across=normalize(across-tangent*dot(across,tangent));
 vec3 normal=normalize(cross(tangent,across));
 float tail=smoothstep(.74,1.,s),neck=smoothstep(.34,.46,s)*(1.-smoothstep(.72,.81,s));
 float gather=smoothstep(.7,3.15,u_time);
 float flight=1.-smoothstep(2.6,3.8,u_time);
 float twist=.18*sin(s*13.+u_red*1.7)+tail*flight*.33*sin(s*9.-u_time*5.5+u_red);
 vec3 u=across*cos(twist)+normal*sin(twist);
 vec3 n=normal*cos(twist)-across*sin(twist);
 float width=.46-neck*gather*.13+.32*tail;
 float phase=.38*sin(s*11.)+flight*.20*sin(s*17.-u_time*6.);
 float amp=.043+tail*.032-neck*gather*.014;
 float wave=.72*sin(a*18.84956+phase)+.28*sin(a*31.41593+s*4.);
 float slope=.72*18.84956*cos(a*18.84956+phase)+.28*31.41593*cos(a*31.41593+s*4.);
 float dome=.045+neck*gather*.065;
 float fold=(dome+amp*wave)*sin(a*3.14159);
 float df=amp*slope*sin(a*3.14159)+(dome+amp*wave)*3.14159*cos(a*3.14159);
 float hem=smoothstep(.91,1.,s)*.032;
 float scallop=hem*sin(a*18.84956+phase);
 p+=u*(a-.5)*width+n*fold-tangent*scallop;
 vec3 du=u*width+n*df-tangent*hem*18.84956*cos(a*18.84956+phase);
 v_normal=normalize(cross(tangent,du));v_tangent=tangent;
 v_uv=vec2(a,s);v_fold=wave;
 v_shadow=lightPosition(p)*.5+.5;
 if(u_shadowPass>.5)gl_Position=vec4(lightPosition(p),1.);
 else gl_Position=vec4(p.x/u_view.x,(p.y+.035)/u_view.y,-p.z/3.,1.-p.z/7.);
}`
const fragment = `
precision highp float;
uniform sampler2D u_texture,u_shadow;
uniform float u_red,u_time,u_shadowPass,u_shadows;
varying vec3 v_normal,v_tangent,v_shadow;
varying vec2 v_uv;
varying float v_fold;
vec4 packDepth(float d) {
 vec4 value=fract(d*vec4(16777216.,65536.,256.,1.));
 return value-value.xxyz*vec4(0.,.00390625,.00390625,.00390625);
}
float sampleShadow(vec2 offset,float bias) {
 float depth=dot(texture2D(u_shadow,v_shadow.xy+offset/512.),vec4(.000000059604645,.000015258789,.00390625,1.));
 return step(v_shadow.z-bias,depth);
}
void main() {
 if(u_shadowPass>.5){gl_FragColor=packDepth(gl_FragCoord.z);return;}
 float a=v_uv.x,s=v_uv.y;
 // Real woven silk and zari, including the woven border turned across the hem.
 float along=1.-abs(fract(s*2.2)*2.-1.);
 vec3 cloth=texture2D(u_texture,vec2(a,along)).rgb;
 float hem=smoothstep(.90,.915,s);
 vec3 hemColor=texture2D(u_texture,vec2(.012+(1.-s)*1.30,a)).rgb;
 cloth=mix(cloth,hemColor,hem);
 vec3 n=normalize(v_normal);if(n.z<0.)n=-n;
 vec3 light=normalize(vec3(-.45,.67,1.)),eye=vec3(0.,0.,1.),halfVector=normalize(light+eye);
 float diffuse=max(dot(n,light),0.);
 float visibility=1.;
 if(u_shadows>.5 && v_shadow.x>0. && v_shadow.x<1. && v_shadow.y>0. && v_shadow.y<1.){
  float bias=.0045+.004*(1.-diffuse);
  visibility=(sampleShadow(vec2(-.8,-.8),bias)+sampleShadow(vec2(.8,-.8),bias)+sampleShadow(vec2(-.8,.8),bias)+sampleShadow(vec2(.8,.8),bias))*.25;
 }
 float crease=1.-.12*max(-v_fold,0.);
 float border=1.-smoothstep(.12,.155,min(a,1.-a));
 float gold=max(border,hem);
 float thread=dot(normalize(v_tangent),halfVector);
 float anisotropic=pow(max(0.,1.-thread*thread),18.)*pow(max(dot(n,halfVector),0.),8.);
 vec3 sheen=mix(vec3(.27,.24,.18),vec3(.25,.11,.07),u_red);
 sheen=mix(sheen,vec3(.40,.28,.10),gold);
 vec3 color=cloth*(.49+.62*diffuse)*(.54+.46*visibility)*crease;
 color+=sheen*anisotropic*(.30+.70*visibility);
 // Gentle rim scattering keeps ivory folds readable without a plastic shine.
 color+=cloth*.045*pow(1.-abs(dot(n,eye)),3.);
 gl_FragColor=vec4(color,1.);
}`

/** Only 15 material frames per cloth cross the CPU/GPU boundary each frame.
 * Dense pleats, surface normals, perspective and self shadows stay on the GPU.
 */
export function createKnotRenderer(canvas:HTMLCanvasElement,ivory:HTMLImageElement,red:HTMLImageElement) {
  const gl=canvas.getContext('webgl',{alpha:true,antialias:true,depth:true,premultipliedAlpha:false,powerPreference:'high-performance'})
  if(!gl)return null
  const buffers:WebGLBuffer[]=[],textures:WebGLTexture[]=[],shaders:WebGLShader[]=[]
  let program:WebGLProgram|null=null,framebuffer:WebGLFramebuffer|null=null,depth:WebGLRenderbuffer|null=null
  let quality=1,cssWidth=1024,cssHeight=576,disposed=false
  const destroy=()=>{if(disposed)return;disposed=true;buffers.forEach(b=>gl.deleteBuffer(b));textures.forEach(t=>gl.deleteTexture(t));shaders.forEach(s=>gl.deleteShader(s));if(program)gl.deleteProgram(program);if(framebuffer)gl.deleteFramebuffer(framebuffer);if(depth)gl.deleteRenderbuffer(depth)}
  try {
    const compile=(type:number,source:string)=>{
      const shader=gl.createShader(type)!
      shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader)
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader)||'Silk shader unavailable')
      return shader
    }
    program=gl.createProgram()!
    gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program)
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Silk program unavailable')
    gl.useProgram(program);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE)
    const count=CLOTH_SAMPLES*(ACROSS+1),curve=new Float32Array(count*4),across=new Float32Array(count)
    const indices=new Uint16Array((CLOTH_SAMPLES-1)*ACROSS*6)
    let index=0
    for(let i=0;i<CLOTH_SAMPLES;i++){
      const s=i/(CLOTH_SAMPLES-1)
      let k=0;while(k<CLOTH_POINTS-2&&s>MATERIAL[k+1])k++
      const span=MATERIAL[k+1]-MATERIAL[k],t=(s-MATERIAL[k])/span
      for(let j=0;j<=ACROSS;j++){
        const n=i*(ACROSS+1)+j
        curve[n*4]=k;curve[n*4+1]=t;curve[n*4+2]=span;curve[n*4+3]=s;across[n]=j/ACROSS
        if(i<CLOTH_SAMPLES-1&&j<ACROSS){indices[index++]=n;indices[index++]=n+1;indices[index++]=n+ACROSS+1;indices[index++]=n+1;indices[index++]=n+ACROSS+2;indices[index++]=n+ACROSS+1}
      }
    }
    const attribute=(name:string,size:number,data:Float32Array)=>{
      const buffer=gl.createBuffer()!;buffers.push(buffer);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW)
      const location=gl.getAttribLocation(program!,name);gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,size,gl.FLOAT,false,0,0)
    }
    attribute('a_curve',4,curve);attribute('a_across',1,across)
    const indicesBuffer=gl.createBuffer()!;buffers.push(indicesBuffer);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indicesBuffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indices,gl.STATIC_DRAW)
    const clothTextures=[ivory,red].map(image=>{
      const texture=gl.createTexture()!;textures.push(texture);gl.bindTexture(gl.TEXTURE_2D,texture)
      const atlas=document.createElement('canvas');atlas.width=512;atlas.height=1024
      const context=atlas.getContext('2d');if(!context)throw new Error('Silk texture unavailable')
      context.drawImage(image,0,0,512,1024)
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,atlas);gl.generateMipmap(gl.TEXTURE_2D)
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)
      return texture
    })
    const shadow=gl.createTexture()!;textures.push(shadow);gl.bindTexture(gl.TEXTURE_2D,shadow)
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,SHADOW_SIZE,SHADOW_SIZE,0,gl.RGBA,gl.UNSIGNED_BYTE,null)
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)
    framebuffer=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,shadow,0)
    depth=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,depth);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,SHADOW_SIZE,SHADOW_SIZE)
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,depth)
    const hasShadows=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE
    gl.bindFramebuffer(gl.FRAMEBUFFER,null)
    const uniforms=Object.fromEntries(['u_time','u_red','u_shadowPass','u_shadows','u_view','u_points[0]','u_tangents[0]','u_frames[0]'].map(name=>[name,gl.getUniformLocation(program!,name)]))
    gl.uniform1i(gl.getUniformLocation(program,'u_texture'),0);gl.uniform1i(gl.getUniformLocation(program,'u_shadow'),1)
    const slopes=[new Float32Array(CLOTH_POINTS*3),new Float32Array(CLOTH_POINTS*3)]
    const frames=[new Float32Array(CLOTH_POINTS*3),new Float32Array(CLOTH_POINTS*3)]
    const resize=(width:number,height:number)=>{
      cssWidth=Math.max(1,width);cssHeight=Math.max(1,height)
      const ratio=Math.min(devicePixelRatio||1,1.75,Math.sqrt(1_100_000/(cssWidth*cssHeight)))*quality
      const w=Math.max(1,Math.round(cssWidth*ratio)),h=Math.max(1,Math.round(cssHeight*ratio))
      if(canvas.width!==w)canvas.width=w;if(canvas.height!==h)canvas.height=h
      const aspect=cssWidth/cssHeight,viewWidth=Math.max(1.1,Math.min(2.32,aspect*1.305))
      gl.uniform2f(uniforms.u_view,viewWidth,viewWidth/aspect)
    }
    resize(canvas.clientWidth||1024,canvas.clientHeight||576)
    const draw=(pose:KnotPose)=>{
      if(disposed||gl.isContextLost())return
      for(let cloth=0;cloth<2;cloth++){
        const points=cloth===0?pose.ivory:pose.red,derivative=slopes[cloth],frame=frames[cloth]
        let px=0,py=cloth===0?1:-1,pz=0
        for(let i=0;i<CLOTH_POINTS;i++){
          const left=Math.max(0,i-1),right=Math.min(CLOTH_POINTS-1,i+1),span=MATERIAL[right]-MATERIAL[left],n=i*3
          let tx=(points[right*3]-points[left*3])/span,ty=(points[right*3+1]-points[left*3+1])/span,tz=(points[right*3+2]-points[left*3+2])/span
          derivative[n]=tx;derivative[n+1]=ty;derivative[n+2]=tz
          const length=Math.hypot(tx,ty,tz)||1;tx/=length;ty/=length;tz/=length
          const dot=px*tx+py*ty+pz*tz
          let x=px-dot*tx,y=py-dot*ty,z=pz-dot*tz
          let norm=Math.hypot(x,y,z)
          if(norm<.01){x=-ty;y=tx;z=0;norm=Math.hypot(x,y)||1}
          x/=norm;y/=norm;z/=norm
          // Free hems gradually open toward the viewer rather than remaining edge-on.
          const open=Math.max(0,Math.min(1,(MATERIAL[i]-.70)/.18)),xy=Math.hypot(tx,ty)||1
          const orientation=x*(-ty/xy)+y*(tx/xy)<0?-1:1
          x+=(orientation*-ty/xy-x)*open;y+=(orientation*tx/xy-y)*open;z*=1-open
          norm=Math.hypot(x,y,z)||1;px=x/norm;py=y/norm;pz=z/norm
          frame[n]=px;frame[n+1]=py;frame[n+2]=pz
        }
      }
      gl.useProgram(program);gl.uniform1f(uniforms.u_time,pose.time)
      const renderCloths=()=>{
        for(let cloth=0;cloth<2;cloth++){
          gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,clothTextures[cloth])
          gl.uniform1f(uniforms.u_red,cloth)
          gl.uniform3fv(uniforms['u_points[0]'],cloth===0?pose.ivory:pose.red)
          gl.uniform3fv(uniforms['u_tangents[0]'],slopes[cloth]);gl.uniform3fv(uniforms['u_frames[0]'],frames[cloth])
          gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0)
        }
      }
      if(hasShadows){
        gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,null)
        gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.viewport(0,0,SHADOW_SIZE,SHADOW_SIZE)
        gl.clearColor(1,1,1,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT)
        gl.uniform1f(uniforms.u_shadowPass,1);gl.uniform1f(uniforms.u_shadows,0);renderCloths()
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,canvas.width,canvas.height)
      gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT)
      gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,shadow)
      gl.uniform1f(uniforms.u_shadowPass,0);gl.uniform1f(uniforms.u_shadows,hasShadows?1:0);renderCloths()
    }
    return {draw,resize,destroy,quality:(value:number)=>{quality=Math.min(1,Math.max(.60,value));resize(cssWidth,cssHeight)}}
  }catch{destroy();return null}
}
