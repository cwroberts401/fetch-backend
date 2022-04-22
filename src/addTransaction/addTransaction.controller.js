const path = require('path');
const pts = require(path.resolve('src/data/points-data'));

/**
 * Returns an object where point totals are grouped by payer.
 * @param {array} entries array of point objects.
 * @param {date string} beforeDate optionl string to count only entries before specficed date.
 * @returns {object} key is payer and value is point total.
 */
function groupPointsByPayer(entries, beforeDate) {
	let ans = {};
	let entriesBeforeDate = entries;
	if (beforeDate) {
		entriesBeforeDate = entries.filter((e) => e.timestamp < beforeDate);
	}
	entriesBeforeDate.forEach((obj) => {
		ans[obj.payer] = (ans[obj.payer] || 0) + obj.points;
	});
	return ans;
}

function list(req, res) {
	res.status(200).json({ data: groupPointsByPayer(pts) });
}

function payerValueOk(req, res, next) {
	let { data: { payer } = {} } = req.body;

	if (!payer) {
		return next({
			status: 400,
			message: `Must include a payer value`
		});
	}

	if (typeof payer !== 'string') {
		return next({
			status: 400,
			message: `Payer value must be a string`
		});
	}
	next();
}

function pointsValueOk(req, res, next) {
	let { data: { points } = {} } = req.body;

	if (!points) {
		return next({
			status: 400,
			message: `Must include a points value`
		});
	}

	if (typeof points !== 'number') {
		return next({
			status: 400,
			message: `Points value must be a number`
		});
	}
	next();
}

function timestampValueOk(req, res, next) {
	let { data: { timestamp } = {} } = req.body;

	if (!timestamp) {
		return next({
			status: 400,
			message: `Must include a timestamp value`
		});
	}

	if (isNaN(Date.parse(timestamp))) {
		return next({
			status: 400,
			message: `Timestamp value must be a date`
		});
	}
	next();
}

function allData(req, res) {
	res.status(200).json({ data: pts });
}

function add(req, res, next) {
	let { data: { payer, points, timestamp } = {} } = req.body;
	const addPts = {
		payer,
		points,
		timestamp
	};
	const displayPoints = {
		payer,
		points
	};
	if (points < 0) {
		let found = pts.find((e) => e.payer === payer);
		while (points !== 0) {
			console.log(found);
			if (found.points < points) {
				points += found.points;
				found.points = 0;
			} else {
				found.points += points;
				points = 0;
			}
		}
	} else {
		pts.push(addPts);
		pts.sort((a, b) => {
			return a.timestamp.localeCompare(b.timestamp);
		});
	}

	res.status(201).json({ data: displayPoints });
}

function enoughPts(req, res, next) {
	let { data: { points, payer, timestamp } = {} } = req.body;

	if (req.method === 'POST') {
		if (points < 0) {
			const total = groupPointsByPayer(pts, timestamp);
			if (!total[payer] || total[payer] < Math.abs(points)) {
				return next({
					status: 400,
					message: `Not enough points to complete transaction. ${payer} only has ${total[payer] ||
						0} points available.`
				});
			}
		}
		next();
	} else {
		let totalPts = 0;
		pts.forEach((e) => (totalPts += e.points));
		if (totalPts < Math.abs(points)) {
			return next({
				status: 400,
				message: `Not enough points to complete transaction. ${totalPts} available.`
			});
		}
		next();
	}
}

function subtract(req, res) {
	let { data: { points } = {} } = req.body;
	const ptsDeducted = [];

	let i = 0;
	while (points !== 0) {
		if (pts[i].points < points) {
			points -= pts[i].points;
			ptsDeducted.push({ payer: pts[i].payer, points: -Math.abs(pts[i].points) });
			pts[i].points = 0;
		} else {
			ptsDeducted.push({ payer: pts[i].payer, points: -Math.abs(points) });
			pts[i].points -= points;
			points = 0;
		}
		i++;
	}

	res.status(201).json({ data: ptsDeducted });
}

module.exports = {
	list,
	add: [ payerValueOk, pointsValueOk, timestampValueOk, enoughPts, add ],
	allData,
	subtract: [ pointsValueOk, enoughPts, subtract ]
};