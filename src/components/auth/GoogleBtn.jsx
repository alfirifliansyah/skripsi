import { BLUE, WHITE, DARK } from "../../constants/colors";

export default function GoogleBtn({ label }) {
  return (
    <button style={{ width:"100%", padding:"0.72rem", background:WHITE, color:DARK, border:"1.5px solid #D1D9EF", borderRadius:10, fontWeight:500, fontSize:14, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"border-color .2s" }}
      onMouseOver={e=>e.currentTarget.style.borderColor=BLUE} onMouseOut={e=>e.currentTarget.style.borderColor="#D1D9EF"}>
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
        <path fill="#FBBC05" d="M6.3 14.7l7 5.1C15.1 16.4 19.2 14 24 14c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z"/>
        <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.4l-6.7-5.5C29.9 36.9 27.1 38 24 38c-6.1 0-11.3-4.1-13.1-9.7l-7 5.4C7.7 41.5 15.3 46 24 46z"/>
        <path fill="#4285F4" d="M44.5 20H24v8.5h11.8c-.8 2.7-2.6 5-5.1 6.6l6.7 5.5C41.4 36.8 45 30.7 45 24c0-1.3-.2-2.7-.5-4z"/>
      </svg>
      {label}
    </button>
  );
}