import { gql } from 'apollo-server'

const typeDefs = gql`
    type Query {
        users: [User]
        messagesByUser(receiverId:String!): [Message]
    }

    input UserInput{
        firstName: String!
        lastName: String!
        email: String!
        password: String!
    }
    input UserSignInInput{
        email: String!
        password: String!
    }

    type Token {
        token: String!
    }

    scalar Date

    type Message {
        id: ID!
        text: String!
        receiverId: String!
        senderId: String!
        createdAt: Date!
    }

    type Mutation {
        signUpUser(newUser: UserInput!): User
        signInUser(userSignIn: UserSignInInput!): Token
        createMessage(receiverId:String!,text:String!): Message
    }

    type User {
        id: ID!
        firstName: String!
        lastName: String!
        email: String!
    }
`

export default typeDefs