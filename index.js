const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql');

const app = express();

const directors = [
    { id: 1, name: 'Christopher Nolan' },
    { id: 2, name: 'Quentin Tarantino' },
    { id: 3, name: 'Hayao Miyazaki' }
];

const movies = [
    { id: 1, name: 'Inception', directorId: 1 },
    { id: 2, name: 'The Dark Knight', directorId: 1 },
    { id: 3, name: 'Pulp Fiction', directorId: 2 },
    { id: 4, name: 'Kill Bill: Vol. 1', directorId: 2 },
    { id: 5, name: 'Spirited Away', directorId: 3 },
    { id: 6, name: 'My Neighbor Totoro', directorId: 3 }
];

const moviesType = new GraphQLObjectType({
    name: 'Movie',
    description: 'This represents a movie directed by a director',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        director: {
            type: directorType,
            resolve: (movie) => {
                return directors.find(director => director.id === movie.directorId)
            }
        }
    })
});

const directorType = new GraphQLObjectType({
    name: 'Director',
    description: 'This represents a director of a movie',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        movies: {
            type: new GraphQLList(moviesType),
            resolve: (director) => {
                return movies.filter(movie => movie.directorId === director.id)
            }
        }
    })
});

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        movie: {
            type: moviesType,
            description: 'A Single Movie',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => movies.find(movie => movie.id === args.id)
        },
        movies: {
            type: new GraphQLList(moviesType),
            description: 'List of All Movies',
            resolve: () => movies
        },
        director: {
            type: directorType,
            description: 'A Single Director',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => directors.find(director => director.id === args.id)
        },
        directors: {
            type: new GraphQLList(directorType),
            description: 'List of All Directors',
            resolve: () => directors
        }
    })
});

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addMovie: {
            type: moviesType,
            description: 'Add a movie',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                directorId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const movie = { id: movies.length + 1, name: args.name, directorId: args.directorId }
                movies.push(movie)
                return movie
            }
        },
        addDirector: {
            type: directorType,
            description: 'Add a director',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                const director = { id: directors.length + 1, name: args.name }
                directors.push(director)
                return director
            }
        },

        updateMovie: {
            type: moviesType,
            description: 'Update a movie',
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) },
                name: { type: GraphQLString },
                directorId: { type: GraphQLInt }               
            },
            resolve: (parent, args) => {
                const { id, name, directorId } = args;
                const movieIndex = movies.findIndex(movie => movie.id === id);

                if (movieIndex !== -1) {
                    if (name) {
                        movies[movieIndex].name = name;
                    }
                    if (directorId) {
                        movies[movieIndex].directorId = directorId;
                    }
                    return movies[movieIndex];
                }
                return null;
            }            
        },

        updateDirector: {
            type: directorType,
            description: 'Update a director',
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) },
                name: { type: GraphQLString }
             
            },
            resolve: (parent, args) => {
                const { id, name } = args;
                const directorIndex = directors.findIndex(director => director.id === id);

                if (directorIndex !== -1) {
                    if (name) {
                        directors[directorIndex].name = name;
                    }
                    return directors[directorIndex];
                }
                return null; 
            }
        },

        deleteMovie: {
            type: GraphQLString,
            description: 'Delete a movie by ID',
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const movieIndex = movies.findIndex(movie => movie.id === args.id);

                if (movieIndex !== -1) {
                    movies.splice(movieIndex, 1);
                    return `Movie with ID ${args.id} has been deleted.`;
                }
                return `Movie with ID ${args.id} not found.`;
            }
        },

        deleteDirector: {
            type: GraphQLString,
            description: 'Delete a director by ID',
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const directorIndex = directors.findIndex(director => director.id === args.id);

                if (directorIndex !== -1) {
                    directors.splice(directorIndex, 1);
                    return `Director with ID ${args.id} has been deleted.`;
                }
                return `Director with ID ${args.id} not found.`;
            }
        }
    })
});



const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
});

app.use('/graphql', graphqlHTTP({
    graphiql: true,
    schema: schema
}));

app.listen(5000, () => console.log('Server running'));
