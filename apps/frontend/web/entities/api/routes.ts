export const APP_ROUTES = {
  LOGIN: `${import.meta.env.VITE_API_URL}/auth/login`,
  PROFILE: `${import.meta.env.VITE_API_URL}/auth/profile`,
  USER: `${import.meta.env.VITE_API_URL}/users/user`,
  USERS: `${import.meta.env.VITE_API_URL}/users`,
  COUNTRIES: `${import.meta.env.VITE_API_URL}/geo/countries`,
  STATES: (countryId: string) =>
    `${import.meta.env.VITE_API_URL}/geo/states?filter.country.id=${countryId}`,
  CITIES: (stateId: string) =>
    `${import.meta.env.VITE_API_URL}/geo/cities?filter.state.id=${stateId}`,
  DISPUTES: `${import.meta.env.VITE_API_URL}/disputes`,
  COMPANIES: `${import.meta.env.VITE_API_URL}/companies`,
  ENTITIES: `${import.meta.env.VITE_API_URL}/entities`,
  MATTERS: `${import.meta.env.VITE_API_URL}/matters`,
  ACTIONS: `${import.meta.env.VITE_API_URL}/actions`,
  CONTRACTS: `${import.meta.env.VITE_API_URL}/contracts`,
  COMPANY: (companyId: string) =>
    `${import.meta.env.VITE_API_URL}/companies/${companyId}`,
  ACCOUNTS: `${import.meta.env.VITE_API_URL}/accounts`,
  ACCOUNT: (accountId: string) =>
    `${import.meta.env.VITE_API_URL}/accounts/${accountId}`,
  SECTORS: `${import.meta.env.VITE_API_URL}/sectors`,
  SECTOR: (sectorId: string) =>
    `${import.meta.env.VITE_API_URL}/sectors/${sectorId}`,
  CATEGORIES: `${import.meta.env.VITE_API_URL}/categories`,
  CATEGORY: (categoryId: string) =>
    `${import.meta.env.VITE_API_URL}/categories/${categoryId}`,
  UPLOAD_FILE: `${import.meta.env.VITE_API_URL}/uploads/project-image`,
  PROJECTS: `${import.meta.env.VITE_API_URL}/projects`,
  RISKS: `${import.meta.env.VITE_API_URL}/risks`,
  RISKS_UPDATE: (projectId: string, targetId?: string, riskId?: string) =>
    `${import.meta.env.VITE_API_URL}/projects/${projectId}/targets/${targetId}/risks/${riskId}`,
  KPIS: `${import.meta.env.VITE_API_URL}/dashboard/kpis`,
  TOP_MATTERS: `${import.meta.env.VITE_API_URL}/dashboard/top-matters-by-risks`,
  CRITICAL_RISK_HEATMAP: `${import.meta.env.VITE_API_URL}/dashboard/critical-risk-heatmap`,
};