"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Wallet2, CreditCard, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { pessoalService } from "@/services/pessoal.service";
import { TransacaoModal } from "@/components/ui/transacao-modal";
import { CartaoModal } from "@/components/ui/cartao-modal";
import { ContaModal } from "@/components/ui/conta-modal";

export default function FinancasDashboard() {
  const [contas, setContas] = useState<any[]>([]);
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [cartoes, setCartoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<"INCOME" | "EXPENSE" | null>(null);
  const [showCartaoModal, setShowCartaoModal] = useState(false);
  const [showContaModal, setShowContaModal] = useState(false);

  const fetchData = async () => {
    try {
      const [contasData, transacoesData, cartoesData] = await Promise.all([
        pessoalService.getContas(),
        pessoalService.getTransacoes(),
        pessoalService.getCartoes()
      ]);
      setContas(Array.isArray(contasData) ? contasData : []);
      setTransacoes(Array.isArray(transacoesData) ? transacoesData : []);
      setCartoes(Array.isArray(cartoesData) ? cartoesData : []);
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            Finanças
          </h1>
          <p className="text-zinc-400">
            Gerencie suas contas, gastos e cartões em um só lugar.
          </p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-lg" onClick={() => setModalType("INCOME")}>
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Receita
          </Button>
          <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg" onClick={() => setModalType("EXPENSE")}>
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Despesa
          </Button>
        </div>
      </div>

      {/* Visão de Contas Bancárias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contas.length > 0 ? contas.map((conta) => (
          <Card key={conta.id} className="bg-zinc-900 border-zinc-800 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                {conta.name}
              </CardTitle>
              <Wallet2 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {conta.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
              <div className="flex items-center gap-2 mt-4 text-xs">
                <span className="text-zinc-500">Saldo Atualizado</span>
              </div>
            </CardContent>
          </Card>
        )) : (
          <Card className="bg-zinc-900 border-zinc-800 border-dashed flex flex-col items-center justify-center p-6">
            <Wallet2 className="h-8 w-8 text-zinc-700 mb-2" />
            <CardTitle className="text-zinc-500 text-sm mb-3">Nenhuma conta cadastrada</CardTitle>
            <Button 
              size="sm" 
              variant="outline"
              className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
              onClick={() => setShowContaModal(true)}
            >
              <PlusCircle className="w-4 h-4 mr-2" /> Cadastrar Conta
            </Button>
          </Card>
        )}

        {/* Visão de Cartões */}
        {cartoes.length > 0 ? cartoes.map((cartao) => (
          <Card key={cartao.id} className="bg-zinc-900 border-zinc-800 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-zinc-400">
                {cartao.name}
              </CardTitle>
              <CreditCard className="h-4 w-4 text-indigo-400" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-white">Fatura: {cartao.currentUsed.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
              <p className="text-xs text-zinc-500 mt-1">Vence dia {cartao.invoiceDate}</p>
              
              <div className="mt-4 w-full bg-zinc-800 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${(cartao.currentUsed / cartao.limit) * 100}%` }}></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-zinc-400">
                <span>Disponível: {(cartao.limit - cartao.currentUsed).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                <span>Limite: {cartao.limit.toLocaleString('pt-BR', { style: 'currency', 'currency': 'BRL' })}</span>
              </div>
            </CardContent>
          </Card>
        )) : (
          <Card className="bg-zinc-900 border-zinc-800 border-dashed flex flex-col items-center justify-center p-6">
            <CreditCard className="h-8 w-8 text-zinc-700 mb-2" />
            <CardTitle className="text-zinc-500 text-sm mb-3">Nenhum cartão cadastrado</CardTitle>
            <Button 
              size="sm" 
              variant="outline"
              className="border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10"
              onClick={() => setShowCartaoModal(true)}
            >
              <PlusCircle className="w-4 h-4 mr-2" /> Cadastrar Cartão
            </Button>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* Ultimas Transações */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Últimas Transações</CardTitle>
            <CardDescription className="text-zinc-400">Seus gastos e ganhos recentes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transacoes.length > 0 ? transacoes.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-zinc-800">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${tx.type === "INCOME" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                    {tx.type === "INCOME" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{tx.description || "Transação Sem Nome"}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-sm">{tx.category}</span>
                      <span className="text-xs text-zinc-500">{new Date(tx.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                <div className={`font-semibold ${tx.type === "INCOME" ? "text-emerald-500" : "text-white"}`}>
                  {tx.type === "INCOME" ? "+" : "-"}
                  {tx.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
              )) : (
                <p className="text-zinc-500 text-sm text-center py-8">Nenhuma transação encontrada.</p>
              )}
            </div>
            {transacoes.length > 0 && (
              <Button variant="outline" className="w-full mt-6 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                Ver todas as transações
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Categorias e Resumo Mensal */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Gastos por Categoria</CardTitle>
            <CardDescription className="text-zinc-400">Onde seu dinheiro está indo.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {(() => {
                const totalDespesas = transacoes
                  .filter(t => t.type === "EXPENSE")
                  .reduce((acc, t) => acc + t.amount, 0);
                
                return ["Moradia", "Comida", "Fitness", "Assinatura"].map((cat) => {
                  const catTxs = transacoes.filter(t => t.category === cat && t.type === "EXPENSE");
                  const total = catTxs.reduce((acc, t) => acc + t.amount, 0);
                  if (total === 0) return null;
                  const percentage = totalDespesas > 0 ? (total / totalDespesas) * 100 : 0;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-medium text-zinc-300">{cat}</span>
                        <span className="text-sm font-semibold text-white">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                });
              })()}
              {transacoes.filter(t => t.type === "EXPENSE").length === 0 && (
                <p className="text-zinc-500 text-sm text-center py-8">Sem despesas registradas.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Transação */}
      <TransacaoModal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        onSuccess={fetchData}
        type={modalType || "EXPENSE"}
        contas={contas}
      />

      {/* Modal de Cartão de Crédito */}
      <CartaoModal
        isOpen={showCartaoModal}
        onClose={() => setShowCartaoModal(false)}
        onSuccess={fetchData}
        contas={contas}
      />

      {/* Modal de Conta Bancária */}
      <ContaModal
        isOpen={showContaModal}
        onClose={() => setShowContaModal(false)}
        onSuccess={fetchData}
      />

    </div>
  );
}
