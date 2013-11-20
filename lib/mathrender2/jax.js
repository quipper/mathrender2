/***********************************************
 *
 *  A Phantom.js script that uses MathJax to
 *  render a TeX equation into and SVG image
 *  file.
 *  
 *  Usage:  phantomjs jax.js  equation output-file-name-without-extension 
 *  
 *  The presence of the --display option causes the TeX commads
 *  to be processed as a display equation; without it, it is
 *  handles as an in-line equation.
 *  
 *  Currently, this code makes reference to the CDN copy of
 *  MathJax.  If you host your own copy, you can change the
 *  address to use that.  It also uses the MathJax
 *  test/examples.html file to start out with, since loading
 *  a remote copy of MathJax into a blank page causes a
 *  security violation (and I can't get the local-to-remote
 *  access control to work).
 */

var page = require('webpage').create();
var system = require('system');

//
//  Get arguments, and print usage if not enough
//
if (system.args.length === 1) {
  console.log('Usage: '+system.args[0]+' equation output-file-name-without-extension');
  phantom.exit();
}
var equation = system.args[1];
var path = system.args[2] || 'sample.png'; 


//
//  Function to allow passing arguments to page.evaluate()
//
function evaluate(page, func) {
  var args = [].slice.call(arguments, 2);
  var fn = "function() {return ("+func.toString()+").apply(this,"+JSON.stringify(args)+")}";
  return page.evaluate(fn);
}

//
//  Open a page from the CDN so we can load MathJax into it (can't do that from a blank page)
//
page.open("http://cdn.mathjax.org/mathjax/latest/test/examples.html", function (status) {
  if (status !== "success") {
    console.log("Unable to access network");
  } else {
    //
    //  This gets called when MathJax is done
    //
    page.onAlert = function (msg) {
      if (msg === "MathJax Done") {

        page.clipRect = page.evaluate(function() {
          var rect = document.getElementsByTagName('svg')[1].getBoundingClientRect();
          return { top: (rect.top - 8), left: (rect.left - 8), width: (rect.width + 8), height: (rect.height + 8) };
        });

        page.render('sample.png')
        console.log("MathJax Done!")
        phantom.exit();
      } else if (msg === "MathJax Timeout") {
        console.log("Timed out waiting for MathJax");
        phantom.exit();
      } else {console.log(msg)}
    }
    //
    //  Clear the page and make it only include the math
    //
    evaluate(page,function (html) {document.body.innerHTML=html},equation);
    //
    //  Load MathJax and queue the alert that tells PhantomJS to make the final SVG file
    //
    page.evaluate(function () {
      var script = document.createElement("script");
      script.type = "text/x-mathjax-config";
      script.text = "MathJax.Hub.Queue([alert,'MathJax Done'])";
      document.head.appendChild(script);
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "http://cdn.mathjax.org/mathjax/2.2-latest/MathJax.js?config=TeX-AMS-MML_SVG";
      document.head.appendChild(script);
      setTimeout(function () {alert("MathJax Timeout")},10000);  // timeout after 10 seconds
    });
  }
});