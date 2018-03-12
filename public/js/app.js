var password = document.getElementById("password")
  , confirm_password = document.getElementById("verifyPassword");

function validatePassword(){

  if (password.value.length < 7) {
  	password.setCustomValidity("Passwords must be at least 8 characters");
  } else {
    password.setCustomValidity('');
  }

  if(password.value != confirm_password.value) {
    confirm_password.setCustomValidity("Passwords Don't Match");
  } else {
    confirm_password.setCustomValidity('');
  }
}

password.onchange = validatePassword;
confirm_password.onkeyup = validatePassword;


function confirmReveal() {
  if (confirm("Are you sure you wish to reveal your identity?") ) {
    document.getElementById("revealed").checked = true;

  } else {
    document.getElementById("anonymous").checked = true;
  }
}



