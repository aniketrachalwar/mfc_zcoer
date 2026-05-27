import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Edit2, Trash2, X, Package, DollarSign } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

const MerchandiseManager = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    image: '',
    stock: 0,
    category: 'Clothing'
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'merchandise'));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(list);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const snap = await getDocs(collection(db, 'orders'));
      // Sort orders locally so newest is first
      const list = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setOrders(list);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const handleMarkOrderCompleted = async (orderId: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: 'completed' });
      fetchOrders();
    } catch (err) {
      console.error("Error updating order:", err);
    }
  };

  const openForm = (product: any = null) => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        image: product.image || '',
        stock: product.stock || 0,
        category: product.category || 'Clothing'
      });
      setEditingId(product.id);
    } else {
      setFormData({ name: '', description: '', price: 0, image: '', stock: 0, category: 'Clothing' });
      setEditingId(null);
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'merchandise', editingId), formData);
      } else {
        await addDoc(collection(db, 'merchandise'), formData);
      }
      closeForm();
      fetchProducts();
    } catch (err) {
      console.error("Error saving product:", err);
      alert("Failed to save product.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, 'merchandise', id));
        fetchProducts();
      } catch (err) {
        console.error("Error deleting product:", err);
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-black uppercase text-white mb-2">
            Merchandise <span className="text-firefox-orange">Management</span>
          </h1>
          <p className="text-zinc-400 text-sm">Manage your store products and track orders.</p>
        </div>
        {activeTab === 'products' && (
          <button 
            onClick={() => openForm()}
            className="flex items-center gap-2 px-6 py-3 bg-firefox-orange text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-colors"
          >
            <Plus size={16} />
            Add Product
          </button>
        )}
      </div>

      <div className="flex gap-4 mb-8 border-b border-white/10 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-4 px-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${activeTab === 'products' ? 'border-firefox-orange text-firefox-orange' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
        >
          <Package className="inline-block mr-2" size={16} />
          Shop Products
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-4 px-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${activeTab === 'orders' ? 'border-firefox-orange text-firefox-orange' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
        >
          <ShoppingBag className="inline-block mr-2" size={16} />
          Orders
        </button>
      </div>
      
      {activeTab === 'orders' ? (
        <div>
          {loadingOrders ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4 text-zinc-500">
                <ShoppingBag size={24} />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-2">No Active Orders</h3>
              <p className="text-zinc-400 text-sm max-w-md">There are currently no merchandise orders to process.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-white font-bold text-lg">{order.productName}</h4>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        order.status === 'completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                      <p className="text-zinc-400">Customer: <span className="text-white">{order.customerName}</span></p>
                      <p className="text-zinc-400">Phone: <span className="text-white">{order.customerPhone}</span></p>
                      <p className="text-zinc-400">UTR: <span className="text-white font-mono">{order.transactionId}</span></p>
                      <p className="text-zinc-400">Date: <span className="text-white">{new Date(order.timestamp).toLocaleDateString()}</span></p>
                      <p className="text-zinc-400">Amount: <span className="text-firefox-orange font-bold">₹{order.price}</span></p>
                    </div>
                  </div>
                  {order.status !== 'completed' && (
                    <button 
                      onClick={() => handleMarkOrderCompleted(order.id)}
                      className="shrink-0 px-6 py-3 bg-white/5 hover:bg-green-500/10 hover:text-green-500 border border-white/10 hover:border-green-500/30 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-colors"
                    >
                      Verify & Complete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-firefox-orange border-t-transparent rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4 text-zinc-500">
                <Package size={24} />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-2">No Products Found</h3>
              <p className="text-zinc-400 text-sm max-w-md">You haven't added any merchandise to sell yet. Click the button above to add your first product or kit.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                  <div className="h-48 bg-zinc-900 relative">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <Package size={48} />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button onClick={() => openForm(product)} className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-firefox-orange transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="w-8 h-8 rounded-full bg-black/50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-white">{product.name}</h3>
                      <span className="font-mono text-firefox-orange font-bold">₹{product.price}</span>
                    </div>
                    <p className="text-zinc-400 text-sm line-clamp-2 mb-4 flex-1">{product.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs text-zinc-500 uppercase tracking-widest">{product.category}</span>
                      <span className={`text-xs font-bold uppercase tracking-widest ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeForm} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-lg relative z-10 shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-display font-black uppercase text-white">
                  {editingId ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={closeForm} className="text-zinc-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <form id="product-form" onSubmit={saveProduct} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Product Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-firefox-orange outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} required rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-firefox-orange outline-none resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Price (₹)</label>
                      <input type="number" name="price" value={formData.price} onChange={handleChange} min="0" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-firefox-orange outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Stock Quantity</label>
                      <input type="number" name="stock" value={formData.stock} onChange={handleChange} min="0" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-firefox-orange outline-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-firefox-orange outline-none">
                      <option value="Clothing">Clothing (T-Shirts, Hoodies)</option>
                      <option value="Accessories">Accessories (Stickers, Mugs)</option>
                      <option value="Hardware Kits">Hardware Kits</option>
                      <option value="Digital">Digital Products</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Image URL</label>
                    <input type="url" name="image" value={formData.image} onChange={handleChange} placeholder="https://..." required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-firefox-orange outline-none" />
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-white/10 shrink-0 flex gap-4">
                <button onClick={closeForm} className="flex-1 px-4 py-3 bg-white/5 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button onClick={(e) => {
                  const form = document.getElementById('product-form') as HTMLFormElement;
                  if (form.checkValidity()) saveProduct(e as any);
                  else form.reportValidity();
                }} className="flex-1 px-4 py-3 bg-firefox-orange text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-[0_0_20px_rgba(255,92,0,0.3)]">
                  {editingId ? 'Update' : 'Save'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MerchandiseManager;
