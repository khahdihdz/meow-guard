(() => {
  "use strict";
  const canvas = document.getElementById("game"), ctx = canvas.getContext("2d");
  const $ = id => document.getElementById(id);
  const ui = {health:$("health"),coins:$("coins"),wave:$("wave"),score:$("score"),message:$("message"),status:$("gameStatus"),overlay:$("overlay")};
  const W=900,H=560,CELL=50,cols=18,rows=11;
  canvas.width=W; canvas.height=H;
  const path=[[-30,125],[175,125],[175,225],[400,225],[400,95],[625,95],[625,355],[760,355],[760,455],[930,455]];
  const cats={
    kitten:{price:50,range:145,rate:690,damage:1,emoji:"🐱",color:"#72a7ff"},
    scout:{price:75,range:205,rate:1050,damage:2,emoji:"😺",color:"#f7c56b"}
  };
  let selected="kitten",towers=[],enemies=[],shots=[],particles=[],health=10,coins=100,wave=1,score=0,playing=false,gameOver=false,last=0,spawnTimer=0,spawnLeft=0,between=0,high=Number(localStorage.getItem("meowguard-high")||0);
  const arena=new Image(); arena.src="./assets/arena.png";
  const spriteCache={};
  function loadSprite(key,src){const im=new Image();im.src=src;spriteCache[key]=im;return im;}
  for(let i=0;i<8;i++){loadSprite("cat"+i,"./assets/cat/idle_"+i+".png");loadSprite("shoot"+i,"./assets/cat/shoot_"+i+".png");}
  for(let i=0;i<10;i++)loadSprite("enemy"+i,"./assets/enemy/walk_"+i+".png");
  function updateUI(){ui.health.textContent=health;ui.coins.textContent=coins;ui.wave.textContent=wave;ui.score.textContent=score;ui.status.textContent=gameOver?"Kết thúc trận":playing?"Đang chiến đấu":"Đang tạm nghỉ";}
  function say(s){ui.message.textContent=s;}
  function reset(){towers=[];enemies=[];shots=[];particles=[];health=10;coins=100;wave=1;score=0;spawnLeft=0;spawnTimer=0;between=0;gameOver=false;playing=false;startWave();ui.overlay.classList.remove("hidden");ui.overlay.querySelector("h2").textContent="Meow Guard";ui.overlay.querySelector("p").textContent="Đội mèo đã sẵn sàng!";ui.overlayStart.textContent="Vào trận";say("Chọn mèo, sau đó chạm vào ô cỏ để đặt.");updateUI();draw();}
  function startWave(){spawnLeft=5+(wave-1)*2;spawnTimer=350;between=0;}
  function start(){if(gameOver)reset();playing=true;ui.overlay.classList.add("hidden");say("Đội mèo, sẵn sàng! Hãy bảo vệ khu vườn.");updateUI();}
  function endGame(){gameOver=true;playing=false;ui.overlay.classList.remove("hidden");ui.overlay.querySelector("h2").textContent="Khu vườn thất thủ!";ui.overlay.querySelector("p").textContent="Điểm của bạn: "+score+" · Kỷ lục: "+Math.max(high,score);ui.overlayStart.textContent="Chơi lại";if(score>high){high=score;localStorage.setItem("meowguard-high",String(high));}updateUI();}
  function pointAt(distance){let remain=distance;for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(remain<=len){const t=remain/len;return{x:a[0]+(b[0]-a[0])*t,y:a[1]+(b[1]-a[1])*t,angle:Math.atan2(b[1]-a[1],b[0]-a[0])};}remain-=len;}return{x:path.at(-1)[0],y:path.at(-1)[1],angle:0};}
  const pathLength=path.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p[0]-path[i][0],p[1]-path[i][1]),0);
  function spawnEnemy(){const hp=2+Math.floor((wave-1)*.85);enemies.push({d:0,speed:40+Math.min(wave*2,30),hp,maxHp:hp,r:16,emoji:wave>4?"👹":"👾"});spawnLeft--; }
  function onPath(x,y){for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy))),px=a[0]+t*dx,py=a[1]+t*dy;if(Math.hypot(x-px,y-py)<32)return true;}return false;}
  function place(e){const rect=canvas.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width*W,y=(e.clientY-rect.top)/rect.height*H;const gx=Math.floor(x/CELL)*CELL+CELL/2,gy=Math.floor(y/CELL)*CELL+CELL/2;if(gx<20||gx>W-20||gy<20||gy>H-20||onPath(gx,gy)){say("Ô này nằm trên đường quái vật! Hãy chọn ô cỏ.");return;}if(towers.some(t=>Math.hypot(t.x-gx,t.y-gy)<CELL*.7)){say("Ô này đã có mèo canh gác.");return;}const cat=cats[selected];if(coins<cat.price){say("Chưa đủ cá! Hãy hạ quái để kiếm thêm.");return;}coins-=cat.price;towers.push({x:gx,y:gy,type:selected,cd:0,frame:0});say("Đã đặt "+(selected==="kitten"?"Mèo con":"Mèo trinh sát")+"!");updateUI();}
  function update(dt){if(!playing)return;spawnTimer-=dt;if(spawnLeft>0&&spawnTimer<=0){spawnEnemy();spawnTimer=900-Math.min(wave*25,250);}if(spawnLeft===0&&enemies.length===0){between+=dt;if(between>1800){wave++;startWave();say("Đợt "+wave+" đang tới!");}}
    for(const e of enemies){e.d+=e.speed*dt/1000;if(e.d>=pathLength){e.dead=true;health--;if(health<=0){endGame();return;}}}
    enemies=enemies.filter(e=>!e.dead);
    for(const t of towers){t.cd-=dt;t.frame=(t.frame+dt/120)%8;if(t.cd<=0){let target=null,best=Infinity;for(const e of enemies){const p=pointAt(e.d),dist=Math.hypot(p.x-t.x,p.y-t.y);if(dist<=cats[t.type].range&&dist<best){best=dist;target=e;}}if(target){const p=pointAt(target.d);shots.push({x:t.x,y:t.y,tx:p.x,ty:p.y,target,damage:cats[t.type].damage,speed:390,color:cats[t.type].color});t.cd=cats[t.type].rate;}}}
    for(const s of shots){if(!s.target||s.target.dead){s.dead=true;continue;}const p=pointAt(s.target.d);s.tx=p.x;s.ty=p.y;const dx=s.tx-s.x,dy=s.ty-s.y,d=Math.hypot(dx,dy),step=s.speed*dt/1000;if(d<=step+5){s.target.hp-=s.damage;s.dead=true;particles.push({x:s.tx,y:s.ty,life:260,text:"✦"});if(s.target.hp<=0&&!s.target.dead){s.target.dead=true;coins+=12;score+=10;}}else{s.x+=dx/d*step;s.y+=dy/d*step;}}
    shots=shots.filter(s=>!s.dead);enemies=enemies.filter(e=>!e.dead);for(const p of particles)p.life-=dt;particles=particles.filter(p=>p.life>0);updateUI();
  }
  function drawPath(){ctx.lineCap="round";ctx.lineJoin="round";ctx.strokeStyle="#3c4b47";ctx.lineWidth=66;ctx.beginPath();path.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();ctx.strokeStyle="#d7c38c";ctx.lineWidth=56;ctx.setLineDash([16,14]);ctx.beginPath();path.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();ctx.setLineDash([]);}
  function draw(){ctx.clearRect(0,0,W,H);if(arena.complete&&arena.naturalWidth){ctx.globalAlpha=.26;ctx.drawImage(arena,0,0,W,H);ctx.globalAlpha=1;}else{ctx.fillStyle="#315a49";ctx.fillRect(0,0,W,H);for(let y=0;y<H;y+=CELL)for(let x=0;x<W;x+=CELL){ctx.fillStyle=((x/CELL+y/CELL)%2===0)?"#38664f":"#335d49";ctx.fillRect(x,y,CELL,CELL);}}
    ctx.strokeStyle="#ffffff0d";ctx.lineWidth=1;for(let x=0;x<=W;x+=CELL){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}for(let y=0;y<=H;y+=CELL){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    drawPath();
    for(const t of towers){const c=cats[t.type],f=Math.floor(t.frame)%8,im=spriteCache["cat"+f];ctx.save();ctx.fillStyle="#14283c99";ctx.beginPath();ctx.ellipse(t.x,t.y+15,21,10,0,0,Math.PI*2);ctx.fill();if(im&&im.complete&&im.naturalWidth){ctx.drawImage(im,t.x-24,t.y-30,48,48);}else{ctx.font="34px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(c.emoji,t.x,t.y);}ctx.strokeStyle=c.color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(t.x,t.y,22,0,Math.PI*2);ctx.stroke();ctx.restore();}
    for(const e of enemies){const p=pointAt(e.d),f=Math.floor((performance.now()/100)%10),im=spriteCache["enemy"+f];if(im&&im.complete&&im.naturalWidth){ctx.drawImage(im,p.x-20,p.y-20,40,40);}else{ctx.font="30px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(e.emoji,p.x,p.y);}ctx.fillStyle="#172033";ctx.fillRect(p.x-17,p.y-27,34,5);ctx.fillStyle="#ff6b78";ctx.fillRect(p.x-17,p.y-27,34*Math.max(0,e.hp/e.maxHp),5);}
    for(const s of shots){ctx.fillStyle=s.color;ctx.beginPath();ctx.arc(s.x,s.y,5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=10;ctx.shadowColor=s.color;ctx.fill();ctx.shadowBlur=0;}for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/260);ctx.fillStyle="#ffe58b";ctx.font="22px sans-serif";ctx.fillText(p.text,p.x,p.y-p.life/15);ctx.globalAlpha=1;}
    ctx.fillStyle="#fff";ctx.font="bold 15px system-ui";ctx.fillText("MEOW GUARD",18,27);ctx.font="12px system-ui";ctx.fillStyle="#ffffffbb";ctx.fillText("ĐƯỜNG QUÁI VẬT",20,52);
  }
  function loop(now){const dt=Math.min(50,now-last||16);last=now;update(dt);draw();requestAnimationFrame(loop);}
  canvas.addEventListener("pointerdown",place);
  document.querySelectorAll(".cat-choice").forEach(btn=>btn.addEventListener("click",()=>{selected=btn.dataset.cat;document.querySelectorAll(".cat-choice").forEach(b=>b.classList.toggle("active",b===btn));say("Đã chọn "+(selected==="kitten"?"Mèo con (50 cá)":"Mèo trinh sát (75 cá)")+". Chạm vào ô cỏ để đặt.");}));
  document.addEventListener("keydown",e=>{if(e.key==="1")document.querySelector('[data-cat="kitten"]').click();if(e.key==="2")document.querySelector('[data-cat="scout"]').click();if(e.key===" "){e.preventDefault();playing? (playing=false,ui.overlay.classList.remove("hidden")):start();}});
  $("startBtn").addEventListener("click",start);$("overlayStart").addEventListener("click",()=>{if(gameOver)reset();start();});$("pauseBtn").addEventListener("click",()=>{if(gameOver)return;playing=!playing;if(playing)ui.overlay.classList.add("hidden");else ui.overlay.classList.remove("hidden");ui.overlay.querySelector("h2").textContent=playing?"Meow Guard":"Đã tạm dừng";ui.overlay.querySelector("p").textContent=playing?"Đội mèo đang chiến đấu!":"Bạn có thể tiếp tục bất cứ lúc nào.";ui.overlayStart.textContent=playing?"Tiếp tục":"Tiếp tục";updateUI();});$("restartBtn").addEventListener("click",reset);
  updateUI();draw();requestAnimationFrame(loop);
})();