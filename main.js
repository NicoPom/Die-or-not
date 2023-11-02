const form = document.querySelector("form");
const resultContent = document.querySelector(".result-content");
const warningMessage = document.querySelector(".warning-message");
const loader = document.querySelector(".loader");
const upgradeBtn = document.querySelector(".upgrade-btn");
const loginMessage = document.querySelector(".login-message");
const header = document.querySelector("header");
const textInput = document.querySelector(".textInput");
const managePlanBtn = document.querySelector(".manage-plan-btn");

// IS USER LOGGED IN ? show the form or the login message
// const updateUserUi = (user) => {
//   if (user) {
//     loginMessage.classList.add("-hidden");
//     managePlanBtn.classList.remove("-hidden");
//     form.classList.remove("-hidden");

//     managePlanBtn.addEventListener("click", () => {
//       manageSubscriptionPlan(user.token.access_token);
//     });
//   } else {
//     loginMessage.classList.remove("-hidden");
//     form.classList.add("-hidden");
//     managePlanBtn.classList.add("-hidden");
//     warningMessage.innerText = "";
//     resultContent.innerText = "";
//   }
// };

// ON FORM SUBMIT ? call the API and display the result
const onFormSubmit = async (event) => {
  event.preventDefault();

  // reset the UI
  warningMessage.innerText = "";
  warningMessage.classList.add("-hidden");
  resultContent.innerText = "";

  // always get a fresh token
  // const token = await netlifyIdentity.currentUser().jwt(true);

  const dish = textInput.value.trim(); // remove whitespace

  if (!dish) {
    warningMessage.innerText = "Please enter a dish name";
    warningMessage.classList.remove("-hidden");
    return;
  }

  const answer = await callApi(dish);
  displayAnswer(dish, answer);
};

// CALL API
const callApi = async (dish) => {
  loader.classList.remove("-hidden");
  resultContent.classList.add("-hidden");

  try {
    const response = await fetch(`/.netlify/functions/api?text=${dish}`, {
      method: "GET",
      headers: {
        // Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // if (response.status === 401) {
      //   upgradeBtn.classList.remove("-hidden"); // show the buy button
      //   upgradeBtn.addEventListener("click", () => {
      //     manageSubscriptionPlan(token);
      //   });
      //   throw new Error(await response.text());
      // } else {
      throw new Error("Oops something went wrong");
      // }
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
    dish + (answer ? ` is spicy 🥵` : " is not spicy 😊");

  const bgRed = document.querySelector(".bg.red");
  const bgGreen = document.querySelector(".bg.green");

  if (answer) {
    bgRed.classList.remove("-invisible");
    bgGreen.classList.add("-invisible");
  } else {
    bgRed.classList.add("-invisible");
    bgGreen.classList.remove("-invisible");
  }
};

// BUY BUTTON
// const manageSubscriptionPlan = async (token) => {
//   try {
//     const response = await fetch(
//       "/.netlify/functions/manage-subscription-plan",
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     // redirect to the stripe portal
//     const link = await response.json();
//     window.location.href = link;
//   } catch (error) {
//     console.error(error);
//   }
// };

// const handleUserStateChange = (user) => {
//   updateUserUi(user);
//   netlifyIdentity.close();
// };

// EVENT LISTENERS
// netlifyIdentity.on("init", handleUserStateChange);

// netlifyIdentity.on("login", handleUserStateChange);

// netlifyIdentity.on("logout", handleUserStateChange);

form.addEventListener("submit", onFormSubmit);
