import { getSession } from "next-auth/react";

export async function getServerSideProps(ctx) {
  const session = await getSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  if (session.user.role === "admin") {
    return {
      redirect: {
        destination: "/dashboard/admin",
        permanent: false,
      },
    };
  }

  return {
    redirect: {
      destination: "/dashboard/user",
      permanent: false,
    },
  };
}

export default function DashboardRedirect() {
  return null;
}
