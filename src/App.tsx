import { useRoutes } from "react-router-dom"
import { routes } from "./routes/routes"
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";
import PageMetadata from "./components/seo/PageMetadata";


const App = () => {
  const routing = useRoutes(routes)

  // to check if user is signed in when page loads
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    const cleanup = initialize();
    return cleanup;
  }, [initialize]);
  

  return (
    <>
      <PageMetadata />
      {routing}
    </>
  );
}

export default App
