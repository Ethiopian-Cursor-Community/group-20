import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div style={{ padding: 40 }}>
      <h1>404 - Page Not Found</h1>
      <Link to="/dashboard">Go back to Dashboard</Link>
    </div>
  );
}