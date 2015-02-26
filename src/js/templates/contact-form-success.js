/* jshint browser:true */


module.exports = function() {
  var header = document.createElement('h3');
  header.appendChild(document.createTextNode('Your email has been sent.'));

  var p = document.createElement('p');
  p.appendChild(document.createTextNode('Thanks for your message! I\'ll reply back as soon as I am able'));

  var successView = document.createElement('div');
  successView.appendChild(header);
  successView.appendChild(p);

  return successView;
};