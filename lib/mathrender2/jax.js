/***********************************************
 *
 *  A Phantom.js script that uses MathJax to
 *  render a TeX equation into and SVG image
 *  file.
 *  
 *  Usage:  phantomjs jax.js [--display] 'tex code' > file.svg
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
  console.log('Usage: '+system.args[0]+' [--display] equation');
  phantom.exit();
}
var display = false, equation = system.args[1];
if (equation === "--display") {display = true; equation = system.args[2]}

//
//  Set up equation mased on disiplay mode
//
equation = (display ? "\\["+equation+"\\]" : "\\("+equation+"\\)");

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
        console.log(page.evaluate(function () {
          //
          //  Look up the SVG output and the font paths
          //  Hook the paths into the SVG output, and put the
          //    SVG element into a DIV so we can use innerHTML to serialize
          //  Add the XML heading, and touch up the SVG output
          //    (add newlines to make output prittier,
          //     add missing xmlns attribute,
          //     add xlink: before hrefs so they can find the paths)
          //  Then return the full SVG file.
          //
          var svg = document.getElementsByTagName("svg");
          svg[1].insertBefore(svg[0].firstChild,svg[1].firstChild);
          var div = document.createElement("div");
          div.appendChild(svg[1]);
          return [
            '<?xml version="1.0" standalone="no"?>',
            '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
            div.innerHTML.replace(/><([^/])/g,">\n<$1")
                         .replace(/(<\/[a-z]*>)(?=<\/)/g,"$1\n")
                         .replace(/<svg /,'<svg xmlns="http://www.w3.org/2000/svg" ')
                         .replace(/<use ([^>]*)href/g,'<use $1xlink:href')
          ].join("\n");
        }));
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
      script.src = "http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_SVG";
      document.head.appendChild(script);
      setTimeout(function () {alert("MathJax Timeout")},10000);  // timeout after 10 seconds
    });
  }
});