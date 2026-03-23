import { useNavigate } from "react-router-dom";
import LandingHeader from "@/components/LandingHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col font-['Outfit']">
      

      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-9xl font-bold text-gray-200 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-500 max-w-md mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>

        <Button
          onClick={() => navigate('/')}
          className="bg-primary hover:bg-primary/90 text-white min-w-[200px]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back Home
        </Button>
      </main>
    </div>
  );
}
