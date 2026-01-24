import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Spoonjoy - Recipe Management" },
    { name: "description", content: "Manage your recipes with ease" },
  ];
}

export default function Home() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Welcome to Spoonjoy v2</h1>
      <p>
        Built with React Router v7 on Cloudflare
      </p>
      <p>
        This is the foundation for the Spoonjoy rebuild. Authentication, recipes, and more features coming soon!
      </p>
    </div>
  );
}
