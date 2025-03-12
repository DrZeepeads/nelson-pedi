
import { useIsMobile } from "@/hooks/use-mobile";

export const MobileCheck = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="rounded-lg bg-white p-6 shadow-xl">
          <h2 className="mb-4 text-xl font-bold">Mobile Access Only</h2>
          <p>This application is optimized for mobile devices only. Please access it from your smartphone or tablet.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
