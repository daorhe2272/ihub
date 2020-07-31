window.urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

window.addEventListener("click", function (event) {
  let elements = document.getElementsByClassName("fa-caret-down");
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].contains(event.target)) {
      elements[i].children[0].style.visibility="visible";
    } else {
      elements[i].children[0].style.visibility="hidden";
    }
  }
});

window.addEventListener("click", function (event) {
  let elements = document.getElementsByClassName("fa-share");
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].contains(event.target)) {
      elements[i].children[0].style.visibility="visible";
    } else {
      elements[i].children[0].style.visibility="hidden";
    }
  }
});

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
      document.getElementById("registerButton").type="submit";
    } else {
      document.getElementById("registerButton").type="button";
    }
  } else {
    document.getElementById("registerButton").type="button";
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
    document.getElementById("changePasswordButton").type="submit";
  } else {
    document.getElementById("changePasswordButton").type="button";
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

function openForm() {
  document.getElementById("popupWrapper").style.display="flex";
  document.getElementById("popupForm").style.display="block";
}

function closeForm() {
  document.getElementById("popupWrapper").style.display="none";
  document.getElementById("popupForm").style.display="none";
}

function checkForLink() {
  // Set maximum amount of characters allowed
  let postInput = document.getElementById("postContent");
  if (postInput.innerText.length > 1000) {
    alert("Maximum number of characters reached! Please make your post shorter.");
  }
  
  // Wait for user to stop typing
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
      if (json.description) {
        document.getElementById("postLinkDescription").innerHTML=json.description;
      }
    } else {
      let json = await response.json();
      alert(json.message);
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
    path = "/";
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

async function deletePost(postId) {
  if (confirm("Delete post?") === true) {
    location.href = `/delete-share/${postId}`;
  }
}

async function likePost(postId) {
  let response = await fetch(`/api/like-share/${postId}`);
  let element = document.getElementById(`like-${postId}`);
  if (response.ok) {
    let json = await response.json();
    if (json.message === "Like added") {
      element.style.color="blue";
      element.children[0].innerHTML=`${parseInt(element.children[0].innerHTML)+1}`;
    }
    if (json.message === "Like removed") {
      element.style.color="#395462";
      element.children[0].innerHTML=`${parseInt(element.children[0].innerHTML)-1}`;
    }
  } else if (response.status === 401) {
    showMessage("Please sign in. If you don't have an account, create one.");
  }
}

function copyLink(postId) {
  let toCopy = `${window.location.href}shared-post/${postId}`;
  try {
    navigator.clipboard.writeText(toCopy);
    showMessage("Link copied to clipboard.");
  } catch {
   showMessage("Functionality available only over https or localhost. Not supported for Internet Explorer.");
  }
}

function showComments(postId) {
  let element = document.getElementById(`commentsSection-${postId}`);
  if (element.style.display === "flex") {
    element.style.display="none";
  } else{
    element.style.display="flex";
  }
}

function submitComment(postId) {
  let element = document.getElementById(`commentContent-${postId}`);
  element.onkeydown = async function (e) {
    // If user press Enter and is not holding the shift key...
    if (e.keyCode == 13 && !e.shiftKey) {
      let data = {commentContent: element.innerText};
      let path = `/post-comment/${postId}`;
      setTimeout(function () {element.innerText="";}, 30);
      try {
        let response = await fetch(path, {method:"Post", body: JSON.stringify(data), headers: {'Content-Type':'application/json'}});
        if (response.ok) {
          let json = JSON.parse(await response.json());
          if (!json.message) {
            let elem = document.getElementById(`commentIcon-${postId}`);
            elem.children[0].innerHTML=`${parseInt(elem.children[0].innerHTML)+1}`;
            elem.style.color="blue";
            let div = document.createElement("div");
            div.setAttribute("id", `${json._id}`);
            div.setAttribute("class", "listedComment");
            div.innerHTML = 
              `<div class="listedCommentContainer">
                <div class="listedCommentAuthor" id="${json.userId}">
                  <small>
                    <a href="/user/${json.userId}" style="font-weight:600;">${json.userName}</a> says...
                  </small>
                </div>
                <i class="fas fa-caret-down">
                  <div class="commentDropdown">
                    <button>
                      Edit
                    </button>
                    <button onclick="deleteComment('${json._id}', '${json.postId}')">
                      Delete
                    </button>
                  </div>
                </i>
                <div class="listedCommentContent">
                  ${json.content}
                </div>
              </div>
              <div class="listedCommentButtons">
                <i class="far fa-thumbs-up" onclick="likeComment('${json._id}')" id="commentLike-${json._id}" style="">
                  <div>0</div>
                </i>
                <div class="listedCommentDate">
                  Just now...
                </div>
              </div>`;
            document.getElementById(`commentsList-${json.postId}`).insertAdjacentElement("afterbegin", div);
          }
        } else if (response.status == 401) {
          showMessage("Please sign in. If you don't have an account, create one.");
        } else {
          let json = await response.json();
          console.log(json); // Remove for production
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
}

async function deleteComment(commentId, postId) {
  if (confirm("Delete comment?") === true) {
    let response = await fetch(`/delete-comment/${commentId}-${postId}`, {method: "DELETE"});
    if (response.ok) {
      let json = await response.json();
      if (json.message === "Comment deleted") {
        let elem = document.getElementById(`commentIcon-${postId}`);
        elem.children[0].innerHTML=`${parseInt(elem.children[0].innerHTML)-1}`;
        let div = document.getElementById(commentId);
        div.parentNode.removeChild(div);
        elem.style.color="#395462";
      }
    }
  }
}

async function likeComment(commentId) {
  let response = await fetch(`/api/like-share-comment/${commentId}`);
  let element = document.getElementById(`commentLike-${commentId}`);
  if (response.ok) {
    let json = await response.json();
    if (json.message === "Like added") {
      element.style.color="blue";
      element.children[0].innerHTML=`${parseInt(element.children[0].innerHTML)+1}`;
    }
    if (json.message === "Like removed") {
      element.style.color="#395462";
      element.children[0].innerHTML=`${parseInt(element.children[0].innerHTML)-1}`;
    }
  } else if (response.status === 401) {
    showMessage("Please sign in. If you don't have an account, create one.");
  }
}

function showReportsForm(sourceId) {
  document.getElementById("popupWrapper").style.display="flex";
  document.getElementById("reportsForm").style.display="block";
  document.getElementById("reportButton").setAttribute("onclick", `reportPost("${sourceId}")`);
}

function closeReportsForm() {
  document.getElementById("popupWrapper").style.display="none";
  document.getElementById("reportsForm").style.display="none";
}

async function reportPost(sourceId) {
  let data = {explanation: document.querySelector("input[name='problem']:checked").value};
  let response = await fetch(`/report-post/${sourceId}`, {method:"Post", body: JSON.stringify(data), headers: {'Content-Type':'application/json'}});
  if (response.ok) {
    let json = await response.json();
    if (json.message) {
      closeReportsForm();
      showMessage(json.message);
    }
  }
}

function showMessage(message) {
  document.getElementById("signinMenuWrapper").style.display="flex";
  document.getElementById("messageAlert").style.display="flex";
  document.getElementById("messageText").innerText=message;
}

function closeMessage() {
  document.getElementById("signinMenuWrapper").style.display="none";
  document.getElementById("messageAlert").style.display="none";
}

function showEditForm(postId) {
  document.getElementById("popupWrapper").style.display="flex";
  document.getElementById("editPostForm").style.display="flex";
  document.getElementById("editPostText").innerText =
    document.getElementById(`postContents-${postId}`).innerText;
  if (document.getElementById(`linkImage-${postId}`) != null) {
    document.getElementById("postExtrasImage").src =
    document.getElementById(`linkImage-${postId}`).getAttribute("src");
  } else {
    document.getElementById("postExtrasImage").src="";
  }
  if (document.getElementById(`linkTitle-${postId}`) != null) {
    document.getElementById("postExtrasTitle").innerText =
    document.getElementById(`linkTitle-${postId}`).innerText;
  } else {
    document.getElementById("postExtrasTitle").innerText="";
  }
  if (document.getElementById(`linkDescription-${postId}`) != null) {
    document.getElementById("postExtrasDescription").innerText = 
    document.getElementById(`linkDescription-${postId}`).innerText;
  } else {
    document.getElementById("postExtrasDescription").innerText="";
  }
}

function closeEditForm() {
  document.getElementById("popupWrapper").style.display="none";
  document.getElementById("editPostForm").style.display="none";
}

function checkForEditLink() {
  // Set maximum amount of characters allowed
  let postInput = document.getElementById("editPostText");
  if (postInput.innerText.length > 1000) {
    alert("Maximum number of characters reached! Please make your post shorter.");
  }
  
  // Wait for user to stop typing
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
      document.getElementById("postExtrasImage").src="";
      document.getElementById("postExtrasTitle").innerHTML="";
      document.getElementById("postExtrasDescription").innerHTML="";
    }
  }
  
  // If there is a link, populate post form
  async function populatePost(url) {
    let data = {postContent: url}
    let response = await fetch("/api/process-share", {method:"POST", body: JSON.stringify(data), headers: {'Content-Type':'application/json'}});
    if (response.ok) {
      let json = await response.json();
      if (json.image) {document.getElementById("postExtrasImage").src=json.image;}
      if (json.title) {document.getElementById("postExtrasTitle").innerHTML=json.title;}
      if (json.description) {
        document.getElementById("postExtrasDescription").innerHTML=json.description;
      }
    } else {
      let json = await response.json();
      alert(json.message);
    }
  }
}
