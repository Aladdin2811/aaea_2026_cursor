import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './lib/supabase'
import './index.css'

// #region agent log
fetch('http://127.0.0.1:7796/ingest/e76d3ff0-328b-44dc-9781-6af0a3c54023',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'863170'},body:JSON.stringify({sessionId:'863170',location:'main.tsx:bootstrap',message:'App bundle executing',data:{phase:'pre-render'},timestamp:Date.now(),hypothesisId:'H0',runId:'post-fix'})}).catch(()=>{});
// #endregion

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
