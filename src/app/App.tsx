import { HashRouter, Routes, Route } from "react-router-dom";
import { SessionProvider } from "./SessionProvider";
import { Layout } from "../components/Layout";
import { Today } from "../pages/Today";
import { Patrol, Candidates } from "../pages/Patrol";
import { Quick } from "../pages/Quick";
import { SmartCheck } from "../pages/SmartCheck";
import { Live } from "../pages/Live";
import { Review } from "../pages/Review";
import { More } from "../pages/More";
export function App() {
  return (
    <SessionProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Today />} />
            <Route path="patrol" element={<Patrol />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="machine/:id/quick" element={<Quick />} />
            <Route path="machine/:id/check" element={<SmartCheck />} />
            <Route path="live" element={<Live />} />
            <Route path="review" element={<Review />} />
            <Route path="more" element={<More />} />
            <Route path="*" element={<Today />} />
          </Route>
        </Routes>
      </HashRouter>
    </SessionProvider>
  );
}
