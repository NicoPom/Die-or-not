const form = document.querySelector("form");
const resultContent = document.querySelector(".resultContent");
const loader = document.querySelector(".loader");
const baseURL = "https://dieornot.com/.netlify/functions/api";
// const baseURL = "http://localhost:8888/.netlify/functions/api";
let textInput = null;

const loginMessage = document.querySelector(".login-message");

netlifyIdentity.on("init", (user) => {
  console.log(user);
  isUserLoggedIn(user);
});

// on login hide popin
netlifyIdentity.on("login", (user) => {
  netlifyIdentity.close();
  isUserLoggedIn(user);
  // createUser(user); // just for test
});

netlifyIdentity.on("logout", (user) => {
  isUserLoggedIn(user);
  netlifyIdentity.close();
});

netlifyIdentity.on("signup", (user) => {
  createUser(user);
});

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
  const response = await fetch("/.netlify/functions/createUser", {
    method: "POST",
    body: JSON.stringify({ user: newUser }),
  });
  try {
    const result = await response.text();
    console.log(result);
  } catch (error) {
    alert("Oops something went wrong");
  }
};

// show login message if not logged in or if user is not here
const isUserLoggedIn = (state) => {
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
    form.innerHTML = "";
  }
};

// on form submit call backend and display result
const onFormSubmit = async (event) => {
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
};

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
