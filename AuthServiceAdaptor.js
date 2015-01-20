(function () {
  "use strict";

  /**
   * Maps between the Authentication service and the login panel, so that if you decide you hate either you can swap out later.
   * In general you will want to assign this global object to an instance variable (for testing, yo), and bind that instance variable to your
   * UX and to your auth provider. Once that's done, set actions and strings as needed.
   *
   * If you care about such things, feel free to create an instance via:
   * var foo = Object.create(AuthServiceAdaptor, {...});
   *
   * It is assumed that only have one login system is used per application. If so, there's really no point in creating an instance.
   *
   * In any event, you'll want to set the authService to Ux message mappings and set the action and listener functions. For example:
   *
   *     var authAdaptor = Object.create(AuthServiceAdaptor, {
   *        authServiceMessageToUxMessageMappings: {
   *            "Success Message from auth server": "message you want passed to your UI",
   *            "Error Message from auth server": { whatever: "message token you want passed to your UI", where: "usernameField" }
   *        }
   *     });
   *     var loginAction = function(email, password, rememberMe){};
   *     var signupAction = function(email, password){ };
   *     authAdaptor.setActions( loginAction, signupAction);
   *
   *     var loginSuccess = function(optionalMessage){};
   *     var loginError = function(optionalMessage){};
   *     var signupSuccess = function(optionalMessage){};
   *     var signupError = function(optionalMessage){};
   *     authAdaptor.setCallbackActions( loginSuccess, loginError, signupSuccess, signupError);
   *
   * The object "found" when mapping from an authService message to a UX message is passed untouched to the the respective callbackAction function.
   * This means you can provide fairly complicated message tokens back to your UX - to indicate that the message should be displayed on the username field,
   * for example. Or you can just store a string. Whatever.
   *
   * The use of setters instead of just adding directly to the object is simply because it is expected that you will be passing this adaptor into your
   * authentication service object and your authentication UX object. Also, IntelliJ+intelliSense.
   *
   *
   * @class AuthServiceAdaptor
   */
  window.AuthServiceAdaptor = window.AuthServiceAdaptor || {

    /**
     * If defined, this value is used to locate the string based key that will be used to translate the message object
     * provided by the authentication service.
     *
     * For example, if you use Firebase, this value would be either "message" or "code".
     */
    authServiceMsgMappingKey: undefined,

    /**
     * Key to Resource string mappings. See Type comment above
     *
     * @attribute authServiceMessageToUxMessageMappings
     * @type Map
     */
    authServiceMessageToUxMessageMappings: undefined,

    mapAuthServiceMsgToRsrcMsg: function (serverMessage) {
      if (!this.authServiceMessageToUxMessageMappings) {
        return serverMessage;
      }
      var key = this.authServiceMsgMappingKey ? serverMessage[this.authServiceMsgMappingKey] : serverMessage;
      return this.authServiceMessageToUxMessageMappings[key];
    },

    /**
     * Set the action functions that will be called by the UX when the user attempts to login or create a new account.
     *
     * These functions should translate (forward) to similar methods provided by your authentication service provider.
     *
     * The provided actions must call handleLoginSuccess, handleLoginError, handleSignupSuccess or handleSignupError, as appropriate. If a message
     * (or message token object) is available it should be passed as an argument to the handler method.
     *
     * @param loginAction {function(username, password, rememberMe)}
     * @param signupAction {function(username, password)}
     */
    setAuthActions: function (loginAction, signupAction) {
      this.loginAction = loginAction;
      this.signupAction = signupAction;
    },

    /**
     * Called by the loginAction after the user has been successfully authenticated.
     *
     * @callback loginSuccess
     * @param {(object|string)=} messageToken
     */
    /**
     * Called by the loginAction after user authentication has failed.
     *
     * @callback loginError
     * @param {(object|string)} messageToken
     */
    /**
     * Called by the signupAction after the user has been successfully had an account created.
     *
     * @callback signupSuccess
     * @param {(object|string)=} messageToken
     */
    /**
     * Called by the signupAction after the user's attempt to create an account has failed.
     *
     * @callback signupError
     * @param {(object|string)} messageToken
     */

    /**
     * Set the action functions that will be called by the authentication provider when a user login attempt or account creation attempt succeeds or fails.
     *
     * These functions should translate (forward) to similar methods provided by your login UI. The granum-login-panel, as you may guess, is already set
     * up to work with this adaptor.
     *
     * These functions are called with a message token provided by 'authServiceMessageToUxMessageMappings', if one is found for the message token provided
     * by the calling loginAction/signupAction function.
     *
     * @param {loginSuccess} loginSuccess Callback for successful login attempt.
     * @param {loginError} loginError Callback for failed login attempt.
     * @param {signupSuccess} signupSuccess Callback for successful create account attempt.
     * @param {signupError} signupError Callback for failed create account attempt.
     */
    setCallbackActions: function (loginSuccess, loginError, signupSuccess, signupError) {
      this.loginSuccess = loginSuccess;
      this.loginError = loginError;
      this.signupSuccess = signupSuccess;
      this.signupError = signupError;
    },

    /**
     * Replace this simple validation function with your own, if you like. Email validation is built into text fields, so probably don't waste time with
     * that kind of thing.
     * @param username The username to test for validity.
     * @returns {boolean}
     */
    usernameValidator: function (username) {
      return (username && username.length > 3);
    },

    /**
     * Replace this simple validation function with your own, if you like.
     * @param password {string} The password to test for validity.
     * @param username {string=} The username, to check for similarity to the password.
     * @returns {boolean}
     */
    passwordValidator: function (password, username) {
      return password && password.length > 7 && password != username;
    },

    performLogin: function (username, password, rememberMe) {
      this.loginAction(username, password, rememberMe);
    },

    performSignup: function (username, password) {
      this.signupAction(username, password);
    },

    handleLoginSuccess: function (successMessage) {
      this.loginSuccess(successMessage);
    },

    handleLoginError: function (errorMessage) {
      this.loginError(this.mapAuthServiceMsgToRsrcMsg(errorMessage));
    },

    handleSignupSuccess: function (successMessage) {
      this.signupSuccess(successMessage);
    },

    handleSignupError: function (errorMessage) {
      this.signupError(this.mapAuthServiceMsgToRsrcMsg(errorMessage));
    }



  };

}());