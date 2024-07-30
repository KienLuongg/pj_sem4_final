import { Fragment, Suspense, lazy, useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Loader from './common/Loader';
import routes, { coreRoutes } from './routes';
import { getCookie } from './utils/storage/cookie-storage';
import { Storage } from './contstants/storage';
import { getLocalStorageItem } from './utils/storage/local-storage';
import { getDeviceToken, onMessageListener } from './firebase';
// import { getDeviceToken, onMessageListener} from './firebase';



const DefaultLayout = lazy(() => import('./layout/DefaultLayout'));
const NotFound = lazy(() => import('./pages/404page'));
const SignIn = lazy(() => import('./pages/Authentication/SignIn'));
const SignUp = lazy(() => import('./pages/Authentication/SignUp'));
const ECommerce = lazy(() => import('./pages/Dashboard/ECommerce'));

function App() {
  const navigate = useNavigate()
  const token = getCookie('token')

  useEffect(() => {
    if (!token) {
      navigate('/sign-in');
    }
  }, [token, navigate]);
 

   useEffect(() => {
     getDeviceToken();

     onMessageListener()
       .then((payload) => {
         if (payload.notification) {
           const newNotification = {
             id: payload.messageId ?? Math.random().toString(36).substr(2, 9), // generate a random ID if messageId is not available
             title: payload.notification.title ?? 'No Title',
             body: payload.notification.body ?? 'No Body',
           };
         }
        //  console.log(newNotification);
       })
       .catch((err) =>
         console.log('Failed to receive foreground message', err)
       );
   }, []);

  const userData = JSON.parse(getLocalStorageItem(Storage.user) || '{}')
  const userRoles = userData.roles ? userData.roles.map((item: any) => item.name) : []

  const hasRequiredRole = (requiredRoles: string[]) => {
    return requiredRoles.some((requiredRole) => userRoles.includes(requiredRole))
  }

  return (
    <Suspense fallback={<Loader />}>
      <Toaster position="top-right" />
      <Routes>
        <Route path="*" element={<NotFound />} />
        {!token ? <Route path="/sign-in" element={<SignIn />} /> : null}
        {token && (
          <Route path="/" element={<DefaultLayout />}>
            <Route index element={<ECommerce />} />
            {coreRoutes.map((route, index) => {
              if (hasRequiredRole(route.roles)) {
                return <Route key={index} path={route.path} element={<route.component />} />
              }
              return null
            })}
          </Route>
        )}
      </Routes>
    </Suspense>
  )
}

export default App
