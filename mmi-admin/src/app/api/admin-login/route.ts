import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  // Usuários e senhas do .env (lado do servidor)
  const ADMINS = [
    { username: "marcos", password: process.env.ADMIN_PASS_1 },
    { username: "ana", password: process.env.ADMIN_PASS_2 },
    { username: "matheus", password: process.env.ADMIN_PASS_3 },
  ];

  const validAdmin = ADMINS.find(
    (admin) => admin.username === username && admin.password === password
  );

  if (!validAdmin) {
    return NextResponse.json({ success: false, message: "Usuário ou senha inválidos" }, { status: 401 });
  }

  // ✅ Retorna sucesso
  const res = NextResponse.json({ success: true });
  res.cookies.set("admin-auth", "true", { path: "/" });
  return res;
}
