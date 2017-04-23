/*global mixpanel:true*/
let toExport;
if (process.env.NODE_ENV === 'production') {
  toExport = mixpanel;
} else {
  toExport = {
    track: t => null,
    identify: t => null
  }
}
export default toExport;
