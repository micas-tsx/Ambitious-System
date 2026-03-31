"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Utensils, Droplets, Info, Loader2 } from "lucide-react";
import { corpoService } from "@/services/corpo.service";

export default function DietaDashboard() {
  const [refeicoes, setRefeicoes] = useState<any[]>([]);
  const [alimentos, setAlimentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMealName, setNewMealName] = useState("");
  const [newMealTime, setNewMealTime] = useState("");
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ foodId: "", quantity: 100 });
  const [waterConsumed, setWaterConsumed] = useState(0);

  const fetchData = async () => {
    try {
      const [mealsData, foodsData, waterData] = await Promise.all([
        corpoService.getRefeicoes(),
        corpoService.getAlimentos(),
        corpoService.getHidratação()
      ]);
      setRefeicoes(Array.isArray(mealsData) ? mealsData : []);
      setAlimentos(Array.isArray(foodsData) ? foodsData : []);
      setWaterConsumed((waterData as any)?.consumed || 0);
    } catch (error) {
      console.error("Erro ao carregar dados da dieta:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateMeal = async () => {
    if (!newMealName.trim() || !newMealTime) return;
    try {
      await corpoService.createRefeicao({
        name: newMealName,
        time: newMealTime
      });
      setNewMealName("");
      setNewMealTime("");
      await fetchData();
    } catch (error) {
      console.error("Erro ao registrar refeição:", error);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    if (!confirm("Excluir esta refeição?")) return;
    try {
      await corpoService.deleteRefeicao(id);
      await fetchData();
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  };

  const handleAddItem = async () => {
    if (!selectedMealId || !newItem.foodId) return;
    try {
      await corpoService.addItemRefeicao(selectedMealId, {
        foodId: newItem.foodId,
        amountInGrams: newItem.quantity
      });
      setNewItem({ foodId: "", quantity: 100 });
      setSelectedMealId(null);
      await fetchData();
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await corpoService.deleteItemRefeicao(id);
      await fetchData();
    } catch (error) {
      console.error("Erro ao deletar item:", error);
    }
  };

  const handleAddWater = async () => {
    try {
      await corpoService.addHidratação(250);
      await fetchData();
    } catch (error) {
      console.error("Erro ao adicionar água:", error);
    }
  };

  const handleAddWaterAmount = async (amount: number) => {
    try {
      await corpoService.addHidratação(amount);
      await fetchData();
    } catch (error) {
      console.error("Erro ao adicionar água:", error);
    }
  };

  // Cálculo simplificado de macros
  const calculateTotals = () => {
    const totals = { kcal: 0, p: 0, c: 0, g: 0 };

    refeicoes.forEach(meal => {
      meal.items?.forEach((item: any) => {
        const food = item.food;
        if (food) {
          const factor = item.amountInGrams / 100;
          totals.kcal += (food.calories || 0) * factor;
          totals.p += (food.protein || 0) * factor;
          totals.c += (food.carbs || 0) * factor;
          totals.g += (food.fats || 0) * factor;
        }
      });
    });

    return { 
      kcal: Math.round(totals.kcal), 
      p: Math.round(totals.p), 
      c: Math.round(totals.c), 
      g: Math.round(totals.g) 
    };
  };

  const totals = calculateTotals();
  const targetKcal = 2450;
  const progress = Math.min(Math.round((totals.kcal / targetKcal) * 100), 100);

  const macros = [
    { name: "Proteínas", current: totals.p, target: 160, color: "bg-blue-500", text: "text-blue-500" },
    { name: "Carboidratos", current: totals.c, target: 250, color: "bg-orange-500", text: "text-orange-500" },
    { name: "Gorduras", current: totals.g, target: 65, color: "bg-amber-500", text: "text-amber-500" },
  ];

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
            Minha Dieta
          </h1>
          <p className="text-zinc-400">
            Acompanhe suas calorias, macros e cadastre refeições do dia.
          </p>
        </div>
      {/* TODO: Permitir selecionar data para a refeição (não apenas hoje) */}
      <div className="flex gap-2">
           <input 
             className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1 text-sm text-white w-32 focus:ring-1 focus:ring-emerald-500 outline-none"
             placeholder="Refeição..."
             value={newMealName}
             onChange={(e) => setNewMealName(e.target.value)}
           />
           <input 
             type="time"
             className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none"
             value={newMealTime}
             onChange={(e) => setNewMealTime(e.target.value)}
           />
           <Button 
              onClick={handleCreateMeal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-lg"
              size="sm"
           >
             <PlusCircle className="mr-2 h-4 w-4" /> Registrar
           </Button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Painel de Macros */}
        <div className="lg:col-span-2 space-y-6">
           <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl overflow-hidden">
              <CardContent className="p-6">
                 <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                    <div className="text-center md:text-left">
                       <p className="text-sm font-medium text-zinc-500 mb-1 uppercase tracking-wider">Calorias do Dia</p>
                       <div className="flex items-baseline gap-2 justify-center md:justify-start">
                          <span className="text-5xl font-black text-white">{totals.kcal}</span>
                          <span className="text-sm text-zinc-600 font-bold">/ {targetKcal} KCAL</span>
                       </div>
                    </div>
                    
                    <div className="flex-1 w-full max-w-sm">
                        <div className="flex justify-between text-[10px] font-bold text-zinc-500 mb-2 uppercase">
                           <span className="flex items-center gap-1"><Info className="w-3 h-3"/> {Math.max(0, targetKcal - totals.kcal)} kcal restantes</span>
                           <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-zinc-900 rounded-full h-3 border border-zinc-800 p-0.5">
                           <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-zinc-800/50">
                    {macros.map((macro, i) => (
                       <div key={i} className="space-y-2">
                          <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                             <span className="text-zinc-500">{macro.name}</span>
                             <span className="text-zinc-300">{macro.current}g <span className="text-zinc-600">/ {macro.target}g</span></span>
                          </div>
                          <div className="w-full bg-zinc-900 rounded-full h-1.5 border border-zinc-800">
                             <div className={`${macro.color} h-full rounded-full`} style={{ width: `${Math.min(100, (macro.current / macro.target) * 100)}%` }}></div>
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           {/* Lista de Refeições */}
           <h3 className="text-lg font-bold text-white mt-8 mb-4 flex items-center gap-2">
             <Utensils className="w-5 h-5 text-emerald-500" /> Refeições de Hoje
           </h3>
           <div className="space-y-4">
              {refeicoes.length > 0 ? refeicoes.map((meal) => {
                const mealKcal = Math.round(meal.items?.reduce((acc: number, item: any) => acc + (item.food?.calories || 0) * (item.amountInGrams / 100), 0) || 0);

                return (
                  <Card key={meal.id} className="border-zinc-800 bg-zinc-900 shadow-md border-0 overflow-hidden group">
                     <CardContent className="p-0">
                        <div className="p-4 flex items-center justify-between bg-zinc-900 border-b border-zinc-800/50">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-emerald-500 font-bold shadow-inner">
                                {meal.time}
                              </div>
                              <div>
                                 <h4 className="font-bold text-white text-lg">{meal.name}</h4>
                                 <p className="text-xs text-zinc-500 font-medium">{meal.items?.length || 0} itens • <span className="text-white">{mealKcal} kcal</span></p>
                              </div>
                           </div>
                           <div className="flex gap-2">
                             <Button 
                               variant="ghost" 
                               size="sm" 
                               className="text-zinc-500 hover:text-red-500 h-8 px-2"
                               onClick={() => handleDeleteMeal(meal.id)}
                             >
                               Excluir
                             </Button>
                             <Button 
                               size="sm" 
                               className="bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white border border-emerald-600/20 h-8"
                               onClick={() => setSelectedMealId(selectedMealId === meal.id ? null : meal.id)}
                             >
                               {selectedMealId === meal.id ? "Fechar" : "Add Item"}
                             </Button>
                           </div>
                        </div>

                        {selectedMealId === meal.id && (
                          <div className="p-4 bg-zinc-950 border-b border-zinc-800 animate-in slide-in-from-top-2 duration-200">
                             <div className="flex flex-col md:flex-row gap-3">
                               <select 
                                 className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                                 value={newItem.foodId}
                                 onChange={e => setNewItem({...newItem, foodId: e.target.value})}
                               >
                                 <option value="">Selecione um alimento...</option>
                                 {alimentos.map(food => (
                                   <option key={food.id} value={food.id}>{food.name} ({food.calories}kcal/100g)</option>
                                 ))}
                               </select>
                               <input 
                                 type="number"
                                 className="w-24 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white"
                                 placeholder="Grams"
                                 value={newItem.quantity}
                                 onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                               />
                               <Button size="sm" className="bg-emerald-600" onClick={handleAddItem}>Adicionar</Button>
                             </div>
                          </div>
                        )}

                        <div className="divide-y divide-zinc-800/40">
                          {meal.items?.map((item: any) => (
                            <div key={item.id} className="p-3 pl-16 flex items-center justify-between hover:bg-zinc-800/10 transition-colors group/item">
                              <div>
                                <p className="text-sm font-semibold text-zinc-300">{item.food?.name}</p>
                                <p className="text-[10px] font-bold text-zinc-600 uppercase">{item.amountInGrams}g • {Math.round((item.food?.calories || 0) * (item.amountInGrams / 100))} kcal</p>
                              </div>
                              <button 
                                onClick={() => handleDeleteItem(item.id)}
                                className="opacity-0 group-item-hover:opacity-100 p-1 text-zinc-600 hover:text-red-500 transition-all"
                              >
                                <PlusCircle className="w-4 h-4 rotate-45" />
                              </button>
                            </div>
                          ))}
                        </div>
                     </CardContent>
                  </Card>
                );
              }) : (
                <div className="p-20 text-center border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
                  <Utensils className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                  <h3 className="text-white font-bold text-xl mb-1">Inicie seu dia</h3>
                  <p className="text-zinc-500 text-sm">Registre sua primeira refeição para bater suas metas.</p>
                </div>
              )}
           </div>
        </div>

        {/* Sidebar Direito (Água) */}
        <div className="space-y-6">
           <Card className="bg-blue-900/10 border-blue-500/20">
              <CardHeader className="pb-2">
                 <CardTitle className="text-blue-400 flex items-center gap-2">
                    <Droplets className="w-5 h-5" /> Hidratação
                 </CardTitle>
                 <CardDescription className="text-zinc-400">Objetivo: 3.5 Litros</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="flex items-center justify-between my-4">
                    <span className="text-3xl font-bold text-white">{(waterConsumed / 1000).toFixed(1)} <span className="text-lg text-zinc-500 font-normal">L</span></span>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="rounded-full bg-blue-500/10 border-blue-500/50 hover:bg-blue-500 hover:text-white text-blue-400"
                      onClick={handleAddWater}
                    >
                       <PlusCircle className="w-5 h-5" />
                    </Button>
                 </div>
                 <div className="w-full bg-blue-500/20 rounded-full h-2 mb-2">
                   <div 
                     className="bg-blue-500 h-2 rounded-full transition-all" 
                     style={{ width: `${Math.min(100, (waterConsumed / 3500) * 100)}%` }}
                   />
                 </div>
                 <p className="text-xs text-center text-zinc-500 mt-2">
                   {((3500 - waterConsumed) / 1000).toFixed(1)}L restantes
                 </p>
                 <div className="flex gap-2 mt-3">
                   <Button 
                     size="sm" 
                     variant="outline"
                     className="flex-1 text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                     onClick={() => handleAddWaterAmount(250)}
                   >
                     +250ml
                   </Button>
                   <Button 
                     size="sm" 
                     variant="outline"
                     className="flex-1 text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                     onClick={() => handleAddWaterAmount(500)}
                   >
                     +500ml
                   </Button>
                 </div>
              </CardContent>
           </Card>
        </div>

      </div>
    </div>
  );
}
