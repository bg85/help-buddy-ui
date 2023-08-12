// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "AIzaSyAvPOBE0W023TicPydyt_hqMqR3qP-HM-0",
    authDomain: "helpbuddy-62d1c.firebaseapp.com",
    projectId: "helpbuddy-62d1c",
    storageBucket: "helpbuddy-62d1c.appspot.com",
    messagingSenderId: "114674232273",
    appId: "1:114674232273:web:434411d269055de2bc8ef0",
    measurementId: "G-TBDT579Z77"
  },
  apiUrl: "http://localhost:3000",
  subscriptionUrl: "https://api-m.sandbox.paypal.com/v1/billing/subscriptions",
  planId: "P-7YT34982GP180630NMGKWMKI"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
