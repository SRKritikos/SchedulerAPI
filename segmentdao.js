const redis = require('redis')
const redisClient = redis.createClient()

module.exports =  {

	create: (segment) => {
		return new Promise((resolve, reject) => {
			redisClient.incr("id", (error, newId) => {
				id = newId
				redisClient.hmset("segment:" + newId,
													"starDate", segment.startDate,
													"endDate", segment.endDate,
													"priority", segment.priority,
													(error, reply) => {
					if (error) {
						throw Error(error)
					}
				})
				redisClient.rpush("segmentIds", "segment:" + newId)
				redisClient.zadd("startDate", segment.startDate, newId)
				resolve(id);
			})
		})
	},

	update: (segment) => {

	},

	getAllSegments: () => {
		return new Promise((resolve, reject) => {
			let segmentKeys = scanSegmentKeys(0)
			console.log(segmentKeys)
			segmentKeys.then((keys) => {
				let segmentPromises = []
				segmentKeys.forEach((key) => {
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
			const segmentIds = getSegmentIdsByDateRange(startDate, endDate)
			const segmentPromises = []
			segmentIds.then((ids) => {
				ids.forEach((id) => {
					segmentPromises.push(getSegmentForKey("segment:"+id))
				})
				const foundSegments = []
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
		redisClient.scan(startCursor, "MATCH", "segment*", (error, reply) => {
			if (error) {
				reject(error)
			}
			let keys = reply[1]
			startCursor = reply[0]
			resolve(keys)
		})
	}).then((keys) => {
		if (startCursor == 0) {
			return keys
		} else {
			return scanSegmentKeys(startCursor)
		}
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