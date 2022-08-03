import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { AuthenticationError, ForbiddenError } from 'apollo-server'
import jwt from 'jsonwebtoken'
import {PubSub} from 'graphql-subscriptions'


const pubsub = new PubSub()
const prisma = new PrismaClient()

const MESSAGE_ADDED = 'MESSAGE_ADDED'

const resolvers = {
    Query: {
        users: async (_,args,{userId}) => {
            if(!userId) throw new ForbiddenError('Action forbidden')
            const users = await prisma.user.findMany({
                orderBy: {
                    createdAt:"desc"
                },
                where: {
                    id: {
                        not: userId
                    }
                }
            })
            return users
        },
        messagesByUser: async (_,{receiverId},{userId}) => {
            if(!userId) throw new ForbiddenError('Action forbidden')
            const messages = await prisma.message.findMany({
                where:{
                    OR: [
                        {
                            senderId: userId,
                            receiverId: receiverId
                        },
                        {
                            senderId: receiverId,
                            receiverId: userId
                        }
                    ]
                },
                orderBy:{
                    createdAt: "asc"
                }
            })
            return messages
        }
    },

    Mutation: {
        signUpUser: async (_, {newUser}) =>{
            const uniqueUser = await prisma.user.findUnique({where:{email:newUser.email}})
            if(uniqueUser) throw new AuthenticationError('User already exists with that email.')
            const hashedPassword = await bcrypt.hash(newUser.password,10)
            const user = await prisma.user.create({
                data: {
                 ...newUser,
                 password: hashedPassword   
                }
            })
            return user
        },
        signInUser: async (_, {userSignIn}) => {
            const user = await prisma.user.findUnique({where:{email:userSignIn.email}})
            if(!user) throw new AuthenticationError('User does not exists with this email!')
            const passMatch = await bcrypt.compare(userSignIn.password, user.password)
            if(!passMatch) throw new AuthenticationError('Email or password mismatch!')

            const token = jwt.sign({userId:user.id}, process.env.JWT_SECRET)
            return {token}
        },
        createMessage: async(_,{receiverId, text},{userId})=> {
            if(!userId) throw new ForbiddenError('Action forbidden')
            const message = await prisma.message.create({
                data:{
                    text,
                    receiverId,
                    senderId: userId
                }
            })

            pubsub.publish(MESSAGE_ADDED,{messageAdded: message})
            
            return message
        }
    },

    Subscription:{
        messageAdded:{
            subscribe: () => pubsub.asyncIterator(MESSAGE_ADDED)
        } 
    }
}

export default resolvers