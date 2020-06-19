window.urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

function openSignin() {
  document.getElementById("signinMenuWrapper").style.display="flex";
  document.getElementById("signinForm").style.display="block";
}

function closeSignin() {
  document.getElementById("signinMenuWrapper").style.display="none";
  document.getElementById("signinForm").style.display="none";
}

function openRegister() {
  document.getElementById("signinMenuWrapper").style.display="flex";
  document.getElementById("registerForm").style.display="block";
}

function closeRegister() {
  document.getElementById("signinMenuWrapper").style.display="none";
  document.getElementById("registerForm").style.display="none";
}

function closeResetForm() {
  for (let i = 0; i < document.getElementsByClassName("formWrapper").length; i++) {
    document.getElementsByClassName("formWrapper")[i].style.visibility="hidden";
    window.location = "/";
  }
}

function checkPassword() {
  if (document.getElementById("password").value === document.getElementById("confirmPassword").value) {
    if (document.getElementById("passwordStrength").innerHTML !== "too weak") {
      document.getElementById("registerButton").type = "submit";
    } else {
      document.getElementById("registerButton").type = "button";
    }
  } else {
    document.getElementById("registerButton").type = "button";
  }
}

function checkAndAlert() {
  if (document.getElementById("password").value !== document.getElementById("confirmPassword").value) {
    alert("Password confirmation failed. Plase make sure that both passwords match.");
  }
  if (document.getElementById("passwordStrength").innerHTML === "too weak") {
    alert("Please use a stronger password.");
  }
}

function resetPassword() {
  if (!document.getElementById("email").value) {
    alert("Please add your email to the log-in form.");
  } else {
    document.getElementById("loginForm").action="/reset-password";
    document.loginForm.submit();
  }
}

function checkPassword2() {
  if (document.getElementById("password2").value === document.getElementById("confirmPassword2").value) {
    document.getElementById("changePasswordButton").type = "submit";
  } else {
    document.getElementById("changePasswordButton").type = "button";
  }
}

function checkAndAlert2() {
  if (document.getElementById("password2").value !== document.getElementById("confirmPassword2").value) {
    alert("Password confirmation failed. Plase make sure that both passwords match.");
  }
}

function scorePassword(password) {
  let score = 0;
  if (!password) {return score;}
  let letters = new Object();
  for (let i = 0; i < password.length; i++) {
    letters[password[i]] = (letters[password[i]] || 0) + 1;
    score += 5.0 / letters[password[i]];
  }
  let variations = {
    digits: /\d/.test(password),
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    nonWords: /\W/.test(password)
  }
  let variationCount = 0;
  for (let check in variations) {
    variationCount += (variations[check] == true) ? 1 : 0;
  }
  score += (variationCount - 1) * 10;
  return parseInt(score);
}

function checkPassStrength() {
  let score = scorePassword(document.getElementById("password").value);
  if (password.length < 8) {message = "too weak"; messageColor = "red";}
  else if (score > 80) {message = "strong"; messageColor = "green";}
  else if (score > 60) {message = "good"; messageColor = "blue";}
  else if (score >= 30) {message = "too weak"; messageColor = "red";}
  else {message = "too weak"; messageColor = "red";}
  document.getElementById("passwordStrength").innerHTML = message;
  document.getElementById("passwordMessage").style = `display:inline;color:${messageColor};`;
}

function checkForLink() {
  // Wait for user to stop typing
  let postInput = document.getElementById("postContent");
  postInput.addEventListener("keyup", () => {
    clearTimeout(window.typingTimer);
    window.typingTimer = setTimeout(doneTyping, 1000);
  });
  // If time's up, check for links
  function doneTyping() {
    let url = postInput.innerHTML.match(urlRegex);
    if (url) {
      let string = postInput.innerHTML;
      populatePost(url[0]);
    } else {
      document.getElementById("postLinkImg").src="";
      document.getElementById("postLinkTitle").innerHTML="";
      document.getElementById("postLinkDescription").innerHTML="";
    }
  }
  
  // If there is a link, populate post form
  async function populatePost(url) {
    let data = {postContent: url}
    let response = await fetch("/api/process-share", {method:"POST", body: JSON.stringify(data), headers: {'Content-Type':'application/json'}});
    if (response.ok) {
      let json = await response.json();
      if (json.image) {document.getElementById("postLinkImg").src=json.image;}
      if (json.title) {document.getElementById("postLinkTitle").innerHTML=json.title;}
      if (json.description) {document.getElementById("postLinkDescription").innerHTML=json.description;}
    } else {
      alert("HTTP-Error: " + response.status);
    }
  }
}

function postShare(path, params, method) {
  const form = document.createElement('form');
  form.method = method;
  form.action = path;
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const hiddenField = document.createElement('input');
      hiddenField.type = 'hidden';
      hiddenField.name = key;
      hiddenField.value = params[key];
      form.appendChild(hiddenField);
    }
  }
  document.body.appendChild(form);
  form.submit();
}

function postSharedContent() {
  if (document.getElementById("postContent").innerHTML === "") {
    alert("There is nothing to post");
  } else {
    path = "/api";
    method = "POST";
    params = {
      postContent: document.getElementById("postContent").innerHTML,
      publisher: document.getElementById("myAccount").getAttribute("name"),
      image: document.getElementById("postLinkImg").getAttribute("src"),
      title: document.getElementById("postLinkTitle").innerHTML,
      description: document.getElementById("postLinkDescription").innerHTML
    };
  }
  postShare(path, params, method);
}
