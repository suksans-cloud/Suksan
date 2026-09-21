/* My Family Funds — No-login build
 * Shared Google Sheets session helper.
 *
 * Login is intentionally disabled. Google Sheets OAuth is still used only when
 * the user explicitly connects/syncs. Once a Sheets access token is obtained,
 * it is kept in sessionStorage so navigating between modules does not trigger
 * OAuth again. The token is never put in localStorage and disappears when the
 * browser session is closed.
 */
(function(){
  'use strict';

  const TOKEN_KEY='mff_google_sheets_access_token_v1';
  const EXP_KEY='mff_google_sheets_expires_at_v1';
  const DRIVE_TOKEN_KEY='mff_google_drive_access_token_v1';
  const DRIVE_EXP_KEY='mff_google_drive_expires_at_v1';

  window.MFFGoogleSession={
    saveSheetsToken(token,expiresAt){
      try{
        if(!token) return;
        sessionStorage.setItem(TOKEN_KEY,String(token));
        sessionStorage.setItem(EXP_KEY,String(Number(expiresAt)||0));
      }catch(e){}
    },
    getSheetsToken(){
      try{
        const token=sessionStorage.getItem(TOKEN_KEY)||'';
        const expiresAt=Number(sessionStorage.getItem(EXP_KEY)||0);
        // Keep a 60-second safety margin so an API call is not started with an
        // almost-expired token.
        if(!token || !expiresAt || Date.now() >= expiresAt-60000){
          this.clearSheetsToken();
          return null;
        }
        return {token,expiresAt};
      }catch(e){ return null; }
    },
    clearSheetsToken(){
      try{sessionStorage.removeItem(TOKEN_KEY);sessionStorage.removeItem(EXP_KEY);localStorage.removeItem('google_sheets_connected');}catch(e){}
    },
    saveDriveToken(token,expiresAt){
      try{
        if(!token) return;
        sessionStorage.setItem(DRIVE_TOKEN_KEY,String(token));
        sessionStorage.setItem(DRIVE_EXP_KEY,String(Number(expiresAt)||0));
      }catch(e){}
    },
    getDriveToken(){
      try{
        const token=sessionStorage.getItem(DRIVE_TOKEN_KEY)||'';
        const expiresAt=Number(sessionStorage.getItem(DRIVE_EXP_KEY)||0);
        if(!token || !expiresAt || Date.now() >= expiresAt-60000){ this.clearDriveToken(); return null; }
        return {token,expiresAt};
      }catch(e){ return null; }
    },
    clearDriveToken(){
      try{sessionStorage.removeItem(DRIVE_TOKEN_KEY);sessionStorage.removeItem(DRIVE_EXP_KEY);localStorage.removeItem('google_drive_connected');}catch(e){}
    },
    clearAllGoogleSession(){
      this.clearSheetsToken();
      this.clearDriveToken();
      try{localStorage.removeItem('google_sheets_connected');localStorage.removeItem('google_drive_connected');}catch(e){}
    }

  };

  // Keep legacy connection flags only as non-secret UI hints; never treat them as an active session.
  try{
    if(!sessionStorage.getItem(TOKEN_KEY)) localStorage.removeItem('google_sheets_connected');
    if(!sessionStorage.getItem(DRIVE_TOKEN_KEY)) localStorage.removeItem('google_drive_connected');
  }catch(e){}

  window.MFFAuth={
    getUser:()=>({username:'Guest',role:'admin'}),
    api:async()=>({ok:false,error:'Login is disabled in this build'}),
    logout:()=>{},
    adminPanel:()=>{}
  };
})();
