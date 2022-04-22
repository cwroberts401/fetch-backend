# Fetch Rewards Back-end Application

## Setup

1. Fork / clone this repository.
1. Run `npm install`.

Use `npm start` to run the application.

Set the `API_BASE_URL` environment variable to the base url for the API.

If `API_BASE_URL` is not set, a default value of `http://localhost:5000` is used.

## Usage

GET /points
* response 200 (text/plain) returns an object with unique payers as keys and point totals as values

POST /points
* sending a POST request with a body as follows;

```md
    { PAYER: "EXAMPLE", POINTS: 200, TIMESTAMP: "2020-11-02T14:00:00Z" }
```
adds points to the database.
* response 200 (text/plain) returns an object 

PUT /points
* sending a PUT request with a body such as { POINTS: 200 }:
* response 200 (text/plain) returns an object detailing how many point were deducted from each payer