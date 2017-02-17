const redis = require('redis')
const redisClient = redis.createClient()

module.exports =  {
	create: (segment) => {
		return new Promise((resolve, reject) => {
			incrementId().then((newId) => {
				const newSegmentId = "segment:" + newId
				segment.id = newSegmentId
				insertSegment(segment).catch((error) => {
					reject(error)
				})
				insertIntoSegmentIdsSet(newSegmentId).catch((error) => {
					reject(error)
				})
				insertIntoStartDateSet(segment.startDate, newSegmentId).catch((error) => {
					reject(error)
				})
				resolve(newSegmentId);
			})
		})
	},

	update: (segment) => {

	},

	getAllSegments: () => {
		return new Promise((resolve, reject) => {
			getActiveSegmentIds().then((segmentIds) => {
				const segmentPromises = []
				segmentIds.forEach((segmentId) => {
					segmentPromises.push( getSegmentForSegmentId(segmentId) )
				})
				const allSegments = []
				Promise.all(segmentPromises).then(segments => {
					allSegments.push(segments)
					resolve(allSegments)
				}).catch((error) => {
					reject(error)
				})
			}).catch((error) => {
				reject(error)
			})
		})	
	},

	getAllSegmentsByDateRange: (startDate, endDate) => {
		return new Promise((resolve, reject) => {
			getSegmentIdsByDateRange(startDate, endDate).then((segmentIds) => {
				const segmentPromises = []
				segmentIds.forEach((id) => {
					segmentPromises.push( getSegmentForSegmentId(id) )
				})
				const foundSegments = []
				Promise.all(segmentPromises).then((segments) => {
					foundSegments.push(segments)
					resolve(foundSegments)
				}).catch((error) => {
					reject(error)
				})
			}).catch((error) => {
				reject(error)
			})
		})
	},

	delete: (segmentId) => {
		return new Promise((resolve, reject) => {
			removeSegmentIdFromActiveSegmentsSet(segmentId).catch((error) => {
				reject(error)
			})
			removeSegmentIdFromStartDateSet(segmentId).catch((error) => {
				reject(error)
			})
		})
	}
}

/**
 * Read functions
 */

const getSegmentForSegmentId = (segmentId) => {
	return new Promise((resolve, reject) => {
		redisClient.hgetall(segmentId, (error, segment) => {
			if (error) {
				reject(error)
			}
			segment.id = segmentId
			resolve(segment)
		})
	})	
}

const getSegmentIdsByDateRange = (startDate, endDate) => {
	return new Promise((resolve, reject) => {
		redisClient.zrange("startDate", startDate,endDate, (error, segmentIds) => {
			if (error) {
				reject(error)
			}
			resolve(segmentIds)
		})
	})
}

const getActiveSegmentIds = () => {
	return new Promise((resolve, reject) => {
		redisClient.smembers("activeSegmentIds", (error, segmentIds) => {
			if (error) {
				reject(error)
			} else {
				resolve(segmentIds)
			}
		})
	})
}

/**
 * Create functions
 */

const incrementId = () => {
	return new Promise((resolve, reject) => {
		redisClient.incr("segmentId", (error, newId) => {
			if (error) {
				reject(error)
			} else {
				resolve(newId)
			}
		})
	})
}

const insertSegment = (segment) => {
	return new Promise((resolve, reject) => {
		redisClient.hmset(
			segment.id,
			"starDate", segment.startDate,
			"endDate", segment.endDate,
			"priority", segment.priority,
			(error, reply) => {
				if (error) {
					reject(error)
				} else {
					resolve(reply)
				}	
			})
	})								
}

const insertIntoSegmentIdsSet = (newSegmentId) => {
	return new Promise((resolve, reject) => {
		redisClient.sadd("activeSegmentIds", newSegmentId, (error, reply) => {
			if (error) {
				reject(error)
			} else {
				resolve(reply)
			}
		})
	})
}

const insertIntoStartDateSet = (startDate, segmentId) => {
	return new Promise((resolve, reject) => {
		redisClient.zadd("startDate", startDate, segmentId, (error, reply) => {
			if (error) {
				reject(error)
			} else {
				resolve(reply)
			}
		})
	})
}

/**
 * Delete function
 */

const removeSegmentIdFromActiveSegmentsSet = (segmentId) => {
	return new Promise((resolve, reject) => {
		redisClient.srem("activeSegmentIds", segmentId, (error, reply) => {
			if (error) {
				reject(error)
			} else {
				console.log(reply)
				resolve(reply)
			}
		})
	})
}

const removeSegmentIdFromStartDateSet = (segmentId) => {
	return new Promise((resolve, reject) => {
		redisClient.zrem("startDate", segmentId, (error, reply) => {
			if (error) {
				reject(error)
			} else {
				console.log(reply)
				resolve(reply)
			}
		})
	})
}