import { useRoutes } from "react-router-dom"
import { routes } from "./routes/routes"
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";


const App = () => {
  const routing = useRoutes(routes)

  // to check if user is signed in when page loads
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    const cleanup = initialize();
    return cleanup;
  }, []);
  

  return routing;
}

export default App