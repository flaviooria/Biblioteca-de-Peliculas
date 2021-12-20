import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"


import {
    User
} from "./models/user.js";

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

//Variables DOM
const $ = (value) => document.querySelector(value)
const logout = $('.btn-logout')
const container_cards = $('.container-movies')
let new_user = {}

const requestOptions = {
    method: 'GET',
    redirect: 'follow',
};

//Evento que siempre esta escuchando si hay un usuario logeado, o sin loguear
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // The user object has basic properties such as display name, email, etc.
        const displayName = user.displayName;
        const email = user.email;
        const photoURL = user.photoURL;
        const uid = user.uid;
        new_user = new User(uid, displayName, email, photoURL)

        console.log(new_user);

        getAllFavoritesMovies(new_user.id)

    } else {
        console.log('Cerrando Sesión');
    }
});

async function getAllFavoritesMovies(id_user) {


    let data = await getMoviesByUser(id_user)

    if (data) {
        container_cards.innerHTML = ''

        let movies = Array.from(Object.entries(data))

        movies.forEach((key) => {

            let id = key[0] // Clave o id unica de firebase
            let item = key[1] // El objeto movie

            const {
                title,
                poster,
                raiting,
                description
            } = item

            container_cards.innerHTML += `
            <div class="card" id="${id}" style="width: 18rem;">
            <img class="card-img-top poster"
              src="${poster}"
              alt="Card image cap">
              <div class="card-header title">
                ${title}
              </div>
            <div class="card-body">
              <h5 class="card-subtitle">${description || 'Sin descripción'}</h5>
              <p class="card-text">Valoración: ${raiting}</p>
              <a href="#" class="btn btn-danger" >Eliminar</a>
            </div>
          </div>
            `
        })

        let card = document.querySelectorAll('.card')

        let get_cards = Array.from(card)

        get_cards.forEach(item => {
            item.addEventListener('click', async (e) => {
                let target = e.target

                let button = target.closest('a.btn')

                if (button) {
                    let card = target.closest('div.card')

                    if (card) {
                        let id_movie = card.getAttribute('id')
                        console.log(id_movie);
                        let res = await deleteMovieFromList(new_user.id, id_movie)

                        console.log(res);

                        //Si el status ha sido ok o 200
                        if (res == 200) {
                            //Eliminamos la card de la biblioteca 
                            card.remove()
                            swal({
                                title: "Pelicula Eliminada",
                                text: "Tu pelicula se elimino correctamente!",
                                icon: "success",
                                button: "ok",
                              });
                        } else {
                            swal({
                                title: "Pelicula no eliminada",
                                text: "Tu pelicula no se pudo eliminar!",
                                icon: "error",
                                button: "ok",
                              });
                        }
                    }
                }
            })
        })
        return
    }

    //Si esta vacio la biblioteca de pelicula añade lo siguiente
    let aviso = document.createElement('h1')
    aviso.classList.add('display-5')
    aviso.classList.add('d-flex')
    aviso.innerText = 'No esperes más en añadir tus pelis favoritas !!!'
    container_cards.appendChild(aviso)

}

logout.addEventListener('click', (e) => {
    e.preventDefault()
    signOut(auth).then(() => {
        // Sign-out successful.
        window.location.href = "http://localhost:5502/index.html?"
    }).catch((error) => {
        // An error happened.
        console.log(error);
    });
})

/**
 * SERVICES
 */


//Get MoviesList By User
async function getMoviesByUser(id_user) {
    const url = `https://playlist-creator-46da6-default-rtdb.europe-west1.firebasedatabase.app/users/${id_user}/movies_list.json`

    let data = await fetch(url, requestOptions)

    return data.json()
}

//DELETE, delete a movie from list in bd
async function deleteMovieFromList(id_user, id_movie) {
    const url = `https://playlist-creator-46da6-default-rtdb.europe-west1.firebasedatabase.app/users/${id_user}/movies_list/${id_movie}.json`

    let data = await fetch(url, {
        method: 'DELETE'
    })

    return data.status
}