import { Button } from "@/components/ui/button";
import { RegisterLink, LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export default async function Home() {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  return (
    <div>
      {user ? (
        <div>
          <LogoutLink>
            <Button>Logout</Button>
          </LogoutLink>
        </div>
      ) : (
        <div>
          <RegisterLink>
            <Button>Register</Button>
          </RegisterLink>
          <LoginLink>
            <Button>Login</Button>
          </LoginLink>
        </div>
      )}
    </div>
  );
}