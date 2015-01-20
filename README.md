Login Panel
============


## A basic login / 'sign up' panel.

A simple login form that can toggle to 'signup' mode. Messaging is highly configurable, and the component could be internationalized fairly easily.

Operates via an "Authentication Service Adaptor" - basically, it is authentication service agnostic, and not particularly difficult to configure.



## Todo
  [] The action button remains disabled until the password field blurs, which means two clicks. Use a job to validate more frequently or whatever.
  [] Implement Forgot Password
  [] Validation and error message handling that isn't so kludgy.
  [] Use a page transition to make the switch from login mode to signup mode more smooth. It's actually TOO fast. Go figure.


## Notes

The pane in a paper-dialog (check out the demo for how), but take care to examine the styles in the demo.

It's crazy epic fail time on mobile when used in a dialog, so beware. This seems to be the case with all default Paper dialogs - in particular, the inability to scroll down and hide the address bar.




## Demo
[https://ggranum.github.io/granum-login-panel](https://ggranum.github.io/granum-login-panel)

Check out [https://ggranum.github.io/granum-firebase-login](https://ggranum.github.io/granum-firebase-login) if you want a quick way to get your project
to the point of secure user registration and login!
