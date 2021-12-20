import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"

import {
    getDatabase,
    ref,
    set
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js"

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
const database = getDatabase(app)

//DOM
const $ = (value) => document.querySelector(value)
const form = $('.form')
const btn_register = $('.btn-register')

btn_register.addEventListener('click',createUser)

function createUser(e) {
    e.preventDefault()

    const name_user = $('#name').value
    const email = $('#email').value
    const password = $('#password').value

    createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            //obtenemos usuario
            const user = userCredential.user

            if (user) {
                let  res = await writeUserData(user.uid, name_user, email, password)
                console.log(res);
                console.log(user);
                form.action = "http://localhost:5502/index.html"
                form.submit()
            } else {
                alert('No puede iniciar sesión')
            }
        })
        .catch((error) => {
            const errorCode = error.code
            const errorMessage = error.message

            form.reset()
            console.log(errorMessage, errorCode);
            alert('Usuario ya creado vuelve a intentarlo')
        });
}

async function writeUserData(userId, name, email, password) {
    await set(ref(database, 'users/' + userId), {
        username: name,
        email,
        password
    });

}