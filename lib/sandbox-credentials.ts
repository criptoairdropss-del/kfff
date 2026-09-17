export function getSandboxCredentials() {
  const token = process.env.VERCEL_TOKEN
  const teamId = process.env.VERCEL_TEAM_ID || process.env.VERCEL_ORG_ID
  const projectId = process.env.VERCEL_PROJECT_ID
  if (token && teamId && projectId) {
    return { token, teamId, projectId }
  }
  return {}
}
