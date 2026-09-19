/* My Family Funds — No-login build
 * This file replaces portfolio/auth.js. It intentionally does NOT show
 * any login gate, overlay, or user bar, and does not call the Apps
 * Script auth backend at all. Every page opens straight into the app.
 * A no-op MFFAuth object is still exposed so any code that happens to
 * reference window.MFFAuth (e.g. window.MFFAuth?.getUser()) keeps working.
 */
(function(){
  'use strict';
  window.MFFAuth={
    getUser:()=>({username:'Guest',role:'admin'}),
    api:async()=>({ok:false,error:'Login is disabled in this build'}),
    logout:()=>{},
    adminPanel:()=>{}
  };
})();
