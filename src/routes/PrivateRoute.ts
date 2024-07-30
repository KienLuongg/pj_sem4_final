// const PrivateRoute: React.FC<{ element: React.ReactNode; path: string }> = ({
//   element,
//   path,
// }) => {
//   const isLoggedIn = localStorage.getItem('loginSuccessMessage');

//   return isLoggedIn ? (
//     <Route path={path} element={element} />
//   ) : (
//     <Navigate to="/sign-in" replace />
//   );
// };
// exports default PrivateRoute;