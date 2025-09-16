"use client";

import { tutorialSteps } from "@/data/steps";
import { useEffect, useState, useRef, useCallback, Fragment } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const [isManualScroll, setIsManualScroll] = useState(false);

  const sidebarRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const manualScrollTimeoutRef = useRef(null);
  const lastScrollY = useRef(0);

  const handleScroll = useCallback(() => {
    if (isManualScroll) return;

    const currentScrollY = window.scrollY;
    const scrollDirection =
      currentScrollY > lastScrollY.current ? "down" : "up";
    lastScrollY.current = currentScrollY;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      const scrollPosition = window.scrollY + window.innerHeight * 0.3;
      let newCurrentStep = currentStep;

      for (let i = tutorialSteps.length - 1; i >= 0; i--) {
        const el = document.getElementById(tutorialSteps[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const elementTop = window.scrollY + rect.top;

          if (scrollPosition >= elementTop) {
            newCurrentStep = i;
            break;
          }
        }
      }

      if (newCurrentStep !== currentStep) {
        setCurrentStep(newCurrentStep);
      }
    }, 100);
  }, [currentStep, isManualScroll]);

  useEffect(() => {
    let ticking = false;

    const scrollListener = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", scrollListener, { passive: true });

    return () => {
      window.removeEventListener("scroll", scrollListener);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  useEffect(() => {
    if (sidebarRef.current && !isManualScroll) {
      const activeItem = sidebarRef.current.querySelector(
        `[data-step="${currentStep}"]`
      );
      if (activeItem) {
        activeItem.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      }
    }
  }, [currentStep, isManualScroll]);

  const scrollToStep = (stepId, index) => {
    setIsManualScroll(true);
    setCurrentStep(index);

    const element = document.getElementById(stepId);
    if (element) {
      const headerOffset = window.innerWidth < 1024 ? 80 : 20;
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }

    if (manualScrollTimeoutRef.current) {
      clearTimeout(manualScrollTimeoutRef.current);
    }

    manualScrollTimeoutRef.current = setTimeout(() => {
      setIsManualScroll(false);
    }, 1000);
  };

  const NavList = ({ onClick }) => (
    <div className="space-y-1">
      {tutorialSteps.map((step, index) => (
        <button
          key={step.id}
          data-step={index}
          onClick={() => {
            scrollToStep(step.id, index);
            if (onClick) onClick();
          }}
          className={`w-full text-left p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
            currentStep === index
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-200"
              : "text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 border border-transparent hover:border-purple-200"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                currentStep === index
                  ? "bg-white/20 text-white shadow-inner"
                  : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 group-hover:from-purple-100 group-hover:to-pink-100"
              }`}
            >
              {step.number}
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-sm block truncate">
                {step.title}
              </span>{" "}
              {step.description && step.description !== "-" && (
                <span
                  className={`text-xs mt-1 block truncate ${
                    currentStep === index ? "text-white/80" : "text-gray-500"
                  }`}
                >
                  {step.description}{" "}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (manualScrollTimeoutRef.current)
        clearTimeout(manualScrollTimeoutRef.current);
    };
  }, []);

  return (
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 min-h-screen">
      <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-purple-200 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            aria-label="Open navigation menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-800">Tutorial</h1>
            <p className="text-xs text-gray-500">
              {tutorialSteps[currentStep]?.title}
            </p>
          </div>
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl px-3 py-2">
            <div className="text-sm font-bold text-purple-600">
              {currentStep + 1}/{tutorialSteps.length}
            </div>
          </div>
        </div>

        <div className="relative w-full bg-gray-200 h-2">
          <div
            className="absolute top-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 h-2 transition-all duration-500 ease-out shadow-sm"
            style={{
              width: `${((currentStep + 1) / tutorialSteps.length) * 100}%`,
            }}
          />
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>
      </div>

      <div
        className={`fixed inset-y-0 left-0 z-50 w-96 bg-white/95 backdrop-blur-md shadow-2xl transform transition-all duration-300 ease-out lg:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Tutorial Steps</h2>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-2 rounded-lg text-gray-500 hover:bg-white/50 transition-all"
              aria-label="Close navigation menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold text-purple-600">
                {Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 shadow-inner"
                style={{
                  width: `${((currentStep + 1) / tutorialSteps.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        <nav className="p-4 h-[calc(100vh-140px)] overflow-y-auto">
          <NavList onClick={() => setIsMobileOpen(false)} />
        </nav>
      </div>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div className="flex">
        <aside className="hidden lg:block w-96 bg-white/90 backdrop-blur-md border-r border-purple-200 sticky top-0 h-screen shadow-xl">
          <div className="p-6 h-full flex flex-col">
            <div className="mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Tutorial
              </h1>
              <p className="text-sm text-gray-500 mb-4">
                Panduan lengkap Google AI Pro untuk mahasiswa
              </p>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Progress Anda
                  </span>
                  <span className="text-lg font-bold text-purple-600">
                    {Math.round(
                      ((currentStep + 1) / tutorialSteps.length) * 100
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-white rounded-full h-3 shadow-inner overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{
                      width: `${
                        ((currentStep + 1) / tutorialSteps.length) * 100
                      }%`,
                    }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  Step {currentStep + 1} dari {tutorialSteps.length}
                </div>
              </div>
            </div>

            <nav
              ref={sidebarRef}
              className="flex-1 overflow-y-auto py-2 overflow-x-hidden scrollbar-none"
            >
              <NavList />
            </nav>

            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Sedang Aktif:
                </p>
                <p className="text-xs text-gray-600">
                  Step {currentStep + 1} - {tutorialSteps[currentStep]?.title}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-10 lg:mb-12">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-6 text-center lg:text-left leading-tight">
                Cara Klaim Langganan Google AI Pro 1 Tahun untuk Mahasiswa
              </h1>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <div className="space-y-4 text-gray-700 text-sm lg:text-base leading-relaxed">
                      {/* Poin 1: Eksklusivitas Akun */}
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 pt-1">
                          <svg
                            className="w-5 h-5 text-orange-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                            ></path>
                          </svg>
                        </div>
                        <div>
                          <span className="font-bold text-orange-600">
                            Penting:
                          </span>{" "}
                          Verifikasi hanya berlaku untuk{" "}
                          <strong>satu data mahasiswa</strong>. Akun yang
                          digunakan harus sama dengan yang didaftarkan saat
                          proses verifikasi.
                        </div>
                      </div>

                      {/* Poin 2: Notifikasi Tagihan */}
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 pt-1">
                          <svg
                            className="w-5 h-5 text-sky-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            ></path>
                          </svg>
                        </div>
                        <div>
                          <span className="font-bold text-sky-600">
                            Langganan & Tagihan:
                          </span>{" "}
                          Anda akan menerima notifikasi saat paket 1 tahun akan
                          berakhir. Cek email secara berkala untuk
                          <strong>menghentikan langganan</strong> sebelum jatuh
                          tempo agar tidak ada tagihan otomatis.
                        </div>
                      </div>

                      {/* Poin 3: Akurasi Data */}
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 pt-1">
                          <svg
                            className="w-5 h-5 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                        </div>
                        <div>
                          <span className="font-bold text-red-600">
                            Akurasi Data:
                          </span>{" "}
                          Proses verifikasi akan <strong>gagal</strong> jika
                          Anda memasukkan data yang tidak sesuai dengan
                          identitas diri (contoh: tanggal lahir yang berbeda
                          dengan KTP/KTM).
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 grid md:grid-cols-2 gap-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-green-700 mb-1">
                          ✓ Dengan Akun Kampus
                        </p>
                        <p className="text-xs text-green-600">
                          Verifikasi otomatis → Mulai dari Step 1 → Step 17
                        </p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-blue-700 mb-1">
                          ⚠ Tanpa Akun Kampus
                        </p>
                        <p className="text-xs text-blue-600">
                          Setelah Step 18 → Lanjut ke Step 28
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {tutorialSteps.map((step, index) => {
                if (index === 17) {
                  console.log(
                    "Pemeriksaan Step 18 -> Nomor:",
                    step.number,
                    "| Tipe Data:",
                    typeof step.number
                  );
                }

                return (
                  <Fragment key={step.id}>
                    {step.number === 18 && (
                      <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-6 rounded-2xl border-l-4 border-blue-500 shadow-md my-4 animate-in fade-in duration-500">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <svg
                              className="w-8 h-8 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              ></path>
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-blue-800">
                              Langkah Verifikasi Manual
                            </h3>
                            <p className="text-blue-700 mt-1 text-sm">
                              Mulai dari sini, Anda akan melakukan proses
                              verifikasi manual dengan mengunggah dokumen.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div
                      key={step.id}
                      id={step.id}
                      className={`bg-white/95 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-lg border border-purple-100 transition-all duration-500 hover:shadow-xl hover:scale-[1.01] ${
                        currentStep === index
                          ? "ring-2 ring-purple-300 shadow-purple-100"
                          : ""
                      }`}
                    >
                      <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                          <div
                            className={`w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg ${
                              currentStep === index
                                ? "animate-pulse shadow-purple-300"
                                : ""
                            }`}
                          >
                            {step.number}
                          </div>
                          <div className="flex-1">
                            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-2">
                              {step.title}
                            </h2>

                            {step.description && step.description !== "-" && (
                              <div className="text-gray-600 text-sm lg:text-base leading-relaxed">
                                {(() => {
                                  const urlRegex = /(https?:\/\/[^\s]+)/g; // Tambahkan 'g' untuk global match

                                  // Jika tidak ada link, tampilkan seperti biasa
                                  if (!step.description.match(urlRegex)) {
                                    return <p>{step.description}</p>;
                                  }

                                  // Jika ada link, pecah teks dan render bagian-bagiannya
                                  return (
                                    <p>
                                      {step.description
                                        .split(urlRegex)
                                        .map((part, index) => {
                                          if (part.match(urlRegex)) {
                                            return (
                                              <a
                                                key={index}
                                                href={part}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 font-semibold hover:underline"
                                              >
                                                (Link)
                                              </a>
                                            );
                                          }
                                          return part;
                                        })}
                                    </p>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Enhanced Image Container */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 overflow-hidden group">
                          <div className="relative overflow-hidden rounded-lg">
                            <Zoom zoomMargin={40}>
                              <img
                                src={step.image}
                                alt={step.title}
                                className="w-full h-auto transition-all duration-500 shadow-md cursor-zoom-in"
                                loading="lazy"
                              />
                            </Zoom>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Fragment>
                );
              })}
            </div>

            {/* Enhanced Help Section */}
            <div className="mt-12 p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl border border-purple-200 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Butuh Bantuan?
                    </h3>
                  </div>

                  <p className="text-gray-700 text-sm lg:text-base mb-4 leading-relaxed">
                    Jika mengalami kendala dalam proses verifikasi, jangan ragu
                    untuk mencari bantuan:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white/70 rounded-xl p-4 border border-blue-200">
                      <a
                        href="https://support.sheerid.com/id/67c8c14f5f17a83b745e3f82/help-center/student"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <p className="font-semibold text-blue-700 mb-2">
                          📋 Pusat Bantuan SheerID
                        </p>
                        <p className="text-xs text-gray-600">
                          Dokumentasi lengkap untuk troubleshooting
                        </p>
                      </a>
                    </div>
                    <div className="bg-white/70 rounded-xl p-4 border border-purple-200">
                      <p className="font-semibold text-purple-700 mb-2">
                        💬 Google Student Ambassador
                      </p>
                      <p className="text-xs text-gray-600">
                        WhatsApp: (+62) 82290211876
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
