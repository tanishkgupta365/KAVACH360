(() => {
  'use strict';

  const DISTRICTS = [
    {name:'Bengaluru Urban',lat:12.9716,lng:77.5946,x:325,y:430,base:1.45},
    {name:'Mysuru',lat:12.2958,lng:76.6394,x:238,y:491,base:1.15},
    {name:'Belagavi',lat:15.8497,lng:74.4977,x:120,y:130,base:1.04},
    {name:'Dharwad',lat:15.4589,lng:75.0078,x:166,y:185,base:.92},
    {name:'Dakshina Kannada',lat:12.8438,lng:75.2479,x:145,y:455,base:.96},
    {name:'Ballari',lat:15.1394,lng:76.9214,x:291,y:260,base:1.02},
    {name:'Kalaburagi',lat:17.3297,lng:76.8343,x:309,y:93,base:1.05},
    {name:'Shivamogga',lat:13.9299,lng:75.5681,x:180,y:318,base:.88},
    {name:'Tumakuru',lat:13.3379,lng:77.1173,x:292,y:380,base:.94},
    {name:'Hassan',lat:13.0033,lng:76.1004,x:215,y:413,base:.82},
    {name:'Udupi',lat:13.3409,lng:74.7421,x:126,y:368,base:.78},
    {name:'Kodagu',lat:12.3375,lng:75.8069,x:188,y:523,base:.70}
  ];
  const CRIMES = [
    {name:'Theft',gravity:'Non-Heinous',weight:22},
    {name:'Cyber Crime',gravity:'Non-Heinous',weight:15},
    {name:'Robbery',gravity:'Heinous',weight:13},
    {name:'Assault',gravity:'Heinous',weight:17},
    {name:'Fraud',gravity:'Non-Heinous',weight:14},
    {name:'NDPS',gravity:'Heinous',weight:9},
    {name:'Missing Person',gravity:'Non-Heinous',weight:10}
  ];
  const STATUSES = ['Under Investigation','Charge Sheeted','Closed','Undetected','Final Report'];
  const STATIONS = {};
  DISTRICTS.forEach((d,i) => {
    STATIONS[d.name] = [
      `${d.name.split(' ')[0]} Central PS`,
      `${d.name.split(' ')[0]} North PS`,
      `${d.name.split(' ')[0]} South PS`,
      `${d.name.split(' ')[0]} Rural PS`
    ];
  });

  function mulberry32(a){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
  const rnd = mulberry32(20260721);
  const pick = arr => arr[Math.floor(rnd()*arr.length)];
  const weightedCrime = () => {
    let n=rnd()*100, sum=0;
    for(const c of CRIMES){sum+=c.weight;if(n<=sum)return c}
    return CRIMES[0];
  };
  const pad=(v,n)=>String(v).padStart(n,'0');
  const today = new Date('2026-07-21T12:00:00');

  const cases = [];
  for(let i=1;i<=680;i++){
    const district = DISTRICTS[Math.min(DISTRICTS.length-1,Math.floor(Math.pow(rnd(),1.2)*DISTRICTS.length))];
    const crime = weightedCrime();
    const daysAgo = Math.floor(Math.pow(rnd(),1.15)*390);
    const date = new Date(today); date.setDate(date.getDate()-daysAgo);
    const trendBoost = daysAgo<60 && ['Bengaluru Urban','Kalaburagi','Ballari'].includes(district.name) ? .15 : 0;
    const statusRoll=rnd();
    let status=statusRoll<.40?'Under Investigation':statusRoll<.65?'Charge Sheeted':statusRoll<.82?'Closed':statusRoll<.93?'Final Report':'Undetected';
    if(daysAgo<28 && status==='Closed') status='Under Investigation';
    const arrested = rnd() < (crime.gravity==='Heinous'?.72:.52);
    const chargesheeted = status==='Charge Sheeted'||(status==='Closed'&&rnd()<.7);
    const accusedCount = 1+Math.floor(rnd()*3);
    const accused = Array.from({length:accusedCount},(_,a)=>`ACC-${pad(1+Math.floor(rnd()*175),4)}`);
    const risk = Math.min(99,Math.round(
      (crime.gravity==='Heinous'?28:12) +
      (status==='Under Investigation'?19:5) +
      (daysAgo<60?18+trendBoost*100:8) +
      (date.getHours()<5?8:0) +
      rnd()*28
    ));
    const station=pick(STATIONS[district.name]);
    const serial=pad(i,5);
    cases.push({
      id:i,
      crimeNo:`1${pad(4430+i%18,4)}${pad(6000+i%40,4)}${date.getFullYear()}${serial}`,
      caseNo:`${date.getFullYear()}${serial}`,
      date:date.toISOString().slice(0,10),
      daysAgo,
      district:district.name,
      station,
      category:crime.name,
      gravity:crime.gravity,
      status,
      lat:district.lat+(rnd()-.5)*.55,
      lng:district.lng+(rnd()-.5)*.55,
      night:rnd()<.36,
      arrested,
      arrestDays:arrested?2+Math.floor(rnd()*48):null,
      chargesheeted,
      chargeDays:chargesheeted?22+Math.floor(rnd()*155):null,
      accused,
      victimCount:1+Math.floor(rnd()*3),
      sections: crime.name==='Robbery'?['BNS 309(4)','BNS 3(5)']:crime.name==='Cyber Crime'?['IT Act 66C','IT Act 66D']:crime.name==='NDPS'?['NDPS 20(b)','NDPS 22']:['BNS 115','BNS 351'],
      risk,
      brief:`Synthetic case record involving ${crime.name.toLowerCase()} indicators. Personally identifiable details are redacted in this prototype.`,
      officer:`KGID-${pad(1000+Math.floor(rnd()*90),5)}`
    });
  }

  // Deliberate repeat-accused connections for a meaningful network demo.
  const repeatIds=['ACC-0007','ACC-0019','ACC-0034','ACC-0058','ACC-0082'];
  repeatIds.forEach((id,idx)=>{
    cases.filter((_,i)=>i%(17+idx*3)===0).slice(0,5).forEach(c=>{
      if(!c.accused.includes(id)) c.accused[0]=id;
      c.risk=Math.min(99,c.risk+10);
    });
  });

  const state = {
    view:'overview',
    district:'All',
    category:'All',
    gravity:'All',
    period:365,
    mapMode:'risk',
    selectedDistrict:'Bengaluru Urban',
    page:1,
    pageSize:12,
    search:''
  };

  const els = id => document.getElementById(id);
  const fmt = n => new Intl.NumberFormat('en-IN').format(n);
  const percent=(a,b)=>b?Math.round(a/b*100):0;
  const riskClass=s=>s>=82?'critical':s>=68?'high':s>=48?'medium':'low';
  const riskLabel=s=>s>=82?'Critical':s>=68?'High':s>=48?'Medium':'Low';
  const colorForRisk=s=>s>=82?'#ff4d6d':s>=68?'#ff814a':s>=48?'#ffbf48':'#46e6a6';

  function filteredCases(){
    return cases.filter(c =>
      (state.district==='All'||c.district===state.district) &&
      (state.category==='All'||c.category===state.category) &&
      (state.gravity==='All'||c.gravity===state.gravity) &&
      c.daysAgo<=state.period
    );
  }

  function aggregateDistrict(list){
    return DISTRICTS.map(d=>{
      const rows=list.filter(c=>c.district===d.name);
      const heinous=rows.filter(c=>c.gravity==='Heinous').length;
      const pending=rows.filter(c=>c.status==='Under Investigation'||c.status==='Undetected').length;
      const repeat=rows.filter(c=>c.accused.some(a=>repeatIds.includes(a))).length;
      const recent=rows.filter(c=>c.daysAgo<=60).length;
      const score=Math.min(97,Math.round(22+percent(heinous,Math.max(rows.length,1))*.28+percent(pending,Math.max(rows.length,1))*.30+Math.min(25,recent*.7)+Math.min(12,repeat)));
      return {...d,total:rows.length,heinous,pending,repeat,recent,score};
    });
  }

  function initControls(){
    els('districtFilter').innerHTML='<option value="All">All Karnataka</option>'+DISTRICTS.map(d=>`<option>${d.name}</option>`).join('');
    els('categoryFilter').innerHTML='<option value="All">All crime categories</option>'+CRIMES.map(c=>`<option>${c.name}</option>`).join('');
    ['districtFilter','categoryFilter','gravityFilter','periodFilter'].forEach(id=>{
      els(id).addEventListener('change',e=>{
        if(id==='districtFilter')state.district=e.target.value;
        if(id==='categoryFilter')state.category=e.target.value;
        if(id==='gravityFilter')state.gravity=e.target.value;
        if(id==='periodFilter')state.period=Number(e.target.value);
        state.page=1; renderAll();
      });
    });
  }

  function setView(view){
    state.view=view;
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(v=>v.classList.toggle('active',v.dataset.view===view));
    els(view+'View').classList.add('active');
    const titles={overview:'Crime Intelligence Command Center',map:'Geospatial Hotspot Intelligence',lifecycle:'Case Lifecycle & SLA Analytics',network:'Repeat-Accused Relationship Intelligence',cases:'Unified Case 360 Explorer'};
    els('pageTitle').textContent=titles[view];
    if(view==='map') renderMap();
    if(view==='network') renderNetwork();
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function metric(label,value,icon,color,trend){
    return `<div class="metric-card" style="--metric-color:${color}"><div class="metric-icon">${icon}</div><div class="metric-value">${value}</div><div class="metric-label">${label}</div><div class="metric-trend">${trend}</div></div>`;
  }

  function renderOverview(){
    const list=filteredCases();
    const pending=list.filter(c=>c.status==='Under Investigation'||c.status==='Undetected').length;
    const heinous=list.filter(c=>c.gravity==='Heinous').length;
    const arrested=list.filter(c=>c.arrested).length;
    const charged=list.filter(c=>c.chargesheeted).length;
    const avgDays=Math.round(list.filter(c=>c.chargeDays).reduce((a,c)=>a+c.chargeDays,0)/Math.max(1,list.filter(c=>c.chargeDays).length));
    els('recordCount').textContent=fmt(list.length);
    els('metricGrid').innerHTML=[
      metric('Total FIRs',fmt(list.length),'▤','#33d6ff','+8.2%'),
      metric('Active / Pending',fmt(pending),'◷','#ffbf48','Needs review'),
      metric('Heinous offences',fmt(heinous),'!','#ff4d6d',`${percent(heinous,list.length)}% share`),
      metric('Arrest rate',percent(arrested,list.length)+'%','✓','#46e6a6','+4.6%'),
      metric('Chargesheet rate',percent(charged,list.length)+'%','⇢','#9f7aea','+3.1%'),
      metric('Avg. disposal',avgDays+'d','⧗','#ff814a','-6 days')
    ].join('');

    const ag=aggregateDistrict(list).sort((a,b)=>b.score-a.score);
    els('districtTable').innerHTML=ag.slice(0,7).map(d=>`<tr data-district="${d.name}"><td><strong>${d.name}</strong></td><td>${d.total}</td><td>${d.heinous}</td><td>${d.pending}</td><td><span class="risk-badge ${riskClass(d.score)}">${d.score} • ${riskLabel(d.score)}</span></td></tr>`).join('');
    document.querySelectorAll('#districtTable tr').forEach(r=>r.onclick=()=>{state.selectedDistrict=r.dataset.district;setView('map')});

    const top=ag[0]||{score:0,name:'Karnataka',heinous:0,pending:0,recent:0,repeat:0};
    els('riskScore').textContent=top.score;
    els('riskRing').style.setProperty('--score',top.score);
    els('riskRing').style.background=`conic-gradient(${colorForRisk(top.score)} ${top.score}%,#1b2d44 0)`;
    els('riskDistrict').textContent=state.district==='All'?top.name:state.district;
    els('riskStatus').textContent=riskLabel(top.score).toUpperCase();
    els('riskStatus').style.color=colorForRisk(top.score);
    els('riskSummary').textContent=`Priority is driven by ${top.recent} recent FIRs, ${top.pending} unresolved cases and ${top.repeat} repeat-accused links.`;
    const factors=[
      ['Recent crime velocity',Math.min(100,top.recent*4)],
      ['Unresolved case volume',Math.min(100,top.pending*2.8)],
      ['Heinous offence share',Math.min(100,percent(top.heinous,Math.max(top.total,1))*1.6)],
      ['Repeat-accused activity',Math.min(100,top.repeat*9)]
    ];
    els('factorList').innerHTML=factors.map(([n,v])=>`<div class="factor-row"><span>${n}<div><i style="width:${v}%"></i></div></span><strong>${Math.round(v)}</strong></div>`).join('');

    const alerts=ag.filter(d=>d.score>=65).slice(0,4).map((d,i)=>({
      title:i===0?`Crime spike detected in ${d.name}`:`${d.name} moved to ${riskLabel(d.score)} risk`,
      text:`${d.recent} FIRs in the recent window; ${d.pending} unresolved. Review patrol and investigation allocation.`
    }));
    els('alertCount').textContent=alerts.length;
    els('alertList').innerHTML=alerts.map(a=>`<div class="alert-item"><div class="alert-icon">⚠</div><div><strong>${a.title}</strong><p>${a.text}</p></div></div>`).join('');

    renderTrend(list);
    renderDonut(list);
    renderWorkload(list);
  }

  function getCanvas(id,height){
    const c=els(id), rect=c.getBoundingClientRect(), ratio=window.devicePixelRatio||1;
    c.width=Math.max(300,rect.width)*ratio;c.height=height*ratio;
    const ctx=c.getContext('2d');ctx.setTransform(ratio,0,0,ratio,0,0);
    return {c,ctx,w:Math.max(300,rect.width),h:height};
  }
  function drawGrid(ctx,w,h,pad=35){
    ctx.strokeStyle='#1c304b';ctx.lineWidth=1;ctx.font='9px Manrope';ctx.fillStyle='#7890ad';
    for(let i=0;i<5;i++){let y=pad+(h-pad*2)*i/4;ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(w-15,y);ctx.stroke()}
  }
  function renderTrend(list){
    const {ctx,w,h}=getCanvas('trendChart',245);ctx.clearRect(0,0,w,h);drawGrid(ctx,w,h);
    const months=[];for(let i=11;i>=0;i--){const d=new Date(today);d.setMonth(d.getMonth()-i);months.push({key:d.toISOString().slice(0,7),label:d.toLocaleString('en',{month:'short'})})}
    const vals=months.map(m=>list.filter(c=>c.date.startsWith(m.key)).length);
    const max=Math.max(...vals,1)*1.25,pad=35,plotW=w-pad-20,plotH=h-pad*2;
    ctx.font='9px Manrope';ctx.fillStyle='#7890ad';
    months.forEach((m,i)=>ctx.fillText(m.label,pad+i*plotW/(months.length-1)-8,h-12));
    const draw=(points,color,dashed=false)=>{
      ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.setLineDash(dashed?[6,5]:[]);
      points.forEach((v,i)=>{const x=pad+i*plotW/(months.length-1),y=pad+plotH-(v/max*plotH);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});
      ctx.stroke();ctx.setLineDash([]);
      points.forEach((v,i)=>{const x=pad+i*plotW/(months.length-1),y=pad+plotH-(v/max*plotH);ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fill()});
    };
    draw(vals,'#33d6ff');
    const forecast=vals.map((v,i)=>i<9?NaN:Math.round(v*(1+(i-8)*.04)+2));
    ctx.beginPath();ctx.strokeStyle='#9f7aea';ctx.lineWidth=2.5;ctx.setLineDash([6,5]);
    let started=false;forecast.forEach((v,i)=>{if(Number.isNaN(v))return;const x=pad+i*plotW/11,y=pad+plotH-(v/max*plotH);if(!started){ctx.moveTo(x,y);started=true}else ctx.lineTo(x,y)});ctx.stroke();ctx.setLineDash([]);
  }

  function renderDonut(list){
    const {ctx,w,h}=getCanvas('donutChart',260);ctx.clearRect(0,0,w,h);
    const colors=['#33d6ff','#9f7aea','#ff4d6d','#ffbf48','#46e6a6','#ff814a','#5ea8ff'];
    const counts=CRIMES.map(c=>list.filter(x=>x.category===c.name).length);
    const total=Math.max(1,counts.reduce((a,b)=>a+b,0));
    let a=-Math.PI/2;counts.forEach((v,i)=>{const slice=v/total*Math.PI*2;ctx.beginPath();ctx.strokeStyle=colors[i];ctx.lineWidth=25;ctx.arc(w/2,h/2,78,a,a+slice);ctx.stroke();a+=slice});
    ctx.fillStyle='#edf6ff';ctx.font='700 27px Space Grotesk';ctx.textAlign='center';ctx.fillText(total,w/2,h/2+4);ctx.fillStyle='#8ea4bf';ctx.font='10px Manrope';ctx.fillText('TOTAL FIRs',w/2,h/2+22);ctx.textAlign='left';
    els('donutLegend').innerHTML=CRIMES.map((c,i)=>`<div><span><i style="background:${colors[i]}"></i>${c.name}</span><strong>${counts[i]}</strong></div>`).join('');
  }

  function renderWorkload(list){
    const {ctx,w,h}=getCanvas('workloadChart',275);ctx.clearRect(0,0,w,h);
    const stations=Object.values(STATIONS).flat().map(s=>({s,n:list.filter(c=>c.station===s&&c.status==='Under Investigation').length})).sort((a,b)=>b.n-a.n).slice(0,7);
    const max=Math.max(...stations.map(s=>s.n),1),left=115,barH=20,gap=13;
    ctx.font='9px Manrope';
    stations.forEach((d,i)=>{const y=22+i*(barH+gap);ctx.fillStyle='#8ea4bf';ctx.fillText(d.s.replace(' Police Station',' PS').slice(0,19),4,y+14);ctx.fillStyle='#172b43';ctx.fillRect(left,y,w-left-30,barH);const grd=ctx.createLinearGradient(left,0,w,0);grd.addColorStop(0,'#33d6ff');grd.addColorStop(1,'#9f7aea');ctx.fillStyle=grd;ctx.fillRect(left,y,(w-left-30)*d.n/max,barH);ctx.fillStyle='#edf6ff';ctx.fillText(d.n,left+8,y+14)});
  }

  function renderMap(){
    const list=filteredCases(), ag=aggregateDistrict(list);
    const g=els('mapMarkers');g.innerHTML='';
    ag.forEach(d=>{
      const radius=state.mapMode==='risk'?Math.max(9,d.score/6):Math.max(9,Math.sqrt(d.total)*3);
      const c=colorForRisk(d.score);
      const node=document.createElementNS('http://www.w3.org/2000/svg','g');
      node.setAttribute('class','map-marker');node.dataset.district=d.name;
      node.innerHTML=`<circle cx="${d.x}" cy="${d.y}" r="${radius+8}" fill="${c}"/><circle cx="${d.x}" cy="${d.y}" r="${radius}" fill="${c}" stroke="#fff" stroke-width="1.3"/><text x="${d.x}" y="${d.y+radius+18}" text-anchor="middle">${d.name.replace('Bengaluru Urban','Bengaluru')}</text>`;
      node.addEventListener('mouseenter',e=>showMapTip(e,d));
      node.addEventListener('mouseleave',()=>els('mapTooltip').style.display='none');
      node.addEventListener('click',()=>{state.selectedDistrict=d.name;renderMapSide(ag)});
      g.appendChild(node);
    });
    renderMapSide(ag);
  }

  function showMapTip(e,d){
    const tip=els('mapTooltip'),stage=e.target.closest('.map-stage').getBoundingClientRect();
    tip.innerHTML=`<strong>${d.name}</strong>${d.total} FIRs • ${d.heinous} heinous<br>Risk ${d.score}/100`;
    tip.style.display='block';tip.style.left=Math.min(stage.width-155,e.clientX-stage.left+12)+'px';tip.style.top=(e.clientY-stage.top-25)+'px';
  }
  function renderMapSide(ag){
    const d=ag.find(x=>x.name===state.selectedDistrict)||ag[0];
    els('selectedDistrictName').textContent=d.name;
    els('selectedDistrictScore').textContent=d.score;
    els('selectedDistrictScore').style.color=colorForRisk(d.score);
    els('selectedDistrictStats').innerHTML=[
      ['FIRs',d.total],['Heinous',d.heinous],['Unresolved',d.pending],['Repeat links',d.repeat]
    ].map(([n,v])=>`<div class="mini-stat"><strong>${v}</strong><span>${n}</span></div>`).join('');
    els('recommendations').innerHTML=[
      `Increase visible patrol coverage around the top two recent hotspot clusters.`,
      `Review ${d.pending} unresolved cases and rebalance investigation workload.`,
      `Conduct human review of ${d.repeat} repeat-accused relationship flags.`,
      `Schedule a 7-day crime trend review with station-level drilldown.`
    ].map(x=>`<li>${x}</li>`).join('');
    const rows=filteredCases().filter(c=>c.district===d.name);
    els('stationCards').innerHTML=STATIONS[d.name].map(s=>{
      const n=rows.filter(c=>c.station===s).length,p=rows.filter(c=>c.station===s&&c.status==='Under Investigation').length;
      return `<div class="station-card"><strong>${s}</strong><span>${n} FIRs • ${p} pending</span><div class="station-bar"><i style="width:${Math.min(100,n*5)}%"></i></div><span>Workload index ${Math.min(99,34+n*3+p*2)}</span></div>`
    }).join('');
  }

  function renderLifecycle(){
    const list=filteredCases(), total=list.length, arrested=list.filter(c=>c.arrested).length, charged=list.filter(c=>c.chargesheeted).length, closed=list.filter(c=>c.status==='Closed'||c.status==='Final Report').length;
    const pending=list.filter(c=>c.status==='Under Investigation').length;
    els('lifecycleMetrics').innerHTML=[
      metric('Registered',fmt(total),'1','#33d6ff','100%'),
      metric('Arrest / surrender',fmt(arrested),'2','#9f7aea',percent(arrested,total)+'%'),
      metric('Chargesheeted',fmt(charged),'3','#46e6a6',percent(charged,total)+'%'),
      metric('Closed / final report',fmt(closed),'4','#ffbf48',percent(closed,total)+'%'),
      metric('Pending investigation',fmt(pending),'◷','#ff814a',percent(pending,total)+'%'),
      metric('SLA exceptions',fmt(list.filter(c=>c.daysAgo>120&&c.status==='Under Investigation').length),'!','#ff4d6d','Review')
    ].join('');
    const stages=[['FIR Registered',total],['Arrest / Surrender',arrested],['Chargesheet Filed',charged],['Closed / Final Report',closed]];
    els('lifecycleFunnel').innerHTML=stages.map((s,i)=>`<div class="funnel-stage" style="width:${100-i*13}%"><strong>${s[0]}</strong><span>${s[1]}</span></div>`).join('');
    const delayed=list.filter(c=>c.daysAgo>90&&c.status==='Under Investigation').sort((a,b)=>b.daysAgo-a.daysAgo).slice(0,12);
    els('delayedTable').innerHTML=delayed.map(c=>`<tr><td><strong>${c.crimeNo}</strong></td><td>${c.district}<br><small>${c.station}</small></td><td>${c.category}</td><td>${c.daysAgo} days</td><td><span class="status-badge">${c.status}</span></td><td><span class="priority ${c.daysAgo>220?'critical':'high'}">${c.daysAgo>220?'Critical':'High'}</span></td><td><button class="row-action" data-case="${c.id}">Open 360</button></td></tr>`).join('');
    document.querySelectorAll('#delayedTable [data-case]').forEach(b=>b.onclick=()=>openCase(Number(b.dataset.case)));
    renderTurnaround(list);
  }

  function renderTurnaround(list){
    const {ctx,w,h}=getCanvas('turnaroundChart',310);ctx.clearRect(0,0,w,h);
    const districts=aggregateDistrict(list).sort((a,b)=>b.total-a.total).slice(0,8);
    const vals=districts.map(d=>{
      const r=list.filter(c=>c.district===d.name&&c.chargeDays);
      return Math.round(r.reduce((a,c)=>a+c.chargeDays,0)/Math.max(1,r.length))
    });
    const max=Math.max(...vals,1),pad=35,plotW=w-pad-20,plotH=h-pad*2,barW=plotW/vals.length*.55;
    drawGrid(ctx,w,h,pad);
    districts.forEach((d,i)=>{const x=pad+i*plotW/vals.length+12,y=pad+plotH-vals[i]/max*plotH;const grd=ctx.createLinearGradient(0,y,0,h-pad);grd.addColorStop(0,'#ff814a');grd.addColorStop(1,'#9f7aea');ctx.fillStyle=grd;ctx.fillRect(x,y,barW,h-pad-y);ctx.save();ctx.translate(x+barW/2,h-8);ctx.rotate(-.35);ctx.fillStyle='#8ea4bf';ctx.font='8px Manrope';ctx.textAlign='right';ctx.fillText(d.name,0,0);ctx.restore();ctx.fillStyle='#fff';ctx.font='9px Manrope';ctx.textAlign='center';ctx.fillText(vals[i]+'d',x+barW/2,y-6);ctx.textAlign='left'});
  }

  function renderNetwork(){
    const svg=els('networkSvg');svg.innerHTML='<defs><filter id="nodeGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
    const nodes=[],links=[];
    const repeatCases=cases.filter(c=>c.accused.some(a=>repeatIds.includes(a))).slice(0,22);
    repeatIds.forEach((id,i)=>nodes.push({id,type:'repeat',x:140+i*150,y:170+(i%2)*190,label:id}));
    repeatCases.forEach((c,i)=>nodes.push({id:'CASE-'+c.id,type:'case',x:80+(i%8)*105,y:65+Math.floor(i/8)*190,label:'FIR '+String(c.id).padStart(3,'0'),caseId:c.id}));
    repeatCases.forEach(c=>c.accused.filter(a=>repeatIds.includes(a)).forEach(a=>links.push([a,'CASE-'+c.id])));
    const additional=[...new Set(repeatCases.flatMap(c=>c.accused).filter(a=>!repeatIds.includes(a)))].slice(0,7);
    additional.forEach((id,i)=>nodes.push({id,type:'accused',x:110+i*110,y:480,label:id}));
    repeatCases.forEach(c=>c.accused.filter(a=>additional.includes(a)).forEach(a=>links.push([a,'CASE-'+c.id])));
    const byId=Object.fromEntries(nodes.map(n=>[n.id,n]));
    links.forEach(([a,b])=>{if(!byId[a]||!byId[b])return;const line=document.createElementNS('http://www.w3.org/2000/svg','line');line.setAttribute('class','net-link');line.setAttribute('x1',byId[a].x);line.setAttribute('y1',byId[a].y);line.setAttribute('x2',byId[b].x);line.setAttribute('y2',byId[b].y);svg.appendChild(line)});
    nodes.forEach(n=>{const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.setAttribute('class','net-node');g.dataset.node=n.id;const color=n.type==='repeat'?'#ff4d6d':n.type==='case'?'#33d6ff':'#9f7aea';const r=n.type==='case'?20:25;g.innerHTML=`<circle cx="${n.x}" cy="${n.y}" r="${r}" fill="${color}22" stroke="${color}"/><text x="${n.x}" y="${n.y+r+15}">${n.label}</text>`;g.onclick=()=>showEntity(n,links,byId);svg.appendChild(g)});
  }

  function showEntity(n,links,byId){
    els('entityTitle').textContent=n.label;
    if(n.type==='case'){const c=cases.find(x=>x.id===n.caseId);els('entityDetails').innerHTML=`<p class="muted">${c.category} • ${c.district}<br>${c.status}</p><div class="entity-grid"><div><strong>${c.risk}</strong><span>Risk score</span></div><div><strong>${c.accused.length}</strong><span>Linked accused</span></div></div><button class="row-action" id="entityOpen">Open Case 360</button>`;setTimeout(()=>els('entityOpen').onclick=()=>openCase(c.id),0)}
    else{const linked=links.filter(x=>x[0]===n.id||x[1]===n.id).map(x=>x[0]===n.id?x[1]:x[0]);els('entityDetails').innerHTML=`<p class="muted">${n.type==='repeat'?'Repeat appearance flag':'Accused reference'} based solely on recorded FIR associations.</p><div class="entity-grid"><div><strong>${linked.length}</strong><span>Direct links</span></div><div><strong>${new Set(linked).size}</strong><span>Related records</span></div></div><div class="modal-list">${linked.slice(0,7).map(x=>`<div><span>Association</span><strong>${byId[x]?.label||x}</strong></div>`).join('')}</div>`}
  }

  function renderCases(){
    const q=state.search.toLowerCase();
    const list=filteredCases().filter(c=>!q||[c.crimeNo,c.district,c.station,c.category,c.status].some(v=>String(v).toLowerCase().includes(q)));
    const pages=Math.max(1,Math.ceil(list.length/state.pageSize));if(state.page>pages)state.page=pages;
    const rows=list.slice((state.page-1)*state.pageSize,state.page*state.pageSize);
    els('caseTable').innerHTML=rows.map(c=>`<tr><td><strong>${c.crimeNo}</strong></td><td>${c.date}</td><td>${c.district}</td><td>${c.station}</td><td>${c.category}</td><td><span class="gravity-badge ${c.gravity.toLowerCase()}">${c.gravity}</span></td><td><span class="status-badge">${c.status}</span></td><td><span class="risk-badge ${riskClass(c.risk)}">${c.risk}</span></td><td><button class="row-action" data-case="${c.id}">View</button></td></tr>`).join('');
    els('pageInfo').textContent=`Page ${state.page} of ${pages} • ${list.length} cases`;
    document.querySelectorAll('#caseTable [data-case]').forEach(b=>b.onclick=()=>openCase(Number(b.dataset.case)));
  }

  function openCase(id){
    const c=cases.find(x=>x.id===id);if(!c)return;
    const stages=[
      ['FIR Registered',c.date,true],
      ['Investigation','Assigned',true],
      ['Arrest / Surrender',c.arrested?`Day ${c.arrestDays}`:'Pending',c.arrested],
      ['Chargesheet',c.chargesheeted?`Day ${c.chargeDays}`:'Pending',c.chargesheeted],
      ['Closure',c.status==='Closed'?'Completed':'Open',c.status==='Closed']
    ];
    els('modalContent').innerHTML=`<p class="eyebrow">Case 360 • Synthetic record</p><h2 class="modal-title">${c.crimeNo}</h2><p class="modal-sub">${c.category} • ${c.district} • ${c.station}</p>
      <div class="modal-grid">
        <div class="modal-stat"><span>Registered</span><strong>${c.date}</strong></div>
        <div class="modal-stat"><span>Gravity</span><strong>${c.gravity}</strong></div>
        <div class="modal-stat"><span>Status</span><strong>${c.status}</strong></div>
        <div class="modal-stat"><span>Explainable risk</span><strong style="color:${colorForRisk(c.risk)}">${c.risk}/100</strong></div>
      </div>
      <div class="timeline">${stages.map(s=>`<div class="timeline-step ${s[2]?'complete':''}"><i></i><strong>${s[0]}</strong><span>${s[1]}</span></div>`).join('')}</div>
      <div class="modal-columns">
        <div class="modal-section"><h3>Incident & legal intelligence</h3><div class="modal-list">
          <div><span>Location</span><strong>${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}</strong></div>
          <div><span>Time band</span><strong>${c.night?'Night':'Day'}</strong></div>
          <div><span>Sections</span><strong>${c.sections.join(', ')}</strong></div>
          <div><span>Investigating officer</span><strong>${c.officer}</strong></div>
          <div><span>Victims</span><strong>${c.victimCount} protected identities</strong></div>
        </div></div>
        <div class="modal-section"><h3>Recorded accused associations</h3><div class="modal-list">${c.accused.map(a=>`<div><span>Reference ID</span><strong>${a}${repeatIds.includes(a)?' • Repeat flag':''}</strong></div>`).join('')}</div></div>
      </div>
      <div class="modal-section" style="margin-top:12px"><h3>Redacted brief facts</h3><p class="muted">${c.brief}</p></div>`;
    els('caseModal').classList.add('open');
  }

  function handleAsk(){
    const q=els('askInput').value.trim().toLowerCase();if(!q)return toast('Enter an operational question.');
    if(q.includes('high-risk')||q.includes('high risk')){setView('map');toast('Showing district risk intelligence.');return}
    if(q.includes('delayed')||q.includes('pending')){setView('lifecycle');toast('Showing delayed and pending case exceptions.');return}
    if(q.includes('repeat')||q.includes('network')){setView('network');toast('Showing repeat-accused relationship network.');return}
    const district=DISTRICTS.find(d=>q.includes(d.name.toLowerCase())||q.includes(d.name.split(' ')[0].toLowerCase()));
    const crime=CRIMES.find(c=>q.includes(c.name.toLowerCase()));
    if(district){state.district=district.name;els('districtFilter').value=district.name}
    if(crime){state.category=crime.name;els('categoryFilter').value=crime.name}
    if(district||crime){setView('cases');state.page=1;renderAll();toast(`Applied ${district?district.name:''}${district&&crime?' + ':''}${crime?crime.name:''} filter.`);return}
    setView('overview');toast('Analysed the current filtered operational picture.');
  }

  function exportBrief(){
    const list=filteredCases(), ag=aggregateDistrict(list).sort((a,b)=>b.score-a.score);
    const brief={
      generated_at:new Date().toISOString(),
      scope:{district:state.district,category:state.category,gravity:state.gravity,period_days:state.period},
      key_metrics:{
        total_firs:list.length,
        pending:list.filter(c=>c.status==='Under Investigation'||c.status==='Undetected').length,
        heinous:list.filter(c=>c.gravity==='Heinous').length,
        arrest_rate:percent(list.filter(c=>c.arrested).length,list.length),
        chargesheet_rate:percent(list.filter(c=>c.chargesheeted).length,list.length)
      },
      top_risk_districts:ag.slice(0,5).map(d=>({district:d.name,risk_score:d.score,firs:d.total,pending:d.pending})),
      disclaimer:'Synthetic and anonymised prototype data. Human review is required for operational use.'
    };
    const blob=new Blob([JSON.stringify(brief,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='KAVACH360_Operational_Brief.json';a.click();URL.revokeObjectURL(url);toast('Operational brief exported.');
  }

  function toast(msg){const t=els('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}

  function renderAll(){
    renderOverview();renderLifecycle();renderCases();
    if(state.view==='map')renderMap();
    if(state.view==='network')renderNetwork();
  }

  function bind(){
    document.querySelectorAll('.nav-item').forEach(b=>b.onclick=()=>setView(b.dataset.view));
    document.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>setView(b.dataset.jump));
    document.querySelectorAll('[data-mapmode]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-mapmode]').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.mapMode=b.dataset.mapmode;renderMap()});
    els('modalClose').onclick=()=>els('caseModal').classList.remove('open');
    els('caseModal').onclick=e=>{if(e.target===els('caseModal'))els('caseModal').classList.remove('open')};
    els('caseSearch').oninput=e=>{state.search=e.target.value;state.page=1;renderCases()};
    els('prevPage').onclick=()=>{if(state.page>1){state.page--;renderCases()}};
    els('nextPage').onclick=()=>{state.page++;renderCases()};
    els('askBtn').onclick=handleAsk;els('askInput').onkeydown=e=>{if(e.key==='Enter')handleAsk()};
    els('reportBtn').onclick=exportBrief;
    els('refreshBtn').onclick=()=>{renderAll();toast('Analytics refreshed from the prototype dataset.')};
    window.addEventListener('resize',()=>{clearTimeout(window.__rt);window.__rt=setTimeout(()=>{renderOverview();renderLifecycle()},150)});
  }

  initControls();bind();renderAll();
})();