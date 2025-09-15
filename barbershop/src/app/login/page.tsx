import { providerMap } from "@/utils/auth.config";
import { SignInPage } from '@toolpad/core/SignInPage';
import signIn from "./actions";
export default function LoginPage() {
  return (
      <SignInPage providers={providerMap} signIn={signIn}/>
  );
}
