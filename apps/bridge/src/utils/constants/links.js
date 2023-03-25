const URL_PARAMETERS = Object.freeze({
  TABLE_ID: 'tableId',
  RECORD_ID: 'recordId',
})

const QUERY_PARAMETERS = Object.freeze({
  OFFSET: 'offset',
  LIMIT: 'limit',
})

const PAGES = Object.freeze({
  HOME: '/',
  DASHBOARD: '/dashboard',
  WORKSTREAM: `/dashboard/:${URL_PARAMETERS.RECORD_ID}`,
})

module.exports = {
  PAGES,
  URL_PARAMETERS,
  QUERY_PARAMETERS,
}
