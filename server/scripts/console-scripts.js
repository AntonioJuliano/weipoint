/* eslint-disable */

// Get all contracts
let r
Contract.find({}).exec().then( res => r = res );

// Show pending Links
r.map( c => c.pendingLinks)

// Accept all of the first link
r.forEach( c => {
  if (c.pendingLinks.length > 0) {
    c.link = c.pendingLinks[0];
    c.pendingLinks = [];
    c.save();
  }
});

r.forEach( c => {
  if (c.link && c.link.match(/^http:\/\/https/)) {
    let str = c.link.replace(/^http:\/\//, '')
    c.link = str
    c.save()
  }
})

let es_query = {
  multi_match: {
    query: query,
    fields: ['tags.tag', 'description', 'link', 'name'],
    fuzziness: 'AUTO',
    prefix_length: 1
  }
};

Contract.esSearchAsync(
  {
    from: 0,
    size: 10,
    query: es_query
  },
  { hydrate: true }
).then(r => res = r );
