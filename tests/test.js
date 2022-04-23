const request = require('supertest');
const pts = require('../src/data/points-data');
const pointsRouter = require('../src/points/points.router');
const makeTestApp = require('./make-test-app');
const { expect } = require('@jest/globals');

const ATTACHED_PATH = '/points';

const app = makeTestApp(ATTACHED_PATH, pointsRouter);

describe('add transaction route', () => {
	test('adds transaction', async () => {
		const response = await request(app).post(ATTACHED_PATH).set('Accept', 'application/json').send({
			data: {
				payer: 'DANNON',
				points: 300,
				timestamp: '2020-10-31T10:00:00Z'
			}
		});

		expect(response.body.error).toBeUndefined();
		expect(response.body.data).not.toBeUndefined();
		expect(response.body.data.payer).toEqual('DANNON');
		expect(response.body.data.points).toEqual(300);
		expect(response.status).toBe(201);
	});

	test('Validates payer string', async () => {
		const response = await request(app).post(ATTACHED_PATH).set('Accept', 'application/json').send({
			data: {
				payer: 100,
				points: 100,
				timestamp: '2020-10-31T10:00:00Z'
			}
		});
		const responseTwo = await request(app).post(ATTACHED_PATH).set('Accept', 'application/json').send({
			data: {
				points: 100,
				timestamp: '2020-10-31T10:00:00Z'
			}
		});

		expect(response.body.error).toContain('Payer value must be a string');
		expect(responseTwo.body.error).toContain('Must include a payer value');
		expect(response.status).toBe(400);
		expect(responseTwo.status).toBe(400);
	});

	test('Validates timestamp', async () => {
		const response = await request(app).post(ATTACHED_PATH).set('Accept', 'application/json').send({
			data: {
				payer: 'TEST',
				points: 100,
				timestamp: 'not a timestamp'
			}
		});
		const responseTwo = await request(app).post(ATTACHED_PATH).set('Accept', 'application/json').send({
			data: {
				payer: 'TEST',
				points: 100
			}
		});

		expect(response.body.error).toContain('Timestamp value must be a date');
		expect(responseTwo.body.error).toContain('Must include a timestamp value');
		expect(response.status).toBe(400);
		expect(responseTwo.status).toBe(400);
	});

	test('adds transaction with different payer', async () => {
		const response = await request(app).post(ATTACHED_PATH).set('Accept', 'application/json').send({
			data: {
				payer: 'MILLER COORS',
				points: 10000,
				timestamp: '2020-11-01T14:00:00Z'
			}
		});

		expect(response.body.error).toBeUndefined();
		expect(response.body.data).not.toBeUndefined();
		expect(response.body.data.payer).toEqual('MILLER COORS');
		expect(response.body.data.points).toEqual(10000);
		expect(response.status).toBe(201);
	});

	test("doesn't allow negative transaction if timestamp is earlier than positive transactions", async () => {
		const response = await request(app).post(ATTACHED_PATH).set('Accept', 'application/json').send({
			data: {
				payer: 'DANNON',
				points: -200,
				timestamp: '2019-10-31T10:00:00Z'
			}
		});

		expect(response.body.error).toContain('Not enough points');
		expect(response.status).toBe(400);
	});

	test('adds transaction with negative points', async () => {
		const response = await request(app).post(ATTACHED_PATH).set('Accept', 'application/json').send({
			data: {
				payer: 'DANNON',
				points: -200,
				timestamp: '2020-10-31T15:00:00Z'
			}
		});

		expect(response.body.error).toBeUndefined();
		expect(response.body.data).not.toBeUndefined();
		expect(response.body.data.payer).toEqual('DANNON');
		expect(response.body.data.points).toEqual(-200);
		expect(response.status).toBe(201);
	});

	test("doesn't allow payers points to go negative", async () => {
		const response = await request(app).post(ATTACHED_PATH).set('Accept', 'application/json').send({
			data: {
				payer: 'DANNON',
				points: -400,
				timestamp: '2020-10-31T15:00:00Z'
			}
		});

		expect(response.body.error).toContain('Not enough points');
		expect(response.status).toBe(400);
	});

	test('adds multiple transactions', async () => {
		const response = await request(app).post(ATTACHED_PATH).set('Accept', 'application/json').send({
			data: {
				payer: 'UNILEVER',
				points: 200,
				timestamp: '2020-10-31T11:00:00Z'
			}
		});
		const responseTwo = await request(app).post(ATTACHED_PATH).set('Accept', 'application/json').send({
			data: {
				payer: 'DANNON',
				points: 1000,
				timestamp: '2020-11-02T14:00:00Z'
			}
		});

		expect(response.status).toBe(201);
		expect(pts.length).toEqual(4);
	});
});

describe('spend points route', () => {
	test('does not deduct points when request is greater than available points', async () => {
		const response = await request(app).put(ATTACHED_PATH).set('Accept', 'application/json').send({
			data: {
				points: 100000
			}
		});

		expect(response.body.error).toContain('Not enough points');
		expect(response.status).toBe(400);
	});

	test('Validates points value', async () => {
		const response = await request(app).post(ATTACHED_PATH).set('Accept', 'application/json').send({
			data: {
				payer: 'TEST',
				points: 'one hundred',
				timestamp: '2020-10-31T10:00:00Z'
			}
		});
		const responseTwo = await request(app).post(ATTACHED_PATH).set('Accept', 'application/json').send({
			data: {
				payer: 'TEST',
				timestamp: '2020-10-31T10:00:00Z'
			}
		});

		expect(response.body.error).toContain('Points value must be a number');
		expect(responseTwo.body.error).toContain('Must include a points value');
		expect(response.status).toBe(400);
		expect(responseTwo.status).toBe(400);
	});

	test('deducts points', async () => {
		const response = await request(app).put(ATTACHED_PATH).set('Accept', 'application/json').send({
			data: {
				points: 5000
			}
		});

		expect(response.body.error).toBeUndefined();
		expect(response.body.data).not.toBeUndefined();
		console.log(response.body.data);
		expect(response.body.data[0].payer).toEqual('DANNON');
		expect(response.body.data[0].points).toEqual(-100);
		expect(response.body.data[1].payer).toEqual('UNILEVER');
		expect(response.body.data[1].points).toEqual(-200);
		expect(response.body.data[2].payer).toEqual('MILLER COORS');
		expect(response.body.data[2].points).toEqual(-4700);
		expect(response.body.timestamp).toBeUndefined();
		expect(response.status).toBe(201);
	});
});

describe('points balance route', () => {
	test('displays correct point totals', async () => {
		const response = await request(app).get(ATTACHED_PATH).set('Accept', 'application/json');

		expect(response.body.error).toBeUndefined();
		expect(response.body.data.DANNON).toEqual(1000);
		expect(response.body.data.UNILEVER).toEqual(0);
		expect(response.body.data['MILLER COORS']).toEqual(5300);
		console.log(response.body.data);
		expect(response.status).toBe(200);
	});
});
