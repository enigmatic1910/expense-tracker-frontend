import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export const ProtectedRoutes = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { accessToken, loading } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (!loading && !accessToken) {
      router.push("/login");
    }
  }, [accessToken, loading, router]);

  return accessToken ? <>{children}</> : null;
};
