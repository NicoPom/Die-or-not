import netlifyIdentity from "netlify-identity-widget";

const form = document.querySelector("form");
const textInput = document.querySelector(".textInput");
const resultContent = document.querySelector(".resultContent");
const loader = document.querySelector(".loader");
const baseURL = "https://dieornot.com/.netlify/functions/api";
// "http://localhost:8888/.netlify/functions/api";

const loginBtn = document.querySelector("#loginBtn");
const loginMessage = document.querySelector(".login-message");

netlifyIdentity.init();

console.log(netlifyIdentity.currentUser());

// show login message if not logged in or if user is not here
const user = netlifyIdentity.currentUser();

const userLoggedIn = (state) => {
  if (state) {
    loginMessage.classList.add("-hidden");
    form.classList.remove("-hidden");
    //render the form
  } else {
    loginMessage.classList.remove("-hidden");
    form.classList.add("-hidden");
  }
};

userLoggedIn(user);

netlifyIdentity.on("login", () => {
  userLoggedIn(true);
});

netlifyIdentity.on("logout", () => {
  userLoggedIn(false);
});

// on login button click
loginBtn.addEventListener("click", () => {
  netlifyIdentity.open();
});

// on form submit
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const dish = textInput.value.trim(); // remove whitespace
  if (!dish) {
    resultContent.innerText = "Please enter a dish name";
    return;
  }
  try {
    const result = await callBackend(dish);
    displayResult(dish, result);
  } catch (error) {
    console.error(error);
  }
});

const callBackend = async (text) => {
  loader.classList.remove("-hidden");
  resultContent.classList.add("-hidden");
  const response = await fetch(`${baseURL}?text=${text}`);
  try {
    const answer = await response.text();
    if (answer) {
      loader.classList.add("-hidden");
      resultContent.classList.remove("-hidden");
    }
    return answer === "yes" || answer === "Yes";
  } catch (error) {
    return "error";
  }
};

const displayResult = (dish, result) => {
  if (result === "error") {
    resultContent.innerText = "Oops something went wrong";
    return;
  }
  resultContent.innerText =
    dish + (result ? ` can be Spicy 🥵` : " is not Spicy 😊");

  const bgRed = document.querySelector(".bg.red");

  if (result) {
    bgRed.classList.remove("-invisible");
  } else {
    bgRed.classList.add("-invisible");
  }
};
