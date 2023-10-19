const form = document.querySelector("form");
const resultContent = document.querySelector(".result-content");
const warningMessage = document.querySelector(".warning-message");
const loader = document.querySelector(".loader");
const testBtn = document.querySelector("#testBtn");

const baseURL = "https://dieornot.com/.netlify/functions/api";
// const baseURL = "http://localhost:8888/.netlify/functions/api";
const loginMessage = document.querySelector(".login-message");

let textInput = null;

const signUpUser = async (user) => {
  if (!user) return;

  const token = await user.jwt();

  try {
    const response = await fetch("/.netlify/functions/signup-user", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
};

// IS USER LOGGED IN ? show the form or the login message
const isUserLoggedIn = (state) => {
  form.innerHTML = "";

  if (state) {
    loginMessage.classList.add("-hidden");

    //render the form
    form.innerHTML = `
      <input type="text" class="textInput" name="text" placeholder="Enter a dish name">
      <button> Check </button>
    `;

    // get the input
    textInput = document.querySelector(".textInput");
    form.addEventListener("submit", onFormSubmit);
  } else {
    loginMessage.classList.remove("-hidden");
  }
};

// ON FORM SUBMIT ? call the API and display the result
const onFormSubmit = async (event) => {
  event.preventDefault();

  const dish = textInput.value.trim(); // remove whitespace

  if (!dish) {
    warningMessage.innerText = "Please enter a dish name";
    warningMessage.classList.remove("-hidden");
    return;
  }

  try {
    const answer = await callApi(dish);
    displayAnswer(dish, answer);
  } catch (error) {
    console.error(error);
  }
};

// CALL API
const callApi = async (text) => {
  loader.classList.remove("-hidden");
  resultContent.classList.add("-hidden");

  const token = await netlifyIdentity.currentUser().jwt();

  try {
    const response = await fetch(`${baseURL}?text=${text}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(await response.text());
      } else {
        throw new Error("Oops something went wrong");
      }
    }

    const answer = await response.json();

    loader.classList.add("-hidden");
    resultContent.classList.remove("-hidden");
    return answer;
  } catch (error) {
    displayErrorMessage(error.message);
  }
};

// ERROR MESSAGE
const displayErrorMessage = (message) => {
  loader.classList.add("-hidden");
  warningMessage.innerText = message;
  warningMessage.classList.remove("-hidden");
};

// DISPLAY RESULT
const displayAnswer = (dish, answer) => {
  resultContent.innerText =
    dish + (answer ? ` can be Spicy 🥵` : " is not Spicy 😊");

  const bgRed = document.querySelector(".bg.red");

  if (answer) {
    bgRed.classList.remove("-invisible");
  } else {
    bgRed.classList.add("-invisible");
  }
};

// EVENT LISTENERS
netlifyIdentity.on("init", (user) => {
  isUserLoggedIn(user);
});

netlifyIdentity.on("login", (user) => {
  netlifyIdentity.close();
  isUserLoggedIn(user);
});

netlifyIdentity.on("logout", (user) => {
  isUserLoggedIn(user);
  netlifyIdentity.close();
});

netlifyIdentity.on("signup", (user) => {
  // signUpUser(user);
});

testBtn.addEventListener("click", () => {
  const user = netlifyIdentity.currentUser();
  signUpUser(user);
});
