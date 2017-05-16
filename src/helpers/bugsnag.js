const bugsnag = require("bugsnag");

bugsnag.register(process.env.BUGSNAG_KEY);

if (process.env.NODE_ENV !== 'production') {
  bugsnag.notify = _ => true;
}

module.exports = bugsnag;
