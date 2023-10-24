const form = document.querySelector("form");
const resultContent = document.querySelector(".result-content");
const warningMessage = document.querySelector(".warning-message");
const loader = document.querySelector(".loader");
const buyBtn = document.querySelector("#buyBtn");
const loginMessage = document.querySelector(".login-message");

let textInput = null;

// IS USER LOGGED IN ? show the form or the login message
const updateUserUi = (user) => {
  form.innerHTML = "";

  if (user) {
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

  // reset the UI
  warningMessage.innerText = "";
  resultContent.innerText = "";

  // get always a fresh token
  const token = await netlifyIdentity.currentUser().jwt(true);

  const dish = textInput.value.trim(); // remove whitespace

  if (!dish) {
    warningMessage.innerText = "Please enter a dish name";
    warningMessage.classList.remove("-hidden");
    return;
  }

  const answer = await callApi(dish, token);
  displayAnswer(dish, answer);
};

// CALL API
const callApi = async (dish, token) => {
  loader.classList.remove("-hidden");
  resultContent.classList.add("-hidden");

  try {
    const response = await fetch(`/.netlify/functions/api?text=${dish}`, {
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

// BUY BUTTON
const stripeBuy = async () => {
  const token = await netlifyIdentity.currentUser().jwt();

  try {
    const response = await fetch(
      "/.netlify/functions/manage-subscription-plan",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // redirect to the stripe portal
    const link = await response.json();
    window.location.href = link;
  } catch (error) {
    console.error(error);
  }
};

const handleUserStateChange = (user) => {
  updateUserUi(user);
  netlifyIdentity.close();
};

// EVENT LISTENERS
netlifyIdentity.on("init", handleUserStateChange);

netlifyIdentity.on("login", handleUserStateChange);

netlifyIdentity.on("logout", handleUserStateChange);

buyBtn.addEventListener("click", () => {
  stripeBuy();
});
