Login Panel
============


## Basic template app that has a login/signup dialog.

Provides a login panel/dialog that can toggle to 'signup' mode. Messaging is highly configurable, and the component could be internationalized fairly easily.

Uses [Firebase](https://www.firebase.com/) to provide authentication, though the intent is that you copy the App.js file into your own project and adjust as
needed.

Inter-component communication is provided by [PubSub](https://github.com/mroderick/PubSubJS), in great part to avoid coupling any code to Polymer specific
eventing - Polymer is far less stable than my initial impressions indicated.







## Todo
- [x] The action button remains disabled until the password field blurs, which means two clicks. Use a job to validate more frequently or whatever.
- [x] Validation and error message handling that isn't so kludgy.
- [ ] Implement Forgot Password
- [ ] Use a page transition to make the switch from login mode to signup mode more smooth. It's actually TOO fast. Go figure.


## Notes

It's crazy epic fail time on mobile when used in a dialog, so beware. This seems to be the case with all default Paper dialogs - in particular, the inability to scroll down and hide the address bar.




## Demo
[https://ggranum.github.io/granum-login-panel](https://ggranum.github.io/granum-login-panel)