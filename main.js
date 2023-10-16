const form = document.querySelector("form");
const textInput = document.querySelector(".textInput");
const resultContent = document.querySelector(".resultContent");
const loader = document.querySelector(".loader");
const baseURL = "https://dieornot.com/.netlify/functions/api";
// "http://localhost:8888/.netlify/functions/api";

const loginMessage = document.querySelector(".login-message");

const user = netlifyIdentity.currentUser();
console.log(user);

// on login hide popin
netlifyIdentity.on("login", () => {
  netlifyIdentity.close();
});

// show login message if not logged in or if user is not here
const isUserLoggedIn = (state) => {
  if (state) {
    loginMessage.classList.add("-hidden");
    form.classList.remove("-hidden");
    //render the form
    form.innerHTML = `
      <input type="text" class="textInput" name="text" placeholder="Enter a dish name">
      <button> Check </button>
    `;
  } else {
    loginMessage.classList.remove("-hidden");
    form.innerHTML = "";
  }
};

isUserLoggedIn(user);

netlifyIdentity.on("login", () => {
  isUserLoggedIn(true);
});

netlifyIdentity.on("logout", () => {
  isUserLoggedIn(false);
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
