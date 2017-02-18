const redis = require('redis')
const redisClient = redis.createClient()

module.exports =  {
	create: (plan) => {
		return new Promise((resolve, reject) => {
			incrementId().then((newId) => {
				const planId = "plan:" + newId
				plan.id = planId
				insertPlan(plan).catch((error) => {
					reject(error)
				})
				insertIntoPlanIdsSet(planId).catch((error) => {
					reject(error)
				})
				insertIntoStartDateSet(plan.startDate, planId).catch((error) => {
					reject(error)
				})
				resolve(planId);
			})
		})
	},

	update: (plan) => {
		return new Promise((resolve, reject) => {
			determineIfPlanExists(plan.id).then((reply) => {
				if (reply > 0) {
					insertPlan(plan).catch((error) => {
						reject(error)
					})
					resolve(plan.id)
				} else {
					reject(0)
				}
			})
		})
	},

	getAllPlans: () => {
		return new Promise((resolve, reject) => {
			getActivePlanIds().then((planIds) => {
				if (planIds.length === 0) {
					reject(0)
				}
				const planPromises = []
				planIds.forEach((planId) => {
					planPromises.push( getPlanForPlanId(planId) )
				})
				const allPlans = []
				Promise.all(planPromises).then((plans) => {
					allPlans.push(plans)
					resolve(allPlans)
				}).catch((error) => {
					reject(error)
				})
			}).catch((error) => {
				reject(error)
			})
		})	
	},

	getAllPlansByDateRange: (startDate, endDate) => {
		return new Promise((resolve, reject) => {
			getPlanIdsByDateRange(startDate, endDate).then((planIds) => {
				if (planIds.length === 0) {
					reject(0)
				}
				const planPromises = []
				planIds.forEach((id) => {
					planPromises.push( getPlanForPlanId(id) )
				})
				const foundPlan = []
				Promise.all(planPromises).then((plan) => {
					foundPlan.push(plan)
					resolve(foundPlan)
				}).catch((error) => {
					reject(error)
				})
			}).catch((error) => {
				reject(error)
			})
		})
	},

	delete: (planId) => {
		return new Promise((resolve, reject) => {
			removePlanIdFromActivePlanSet(planId).catch((error) => {
				reject(error)
			})
			removePlanIdFromStartDateSet(planId).catch((error) => {
				reject(error)
			})
			resolve()
		})
	}
}

/**
 * Read functions
 */

const getPlanForPlanId = (planId) => {
	return new Promise((resolve, reject) => {
		redisClient.hgetall(planId, (error, plan) => {
			if (error) {
				reject(error)
			}
			plan.id = planId
			resolve(plan)
		})
	})	
}

const getPlanIdsByDateRange = (startDate, endDate) => {
	return new Promise((resolve, reject) => {
		redisClient.zrange("startDate", startDate, endDate, (error, planIds) => {
			if (error) {
				reject(error)
			}
			resolve(planIds)
		})
	})
}

const getActivePlanIds = () => {
	return new Promise((resolve, reject) => {
		redisClient.smembers("activePlanIds", (error, planIds) => {
			if (error) {
				reject(error)
			} else {
				resolve(planIds)
			}
		})
	})
}

const determineIfPlanExists = (planId) => {
	return new Promise((resolve, reject) => {
		redisClient.sismember("activePlanIds", planId, (error, reply) => {
			if (error) {
				reject(error)
			} else {
				resolve(reply)
			}
		})
	})

}

/**
 * Create functions
 */

const incrementId = () => {
	return new Promise((resolve, reject) => {
		redisClient.incr("planId", (error, newId) => {
			if (error) {
				reject(error)
			} else {
				resolve(newId)
			}
		})
	})
}

const insertPlan = (plan) => {
	return new Promise((resolve, reject) => {
		redisClient.hmset(
			plan.id,
			"starDate", plan.startDate,
			"endDate", plan.endDate,
			"priority", plan.priority,
			(error, reply) => {
				if (error) {
					reject(error)
				} else {
					resolve(reply)
				}	
			})
	})								
}

const insertIntoPlanIdsSet = (newPlanId) => {
	return new Promise((resolve, reject) => {
		redisClient.sadd("activePlanIds", newPlanId, (error, reply) => {
			if (error) {
				reject(error)
			} else {
				resolve(reply)
			}
		})
	})
}

const insertIntoStartDateSet = (startDate, planId) => {
	return new Promise((resolve, reject) => {
		redisClient.zadd("startDate", startDate, planId, (error, reply) => {
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

const removePlanIdFromActivePlanSet = (planId) => {
	return new Promise((resolve, reject) => {
		redisClient.srem("activePlanIds", planId, (error, reply) => {
			if (error) {
				reject(error)
			} else {
				resolve(reply)
			}
		})
	})
}

const removePlanIdFromStartDateSet = (planId) => {
	return new Promise((resolve, reject) => {
		redisClient.zrem("startDate", planId, (error, reply) => {
			if (error) {
				reject(error)
			} else {
				resolve(reply)
			}
		})
	})
}