import './scss/style.scss';
import React, { useEffect, useState }  from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import AuthContext from './contexts/AuthContext';
import AuthActions from './services/AuthActions';
import MercureHub from './components/Mercure/MercureHub';
import AdminRoute from './components/route/AdminRoute';
import PrivateRoute from './components/route/PrivateRoute';
import UserActions from './services/UserActions';
import ProductActions from './services/ProductActions';
import axios from 'axios';

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
)

// Containers
const TheLayout = React.lazy(() => import('./containers/TheLayout'));

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'));
const Register = React.lazy(() => import('./views/pages/register/Register'));
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'));
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'));

const App = () => {

    const [isAuthenticated, setIsAuthenticated] = useState(AuthActions.isAuthenticated());
    const [currentUser, setCurrentUser] = useState(AuthActions.getCurrentUser());
    const [eventSource, setEventSource] = useState({});

    useEffect(() => {
      AuthActions.setErrorHandler(setCurrentUser, setIsAuthenticated);
      // ProductActions.findAll()
      //               .then(data => {
      //                   setProducts(data);
      //               })
      //               .catch(error => console.log(error.response));
  }, []);

  useEffect(() => {
      setCurrentUser(AuthActions.getCurrentUser());
      if (isAuthenticated) {
        UserActions.findAll()
                   .then(response => console.log(response));
        ProductActions.findAll()
                      .then(data => console.log(data));
      }
  }, [isAuthenticated]);

    return (
      <AuthContext.Provider value={ {isAuthenticated, setIsAuthenticated, currentUser, setCurrentUser, eventSource, setEventSource} }>
          <MercureHub>
              <HashRouter>
                  <React.Suspense fallback={loading}>
                      <Switch>
                          <Route exact path="/login" name="Login Page" component={ Login } />
                          <Route exact path="/register" name="Register Page" component={ Register } />
                          <Route exact path="/404" name="Page 404" component={ Page404 } />
                          <Route exact path="/500" name="Page 500" component={ Page500 } />
                          <PrivateRoute path="/" name="Home" component={ TheLayout } />     {/*  render={props => <TheLayout {...props}/>} */}
                      </Switch>
                  </React.Suspense>
              </HashRouter>
          </MercureHub>
      </AuthContext.Provider>
    );
}

export default App;
