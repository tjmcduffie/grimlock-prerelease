/* jshint browser:true */


module.exports = function(errors) {
  var errorsList = document.createElement('ul');
  errorsList.className = 'errors';

  errors.forEach(function(err) {

      var name = err.elem ? err.elem.name.charAt(0).toUpperCase() : '';
      var li = document.createElement('li');
      var message;

      switch (err.type) {
        case 'required':
          message = name + ' is a required field.';
          break;
        case 'pattern':
          message = err.message || 'Please enter a valid ' + name;
          break;
        default:
          message = err.message;
      }

      li.appendChild(document.createTextNode(message));
      errorsList.appendChild(li);
  });
  return errorsList;
};