import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { AuthenticationError, ForbiddenError } from 'apollo-server'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

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
        }
    }
}

export default resolvers