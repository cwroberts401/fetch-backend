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
```md
    { "HONDA": 5000, "DANNON": 400 }
```

POST /points
* sending a POST request with a body as follows;

```md
    { "payer": "EXAMPLE", "points": 200, "timestamp": "2020-11-02T14:00:00Z" }
```
adds points to the database.

* expected response to a valid request is;
201 (created)

```md
    { "payer": "EXAMPLE", "points": 200 }
```

PUT /points
* sending a PUT request with a body such as { POINTS: 200 }:
```md
    { "points": 800 }
```

* response 200 (text/plain) returns an object detailing how many point were deducted from each payer
```md
    [
        { "payer": "HONDA", "points" -600 },
        { "payer": "DANNON", "points" -200 }
    ]