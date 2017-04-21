/* eslint-disable */

// Get all contracts
let r
Contract.find({}).exec.then( res => r = res );

// Show pending Links
r.forEach( c => c.pendingLinks)

// Accept all of the first link
r.forEach( c => {
  if (c.pendingLinks.length > 0) {
    c.link = c.pendingLinks[0];
    c.pendingLinks = [];
    c.save();
  }
});
