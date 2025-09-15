import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Você precisa estar logado para acessar esta página</h1>
      <p>Por favor, faça login para continuar.</p>
      <Link href="/login" style={{ color: '#1976d2', textDecoration: 'underline' }}>
        Ir para a página de login
      </Link>
    </div>
  );
}

