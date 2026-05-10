import { BLUE, YELLOW } from "../../constants/colors";

export default function MultimediaIllustration() {
  return (
    <svg viewBox="0 0 480 520" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%", display:"block" }}>
      <circle cx="360" cy="100" r="90"  fill="#C7D5F8" opacity=".5"/>
      <circle cx="120" cy="400" r="70"  fill="#FDE68A" opacity=".4"/>
      <circle cx="400" cy="380" r="55"  fill="#BFDBFE" opacity=".4"/>
      <rect x="80"  y="100" width="280" height="190" rx="16" fill="#0F1B3D"/>
      <rect x="92"  y="112" width="256" height="165" rx="10" fill="#1B4FD8"/>
      {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => {
        const hs=[28,45,18,60,35,72,40,55,22,48,30,62]; const h=hs[i];
        return <rect key={i} x={112+i*20} y={194-h/2} width="10" height={h} rx="4" fill={i%3===0?"#FACC15":"rgba(255,255,255,.55)"}/>;
      })}
      <circle cx="320" cy="128" r="7"  fill="#EF4444"/>
      <circle cx="320" cy="128" r="4"  fill="#FCA5A5"/>
      <rect x="200" y="290" width="40" height="28" rx="4" fill="#1E3A5F"/>
      <rect x="165" y="314" width="110" height="10" rx="5" fill="#1E3A5F"/>
      <rect x="290" y="260" width="110" height="72" rx="12" fill="#0F1B3D"/>
      <circle cx="336" cy="296" r="26" fill="#1B4FD8"/>
      <circle cx="336" cy="296" r="18" fill="#0F1B3D"/>
      <circle cx="336" cy="296" r="10" fill="#93C5FD" opacity=".7"/>
      <rect x="388" y="278" width="22" height="10" rx="4" fill="#374151"/>
      <rect x="290" y="252" width="40" height="12" rx="4" fill="#374151"/>
      <rect x="296" y="265" width="16" height="10" rx="3" fill="#FACC15" opacity=".9"/>
      <rect x="68"  y="255" width="34" height="58" rx="17" fill="#1B4FD8"/>
      <rect x="76"  y="313" width="18" height="30" rx="4" fill="#374151"/>
      <rect x="60"  y="340" width="34" height="6"  rx="3" fill="#374151"/>
      <line x1="76" y1="272" x2="94" y2="272" stroke="white" strokeWidth="2" strokeLinecap="round" opacity=".4"/>
      <line x1="74" y1="282" x2="96" y2="282" stroke="white" strokeWidth="2" strokeLinecap="round" opacity=".4"/>
      <line x1="76" y1="292" x2="94" y2="292" stroke="white" strokeWidth="2" strokeLinecap="round" opacity=".4"/>
      <circle cx="390" cy="175" r="30" fill="#FACC15"/>
      <polygon points="384,162 384,188 408,175" fill="#0F1B3D"/>
      <rect x="50" y="155" width="90" height="32" rx="8" fill="white" opacity=".92"/>
      <text x="95" y="176" textAnchor="middle" fontSize="11" fontWeight="700" fill={BLUE}>🎬 VIDEO</text>
      <rect x="330" y="370" width="110" height="32" rx="8" fill="white" opacity=".92"/>
      <text x="385" y="391" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0F1B3D">📡 STREAMING</text>
      <path d="M170 430 Q200 410 230 430" stroke={BLUE} strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M155 418 Q200 390 245 418" stroke={BLUE} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".6"/>
      <path d="M140 406 Q200 370 260 406" stroke={BLUE} strokeWidth="2" fill="none" strokeLinecap="round" opacity=".3"/>
      <circle cx="200" cy="442" r="5" fill={BLUE}/>
      <path d="M92 195 Q115 165 140 195" stroke={YELLOW} strokeWidth="4" fill="none" strokeLinecap="round"/>
      <rect x="85" y="192" width="14" height="22" rx="7" fill={YELLOW}/>
      <rect x="141" y="192" width="14" height="22" rx="7" fill={YELLOW}/>
      {[0,1,2,3].map(row=>[0,1,2,3].map(col=>(
        <circle key={`${row}-${col}`} cx={310+col*14} cy={440+row*14} r="2.5" fill={BLUE} opacity=".18"/>
      )))}
    </svg>
  );
}