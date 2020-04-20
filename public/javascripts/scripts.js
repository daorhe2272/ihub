function openSignin() {
  document.getElementById("signinMenuWrapper").style.display="flex";
  document.getElementById("signinFormA").style.display="block";
}

function closeSignin() {
  document.getElementById("signinMenuWrapper").style.display="none";
  document.getElementById("signinFormA").style.display="none";
}

function processEmail(form) {alert("This shit is working so far.");}
