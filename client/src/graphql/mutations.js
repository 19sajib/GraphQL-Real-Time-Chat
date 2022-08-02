import {gql} from '@apollo/client'

export const SIGNUP_USER = gql `
mutation SignUpUser($newUser: UserInput!) {
  signUpUser(newUser: $newUser) {
    firstName
    lastName
    email
    id
  }
}
`
export const LOGIN_USER = gql `
mutation SignInUser($userSignIn: UserSignInInput!) {
  signInUser(userSignIn: $userSignIn) {
    token
  }
}
`