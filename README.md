# Contestphyte

An app targeted towards small business owners and influencers that allows them to run online contests to boost brand awareness and engagement.

## Description

Contests (when ran correctly) can be a lucritive way for brands to grow awareness and gain new customers. By incentivizing participants to share the contests in social media sites and to their contacts in return for entries, a viral-like effect starts taking place, mobilizing your current following to spread the word on your campaign and business.

This concept of creating a viral-like contest where participants are incentivized to share is the basis of Contestphyte.

## Demo
-  [See the live demo](https://contestphyte-app.now.sh/home)

## API documentation
Authentication: All endpoints require the use of JWT tokens which are assigned at login.

### GET /api/contests/
Gets all contests owned by the user based off the JWT token.

### POST /api/contests/
Posts a new contest campaign with user in the JWT token listed as the production owner.

Request body must include:
- "owner_id": integer (references the id in api token)
- "is_active": true
- "company_name": string
- "company_url": string in url format
- "company_email": string in email address format
- "image_url": string in url format
- "contest_description": string
- "prize_value": integer
- "official_rules_url": string in url format
- "business_mailing_address": string
- "business_state": string of valid U.S. state written out (Ex: California)
- "business_zip_code": integer
- "end_datetime": datetime (Ex: 2020-06-12T19:30)

### GET /api/contests/public/landing/{contestId}
Publically accessible endpoint to get public details for a contest.

### GET /api/contests/{contestId}
Gets all details for a certain contest based off the contest id, accessible only by contest owner.

### PATCH /api/contests/{contestId}
Updates data for a certain contest, accessible only by contest owner.

### DELETE /api/contests/{contestId}
Deletes a contest, accessible only by contest owner.

### GET /api/participants/{contestId}
Gets all participants for the given contest id, accessible only by contest owner.

### GET /api/participants/contest/{participantId}
Gets data for a certain participant by participant id.

### POST /api/participants/new/{contestId}
Posts a new participant in a contest by contest id. 

Request body must include:
- "contest_id": integer for a contest id that is existing
- "first_name": string
- "last_name": string
- "email_address": string in email format

## Scripts
- Start application for development: `npm run dev`
- Run tests `npm test`

## Screenshots

Home
![home](https://github.com/maximus202/contestphyte-app/blob/master/public/home.png?raw=true)

Contests List
![contests](https://github.com/maximus202/contestphyte-app/blob/master/public/contests.png?raw=true)

Create New Contest
![createcontest](https://github.com/maximus202/contestphyte-app/blob/master/public/create-contest.png?raw=true)

Contest Profile
![contestprofile](https://github.com/maximus202/contestphyte-app/blob/master/public/contest-profile.png?raw=true)

Contest Campaign Landing Page
![contestlandingpage](https://github.com/maximus202/contestphyte-app/blob/master/public/contest-landing.png?raw=true)

Contest Post-Signup
![contestpostsignup](https://github.com/maximus202/contestphyte-app/blob/master/public/contest-thank-you.png?raw=true)

## Built With
- Node
- Express
- PostgreSQL

## Last updated
June 2, 2020.