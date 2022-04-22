# Fetch Rewards Back-end Application

A basic back-end application used to keep track of Fetch Rewards points. Built using Node.js and Express. 

&nbsp;

## Setup

1. Fork / clone this repository.
1. Run `npm install`.

Use `npm start` to run the application.

Set the `API_BASE_URL` environment variable to the base url for the API.

If `API_BASE_URL` is not set, a default value of `http://localhost:5000` is used.

&nbsp;

## Endpoints

### GET /points
Sending a GET request to `/points` endpoint should return an object where the keys are unique payers and values are their point totals.

expected response;
```md
    { "HONDA": 5000, "DANNON": 400 }
```
&nbsp;

### POST /points
Sending a POST request to `/point` endpoint adds a points entry to the points bank.

POST requests require the following fields:
- "payer" -- must be typeof "string"
- "points" -- must be typeof "number"
- "timestamp" -- must be a date string

format the POST request as follows;
```md
    { "payer": "EXAMPLE", "points": 200, "timestamp": "2020-11-02T14:00:00Z" }
```

expected response;
```md
    { "payer": "EXAMPLE", "points": 200 }
```
Points can also be negative value, but there must be enough payer points already in bank. No payer can hold a negative point value

&nbsp;

### PUT /points
sending a PUT request to `/points` endpoint deducts points from the points bank:

format the PUT request as follows;
```md
    { "points": 800 }
```

expected response;
```md
    [
        { "payer": "HONDA", "points" -600 },
        { "payer": "DANNON", "points" -200 }
    ]
```
Points are deducted in the order based on timestamp, oldest to newest. Single payers point values can never be negative. 

&nbsp;

## Testing
Use `npm test` to run the tests.