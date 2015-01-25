/*
 global
 window,
 PubSub,
 App
 */
/**
 *
 * If you're starting from scratch, break these modules out into a few appropriately named files and start editing away.
 *
 * If you are using firebase you can pretty much just set "App.firebaseProjectName' and roll - the field is defined just below this comment block.
 *
 *
 *
 * Define the primary App object.
 */


window.App = window.App || (function () {
  "use strict";

  var App = {
    Types: {},
    firebaseProjectName: undefined
  };

  if(!App.firebaseProjectName){
    alert("You'll need to set 'window.App.firebaseProjectName' to a valid firebase project to test actual login/signup behaviors.");
  }
  return App;

}());

/**
 * Define Utility functions.
 */
(function (App) {
  "use strict";

  var Util = {
    assign: function (target, firstSource) {
      if (target === undefined || target === null) {
        throw new TypeError("Cannot convert first argument to object");
      }
      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource === undefined || nextSource === null) {
          continue;
        }
        var keysArray = Object.keys(Object(nextSource));
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
          var nextKey = keysArray[nextIndex];
          var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (desc !== undefined && desc.enumerable) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
      return to;
    },
    copyObjectDeep: function (source) {
      if (!source) {
        throw new TypeError("Cannot copy falsy object.");
      }
      return JSON.parse(JSON.stringify(source));
    },
    isNumber: function (obj) {
      return typeof obj === 'number' && isFinite(obj);
    },
    isEmpty: function (aString) {
      return aString ? ( App.Util.isNumber(aString.length) && aString.length === 0) : true;
    },
    isNotEmpty: function (aString) {
      return aString ? (App.Util.isNumber(aString.length) && aString.length > 0) : false;
    },
    KeyCode: {
      /**
       * Check if the input is one of the code values.
       * @param {String} input
       * @param {String...} code
       */
      is: function (input, code) {
        for (var idx = 1; idx < arguments.length; idx++) {
          if (input === arguments[idx]) {
            return true;
          }
        }
        return false;
      },
      ENTER: 13,
      ESC: 27,
      TAB: 9,
      ARROW_LEFT: 37,
      ARROW_UP: 38,
      ARROW_RIGHT: 39,
      ARROW_DOWN: 40
    }
  };
  App.Util = Util;
}(App));

/**
 * Define the PubSub topics.
 */
(function (App) {
  "use strict";

  /* Disable in prod. */
  PubSub.immediateExceptions = true;

  App.topics = {

    APP_READY: 'APP_READY',
    CONCEPTS_LOADED: 'CONCEPTS_LOADED',
    CONCEPT_CHANGED: 'CONCEPT_CHANGED',

    auth: {
      LOGGED_OUT: 'auth.LOGGED_OUT', /* Authentication server says no, user is not available. */
      LOGGED_IN: 'auth.LOGGED_IN', /* Actually authenticated, versus an attempt. */
      ACCOUNT_CREATED: 'auth.ACCOUNT_CREATED', /* Actually authenticated, versus an attempt. */
      AUTHENTICATION_FAILED: 'auth.AUTHENTICATION_FAILED' /* Bummer */
    },
    action: {
      user: {
        ATTEMPT_LOGIN: 'action.user.ATTEMPT_LOGIN', /* Entered credentials and pushed a login button. */
        ATTEMPT_SIGNUP: 'action.user.ATTEMPT_SIGNUP', /* Entered credentials and pushed a 'Sign Up' button */
        ATTEMPT_LOGOUT: 'action.user.ATTEMPT_LOGOUT', /* Pushed a 'Logout' button */
        REQUEST_PASSWORD: 'action.user.REQUEST_PASSWORD' /* Pushed a 'forgot password' button */
      }
    }

  };
}(App));

/**
 * Define the AuthController.
 */
(function (App) {
  "use strict";

  var authRef,
      state,
      email,
      password;

  var states = {
    unknown: 0,
    loggedOut: 10,
    creatingAccount: 20,
    loggingIn: 30,
    loggedIn: 40,
    loggingOut: 50
  };

  var userAuth = {
    auth: {
      provider: undefined,
      uid: undefined
    },
    expires: undefined,
    password: {
      email: undefined,
      isTemporaryPassword: false
    },
    provider: undefined,
    token: undefined,
    uid: undefined
  };

  var Auth = {


    init: function () {
      state = states.unknown;
      if(App.firebaseProjectName){
        authRef = new Firebase("https://" + App.firebaseProjectName + ".firebaseio.com");
        authRef.onAuth(Auth.firebaseAuthCallback);
      } else {
        authRef = {}; // let the demo work a bit longer
      }
    },


    performLogin: function (email, password, rememberMe) {
      console.log("performLogin: ", email, password, rememberMe);
      var rememberCfg = {};
      rememberCfg.remember = rememberMe === false ? "sessionOnly" : "default";
      authRef.authWithPassword({
        email: email,
        password: password
      }, Auth.loginResponseListener, rememberCfg);
    },

    performCreateAccount: function (newEmail, newPassword, rememberMe) {
      console.log("performCreateAccount: ", email, password, rememberMe);
      state = states.creatingAccount;
      email = newEmail;
      password = newPassword;
      authRef.createUser({
        email: email,
        password: password
      }, Auth.createUserResponseListener);
    },

    loginResponseListener: function (error, authData) {
      if (error === null) {
        console.log("Authenticated successfully with payload:", authData);
        /* Do not fire message here. See firebaseAuthCallback*/
      } else {
        console.log("Login failed with error: ", error);
        PubSub.publish(App.topics.auth.AUTHENTICATION_FAILED, {error: error, message: Auth.rsrc[error.code]});
      }
    },

    createUserResponseListener: function (error) {
      if (error === null) {
        Auth.performLogin(email, password, false);
      } else {
        console.log("Create account failed with error: ", error);
        PubSub.publish(App.topics.auth.AUTHENTICATION_FAILED, { error: error, message: Auth.rsrc[error.code] });
      }
    },

    /**
     * Listens in on *all* authentication actions. But does not get error states when authentication fails.
     * @param authData
     */
    firebaseAuthCallback: function (authData) {
      var prevState = state;

      if (authData) {
        state = states.loggedIn;
        userAuth = authData;
        if (prevState === states.creatingAccount) {
          Auth.initializeNewUserAccount(authData);
        }
        PubSub.publish(App.topics.auth.LOGGED_IN, authData);
        console.log("User " + authData.uid + " is logged in with " + authData.provider, authData);
      } else {
        state = states.loggedOut;
        PubSub.publish(App.topics.auth.LOGGED_OUT, authData);
        console.log("User is logged out", authData);
      }
    },

    initializeNewUserAccount: function (authData) {
      PubSub.publish(App.topics.auth.ACCOUNT_CREATED, authData);
    },

    handleAttemptLogout: function (topic) {
      state = states.loggingOut;
      authRef.unauth();
    },

    handleAttemptLogin: function (topic, data) {
      state = states.loggingIn;
      Auth.performLogin(data.username, data.password, data.rememberMe)
    },

    handleAttemptSignup: function (topic, data) {
      state = states.creatingAccount;
      Auth.performCreateAccount(data.username, data.password, data.rememberMe)
    }
  };

  App.AuthController = Auth;

  PubSub.subscribe(App.topics.APP_READY, Auth.init);
  PubSub.subscribe(App.topics.action.user.ATTEMPT_LOGOUT, Auth.handleAttemptLogout);
  PubSub.subscribe(App.topics.action.user.ATTEMPT_LOGIN, Auth.handleAttemptLogin);
  PubSub.subscribe(App.topics.action.user.ATTEMPT_SIGNUP, Auth.handleAttemptSignup);
}(App));

(function (App) {
  "use strict";
  /**
   * Adding resource strings in separate block to avoid cluttering the Auth controller... as much.
   *
   * Lightly modified from the firebase docs: https://www.firebase.com/docs/web/guide/user-auth.html
   * Hopefully only developers ever see these first few:
   *
   * Regarding 'Invalid_Password': An attacker can verify that an account exists by trying to create an account, so no point in pretending.
   * If you believe otherwise, you're wrong. But feel free to change the message! ;~)
   */

  App.AuthController.rsrc = {
    "AUTHENTICATION_DISABLED": "The requested authentication provider is disabled.",
    "INVALID_CONFIGURATION": "The requested authentication provider is misconfigured, and the request cannot complete. Please confirm that the provider's client ID and secret are correct in your Firebase Dashboard and the app is properly set up on the provider's website.",
    "INVALID_PROVIDER": "The requested authentication provider does not exist. Please consult the Firebase authentication documentation for a list of supported providers.",
    "INVALID_TOKEN": "The specified authentication token is invalid. This can occur when the token is malformed, expired, or the Firebase secret that was used to generate it has been revoked.",
    "PROVIDER_ERROR": "A third-party provider error occurred. Please refer to the error message and error details for more information.",
    "TRANSPORT_UNAVAILABLE": "The requested login method is not available in the user's browser environment. Popups are not available in Chrome for iOS, iOS Preview Panes, or local, file:// URLs. Redirects are not available in PhoneGap / Cordova, or local, file:// URLs.",
    "UNKNOWN_ERROR": "An unknown error occurred. Please refer to the error message and error details for more information.",
    "USER_CANCELLED": "The current authentication request was cancelled by the user.",
    "USER_DENIED": "The user did not authorize the application. This error can occur when the user has cancelled an OAuth authentication request.",

    /* User facing messages: */
    "EMAIL_TAKEN": "That email address is already in use.",
    "INVALID_ARGUMENTS": "The specified username or password is malformed or incomplete.",
    "INVALID_CREDENTIALS": "Your password has expired and needs to be reset.",
    "INVALID_EMAIL": "The specified email is not a valid email.",
    "INVALID_ORIGIN": "Warning! Your connection may not be secure. If you are in a public location you should avoid performing any further sensitive browsing until you've changed connections.",
    "INVALID_USER": "We don't have an account listed under that email address.",
    "INVALID_PASSWORD": "The password you entered is incorrect.",
    "NETWORK_ERROR": "An error occurred while attempting to contact the authentication server."
  };
}(App));


