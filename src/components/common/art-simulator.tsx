// @ts-nocheck
import { useState, useCallback, useMemo, useEffect } from "react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, Area, BarChart, Bar, ComposedChart, ReferenceLine
} from "recharts";

/* ═══════════════════════════════════════════════════════════════
   §0  MATH UTILITIES
   ═══════════════════════════════════════════════════════════════ */
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
function mulberry32(s){let a=s>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function rbinom(n,p,r){n=Math.max(0,Math.floor(n));p=clamp(p,0,1);if(!p||!n)return 0;if(p===1)return n;let x=0;for(let i=0;i<n;i++)if(r()<p)x++;return x}
function rpoisson(l,r){if(l<=0)return 0;const L=Math.exp(-l);let k=0,p=1;do{k++;p*=r()}while(p>L);return k-1}
function rnegbin(mu,sz,r){if(mu<=0)return 0;return rpoisson(rgamma(sz,mu/sz,r),r)}
function rgamma(sh,sc,r){if(sh<1)return rgamma(1+sh,sc,r)*Math.pow(r(),1/sh);const d=sh-1/3,c=1/Math.sqrt(9*d);while(true){let x,v;do{x=rnorm(r);v=1+c*x}while(v<=0);v=v*v*v;const u=r();if(u<1-0.0331*(x*x)*(x*x))return d*v*sc;if(Math.log(u)<0.5*x*x+d*(1-v+Math.log(v)))return d*v*sc}}
function rnorm(r){return Math.sqrt(-2*Math.log(r()+1e-30))*Math.cos(2*Math.PI*r())}
function piecewiseLinear(x,pts){if(x<=pts[0][0])return pts[0][1];for(let i=1;i<pts.length;i++){if(x<=pts[i][0]){const[x0,y0]=pts[i-1],[x1,y1]=pts[i];return y0+((x-x0)/(x1-x0))*(y1-y0)}}return pts[pts.length-1][1]}
function percentile(a,p){if(!a.length)return NaN;const i=(p/100)*(a.length-1),lo=Math.floor(i),hi=Math.ceil(i);return lo===hi?a[lo]:a[lo]*(1-(i-lo))+a[hi]*(i-lo)}
function wilsonCI(k,n,z=1.96){if(!n)return[NaN,NaN];const p=k/n,z2=z*z,d=1+z2/n,c=(p+z2/(2*n))/d,h=(z*Math.sqrt((p*(1-p)+z2/(4*n))/n))/d;return[Math.max(0,c-h),Math.min(1,c+h)]}

/* ═══════════════════════════════════════════════════════════════
   §0.5  LOCALIZATION (ja/en)
   ═══════════════════════════════════════════════════════════════ */
const t = {
  ja: {
    title: "ART妊活シミュレーター",
    subtitle: "体外受精の治療予測モデル",
    pgtOn: "PGT-A ON",
    yourInfo: "あなたの情報",
    age: "治療開始年齢",
    ageHint1: "比較的良好な条件です", ageHint2: "標準的な条件です", ageHint3: "成功率がやや低下する年齢域です", ageHint4: "個別の治療戦略が重要です",
    amh: "AMH（卵巣予備能）",
    amhHint: (a, m) => `${a}歳の平均: ${m.toFixed(1)} ng/mL`,
    pgtTitle: "PGT-A（着床前検査）", pgtDesc: "正常胚のみを移植する前提で計算",
    btnCalc: "計算しています...", btnRun: "結果を見る",
    stat50: "半数が妊娠", stat80: "8割が妊娠", statRet: "採卵回数", statTra: "移植回数",
    months: "ヶ月", times: "回",
    median: v => `中央値 ${v}回`,
    note3y: "※3年以内の実施回数",
    rate12: "12ヶ月", rate24: "24ヶ月",
    advBtn: "詳細設定",
    advMii: "成熟卵（平均）", advPb: "胚盤胞到達率", advPf: "受精率", advPe: "Euploid率",
    advMpr: "採卵間隔", advMpt: "移植間隔", advCancel: "キャンセル率", advIter: "患者数",
    freshTx: "新鮮胚移植を行う",
    stratL: "移植戦略", stratSeq: "保険診療", stratBat: "複数採卵で確保",
    batchL: "確保数",
    disc: "※ 統計モデルによる推定です。個別の医学的助言ではありません。結果の解釈は担当医にご相談ください。",
    ch1T: "治療期間と妊娠の可能性", ch1S: "治療を続けた場合の累積妊娠確率",
    xaxis: "治療期間（ヶ月）", yaxis: "妊娠確率（%）",
    ttProb: "妊娠確率", ttLo: "下限", ttHi: "上限", ttMo: "ヶ月目",
    ch2T: "妊娠までの期間分布", ch2S: "何ヶ月目に妊娠する方が多いか",
    ttPreg: "妊娠数",
    miPrefix: "人の仮想患者コホートを生成し、モンテカルロ法で推定。\n",
    miTags: <><em>負の二項分布</em>・<em>Frailtyモデル</em>・<em>イベント駆動型ドロップアウト</em>を実装。</>,
    miPgt: " PGT-A正常胚のLBRは年齢非依存の55%固定。",
    miSuffix: "OHSS予防のため成熟卵数は15個を上限としています。"
  },
  en: {
    title: "ART Success Simulator",
    subtitle: "IVF Treatment Prediction Model",
    pgtOn: "PGT-A ON",
    yourInfo: "Your Profile",
    age: "Starting Age",
    ageHint1: "Favorable conditions", ageHint2: "Standard conditions", ageHint3: "Age where success rates begin to decline", ageHint4: "Personalized strategy is crucial",
    amh: "AMH (Ovarian Reserve)",
    amhHint: (a, m) => `Average at age ${a}: ${m.toFixed(1)} ng/mL`,
    pgtTitle: "PGT-A (Preimplantation Testing)", pgtDesc: "Assumes transfer of euploid embryos only",
    btnCalc: "Calculating...", btnRun: "View Results",
    stat50: "50% Pregnancy", stat80: "80% Pregnancy", statRet: "Retrievals", statTra: "Transfers",
    months: "mo", times: "x",
    median: v => `Median: ${v}x`,
    note3y: "*Number of cycles within 3 years",
    rate12: "12 Months", rate24: "24 Months",
    advBtn: "Advanced Settings",
    advMii: "MII Oocytes", advPb: "Blastocyst Rate", advPf: "Fertilization", advPe: "Euploid Rate",
    advMpr: "Retrieval Intvl", advMpt: "Transfer Intvl", advCancel: "Cancel Rate", advIter: "Patients",
    freshTx: "Include Fresh Transfer",
    stratL: "Strategy", stratSeq: "Sequential", stratBat: "Batching (Banking)",
    batchL: "Target Embryos",
    disc: "* Estimated via statistical model. Not individualized medical advice. Consult your doctor for interpretation.",
    ch1T: "Treatment Duration & Probability", ch1S: "Cumulative live birth probability over time",
    xaxis: "Treatment Duration (Months)", yaxis: "Probability (%)",
    ttProb: "Probability", ttLo: "Lower", ttHi: "Upper", ttMo: "mo",
    ch2T: "Distribution of Conceptions", ch2S: "When do most pregnancies occur?",
    ttPreg: "Pregnancies",
    miPrefix: "virtual patient cohort generated. Estimated via Monte Carlo simulation.\n",
    miTags: <>Implemented <em>Negative Binomial</em>, <em>Frailty Model</em>, and <em>Event-driven dropout</em>.</>,
    miPgt: " PGT-A euploid LBR is fixed at 55% (age-independent).",
    miSuffix: " MII cap at 15 to account for OHSS prevention."
  }
};

// ── Curve smoothing (weighted moving average) ──
function smoothCurve(data, windowSize = 5) {
  if (data.length < windowSize) return data;
  const smoothed = [];
  for (let i = 0; i < data.length; i++) {
    let sumY = 0, sumLo = 0, sumHi = 0, weight = 0;
    for (let j = Math.max(0, i - Math.floor(windowSize / 2)); j <= Math.min(data.length - 1, i + Math.floor(windowSize / 2)); j++) {
      const w = 1 - Math.abs(j - i) / (windowSize / 2 + 1); // triangular weight
      sumY += data[j].y * w;
      sumLo += data[j].lo * w;
      sumHi += data[j].hi * w;
      weight += w;
    }
    smoothed.push({
      x: data[i].x,
      y: +Math.min(100, Math.max(0, sumY / weight)).toFixed(2),
      lo: +Math.min(100, Math.max(0, sumLo / weight)).toFixed(2),
      hi: +Math.min(100, Math.max(0, sumHi / weight)).toFixed(2),
    });
  }
  // Ensure monotonically non-decreasing (cumulative curve should never drop)
  for (let i = 1; i < smoothed.length; i++) {
    smoothed[i].y = Math.max(smoothed[i].y, smoothed[i - 1].y);
    smoothed[i].lo = Math.max(smoothed[i].lo, smoothed[i - 1].lo);
    smoothed[i].hi = Math.max(smoothed[i].hi, smoothed[i - 1].hi);
  }
  return smoothed;
}

/* ═══════════════════════════════════════════════════════════════
   §1  CLINICAL PARAMETERS
   ═══════════════════════════════════════════════════════════════ */
const ageP={
  pMII:a=>clamp(.78-Math.max(0,a-38)*.012,.55,.88),
  pFert:a=>clamp(.72-Math.max(0,a-40)*.015,.50,.86),
  pBlast:a=>clamp(piecewiseLinear(a,[[30,.46],[35,.43],[38,.38],[41,.32],[43,.26],[45,.20]]),.15,.60),
  pUsable:a=>clamp(piecewiseLinear(a,[[30,.76],[35,.72],[38,.66],[41,.60],[43,.52],[45,.44]]),.35,.85),
  pLBR:(a,k)=>{const v=clamp(piecewiseLinear(a,[[30,.43],[35,.40],[38,.34],[41,.26],[43,.16],[45,.08]]),.03,.60);return k==='fresh'?v*.95:v},
};
const PGT_LBR=0.55;
const pEuploid=a=>clamp(piecewiseLinear(a,[[30,.60],[35,.50],[38,.35],[40,.25],[42,.15],[44,.07],[45,.04]]),.02,.75);
const expOocytes=(a,amh)=>clamp(amh*8-Math.max(0,a-35)*.75,1,40);
const amhMedian=a=>clamp(piecewiseLinear(a,[[28,5],[30,4.2],[32,3.5],[34,3],[36,2.4],[38,1.8],[40,1.3],[42,.8],[44,.4],[46,.2]]),.1,8);

/* ═══════════════════════════════════════════════════════════════
   §2  SIMULATION ENGINE (v2 — 4 corrections)
   ═══════════════════════════════════════════════════════════════ */
const NB_SZ=4,FR_D=.88,FR_F=.35,DO_Z=.12,DO_F=.08,DO_R=.15;

function simOne(o){
  const{startAge,amh,mpr=1.5,mpt=1,maxAge=45,cancelRate=.1,thaw=.97,fresh=false,strat='sequential',batch=0,miiOv=null,pfOv=null,pbOv=null,peOv=null,cap15=true,pgt=false,seed=1}=o;
  const rng=mulberry32(seed);let m=0,am=startAge*12,bank=0,fc=0,ret=0,tra=0,sm=null,stop=null;
  const rL=[],tL=[];let cf=0,fm=1;
  while(am<maxAge*12){
    ret++;m+=mpr;am+=mpr;rL.push(Math.round(m));
    if(am>=maxAge*12){stop='age';break}
    const age=am/12;
    let mii=0;
    if(miiOv!=null&&isFinite(miiOv))mii=rnegbin(Math.max(.1,miiOv),NB_SZ,rng);
    else{mii=rbinom(rnegbin(expOocytes(age,amh),NB_SZ,rng),ageP.pMII(age),rng)}
    if(cap15)mii=Math.min(mii,15);
    const pF=pfOv!=null?clamp(pfOv,0,1):ageP.pFert(age);
    const pB=pbOv!=null?clamp(pbOv,0,1):ageP.pBlast(age);
    const bl=rbinom(rbinom(mii,pF,rng),pB,rng);
    let us=0;
    if(pgt){const pe=peOv!=null?clamp(peOv,0,1):pEuploid(age);us=rbinom(bl,pe,rng)}
    else us=rbinom(bl,ageP.pUsable(age),rng);
    if(!us){if(rng()<DO_Z){stop='do_z';break}continue}
    fc=0;let tf=us;if(fresh&&us>0){fc=1;tf=us-1}bank+=tf;
    while(am<maxAge*12){
      if(strat==='batch'&&(bank+fc)<batch)break;
      m+=mpt;am+=mpt;if(am>=maxAge*12){stop='age';break}
      if(cancelRate>0&&rng()<cancelRate)continue;
      let k='FET';if(fc>0){k='fresh';fc=0}else if(bank>0){bank--;if(!(rng()<thaw))continue}else break;
      tra++;tL.push(Math.round(m));
      const bp=pgt?PGT_LBR:ageP.pLBR(age,k);
      if(rng()<bp*fm){sm=Math.round(m);stop='ok';break}
      cf++;fm=Math.max(FR_F,Math.pow(FR_D,cf));
      if(rng()<(cf>=3?DO_R:DO_F)){stop='do_f';break}
      if(bank+fc<=0)break;
    }
    if(stop)break;
  }
  return{sm,ret,tra,stop,rL,tL};
}

function runSim(o){
  const hz=Math.max(0,Math.ceil((o.maxAge-o.startAge)*12)),it=o.iterations;
  const hm=new Array(hz+1).fill(0),sM=[],rS=[],tS=[],r3=[],t3=[];
  for(let i=0;i<it;i++){
    const s=simOne({...o,seed:(o.seed||1234)+i});
    if(s.sm!=null){hm[Math.min(s.sm,hz)]++;sM.push(s.sm);rS.push(s.ret);tS.push(s.tra)}
    r3.push((s.rL||[]).filter(x=>x<=36).length);t3.push((s.tL||[]).filter(x=>x<=36).length);
  }
  const tl=[];let ac=0;
  for(let m=0;m<=hz;m++){ac+=hm[m];const p=ac/it;const[lo,hi]=wilsonCI(ac,it);tl.push({x:m,y:+(p*100).toFixed(2),lo:+(lo*100).toFixed(2),hi:+(hi*100).toFixed(2)})}
  sM.sort((a,b)=>a-b);
  const mx=sM.length?Math.max(...sM):0,bins=new Array(Math.max(hz,mx)+1).fill(0);
  for(const m of sM)bins[Math.round(m)]++;
  const hd=[];for(let i=0;i<=Math.min(bins.length-1,36);i++)hd.push({month:i,count:bins[i]||0});
  return{tl,hd,sM,rS,tS,r3,t3};
}

/* ═══════════════════════════════════════════════════════════════
   §3  REACT UI
   ═══════════════════════════════════════════════════════════════ */

function Range({label,value,onChange,min,max,step=1,fmt,hint}){
  const pct=((value-min)/(max-min))*100;
  return(
    <div style={{marginBottom:12}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:4}}>
        <span className="rl">{label}</span>
        <span className="rv">{fmt?fmt(value):value}</span>
      </div>
      <div style={{position:'relative'}}>
        <div className="trk"><div className="trk-f" style={{width:`${pct}%`}}/></div>
        <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(parseFloat(e.target.value))} className="ri"/>
      </div>
      {hint&&<p className="rh">{hint}</p>}
    </div>
  );
}

function Stat({icon,label,value,unit,sub,accent}){
  return(
    <div className={`sc${accent?' sc-a':''}`}>
      <div className="sc-i">{icon}</div>
      <div className="sc-l">{label}</div>
      <div className="sc-v">{value}<span className="sc-u">{unit}</span></div>
      {sub&&<div className="sc-s">{sub}</div>}
    </div>
  );
}

export default function ART({ lang = "ja" }: { lang?: "ja" | "en" }){
  const[age,setAge]=useState(36);
  const[amh,setAmh]=useState(2.4);
  const[pgt,setPgt]=useState(false);
  const[adv,setAdv]=useState(false);
  const[mii,setMii]=useState(8);
  const[cap15]=useState(true);
  const[pf,setPf]=useState(72);
  const[pb,setPb]=useState(40);
  const[pe,setPe]=useState(35);
  const[fresh,setFresh]=useState(false);
  const[strat,setStrat]=useState('sequential');
  const[batch,setBatch]=useState(2);
  const[mpr,setMpr]=useState(1.5);
  const[mpt,setMpt]=useState(1.0);
  const[cancel,setCancel]=useState(10);
  const[iter,setIter]=useState(3000);
  const[ci,setCi]=useState(true);
  const[res,setRes]=useState(null);
  const[busy,setBusy]=useState(false);

  const derive=useCallback((a,am)=>{
    const lam=expOocytes(a,am);
    const mm=ageP.pMII(a)*lam;
    setMii(+Math.min(15,mm).toFixed(1));
    setPf(Math.round(ageP.pFert(a)*100));
    setPb(Math.round(ageP.pBlast(a)*100));
    setPe(Math.round(pEuploid(a)*100));
  },[]);

  const onAge=useCallback(a=>{setAge(a);const am=+amhMedian(a).toFixed(1);setAmh(am);derive(a,am)},[derive]);
  const onAmh=useCallback(a=>{setAmh(a);derive(age,a)},[age,derive]);

  useEffect(()=>{derive(age,amh)},[]);

  const empr=pgt?Math.max(mpr,2.5):mpr, empt=pgt?mpt+1:mpt;

  const run=useCallback(()=>{
    setBusy(true);
    setTimeout(()=>{
      const r=runSim({startAge:age,amh,iterations:iter,mpr:empr,mpt:empt,maxAge:45,cancelRate:cancel/100,thaw:.97,fresh,strat,batch,miiOv:mii,pfOv:pf/100,pbOv:pb/100,peOv:pgt?pe/100:null,cap15:true,pgt,seed:Date.now()});
      setRes(r);setBusy(false);
    },30);
  },[age,amh,iter,empr,empt,cancel,fresh,strat,batch,mii,pf,pb,pe,pgt]);

  useEffect(()=>{run()},[]);

  const st=useMemo(()=>{
    if(!res)return{};
    const tl=res.tl;
    const fm=t=>{for(const p of tl)if(p.y>=t)return p.x;return NaN};
    const ra=m=>{for(const p of tl)if(p.x>=m)return p.y;return tl[tl.length-1]?.y??NaN};
    const t50=fm(50),t80=fm(80),r12=ra(12),r24=ra(24);
    let nR='—',nT='—',mR='',mT='',note='';
    const m75=fm(75),ok75=isFinite(m75)&&tl.length&&tl[tl.length-1].y>=75;
    if(ok75&&res.sM?.length&&res.rS&&res.tS){
      const idx=[];for(let i=0;i<res.sM.length;i++)if(res.sM[i]<=m75)idx.push(i);
      if(idx.length){
        const r=idx.map(i=>res.rS[i]).sort((a,b)=>a-b);
        const t=idx.map(i=>res.tS[i]).sort((a,b)=>a-b);
        nR=`${Math.round(percentile(r,50))}〜${Math.round(percentile(r,97.5))}`;
        nT=`${Math.round(percentile(t,50))}〜${Math.round(percentile(t,97.5))}`;
        mR=tObj.median(Math.round(percentile(r,50)));mT=tObj.median(Math.round(percentile(t,50)));
      }
    }else if(res.r3&&res.t3){
      const r=[...res.r3].sort((a,b)=>a-b),t=[...res.t3].sort((a,b)=>a-b);
      if(r.length){nR=`${Math.round(percentile(r,50))}〜${Math.round(percentile(r,97.5))}`;mR=tObj.median(Math.round(percentile(r,50)))}
      if(t.length){nT=`${Math.round(percentile(t,50))}〜${Math.round(percentile(t,97.5))}`;mT=tObj.median(Math.round(percentile(t,50)))}
      note=tObj.note3y;
    }
    return{t50,t80,r12,r24,nR,nT,mR,mT,note};
  },[res, lang]);

  const fm=v=>isFinite(v)?`${Math.round(v)}`:'—';

  // Apply smoothing to chart data (especially helps PGT-A curves)
  const chartData=useMemo(()=>{
    const raw=(res?.tl||[]).filter(d=>d.x<=36);
    return smoothCurve(raw, 5);
  },[res]);
  const histData=useMemo(()=>res?.hd||[],[res]);

  const tObj = t[lang] || t.ja;

  return(
    <div className="root">
      <style>{CSS}</style>

      <header className="hd">
        <div className="hd-in">
          <div className="hd-left">
            <h1 className="hd-t">
              <span className="hd-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity=".25"/>
                  <circle cx="12" cy="12" r="4.5" fill="currentColor" opacity=".45"/>
                  <circle cx="12" cy="5.5" r="2" fill="currentColor" opacity=".9"/>
                  <circle cx="17.5" cy="9" r="1.5" fill="currentColor" opacity=".6"/>
                  <circle cx="6.5" cy="9" r="1.5" fill="currentColor" opacity=".6"/>
                  <circle cx="16" cy="15" r="1.2" fill="currentColor" opacity=".4"/>
                  <circle cx="8" cy="15" r="1.2" fill="currentColor" opacity=".4"/>
                </svg>
              </span>
              {tObj.title}
            </h1>
            <p className="hd-sub">{tObj.subtitle}</p>
          </div>
          <div className="hd-right">
            {pgt&&<span className="pgt-b">{tObj.pgtOn}</span>}
          </div>
        </div>
      </header>

      <main className="mn">
        {/* ══ LEFT PANEL ══ */}
        <div className="lp">
          <div className="lp-box">
            <h2 className="lp-title">{tObj.yourInfo}</h2>

            <Range label={tObj.age} value={age} onChange={onAge} min={28} max={45} fmt={v=>lang==='en'?`${v}`:`${v}歳`}
              hint={age<=34?tObj.ageHint1:age<=37?tObj.ageHint2:age<=40?tObj.ageHint3:tObj.ageHint4} />

            <Range label={tObj.amh} value={amh} onChange={onAmh} min={0.1} max={8} step={0.1}
              fmt={v=>`${v.toFixed(1)} ng/mL`}
              hint={tObj.amhHint(age, amhMedian(age))} />

            <div className="pgt-w">
              <label className="pgt-l">
                <div><span className="pgt-t">{tObj.pgtTitle}</span><span className="pgt-s">{tObj.pgtDesc}</span></div>
                <div className={`sw${pgt?' sw-on':''}`} onClick={()=>setPgt(!pgt)}><div className="sw-k"/></div>
              </label>
            </div>

            <button className={`run${busy?' run-b':''}`} onClick={run} disabled={busy}>
              {busy?<><svg className="spin" viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="50" strokeLinecap="round"/></svg>{tObj.btnCalc}</>:(
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:4}}>
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  {tObj.btnRun}
                </>
              )}
            </button>
          </div>

          {/* ── STAT CARDS ── */}
          <div className="sg">
            <Stat accent icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--t)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
              label={tObj.stat50} value={fm(st.t50)} unit={tObj.months} />
            <Stat icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--n)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
              label={tObj.stat80} value={fm(st.t80)} unit={tObj.months} />
            <Stat icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--t)" strokeWidth="2"><path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7z"/><circle cx="12" cy="9" r="2.5"/></svg>}
              label={tObj.statRet} value={st.nR||'—'} unit={tObj.times} sub={st.mR} />
            <Stat icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--n)" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>}
              label={tObj.statTra} value={st.nT||'—'} unit={tObj.times} sub={st.mT} />
          </div>
          {st.note&&<p className="sn">{st.note}</p>}

          {/* Period rates */}
          <div className="pr">
            <div className="pr-i"><span className="pr-l">{tObj.rate12}</span><span className="pr-v">{isFinite(st.r12)?`${st.r12.toFixed(0)}%`:'—'}</span></div>
            <div className="pr-d"/>
            <div className="pr-i"><span className="pr-l">{tObj.rate24}</span><span className="pr-v">{isFinite(st.r24)?`${st.r24.toFixed(0)}%`:'—'}</span></div>
            <label className="ci-l"><input type="checkbox" checked={ci} onChange={e=>setCi(e.target.checked)}/>95%CI</label>
          </div>

          {/* Advanced */}
          <button className="at" onClick={()=>setAdv(!adv)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            {tObj.advBtn}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{marginLeft:'auto',transform:adv?'rotate(180deg)':'',transition:'transform .2s'}}><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {adv&&(
            <div className="ap">
              <div className="ag"><Range label={tObj.advMii} value={mii} onChange={setMii} min={0} max={20} step={.1} fmt={v=>`${v.toFixed(1)}`}/><Range label={tObj.advPb} value={pb} onChange={setPb} min={10} max={80} fmt={v=>`${v}%`}/></div>
              <div className="ag"><Range label={tObj.advPf} value={pf} onChange={setPf} min={30} max={100} fmt={v=>`${v}%`}/><Range label={tObj.advPe} value={pe} onChange={setPe} min={5} max={80} fmt={v=>`${v}%`}/></div>
              <div className="ag"><Range label={tObj.advMpr} value={mpr} onChange={setMpr} min={pgt?2.5:1} max={3} step={.25} fmt={v=>`${v.toFixed(1)}${tObj.months}`}/><Range label={tObj.advMpt} value={mpt} onChange={setMpt} min={.5} max={3} step={.25} fmt={v=>`${v.toFixed(1)}${tObj.months}`}/></div>
              <div className="ag"><Range label={tObj.advCancel} value={cancel} onChange={setCancel} min={0} max={40} step={.5} fmt={v=>`${v.toFixed(0)}%`}/><Range label={tObj.advIter} value={iter} onChange={setIter} min={500} max={8000} step={100} fmt={v=>`${v}`}/></div>
              <div className="ag">
                <label className="ck"><input type="checkbox" checked={fresh} onChange={e=>setFresh(e.target.checked)}/><span>{tObj.freshTx}</span></label>
                <div>
                  <label className="al">{tObj.stratL}</label>
                  <select value={strat} onChange={e=>setStrat(e.target.value)} className="as">
                    <option value="sequential">{tObj.stratSeq}</option><option value="batch">{tObj.stratBat}</option>
                  </select>
                </div>
              </div>
              {strat==='batch'&&<Range label={tObj.batchL} value={batch} onChange={setBatch} min={1} max={6} fmt={v=>`${v}`}/>}
            </div>
          )}

          <p className="disc">{tObj.disc}</p>
        </div>

        {/* ══ RIGHT — CHARTS ══ */}
        <div className="rp">
          <div className="cc">
            <div className="ch"><h3 className="ct">{tObj.ch1T}</h3><span className="cs">{tObj.ch1S}</span></div>
            <ResponsiveContainer width="100%" height="100%" minHeight={180}>
              <ComposedChart data={chartData} margin={{top:6,right:12,left:-4,bottom:2}}>
                <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--t)" stopOpacity={.2}/><stop offset="100%" stopColor="var(--t)" stopOpacity={.01}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee"/>
                <XAxis dataKey="x" type="number" domain={[0,36]} tick={{fontSize:10,fill:'var(--m)'}} label={{value:tObj.xaxis,position:'insideBottomRight',offset:-2,fontSize:10,fill:'var(--m)'}}/>
                <YAxis domain={[0,100]} tick={{fontSize:10,fill:'var(--m)'}} label={{value:tObj.yaxis,angle:-90,position:'insideLeft',offset:16,fontSize:10,fill:'var(--m)'}}/>
                <ReTooltip contentStyle={{background:'var(--n)',border:'none',borderRadius:8,color:'#fff',fontSize:11,padding:'6px 10px'}} itemStyle={{color:'#fff'}}
                  formatter={(v,name)=>[`${Number(v).toFixed(1)}%`,name==='y'?tObj.ttProb:name==='lo'?tObj.ttLo:tObj.ttHi]} labelFormatter={v=>`${v}${tObj.ttMo}`}/>
                {ci&&<Area dataKey="hi" stroke="#b0bec5" fill="none" strokeDasharray="4 3" dot={false} strokeWidth={1} name={tObj.ttHi}/>}
                {ci&&<Area dataKey="lo" stroke="#b0bec5" fill="none" strokeDasharray="4 3" dot={false} strokeWidth={1} name={tObj.ttLo}/>}
                <Area dataKey="y" stroke="var(--t)" fill="url(#ag)" strokeWidth={2.5} dot={false} name={tObj.ttProb} animationDuration={600}/>
                <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="6 3" strokeWidth={1}/>
                <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="6 3" strokeWidth={1}/>
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="cc cc2">
            <div className="ch"><h3 className="ct">{tObj.ch2T}</h3><span className="cs">{tObj.ch2S}</span></div>
            <ResponsiveContainer width="100%" height="100%" minHeight={140}>
              <BarChart data={histData} margin={{top:6,right:12,left:-4,bottom:2}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee"/>
                <XAxis dataKey="month" tick={{fontSize:10,fill:'var(--m)'}} label={{value:tObj.xaxis,position:'insideBottomRight',offset:-2,fontSize:10,fill:'var(--m)'}}/>
                <YAxis tick={{fontSize:10,fill:'var(--m)'}}/>
                <ReTooltip contentStyle={{background:'var(--n)',border:'none',borderRadius:8,color:'#fff',fontSize:11,padding:'6px 10px'}}
                  formatter={v=>[`${v}`,tObj.ttPreg]} labelFormatter={v=>`${v}${tObj.ttMo}`}/>
                <Bar dataKey="count" fill="var(--t)" radius={[3,3,0,0]} animationDuration={500}/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mi">
            <p>{lang!=='en'&&iter.toLocaleString()}{tObj.miPrefix}{lang==='en'&&iter.toLocaleString()}{lang==='en'&&' '}
            {tObj.miTags}
            {pgt&&tObj.miPgt}
            {tObj.miSuffix}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   §4  CSS
   ═══════════════════════════════════════════════════════════════ */
const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700&family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700&display=swap');
:root{
  --n:#1a2744;--nl:#2a3f66;--t:#0d9488;--tl:#5eead4;--tb:#f0fdfa;
  --bg:#f8f7f4;--card:#fff;--bdr:#e8e5e0;--bdrl:#f0ede8;
  --tx:#1a2744;--m:#7c8599;
  --jp:'Zen Maru Gothic',sans-serif;--en:'DM Sans',sans-serif;
  --r:12px;
}
*{box-sizing:border-box;margin:0;padding:0}
.root{font-family:var(--jp);background:var(--bg);color:var(--tx);min-height:100vh;-webkit-font-smoothing:antialiased}

/* HEADER */
.hd{background:var(--n);color:#fff;padding:10px 20px}
.hd-in{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.hd-left{display:flex;align-items:center;gap:0}
.hd-t{font-size:17px;font-weight:700;display:flex;align-items:center;letter-spacing:.02em}
.hd-icon{margin-right:8px;display:flex;align-items:center}
.hd-sub{font-family:var(--en);font-size:10px;opacity:.4;letter-spacing:.08em;margin-left:36px;margin-top:-2px}
.hd-right{display:flex;align-items:center;gap:8px}
.pgt-b{padding:3px 14px;border-radius:20px;font-family:var(--en);font-size:11px;font-weight:700;background:var(--t);letter-spacing:.08em;animation:fadeIn .3s ease}
@keyframes fadeIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}

/* MAIN — desktop: single viewport */
.mn{
  max-width:1200px;margin:0 auto;padding:12px 16px;
  display:grid;grid-template-columns:320px 1fr;gap:14px;
  align-items:start;
  height:calc(100vh - 52px);
}

/* LEFT */
.lp{
  display:flex;flex-direction:column;gap:8px;
  height:100%;overflow-y:auto;
  scrollbar-width:thin;scrollbar-color:var(--bdr) transparent;
}
.lp::-webkit-scrollbar{width:4px}
.lp::-webkit-scrollbar-thumb{background:var(--bdr);border-radius:4px}
.lp-box{background:var(--card);border-radius:var(--r);padding:16px 18px;border:1px solid var(--bdrl);box-shadow:0 2px 10px rgba(26,39,68,.05)}
.lp-title{font-size:13px;font-weight:700;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid var(--t);display:inline-block}

/* RANGE */
.rl{font-size:12px;font-weight:600}
.rv{font-family:var(--en);font-size:14px;font-weight:700;color:var(--t);letter-spacing:-.02em}
.trk{height:5px;border-radius:99px;background:var(--bdr);position:relative;overflow:hidden}
.trk-f{position:absolute;top:0;left:0;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--t),var(--tl));transition:width .08s}
.ri{width:100%;height:20px;-webkit-appearance:none;appearance:none;background:transparent;position:relative;top:-12px;margin-bottom:-12px;cursor:pointer}
.ri::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;background:var(--card);border:2.5px solid var(--t);border-radius:50%;box-shadow:0 1px 4px rgba(13,148,136,.25);transition:transform .12s}
.ri::-webkit-slider-thumb:hover{transform:scale(1.15)}
.ri::-moz-range-thumb{width:16px;height:16px;background:var(--card);border:2.5px solid var(--t);border-radius:50%;cursor:pointer}
.rh{font-size:10px;color:var(--m);margin-top:1px}

/* PGT-A */
.pgt-w{margin:4px 0 8px;padding:10px 12px;background:var(--tb);border-radius:8px;border:1px solid #ccfbf1}
.pgt-l{display:flex;align-items:center;justify-content:space-between;cursor:pointer;gap:10px}
.pgt-t{font-size:12px;font-weight:600}
.pgt-s{display:block;font-size:9px;color:var(--m);margin-top:1px}
.sw{width:40px;height:22px;background:var(--bdr);border-radius:11px;position:relative;transition:background .2s;cursor:pointer;flex-shrink:0}
.sw-on{background:var(--t)}
.sw-k{width:18px;height:18px;background:#fff;border-radius:50%;position:absolute;top:2px;left:2px;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.12)}
.sw-on .sw-k{transform:translateX(18px)}

/* RUN BUTTON */
.run{display:flex;align-items:center;justify-content:center;gap:4px;width:100%;margin-top:10px;padding:11px;border:none;border-radius:10px;font-family:var(--jp);font-size:14px;font-weight:700;color:#fff;cursor:pointer;background:linear-gradient(135deg,var(--t),#0f766e);box-shadow:0 3px 12px rgba(13,148,136,.3);transition:transform .12s,box-shadow .12s;letter-spacing:.04em}
.run:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 5px 18px rgba(13,148,136,.35)}
.run:active:not(:disabled){transform:translateY(0)}
.run-b{opacity:.65;cursor:default}
.spin{animation:sp .7s linear infinite}
@keyframes sp{to{transform:rotate(360deg)}}

/* STAT CARDS */
.sg{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.sc{background:var(--card);border-radius:10px;padding:10px 12px;border:1px solid var(--bdrl);box-shadow:0 1px 4px rgba(26,39,68,.04);transition:transform .15s}
.sc:hover{transform:translateY(-1px)}
.sc-a{background:linear-gradient(135deg,var(--tb),#fff);border-color:#99f6e4}
.sc-i{margin-bottom:3px}
.sc-l{font-size:10px;color:var(--m);font-weight:500;line-height:1.2;margin-bottom:2px}
.sc-v{font-family:var(--en);font-size:22px;font-weight:700;color:var(--n);letter-spacing:-.03em;line-height:1.1}
.sc-u{font-size:11px;font-weight:500;margin-left:1px;color:var(--m)}
.sc-s{font-size:9px;color:var(--m);margin-top:2px}
.sn{font-size:9px;color:var(--m);padding:0 2px}

/* PERIOD RATES */
.pr{display:flex;align-items:center;gap:12px;padding:8px 12px;background:var(--card);border-radius:8px;border:1px solid var(--bdrl)}
.pr-i{text-align:center}
.pr-l{display:block;font-size:9px;color:var(--m)}
.pr-v{font-family:var(--en);font-size:16px;font-weight:700;color:var(--t)}
.pr-d{width:1px;height:24px;background:var(--bdr)}
.ci-l{margin-left:auto;display:flex;align-items:center;gap:3px;font-size:10px;color:var(--m);cursor:pointer;white-space:nowrap}
.ci-l input{accent-color:var(--t)}

/* ADVANCED */
.at{display:flex;align-items:center;gap:5px;width:100%;padding:8px 12px;border-radius:8px;background:var(--card);border:1px solid var(--bdr);font-family:var(--jp);font-size:11px;color:var(--m);cursor:pointer;transition:background .12s}
.at:hover{background:#f5f3ef}
.ap{padding:12px;background:var(--card);border-radius:var(--r);border:1px solid var(--bdr);animation:sd .25s ease}
@keyframes sd{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
.ag{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.ck{display:flex;align-items:center;gap:5px;font-size:11px;cursor:pointer;padding:4px 0}
.ck input{accent-color:var(--t)}
.al{font-size:11px;font-weight:600;display:block;margin-bottom:3px}
.as{width:100%;padding:5px 8px;border-radius:6px;border:1px solid var(--bdr);font-size:11px;font-family:var(--jp);background:#fff}
.disc{font-size:9px;color:var(--m);line-height:1.5;padding:0 2px}

/* RIGHT — CHARTS */
.rp{
  display:flex;flex-direction:column;gap:10px;
  height:100%;min-height:0;
}
.cc{
  background:var(--card);border-radius:var(--r);
  padding:14px 12px 8px;
  border:1px solid var(--bdrl);box-shadow:0 1px 4px rgba(26,39,68,.04);
  flex:1.15;min-height:0;
  display:flex;flex-direction:column;
}
.cc2{flex:0.85}
.cc .recharts-responsive-container{flex:1;min-height:0}
.ch{margin-bottom:6px}
.ct{font-size:13px;font-weight:700}
.cs{font-size:10px;color:var(--m)}
.mi{padding:10px 12px;background:var(--card);border-radius:var(--r);border:1px solid var(--bdrl);font-size:10px;line-height:1.6;color:var(--m);flex-shrink:0}
.mi em{font-style:normal;color:var(--t);font-weight:600}

/* Recharts */
.recharts-cartesian-axis-tick-value{font-family:var(--en)!important}

/* ═══ MOBILE ═══ */
@media(max-width:900px){
  .mn{
    grid-template-columns:1fr;
    height:auto;
    padding:10px 12px;
    gap:12px;
  }
  .lp{height:auto;overflow:visible}
  .rp{height:auto}
  .cc{flex:none;min-height:240px}
  .cc2{min-height:200px}
  .sg{grid-template-columns:1fr 1fr}
  .hd{padding:10px 14px}
  .hd-t{font-size:15px}
  .hd-sub{margin-left:34px}
}
@media(max-width:420px){
  .sg{grid-template-columns:1fr 1fr}
  .sc-v{font-size:18px}
  .sc{padding:8px 10px}
  .mn{padding:6px 8px;gap:8px}
  .hd-t{font-size:14px}
  .lp-box{padding:14px}
  .pr{gap:8px;padding:6px 10px}
  .ag{grid-template-columns:1fr;gap:4px}
}
`;
