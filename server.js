// use 'npm run devStart' to start server


const express = require('express')
// const expressGraphQL = require('express-graphql')
const {graphqlHTTP} = require("express-graphql");
const{
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInterfaceType,
    GraphQLList,
    GraphQLNonNull,
    GraphQLInt,
} = require('graphql')

const app = express()

//data
const clients = [
    {id: 1, name: 'John Doe'},
    {id: 2, name: 'Jenny Shook'},
    {id: 3, name: 'Flan Driller'}
]

const items = [
    {id: 1, name: 'Compass', ownerId: 1},
    {id: 2, name: 'Lantern', ownerId: 1},
    {id: 3, name: 'Pickaxe', ownerId: 1},
    {id: 4, name: 'Gun', ownerId: 2},
    {id: 5, name: 'Map', ownerId: 2},
    {id: 6, name: 'Goggles', ownerId: 2},
    {id: 7, name: 'Watch', ownerId: 3}
]

// defining an item type which can be used to represent raw data using GraphQL
const ItemType = new GraphQLObjectType({
    name: 'Item',
    description: 'Item owned by an owner',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        ownerId: {type: GraphQLNonNull(GraphQLInt)},
        owner: {
            type: OwnerType,
            resolve: (item) => {
                return clients.find(owner => owner.id === item.ownerId)
            }
        }
    })
})

// defining an owner type 
const OwnerType = new GraphQLObjectType({
    name: 'Owner',
    description: 'This represents an owner of an item',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        items: {
            type: GraphQLList(ItemType),
            resolve: (client) => {
                return items.filter(item => item.ownerId === client.id)
            }
        }

    })
})




//defining the format of first query u see when u open localport
const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        item:{
            type: ItemType, 
            description: 'A single item',
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => items.find(book => book.id === args.id) // basically acts as a return function of the fields, this is what lets you see the defined field types on the localhost

        },
        items: {
            type: new GraphQLList(ItemType), // basically a list of all the items where each element of a custom defined object type; "ItemType"
            description: 'List of All Items',
            resolve: () => items // basically acts as a return function of the fields, this is what lets you see the defined field types on the localhost

        },
        clients: {
            type: new GraphQLList(OwnerType), 
            description: 'List of all clients',
            resolve: () => clients 
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addItem: {
            type: ItemType,
            description: 'Add an Item',
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                ownerId: {type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const item = {id: items.length + 1, name: args.name, ownerId: args.ownerId}
                items.push(item)
                return item
            }   
        }
     })
    
})

// A schema in graphQL is a description of the data clients can request from the rawdata.
const schema = new GraphQLSchema ({
    query: RootQueryType,
    mutation: RootMutationType
})
app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}))
app.listen(5000., () => console.log('Server Running'))