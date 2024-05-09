# Authentication

Simple JWT practice.

## TODO

- (Done) Register/Sign up
- (Done) Account activation
- (Done) Login/Sign in
- (Done) Logout/Sign out
- (Done) Forgot password + send email
- (Done) Reset password
- (Done) Remember me
- Update user details
- (Done) Refresh token
- (Done) Account disable

**NB.**

Token:

- Default Access Token: Expire in 3600 seconds (1 Hour).
- Remember me token will exire in 7 days.
- Refresh token will expire in 30 days.

Logout:

Something you should know about token-based authentication is that it is stateless. This means that even the server does not keep track of which users are authenticated, like with session-based authentication. As such, you do not need to do anything on the server side to "log out" a user. You simply need to delete the t\JWT token on the client. If you make a request to the server app, without a valid JWT token, it will be treated as the user is not logged in.

## Basic start

```bash
# Install NestJS
> nest new authentication

# Create auth module
> nest g module auth

# Create a controller
> nest g controller auth

# Create a service
> nest g service auth

```

Start development server

> npm run start:dev

## ESLintrc issue

add the code bellow into **.eslintrc.js** at **rules** area

> 'prettier/prettier': ['error', {'endOfLine': 'auto'}],

## Steps

- Create DTO
- Install JWT related packages

```bash
# Passport
npm i @nestjs/jwt @nestjs/passport passport passport-jwt passport-local
npm i -D @types/passport-jwt @types/passport-local

# For bcrypt
npm i bcrypt
npm i -D @types/bcrypt
```

- Create DTO
- Create Guard
- Create Strategy
- Install ConfigService

```bash
npm i --save @nestjs/config
```

- Database

```bash
npm i @nestjs/typeorm typeorm mysql2
```

## New Commands

```bash
# Generate resource
nest g resource <resource-name>
```

## Configure mailer

```bash
npm install --save @nestjs-modules/mailer nodemailer
npm install preview-email
```

To generate a random JWT secret key, you can use a tool like Node.js to create a random string. Here's a simple example:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# or,
node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
```

## Doc and tutorials

Logout & Refresh token tutorial: [Dev Influence](https://www.dev-influence.com/article/jwt-authentication-in-nestjs)

Documentation: [NestJS - Mailer](https://nest-modules.github.io/mailer/docs/mailer) and tutorial: [Youtube](https://www.youtube.com/watch?v=DAAxWEPCARo)

Thank you.
