const form = document.querySelector("form");
const resultContent = document.querySelector(".result-content");
const warningMessage = document.querySelector(".warning-message");
const loader = document.querySelector(".loader");
const baseURL = "https://dev-die-or-not.netlify.app/.netlify/functions/api";
// const baseURL = "https://dieornot.com/.netlify/functions/api";
// const baseURL = "http://localhost:8888/.netlify/functions/api";
const loginMessage = document.querySelector(".login-message");

let textInput = null;

const createUser = async (user) => {
  if (!user) return;

  const { email, user_metadata } = user;
  const { full_name } = user_metadata;

  const newUser = {
    name: full_name,
    email: email,
    subscribed: false,
    unique_id: user.id,
  };

  const response = await fetch("/.netlify/functions/create-user", {
    method: "POST",
    body: JSON.stringify({ user: newUser }),
  });

  try {
    const result = await response.text();
  } catch (error) {
    alert("Oops something went wrong");
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
  createUser(user);
});
