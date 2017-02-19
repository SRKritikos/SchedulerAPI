const planDAO = require('./plandao.js')

module.exports = {
  create: (plan) => {
		return new Promise((resolve, reject) => {
			planDAO.incrementId().then((newId) => {
				const planId = "plan:" + newId
				plan.id = planId
				planDAO.insertPlan(plan).catch((error) => {
					reject(error)
				})
				planDAO.insertIntoPlanIdsSet(planId).catch((error) => {
					reject(error)
				})
				resolve(planId);
			})
		})
	},

	update: (plan) => {
		return new Promise((resolve, reject) => {
			planDAO.determineIfPlanExists(plan.id).then((reply) => {
				if (reply > 0) {
					planDAO.insertPlan(plan).then(() => {
            resolve(plan.id)
          }).catch((error) => {
						reject(error)
					})
				} else {
					reject(0)
				}
			})
		})
	},

	getAllPlans: () => {
		return new Promise((resolve, reject) => {
			planDAO.getActivePlanIds().then((planIds) => {
				if (planIds.length === 0) {
					reject(0)
				}
				const planPromises = []
				planIds.forEach((planId) => {
					planPromises.push( planDAO.getPlanForPlanId(planId) )
				})
				Promise.all(planPromises).then((plans) => {
					resolve(plans)
				}).catch((error) => {
					reject(error)
				})
			}).catch((error) => {
				reject(error)
			})
		})	
	},

	getAllPlansByDateRange: (startTime, endTime) => {
		return new Promise((resolve, reject) => {
      module.exports.getAllPlans().then((plans) => {
        filteredPlans = plans.filter((plan) => {
          return (plan.startDate >= startTime && plan.startDate <= endTime)  
                || (plan.endDate >= startTime && plan.endDate <= endTime)
                || (startTime >= plan.startDate && endTime <= plan.endDate)
        })
          resolve(filteredPlans)
        }).catch((error) => {
          reject(error)
        })
      })
		},

	delete: (planId) => {
		return new Promise((resolve, reject) => {
			planDAO.removePlanIdFromActivePlanSet(planId).catch((error) => {
				reject(error)
			})
			resolve()
		})
	}
}

const getPlansInDateRange = (plan, start, end) => {
  if (plan.startDate > startDate && plan.endDate < endDate) {
    return true
  } else if (plan.endDate > startDate && plan.endDate < endDate) {
    return true
  } else if (startDate > plan.startDate && endDate < plan.endDate) {
    return true
  }
  return false
}