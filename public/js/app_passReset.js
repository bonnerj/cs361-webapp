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