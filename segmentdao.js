const redis = require('redis')
const redisClient = redis.createClient()

module.exports =  {
	create: (segment) => {
			let id
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
			})
			return id
	},

	update: (segment) => {

	},

	getAll: () => {
		return new Promise((resolve, reject) => {
			let segmentKeys = scanSegmentKeys()
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

	delete: (segment) => {

	}
}

let scanSegmentKeys = () => {
	return new Promise((resolve, reject) => {
		redisClient.scan(0, "MATCH", "segments*", (error, reply) => {
			if (error) {
				reject(error)
			}
			let keys = reply[1]
			let cursor = reply[0]
			if (cursor == 0) {
				resolve(keys)
			} else {
				scanSegmentKeys()
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
			resolve(segment)
		})
	})	
}