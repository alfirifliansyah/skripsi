import { BLUE, DARK, MUTED } from "../../constants/colors";
import MultimediaIllustration from "./MultimediaIllustration";

export default function IllustrationPanel({ bg, accent }) {
  return (
    <div style={{ background:bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"2rem", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:-30, right:-30, width:130, height:130, borderRadius:"50%", background:accent, opacity:.15 }}/>
      <div style={{ position:"absolute", bottom:-20, left:-20, width:80, height:80, borderRadius:"50%", background:BLUE, opacity:.12 }}/>
      <div style={{ width:"90%", maxWidth:300, position:"relative" }}><MultimediaIllustration/></div>
      <div style={{ textAlign:"center", marginTop:"1rem" }}>
        <div style={{ fontWeight:700, fontSize:16, color:DARK }}>Studio Profesional</div>
        <div style={{ fontSize:13, color:MUTED, marginTop:4 }}>Live Streaming · Video · Event</div>
      </div>
    </div>
  );
}