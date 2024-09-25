import router from '@/router'

export const goPage = (routeName = 'home', params = {}, query = {}, type = '_self') => {
  goRoute(
    {
      name: routeName,
      params,
      query
    },
    type
  )
}
export const goRoute = (route, type = '_self') => {
  router.currentRoute.value.name !== route.name &&
    (type === 'replace'
      ? router.replace(route)
      : type !== '_self'
        ? typeof route === 'object'
          ? window.open(router.resolve(route).href, type)
          : window.open(route, type)
        : router.push(route))
}
