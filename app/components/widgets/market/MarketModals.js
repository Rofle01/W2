import React from "react";
import { motion } from "framer-motion";
import { X, Trash2, Download, Upload, FileSpreadsheet, FileJson, Coins } from "lucide-react";
import * as LucideIcons from "lucide-react";

export default function MarketModals({
    showProfileModal,
    setShowProfileModal,
    profileName,
    setProfileName,
    onAddServer,

    showResetModal,
    setShowResetModal,
    onResetData,
    onNukeStore,

    showDataModal,
    setShowDataModal,
    dataModalTab,
    setDataModalTab,
    onExport,
    onFileChange,

    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop
}) {
    return (
        <>
            {/* Server Add Modal */}
            {showProfileModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowProfileModal(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">Yeni Sunucu Ekle</h3>
                            <button
                                onClick={() => setShowProfileModal(false)}
                                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-white/70" />
                            </button>
                        </div>
                        <p className="text-sm text-white/70 mb-4">
                            Yeni bir sunucu profili oluşturun.
                        </p>
                        <input
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            placeholder="Sunucu adı..."
                            className="w-full px-3 py-2 font-medium text-white bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 placeholder:text-white/20 mb-4"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={onAddServer}
                                disabled={!profileName.trim()}
                                className="flex-1 px-4 py-2 bg-cyan-600/20 text-cyan-400 rounded-lg hover:bg-cyan-600/40 transition-colors font-medium border border-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Ekle
                            </button>
                            <button
                                onClick={() => setShowProfileModal(false)}
                                className="px-4 py-2 bg-white/5 text-white/80 rounded-lg hover:bg-white/10 transition-colors font-medium border border-white/10"
                            >
                                İptal
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Reset Confirmation Modal */}
            {showResetModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-red-950/80 backdrop-blur-md"
                        onClick={() => setShowResetModal(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative bg-black/90 backdrop-blur-xl border-2 border-red-600 rounded-2xl p-6 max-w-md w-full shadow-[0_0_50px_rgba(220,38,38,0.3)]"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                <div className="p-2 bg-red-600 rounded-lg">
                                    <Trash2 className="w-6 h-6 text-white" />
                                </div>
                                KRİTİK İŞLEM
                            </h3>
                            <button
                                onClick={() => setShowResetModal(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-white/70" />
                            </button>
                        </div>

                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                            <p className="text-red-200 font-medium mb-2 flex items-center gap-2">
                                <LucideIcons.AlertTriangle className="w-5 h-5 text-red-500" />
                                Bu işlem geri alınamaz!
                            </p>
                            <ul className="text-sm text-red-300/80 list-disc list-inside space-y-1 ml-1">
                                <li>Tüm market fiyatları silinir.</li>
                                <li>Metin ve karakter ayarları silinir.</li>
                                <li>Sayfa otomatik yenilenir.</li>
                                <li>Uygulama <strong>fabrika ayarlarına</strong> döner.</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    if (window.confirm("SON UYARI: Bütün verileriniz kalıcı olarak silinecek.\n\nOnaylıyor musunuz?")) {
                                        onNukeStore();
                                    }
                                }}
                                className="w-full px-4 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-500 hover:to-red-600 transition-all font-bold shadow-lg shadow-red-900/40 flex items-center justify-center gap-3 group"
                            >
                                <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                TÜM VERİLERİ SİL (FABRİKA AYARLARI)
                            </button>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-black/90 px-2 text-white/40">veya</span>
                                </div>
                            </div>

                            <button
                                onClick={() => onResetData('prices')}
                                className="w-full px-4 py-3 bg-white/5 text-amber-500 rounded-xl hover:bg-amber-500/10 transition-colors font-medium border border-amber-500/20 flex items-center justify-center gap-2"
                            >
                                <Coins className="w-5 h-5" />
                                Sadece Fiyatları Temizle
                            </button>

                            <button
                                onClick={() => setShowResetModal(false)}
                                className="w-full px-4 py-3 bg-transparent text-white/60 rounded-xl hover:text-white hover:bg-white/5 transition-colors font-medium"
                            >
                                İptal
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Data Import/Export Modal */}
            {showDataModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowDataModal(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">Veri İşlemleri</h3>
                            <button
                                onClick={() => setShowDataModal(false)}
                                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-white/70" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setDataModalTab("export")}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${dataModalTab === "export"
                                    ? "bg-violet-600/20 text-violet-400 border border-violet-500/30"
                                    : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                                    }`}
                            >
                                <Download className="w-4 h-4 inline mr-2" />
                                İndir
                            </button>
                            <button
                                onClick={() => setDataModalTab("import")}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${dataModalTab === "import"
                                    ? "bg-violet-600/20 text-violet-400 border border-violet-500/30"
                                    : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                                    }`}
                            >
                                <Upload className="w-4 h-4 inline mr-2" />
                                Yükle
                            </button>
                        </div>

                        {/* Export Tab */}
                        {dataModalTab === "export" && (
                            <div className="space-y-3">
                                <p className="text-sm text-white/70 mb-3">
                                    Piyasa fiyatlarınızı Excel veya JSON formatında indirin.
                                </p>
                                <button
                                    onClick={() => onExport("excel")}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-green-600/20 backdrop-blur-sm text-green-400 rounded-lg hover:bg-green-600/40 transition-colors font-medium border border-green-500/30"
                                >
                                    <FileSpreadsheet className="w-5 h-5" />
                                    Excel (.xlsx) İndir
                                </button>
                                <button
                                    onClick={() => onExport("json")}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-purple-600/20 backdrop-blur-sm text-purple-400 rounded-lg hover:bg-purple-600/40 transition-colors font-medium border border-purple-500/30"
                                >
                                    <FileJson className="w-5 h-5" />
                                    JSON İndir
                                </button>
                            </div>
                        )}

                        {/* Import Tab */}
                        {dataModalTab === "import" && (
                            <div className="space-y-3">
                                <p className="text-sm text-white/70 mb-3">
                                    Excel (.xlsx) veya JSON dosyası yükleyin.
                                </p>
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${isDragging
                                        ? "border-violet-500 bg-violet-500/10"
                                        : "border-white/10 bg-white/5 hover:bg-white/10"
                                        }`}
                                >
                                    <Upload className="w-12 h-12 text-white/50 mx-auto mb-3" />
                                    <p className="text-white/70 mb-2">Dosyayı buraya sürükleyin</p>
                                    <p className="text-white/50 text-sm mb-4">veya</p>
                                    <label className="inline-block px-4 py-2 bg-violet-600/20 backdrop-blur-sm text-violet-400 rounded-lg hover:bg-violet-600/40 transition-colors cursor-pointer font-medium border border-violet-500/30">
                                        Dosya Seç
                                        <input
                                            type="file"
                                            accept=".xlsx,.xls,.json,.csv"
                                            onChange={onFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                    <p className="text-white/40 text-xs mt-3">
                                        Desteklenen formatlar: .xlsx, .xls, .json, .csv
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </>
    );
}
