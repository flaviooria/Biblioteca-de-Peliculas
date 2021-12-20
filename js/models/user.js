class User {
    constructor(id,name,email, photoURL = '', movies = []) {
        this.id = id
        this.name = name
        this.movielist = movies
        this.email = email
        this.photoURL = photoURL
    }

    getAllMovieList() {
        return this.movielist
    }

    addMovie(movie) {
       this.movielist.add(movie)
    }
}

export { User };