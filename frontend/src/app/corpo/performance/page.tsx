"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Target, Scale, Activity, Flame, PlusCircle, ArrowUpRight, ArrowDownRight, Dumbbell, Loader2 } from "lucide-react";
import { corpoService } from "@/services/corpo.service";

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

function calculateTDEE(weight: number, height: number, age: number, isMale: boolean, activityLevel: keyof typeof ACTIVITY_MULTIPLIERS): number {
  let bmr: number;
  if (isMale) {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

function calculateMacros(tdee: number, goal: 'maintain' | 'lose' | 'gain') {
  let calories: number;
  let proteinRatio: number;
  let fatRatio: number;
  
  switch (goal) {
    case 'lose':
      calories = tdee - 500;
      proteinRatio = 0.35;
      fatRatio = 0.35;
      break;
    case 'gain':
      calories = tdee + 300;
      proteinRatio = 0.30;
      fatRatio = 0.25;
      break;
    default:
      calories = tdee;
      proteinRatio = 0.30;
      fatRatio = 0.30;
  }
  
  const protein = Math.round((calories * proteinRatio) / 4);
  const carbs = Math.round((calories * (1 - proteinRatio - fatRatio)) / 4);
  const fats = Math.round((calories * fatRatio) / 9);
  
  return { calories, protein, carbs, fats };
}

export default function PerformanceDashboard() {
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWeight, setNewWeight] = useState("");
  const [newBF, setNewBF] = useState("");
  const [saving, setSaving] = useState(false);
  
  const [calcWeight, setCalcWeight] = useState("");
  const [calcHeight, setCalcHeight] = useState("");
  const [calcAge, setCalcAge] = useState("");
  const [calcSex, setCalcSex] = useState<"male" | "female">("male");
  const [calcActivity, setCalcActivity] = useState<keyof typeof ACTIVITY_MULTIPLIERS>("moderate");
  const [calcGoal, setCalcGoal] = useState<"lose" | "maintain" | "gain">("maintain");
  const [calcResult, setCalcResult] = useState<{ tdee: number; macros: ReturnType<typeof calculateMacros> } | null>(null);

  const fetchData = async () => {
    try {
      const data = await corpoService.getAvaliacoes();
      setAvaliacoes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAvaliacao = async () => {
    if (!newWeight) return;
    setSaving(true);
    try {
      await corpoService.createAvaliacao({
        weight: parseFloat(newWeight),
        bodyFat: newBF ? parseFloat(newBF) : undefined
      });
      setNewWeight("");
      setNewBF("");
      await fetchData();
    } catch (error) {
      console.error("Erro ao salvar avaliação:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCalculate = () => {
    const weight = parseFloat(calcWeight) || latest?.weight || 70;
    const height = parseFloat(calcHeight) || 170;
    const age = parseInt(calcAge) || 25;
    
    const tdee = calculateTDEE(weight, height, age, calcSex === "male", calcActivity);
    const macros = calculateMacros(tdee, calcGoal);
    
    setCalcResult({ tdee, macros });
  };

  const latest = avaliacoes.length > 0 ? avaliacoes[0] : null;
  const previous = avaliacoes.length > 1 ? avaliacoes[1] : null;
  const weightDiff = latest && previous ? (latest.weight - previous.weight).toFixed(1) : "0.0";

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            Performance & Bio
          </h1>
          <p className="text-zinc-400">
            Monitore seu peso, metas físicas e gasto calórico diário.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-2">
            <input 
              type="number"
              placeholder="Peso (kg)"
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1 text-sm text-white w-24"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
            />
            <Button 
               onClick={handleCreateAvaliacao}
               disabled={saving}
               className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-lg"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Nova Avaliação
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Status Atual Card */}
         <Card className="bg-zinc-900 border-zinc-800">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium text-zinc-400">
               Peso Atual
             </CardTitle>
             <Scale className="h-4 w-4 text-emerald-500" />
           </CardHeader>
           {/* TODO: Adicionar campo de meta de peso */}
           <CardContent>
              <div className="text-3xl font-bold text-white">{latest ? `${latest.weight} kg` : "--"}</div>
              <p className="text-xs text-zinc-500 mt-1 flex items-center">
                 {parseFloat(weightDiff) < 0 ? <ArrowDownRight className="w-3 h-3 text-emerald-500 mr-1" /> : <ArrowUpRight className="w-3 h-3 text-red-500 mr-1" />}
                 {weightDiff} kg desde a última avaliação
              </p>
           </CardContent>
         </Card>

         <Card className="bg-zinc-900 border-zinc-800">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium text-zinc-400">
               Meta Principal
             </CardTitle>
             <Target className="h-4 w-4 text-emerald-500" />
           </CardHeader>
           {/* TODO: Buscar meta do usuário do backend e exibir aqui */}
           <CardContent>
             <div className="text-2xl font-bold text-white mt-1">Evolução Constante</div>
             <p className="text-xs text-zinc-500 mt-1">
                Foco no progresso diário
             </p>
           </CardContent>
         </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                Gasto Energético (TDEE)
              </CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold text-white mt-1">{calcResult ? `${calcResult.tdee} kcal` : "--"}</div>
               <p className="text-xs text-zinc-500 mt-1">
                  {calcResult ? `Meta: ${calcResult.macros.calories} kcal` : "Use a calculadora ao lado"}
               </p>
            </CardContent>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* Avaliações Recentes */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
               <Activity className="w-5 h-5 text-emerald-500" />
               Histórico de Avaliações
            </CardTitle>
            <CardDescription className="text-zinc-400">Suas últimas atualizações de medidas e peso.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               {avaliacoes.length > 0 ? avaliacoes.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-zinc-800/50 rounded-lg hover:bg-zinc-800/30 transition-colors">
                     <div>
                        <p className="text-sm font-medium text-white">{new Date(item.date).toLocaleDateString()}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Peso e Bioimpedância</p>
                     </div>
                     <div className="text-right">
                        <p className="text-sm font-bold text-emerald-400">{item.weight} kg</p>
                        <p className="text-xs text-zinc-500">BF: {item.bodyFat || "--"}%</p>
                     </div>
                  </div>
               )) : (
                 <p className="text-zinc-600 text-sm italic text-center py-8">Nenhuma avaliação registrada.</p>
               )}
             </div>
          </CardContent>
        </Card>

        {/* Calculadora de Calorias Widget */}
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-emerald-500/20 shadow-lg shadow-emerald-900/5">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
               <Dumbbell className="w-5 h-5 text-emerald-500" />
               Calculadora de TDEE
            </CardTitle>
            <CardDescription className="text-zinc-400">Calcule suas necessidades calóricas e macros.</CardDescription>
          </CardHeader>
          <CardContent>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleCalculate(); }}>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-xs text-zinc-400">Peso (kg)</label>
                       <Input 
                         type="number" 
                         placeholder={latest?.weight?.toString() || "70"} 
                         value={calcWeight}
                         onChange={(e) => setCalcWeight(e.target.value)}
                         className="bg-zinc-950 border-zinc-800 text-white" 
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs text-zinc-400">Altura (cm)</label>
                       <Input 
                         type="number" 
                         placeholder="170" 
                         value={calcHeight}
                         onChange={(e) => setCalcHeight(e.target.value)}
                         className="bg-zinc-950 border-zinc-800 text-white" 
                       />
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-xs text-zinc-400">Idade</label>
                       <Input 
                         type="number" 
                         placeholder="25" 
                         value={calcAge}
                         onChange={(e) => setCalcAge(e.target.value)}
                         className="bg-zinc-950 border-zinc-800 text-white" 
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs text-zinc-400">Sexo</label>
                       <select 
                         className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none"
                         value={calcSex}
                         onChange={(e) => setCalcSex(e.target.value as "male" | "female")}
                       >
                         <option value="male">Masculino</option>
                         <option value="female">Feminino</option>
                       </select>
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Nível de Atividade</label>
                    <select 
                      className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none"
                      value={calcActivity}
                      onChange={(e) => setCalcActivity(e.target.value as keyof typeof ACTIVITY_MULTIPLIERS)}
                    >
                       <option value="veryActive">Intenso (5-6x semana)</option>
                       <option value="active">Muito Ativo (4-5x semana)</option>
                       <option value="moderate">Moderado (3-4x semana)</option>
                       <option value="light">Leve (1-2x semana)</option>
                       <option value="sedentary">Sedentário</option>
                    </select>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Objetivo</label>
                    <select 
                      className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none"
                      value={calcGoal}
                      onChange={(e) => setCalcGoal(e.target.value as "lose" | "maintain" | "gain")}
                    >
                       <option value="lose">Perder peso (-500 kcal)</option>
                       <option value="maintain">Manter peso</option>
                       <option value="gain">Ganhar massa (+300 kcal)</option>
                    </select>
                 </div>

                 <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-2">
                    Calcular Macros
                 </Button>
                 
                 {calcResult && (
                   <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                     <div className="text-center mb-3">
                       <p className="text-xs text-zinc-400 uppercase tracking-wider">Meta Diária</p>
                       <p className="text-2xl font-bold text-emerald-400">{calcResult.macros.calories} kcal</p>
                     </div>
                     <div className="grid grid-cols-3 gap-2 text-center text-xs">
                       <div className="p-2 bg-zinc-900/50 rounded">
                         <p className="text-blue-400 font-semibold">{calcResult.macros.protein}g</p>
                         <p className="text-zinc-500">Proteína</p>
                       </div>
                       <div className="p-2 bg-zinc-900/50 rounded">
                         <p className="text-orange-400 font-semibold">{calcResult.macros.carbs}g</p>
                         <p className="text-zinc-500">Carbo</p>
                       </div>
                       <div className="p-2 bg-zinc-900/50 rounded">
                         <p className="text-amber-400 font-semibold">{calcResult.macros.fats}g</p>
                         <p className="text-zinc-500">Gordura</p>
                       </div>
                     </div>
                   </div>
                 )}
              </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
