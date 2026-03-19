import { redirect } from 'next/navigation';

export default function PessoalRoot() {
  // Redireciona a área pessoal direto para a sub-área principal (Finanças)
  redirect('/pessoal/financas');
}
