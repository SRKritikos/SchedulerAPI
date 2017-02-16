const redis = require('redis')
const redisClient = redis.createClient()

module.exports =  {

	create: (segment) => {
		return new Promise((resolve, reject) => {
			redisClient.incr("id", (error, newId) => {
				id = newId
				redisClient.hmset("segments:" + newId,
													"starDate", segment.startDate,
													"endDate", segment.endDate,
													"priority", segment.priority,
													(error, reply) => {
					if (error) {
						throw Error(error)
					}
				})
				redisClient.zadd("startDate", segment.startDate, newId)
				resolve(newId);
			})
		})
	},

	update: (segment) => {

	},

	getAllSegments: () => {
		return new Promise((resolve, reject) => {
			let segmentKeys = scanSegmentKeys(0)
			segmentKeys.then((keys) => {
				let segmentPromises = []
				keys.forEach((key) => {
					segmentPromises.push(getSegmentForKey(key))
				})
				let allSegments = []
				Promise.all(segmentPromises).then((segments) => {
					allSegments.push(segments)
					resolve(allSegments)
				})
			})
		})	
	},

	getAllSegmentsByDateRange: (startDate, endDate) => {
		return new Promise((resolve, reject) => {
			let segmentIds = getSegmentIdsByDateRange(startDate, endDate)
			let segmentPromises = []
			segmentIds.then((ids) => {
				ids.forEach((id) => {
					segmentPromises.push(getSegmentForKey("segments:"+id))
				})
				let foundSegments = []
				Promise.all(segmentPromises).then((segments) => {
					foundSegments.push(segments)
					resolve(foundSegments)
				})
			})
		})
	},

	delete: (segment) => {

	}
}

let scanSegmentKeys = (startCursor) => {
	return new Promise((resolve, reject) => {
		redisClient.scan(startCursor, "MATCH", "segments*", (error, reply) => {
			if (error) {
				reject(error)
			}
			let keys = reply[1]
			let cursor = reply[0]
			if (cursor == 0) {
				resolve(keys)
			} else {
				scanSegmentKeys(cursor)
				resolve(keys)
			}
		})
	})	
} 

let getSegmentForKey = (key) => {
	return new Promise((resolve, reject) => {
		redisClient.hgetall(key, (error, segment) => {
			if (error) {
				reject(error)
			}
			segment.id = key
			resolve(segment)
		})
	})	
}

let getSegmentIdsByDateRange = (startDate, endDate) => {
	return new Promise((resolve, reject) => {
		redisClient.zrange("startDate", startDate,
											 endDate, "WITHSCORES",
											 (error, reply) => {
			if (error) {
				reject(error)
			}
			let segmentIds = []
			for (let i = 1; i < reply.length; i += 2) {
				segmentIds.push(reply[i])
			}
			console.log(segmentIds)
			resolve(segmentIds)
		})
	})
}