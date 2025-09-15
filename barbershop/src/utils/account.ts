import { post } from "./BarberShopApi";

export interface Account {
  id: number;
  id_token: string;
}

export async function createAccount(
  email: string,
  password: string
): Promise<Account> {
  const { statusCode, body } = await post({
    path: `/Accounts`,
    body: { email, password },
    headers: { "Content-Type": "application/json" },
  });
  if (statusCode === 200) {
    const { id, id_token } = body as Account;
    return { id, id_token };
  }
  console.error(`Failed to create account: ${statusCode} - ${body}`);
  throw new Error(`Failed to create account`);
}
