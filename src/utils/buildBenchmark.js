export function buildAnonymousBenchmark(applications, minSampleSize = 5) {
  const totalApplications = applications.length

  const byStatus = applications.reduce((acc, app) => {
    const status = app.status || 'Applied'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  const companyCounts = applications.reduce((acc, app) => {
    const company = app.company?.trim()
    if (!company) return acc
    acc[company] = (acc[company] || 0) + 1
    return acc
  }, {})

  const byCompany = Object.entries(companyCounts)
    .filter(([, count]) => count >= minSampleSize)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }))

  return {
    totalApplications,
    byStatus,
    byCompany,
    minSampleSize,
  }
}