import { redirect } from 'next/navigation';

export default function MenteRoot() {
  // Redireciona a área Mente direto para a sub-área principal (Estudos)
  redirect('/mente/estudos');
}
