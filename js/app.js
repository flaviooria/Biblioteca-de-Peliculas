import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,

} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"

const firebaseConfig = {
  apiKey: "AIzaSyBYHFKfqmPSsYK5_faV0CFXpZ8rsxxLoto",
  authDomain: "playlist-creator-46da6.firebaseapp.com",
  projectId: "playlist-creator-46da6",
  storageBucket: "playlist-creator-46da6.appspot.com",
  messagingSenderId: "284538167302",
  appId: "1:284538167302:web:d082e7c418686a0fefe387",
  databaseURL: "https://playlist-creator-46da6-default-rtdb.europe-west1.firebasedatabase.app/",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//Configuración de firebase
const auth = getAuth(app)
const provider_google = new GoogleAuthProvider()

//Variables dom 
const $ = (value) => document.querySelector(value)

const form = $('.form')
const btn_google = $('.btn-google')


form.addEventListener('submit', (e) => {
  e.preventDefault()

  const email = $('#email').value
  const password = $('#password').value

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      let user = userCredential.user;
      if (user) {
        form.action = "./pages/home_page.html"
        form.submit()
      }
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert('No pudo iniciar sesión')
      form.reset()
    });

})

//Form con google
btn_google.addEventListener('click', () => {
  signInWithPopup(auth, provider_google)
    .then(async (result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      // The signed-in user info.
      const user = result.user;
      if (user) {
        console.log(user);

        form.action = "./pages/home_page.html"
        form.submit()
      }

    }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      alert('No pudo iniciar sesión')
      form.reset()
    });
})

