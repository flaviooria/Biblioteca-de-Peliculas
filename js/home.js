import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"

import {
    getDatabase,
    ref,
    set
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js"

import {
    User
} from "./models/user.js";

import {
    Movie
} from "./models/movie.js";

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
const database = getDatabase(app)

//Configuración de firebase
const auth = getAuth(app)

//Variables DOM
const $ = (value) => document.querySelector(value)

const logout = $('.btn-logout')
const btn_search = $('#btn-search')
const url_pre_img = 'https://www.themoviedb.org/t/p/w600_and_h900_bestv2'

let input_search = $('#input_search')
let list_of_movies = []
let all_movies = []
let container_cards = $('.container-movies')
let menu_genre = $('.menu-genres')
let new_user = {}


const requestOptions = {
    method: 'GET',
    redirect: 'follow',
};



//Functions Evenets

//Evento que siempre esta escuchando si hay un usuario logeado, o sin loguear
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // The user object has basic properties such as display name, email, etc.
        const displayName = user.displayName;
        const email = user.email;
        const photoURL = user.photoURL;
        const uid = user.uid;

        new_user = new User(uid, displayName, email, photoURL)

        let user_get = await getUser(uid)

        if (user_get == null) {
            await writeUserData(new_user.id, new_user.name, new_user.email, new_user.id)
            let user_get = await getUser(uid)
            new_user = new User(user_get.id, user_get.username, user_get.email)
        }

    } else {
        console.log('Cerrando Sesión');
    }
});

//Funcion para cerrar sesión
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

function cleanMovies() {
    container_cards.innerHTML = ''
    all_movies = []
    list_of_movies = []
}


btn_search.addEventListener('click', async (e) => {
    e.preventDefault()
    cleanMovies()

    let target = e.target
    let input = target.parentElement

    //Aqui capturamos el valord del input
    let data = input.children[0].value

    if (data != '') {
        const {
            results
        } = await getMovieByTitle(data)

        let url_img = ''
        //Esta variable me servira por si de la api no tiene poster y la reemplazo con esta
        const placeholder = 'https://paperetsdecolorets.es/wp-content/uploads/2019/10/placeholder.png'

        results.forEach(movie => {
            const {
                id,
                title,
                vote_average,
                poster_path,
                overview
            } = movie

            if (poster_path != null) {
                url_img = url_pre_img + poster_path
            } else {
                url_img = placeholder
            }

            list_of_movies.push(new Movie(id, title, url_img, vote_average, overview))
        });

        all_movies = [...list_of_movies]

        container_cards.innerHTML = ''

        all_movies.forEach(item => {
            //Iremos construyendo las cartas con las peliculas que tengamos
            const {
                id,
                title,
                poster,
                raiting,
                description
            } = item

            container_cards.innerHTML += `
            <div class="card" id="${id}">
            <img class="card-img-top poster"
              src="${poster}"
              alt="Card image cap">
              <div class="card-header title">
                ${title}
              </div>
            <div class="card-body">
              <h5 class="card-subtitle">${description || 'Sin descripción'}</h5>
              <p class="card-text">Valoración: ${raiting}</p>
              <a href="#" class="btn btn-primary" >Añadir a favoritos</a>
            </div>
          </div>
            `
        })

        let card = document.querySelectorAll('.card')

        let get_cards = Array.from(card)

        get_cards.forEach(item => {
            //Este es un evento y realizamos propagación de los elementos!!! 
            //De esta forma, lo que haremos es obtener la id de la pelicula seleccionada 
            item.addEventListener('click', async (e) => {
                let target = e.target

                let button = target.closest('a.btn')

                if (button) {
                    let card = target.closest('div.card')

                    if (card) {
                        let id_movie = card.getAttribute('id')
                        let movie = await getMovieById(id_movie)

                        if (movie) {
                            let url_img = ''
                            const placeholder = 'https://paperetsdecolorets.es/wp-content/uploads/2019/10/placeholder.png'

                            const {
                                id,
                                title,
                                vote_average,
                                poster_path,
                                overview
                            } = movie

                            if (poster_path != null) {
                                url_img = url_pre_img + poster_path
                            } else {
                                url_img = placeholder
                            }

                            //Obtengo la pelicula y luego la inserto en la base de datos 
                            let movie_obtenida = new Movie(id, title, url_img, vote_average, overview)
                            let response = await insertMovieInFavorites(movie_obtenida, new_user.id);

                            if (response) {
                                alert('Pelicula insertada')
                            }
                        }
                    }
                }
            })
        })
    }

})

input_search.addEventListener('input', async (e) => {
    e.preventDefault()
    cleanMovies()
    let value = input_search.value

    if (value == '') {
        //Si el valor del campo de busqueda esta vacio se resetea todo
        cleanMovies()
    }

    if (value.length >= 3) { //Aquí realizamos la busqueda dinamica
        //Obtengo las peliculas según la busqueda
        const {
            results
        } = await getMovieByTitle(value)

        let url_img = ''
        //Esta variable me servira por si de la api no tiene poster y la reemplazo con esta
        const placeholder = 'https://paperetsdecolorets.es/wp-content/uploads/2019/10/placeholder.png'

        results.forEach(movie => {
            const {
                id,
                title,
                vote_average,
                poster_path,
                overview
            } = movie

            if (poster_path != null) {
                url_img = url_pre_img + poster_path
            } else {
                url_img = placeholder
            }

            list_of_movies.push(new Movie(id, title, url_img, vote_average, overview))
        });

        //Obtenemos solo las primeras 30 peliculas que coincidan
        all_movies = list_of_movies.slice(0, 30)

        container_cards.innerHTML = ''

        all_movies.forEach(item => {
            //Iremos construyendo las cartas con las peliculas que tengamos
            const {
                id,
                title,
                poster,
                raiting,
                description
            } = item

            container_cards.innerHTML += `
            <div class="card" id="${id}">
            <img class="card-img-top poster"
              src="${poster}"
              alt="Card image cap">
              <div class="card-header title">
                ${title}
              </div>
            <div class="card-body">
              <h5 class="card-subtitle">${description || 'Sin descripción'}</h5>
              <p class="card-text">Valoración: ${raiting}</p>
              <a href="#" class="btn btn-primary" >Añadir a favoritos</a>
            </div>
          </div>
            `
        })

        let card = document.querySelectorAll('.card')

        let get_cards = Array.from(card)

        get_cards.forEach(item => {
            //Este es un evento y realizamos propagación de los elementos!!! 
            //De esta forma, lo que haremos es obtener la id de la pelicula seleccionada 
            item.addEventListener('click', async (e) => {
                let target = e.target

                let button = target.closest('a.btn')

                if (button) {
                    let card = target.closest('div.card')

                    if (card) {
                        let id_movie = card.getAttribute('id')
                        let movie = await getMovieById(id_movie)

                        if (movie) {
                            let url_img = ''
                            const placeholder = 'https://paperetsdecolorets.es/wp-content/uploads/2019/10/placeholder.png'

                            const {
                                id,
                                title,
                                vote_average,
                                poster_path,
                                overview
                            } = movie

                            if (poster_path != null) {
                                url_img = url_pre_img + poster_path
                            } else {
                                url_img = placeholder
                            }

                            //Obtengo la pelicula y luego la inserto en la base de datos 
                            let movie_obtenida = new Movie(id, title, url_img, vote_average, overview)
                            let response = await insertMovieInFavorites(movie_obtenida, new_user.id);

                            if (response) {
                                alert('Pelicula insertada')
                            }
                        }
                    }
                }
            })
        })

    }
})

window.addEventListener('load', async (e) => {

    let data = await getGeneresMovies()
    const {
        genres
    } = data
    for (const {
            id,
            name
        } of genres) {
        menu_genre.innerHTML += `
        <option class="genre-option" value="${id}">${name}</option>
        `
    }
})

menu_genre.addEventListener('change', async (e) => {
    const id_genre = e.target.value
    if (id_genre != '-1') {
        const {
            results
        } = await getMoviesByFilterGenre(id_genre)

        cleanMovies()

        let url_img = ''
        //Esta variable me servira por si de la api no tiene poster y la reemplazo con esta
        const placeholder = 'https://paperetsdecolorets.es/wp-content/uploads/2019/10/placeholder.png'



        results.forEach(movie => {
            const {
                id,
                title,
                vote_average,
                poster_path,
                overview
            } = movie

            if (poster_path != null) {
                url_img = url_pre_img + poster_path
            } else {
                url_img = placeholder
            }

            list_of_movies.push(new Movie(id, title, url_img, vote_average, overview))
        });


        all_movies = [...list_of_movies]

        container_cards.innerHTML = ''

        all_movies.forEach(item => {
            //Iremos construyendo las cartas con las peliculas que tengamos
            const {
                id,
                title,
                poster,
                raiting,
                description
            } = item

            container_cards.innerHTML += `
            <div class="card" id="${id}">
            <img class="card-img-top poster"
              src="${poster}"
              alt="Card image cap">
              <div class="card-header title">
                ${title}
              </div>
            <div class="card-body">
              <h5 class="card-subtitle">${description || 'Sin descripción'}</h5>
              <p class="card-text">Valoración: ${raiting}</p>
              <a href="#" class="btn btn-primary" >Añadir a favoritos</a>
            </div>
          </div>
            `
        })

        let card = document.querySelectorAll('.card')

        let get_cards = Array.from(card)

        get_cards.forEach(item => {
            //Este es un evento y realizamos propagación de los elementos!!! 
            //De esta forma, lo que haremos es obtener la id de la pelicula seleccionada 
            item.addEventListener('click', async (e) => {
                let target = e.target

                let button = target.closest('a.btn')

                if (button) {
                    let card = target.closest('div.card')

                    if (card) {
                        let id_movie = card.getAttribute('id')
                        let movie = await getMovieById(id_movie)

                        if (movie) {
                            let url_img = ''
                            const placeholder = 'https://paperetsdecolorets.es/wp-content/uploads/2019/10/placeholder.png'

                            const {
                                id,
                                title,
                                vote_average,
                                poster_path,
                                overview
                            } = movie

                            if (poster_path != null) {
                                url_img = url_pre_img + poster_path
                            } else {
                                url_img = placeholder
                            }

                            //Obtengo la pelicula y luego la inserto en la base de datos 
                            let movie_obtenida = new Movie(id, title, url_img, vote_average, overview)
                            let response = await insertMovieInFavorites(movie_obtenida, new_user.id);

                            if (response) {
                                alert('Pelicula insertada')
                            }
                        }
                    }
                }
            })
        })
    }
})



/* 
 * SERVICES
 **/

//GET movies filter by genre
async function getMoviesByFilterGenre(id_genre) {
    const data = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=06069c8357d1fbce87e5f4ca6c1cf844&with_genres=${id_genre}&include_adult=false&language=es-Es`, requestOptions)

    return data.json()

}

//GET user by id
async function getUser(id_user) {

    const data = await fetch('https://playlist-creator-46da6-default-rtdb.europe-west1.firebasedatabase.app/users/' + id_user + '.json', requestOptions)

    return data.json()
}

//GET list option by genres

async function getGeneresMovies() {
    const data = await fetch("https://api.themoviedb.org/3/genre/movie/list?api_key=06069c8357d1fbce87e5f4ca6c1cf844&language=es-ES", requestOptions)

    return data.json()
}

//GET movies by title
async function getMovieByTitle(title) {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=06069c8357d1fbce87e5f4ca6c1cf844&query=${title}&language=es-ES&total_results=10`

    const data = await fetch(url, requestOptions)

    return data.json()

}

//POST Movie in list of favorites
async function insertMovieInFavorites(movieObject, id_user) {
    const url = `https://playlist-creator-46da6-default-rtdb.europe-west1.firebasedatabase.app/users/${id_user}/movies_list.json`

    const data = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(movieObject),

    })

    return data.json()
}

//GET movie by id
async function getMovieById(id_movie) {
    const url = `http://api.themoviedb.org/3/movie/${id_movie}?api_key=06069c8357d1fbce87e5f4ca6c1cf844&language=es-ES`

    const data = await fetch(url, requestOptions)

    return data.json()
}

//POST create user into db in firebase
async function writeUserData(userId, name, email, password) {
    await set(ref(database, 'users/' + userId), {
        username: name,
        email,
        password
    });

}