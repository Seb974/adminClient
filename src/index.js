import 'react-app-polyfill/ie11'; // For IE 11 support
import 'react-app-polyfill/stable';
import 'core-js';
import './polyfill'
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { icons } from './assets/icons';
import { Provider } from 'react-redux';
import store from './store';
import PlatformActions from './services/PlatformActions';
import { isDefined } from './helpers/utils';

(async () => {
    const platform = await PlatformActions.find();
    const stripePromise = isDefined(platform) && isDefined(platform.stripePublicKey) ? loadStripe(platform.stripePublicKey) : null;
    React.icons = icons
    
    ReactDOM.render(
      <React.StrictMode>
        { isDefined(stripePromise) ? 
             <Elements stripe={ stripePromise }>
                <Provider store={ store }>
                    <App platform={ platform }/>
                </Provider>
            </Elements>
          :
            <Provider store={ store }>
                <App platform={ platform }/>
            </Provider>
        }
      </React.StrictMode>,
      document.getElementById('root')
    );

    // If you want your app to work offline and load faster, you can change
    // unregister() to register() below. Note this comes with some pitfalls.
    // Learn more about service workers: http://bit.ly/CRA-PWA
    serviceWorker.unregister();
})()

