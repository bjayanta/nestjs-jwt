# Authentication

Simple JWT practice.

## TODO

- (Done) Register/Sign up
- Account activation
- (Done) Login/Sign in
- (Done) Forgot password + send email
- Reset password
- Remember me
- Account delete

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

Documentation: [NestJS - Mailer](https://nest-modules.github.io/mailer/docs/mailer)
Tutorial: [Youtube](https://www.youtube.com/watch?v=DAAxWEPCARo)

Thank you.
