import { JobPostingForm } from "./components/JobPostingForm";
import { JobsPage } from "./pages/JobsPage";
import { SavedApplicationsPage } from "./pages/SavedApplicationsPage";

function App() {
    return (
        <main>
            <JobsPage />

            <hr />

            <SavedApplicationsPage />

            <hr />

            <JobPostingForm />
        </main>
    );
}

export default App;