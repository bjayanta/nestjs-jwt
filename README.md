# Authentication

Simple JWT practice.

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
npm i @nestjs/jwt @nestjs/passport passport passport-jwt passport-local

npm i -D @types/passport-jwt @types/passport-local
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

Thank you.
