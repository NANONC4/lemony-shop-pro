"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Edit, Trash2, X, GripVertical, Settings, Save, ShoppingBag, UploadCloud, Image as ImageIcon } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Component การ์ดเกมที่ลากได้ ---
function SortableGameItem({ game, onEditGame, onEditProduct, onAddProduct, children }: any) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: game.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-6 group/game">
            {/* Header เกม */}
            <div className="p-4 flex items-center gap-4 bg-slate-950/50 border-b border-slate-800">
                <button {...attributes} {...listeners} className="p-2 text-slate-500 hover:text-white cursor-grab active:cursor-grabbing hover:bg-slate-800 rounded">
                    <GripVertical size={20} />
                </button>

                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
                    {game.imageUrl && <Image src={game.imageUrl} alt={game.title} fill className="object-cover" />}
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{game.title}</h3>
                    <p className="text-xs text-slate-500 font-mono uppercase">SLUG: {game.slug}</p>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => onEditGame(game)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-colors border border-blue-600/20"
                    >
                        <Edit size={16} /> <span className="hidden md:inline">แก้ไขเกม</span>
                    </button>
                </div>
            </div>

            {/* พื้นที่แสดงสินค้า (Children) */}
            <div className="p-4 bg-slate-900">
                {children}
            </div>
        </div>
    );
}

// --- Main Component ---
export default function ProductManager({ initialGames }: { initialGames: any[] }) {
  const [games, setGames] = useState(initialGames);
  
  // State Modal
  const [editingGame, setEditingGame] = useState<any | null>(null);       
  const [editingProduct, setEditingProduct] = useState<any | null>(null); 
  const [addingToGameId, setAddingToGameId] = useState<number | null>(null);
  const [newProductData, setNewProductData] = useState({ name: "", price: "", imageUrl: "" });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ✅ ฟังก์ชันแปลงไฟล์เป็น Base64 (สำหรับการอัปโหลด)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              callback(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  // 1. Drag End
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
        setGames((items) => {
            const oldIndex = items.findIndex((i) => i.id === active.id);
            const newIndex = items.findIndex((i) => i.id === over?.id);
            const newItems = arrayMove(items, oldIndex, newIndex);
            
            const orderPayload = newItems.map((game, index) => ({ id: game.id, order: index }));
            fetch('/api/admin/games', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderPayload) });
            return newItems;
        });
    }
  };

  // 2. Save Game
  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGame) return;
    try {
        const res = await fetch('/api/admin/games', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingGame) });
        if (res.ok) {
            const updated = await res.json();
            setGames(games.map(g => g.id === updated.id ? { ...g, ...updated } : g));
            setEditingGame(null);
        }
    } catch (error) { alert("Error saving game"); }
  };

  // 3. Delete Game
  const handleDeleteGame = async () => {
    if (!editingGame || !confirm(`ลบเกม "${editingGame.title}" ?`)) return;
    await fetch(`/api/admin/games?id=${editingGame.id}`, { method: 'DELETE' });
    setGames(games.filter(g => g.id !== editingGame.id));
    setEditingGame(null);
  };

  // 4. Save Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
        const res = await fetch('/api/admin/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingProduct) });
        if (res.ok) {
            const updatedProduct = await res.json();
            setGames(games.map(g => {
                if (g.id === updatedProduct.gameId) {
                    return { ...g, products: g.products.map((p: any) => p.id === updatedProduct.id ? updatedProduct : p) };
                }
                return g;
            }));
            setEditingProduct(null);
        }
    } catch (error) { alert("แก้ไขสินค้าไม่สำเร็จ"); }
  };

  // 5. Delete Product
  const handleDeleteProduct = async () => {
    if (!editingProduct || !confirm("ยืนยันลบสินค้านี้?")) return;
    try {
        await fetch(`/api/admin/products?id=${editingProduct.id}`, { method: 'DELETE' });
        setGames(games.map(g => {
            if (g.id === editingProduct.gameId) {
                return { ...g, products: g.products.filter((p: any) => p.id !== editingProduct.id) };
            }
            return g;
        }));
        setEditingProduct(null);
    } catch (error) { alert("ลบสินค้าไม่สำเร็จ"); }
  };

  // 6. Create Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingToGameId) return;
    try {
        const res = await fetch('/api/admin/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gameId: addingToGameId,
                name: newProductData.name,
                price: Number(newProductData.price),
                imageUrl: newProductData.imageUrl
            }),
        });
        if (res.ok) {
            const newProduct = await res.json();
            setGames(games.map(g => {
                if (g.id === addingToGameId) {
                    return { ...g, products: [...g.products, newProduct] };
                }
                return g;
            }));
            setAddingToGameId(null);
            setNewProductData({ name: "", price: "", imageUrl: "" });
            alert("✅ เพิ่มสินค้าเรียบร้อย");
        }
    } catch (error) { alert("❌ เพิ่มสินค้าไม่สำเร็จ"); }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Info */}
      <div className="flex justify-between items-center bg-blue-600/10 border border-blue-500/20 p-4 rounded-xl text-blue-200 text-sm">
        <div className="flex items-center gap-2">
            <GripVertical className="w-5 h-5" />
            <span>ลากวางเพื่อจัดลำดับเกม | กด + เพื่อเพิ่มแพ็กเกจสินค้า</span>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <DndContext id="product-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={games.map(g => g.id)} strategy={verticalListSortingStrategy}>
            {games.map((game) => (
                <SortableGameItem 
                    key={game.id} 
                    game={game} 
                    onEditGame={setEditingGame}
                >
                    {/* Grid แสดงสินค้า */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {game.products.map((product: any) => (
                           <div key={product.id} className="relative group bg-slate-950 border border-slate-800 rounded-lg p-3 hover:border-blue-500 transition-all">
                             <div className="relative w-full aspect-square bg-slate-900 rounded-md mb-2 overflow-hidden">
                                {product.imageUrl ? (
                                    <Image src={product.imageUrl} alt={product.name} fill className="object-contain p-2" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-700 text-xs">No Image</div>
                                )}
                             </div>
                             <div className="text-center">
                                 <p className="text-white font-bold text-sm truncate">{product.name}</p>
                                 <p className="text-green-400 text-sm font-mono">฿{product.price}</p>
                             </div>
                             <button 
                                onClick={() => setEditingProduct(product)}
                                className="absolute top-2 right-2 bg-blue-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-blue-500"
                             >
                                <Edit size={14} />
                             </button>
                           </div>
                        ))}
                        
                        {/* ปุ่มเพิ่มสินค้า */}
                        <button 
                            onClick={() => setAddingToGameId(game.id)}
                            className="flex flex-col items-center justify-center h-full min-h-[140px] border border-dashed border-slate-700 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition group"
                        >
                            <div className="bg-slate-800 p-3 rounded-full mb-2 group-hover:bg-slate-700 transition">
                                <Plus size={24} />
                            </div>
                            <span className="text-xs font-bold">เพิ่มสินค้า</span>
                        </button>
                    </div>

                </SortableGameItem>
            ))}
        </SortableContext>
      </DndContext>

      {/* --- Modal 1: แก้ไขเกม --- */}
      {editingGame && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">แก้ไขเกม</h3>
                    <button onClick={() => setEditingGame(null)}><X className="text-slate-400 hover:text-white" /></button>
                </div>
                <form onSubmit={handleSaveGame} className="space-y-4">
                    <input type="text" value={editingGame.title} onChange={e => setEditingGame({...editingGame, title: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white" placeholder="ชื่อเกม" />
                    <input type="text" value={editingGame.slug} onChange={e => setEditingGame({...editingGame, slug: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono" placeholder="Slug" />
                    
                    {/* ✅ ส่วนอัปโหลดรูปเกม */}
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">รูปปกเกม</label>
                        <div className="relative w-full h-32 bg-slate-950 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 overflow-hidden group">
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleFileUpload(e, (url) => setEditingGame({...editingGame, imageUrl: url}))} accept="image/*" />
                            {editingGame.imageUrl ? (
                                <Image src={editingGame.imageUrl} fill className="object-cover opacity-60 group-hover:opacity-40 transition" alt="Preview" />
                            ) : null}
                            <div className="z-20 flex flex-col items-center text-slate-400 group-hover:text-white">
                                <UploadCloud size={24} />
                                <span className="text-xs mt-1">คลิกเพื่อเปลี่ยนรูป</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-bold">บันทึก</button>
                        <button type="button" onClick={handleDeleteGame} className="px-4 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-lg"><Trash2 /></button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- Modal 2: แก้ไขสินค้า --- */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Settings className="text-green-500" /> แก้ไขสินค้า
                    </h3>
                    <button onClick={() => setEditingProduct(null)}><X className="text-slate-400 hover:text-white" /></button>
                </div>
                
                <form onSubmit={handleSaveProduct} className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">ชื่อแพ็กเกจ</label>
                        <input type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-green-500 outline-none" />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">ราคา (บาท)</label>
                        <input type="number" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white font-mono text-lg focus:border-green-500 outline-none" />
                    </div>
                    
                    {/* ✅ ส่วนอัปโหลดรูปสินค้า (แก้ไข) */}
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">รูปสินค้า</label>
                        <div className="relative w-full h-32 bg-slate-950 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 overflow-hidden group">
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleFileUpload(e, (url) => setEditingProduct({...editingProduct, imageUrl: url}))} accept="image/*" />
                            {editingProduct.imageUrl ? (
                                <Image src={editingProduct.imageUrl} fill className="object-contain p-2 opacity-80 group-hover:opacity-100 transition" alt="Preview" />
                            ) : (
                                <div className="text-slate-500 flex flex-col items-center"><ImageIcon size={24} /><span className="text-xs mt-1">ยังไม่มีรูป</span></div>
                            )}
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                <UploadCloud size={24} className="text-white" />
                                <span className="text-xs text-white mt-1">เปลี่ยนรูป</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="submit" className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2"><Save size={18} /> บันทึก</button>
                        <button type="button" onClick={handleDeleteProduct} className="px-4 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-xl transition-colors"><Trash2 size={20} /></button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- Modal 3: เพิ่มสินค้าใหม่ --- */}
      {addingToGameId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShoppingBag className="text-blue-500" /> เพิ่มสินค้าใหม่
                    </h3>
                    <button onClick={() => setAddingToGameId(null)}><X className="text-slate-400 hover:text-white" /></button>
                </div>
                
                <form onSubmit={handleCreateProduct} className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">ชื่อแพ็กเกจ</label>
                        <input 
                            type="text" 
                            required
                            value={newProductData.name} 
                            onChange={e => setNewProductData({...newProductData, name: e.target.value})} 
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" 
                            placeholder="ระบุชื่อสินค้า"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">ราคา (บาท)</label>
                        <input 
                            type="number" 
                            required
                            value={newProductData.price} 
                            onChange={e => setNewProductData({...newProductData, price: e.target.value})} 
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white font-mono text-lg focus:border-blue-500 outline-none" 
                            placeholder="0.00"
                        />
                    </div>
                    
                    {/* ✅ ส่วนอัปโหลดรูปสินค้า (เพิ่มใหม่) */}
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">รูปสินค้า</label>
                        <div className="relative w-full h-32 bg-slate-950 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 overflow-hidden group">
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleFileUpload(e, (url) => setNewProductData({...newProductData, imageUrl: url}))} accept="image/*" />
                            {newProductData.imageUrl ? (
                                <Image src={newProductData.imageUrl} fill className="object-contain p-2" alt="Preview" />
                            ) : (
                                <div className="text-slate-500 flex flex-col items-center group-hover:text-white transition">
                                    <UploadCloud size={24} />
                                    <span className="text-xs mt-1">คลิก/ลากรูปมาวางที่นี่</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                            <Plus size={18} /> สร้างสินค้า
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}