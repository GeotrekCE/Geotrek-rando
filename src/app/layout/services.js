'use strict';

function RunApp(globalSettings) {

    (function(d, s, id){
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement(s); js.id = id;
       js.src = "//connect.facebook.net/en_US/sdk.js";
       fjs.parentNode.insertBefore(js, fjs);
     }(document, 'script', 'facebook-jssdk'));


     window.fbAsyncInit = function() {
         var FB = window.FB;

         if(!FB) {
             throw new Error('Facebook not loaded');
         }

         FB.init({
             appId      : globalSettings.FACEBOOK_APP_ID,
             xfbml      : true,
             version    : 'v2.5'
         });
     };
}

module.exports = {
    RunApp: RunApp
};
