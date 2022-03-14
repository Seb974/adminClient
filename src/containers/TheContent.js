import React, { Suspense } from 'react'
import { Redirect, Switch } from 'react-router-dom'
import { CContainer } from '@coreui/react'
import routes from '../routes'
import AdminRoute from 'src/components/route/AdminRoute'
  
const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
)

const TheContent = () => {
  return (
    <main className="c-main">
      <CContainer fluid>
        <Suspense fallback={loading}>
          <Switch>
            {routes.map((route, idx) => {
              return route.component && (
                <AdminRoute
                  key={idx}
                  path={route.path}
                  exact={route.exact}
                  name={route.name}
                  component={ route.component }
                  />
              )
            })}
            <Redirect from="/" to="/dashboard" />
          </Switch>
        </Suspense>
      </CContainer>
    </main>
  )
}

export default React.memo(TheContent)
