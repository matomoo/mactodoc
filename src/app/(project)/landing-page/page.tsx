"use client";

// app/page.tsx
// biome-ignore assist/source/organizeImports: <will be handled by the formatter>
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  TrendingUp,
  Zap,
  Database,
  BarChart3,
  Code,
  Rocket,
  Clock,
  Tag,
  ExternalLink,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Page() {
  const highlights = [
    { icon: <Zap className="h-5 w-5" />, text: "Pendekatan 'Cepat Implementasi'" },
    { icon: <Database className="h-5 w-5" />, text: "Template Dashboard Siap Pakai" },
    { icon: <BarChart3 className="h-5 w-5" />, text: "Visualisasi Data dengan Chart.js" },
    { icon: <Code className="h-5 w-5" />, text: "Fullstack (Frontend + Backend)" },
    { icon: <TrendingUp className="h-5 w-5" />, text: "Siap Kerja sebagai Dashboard Specialist" },
  ];

  const steps = [
    {
      number: 1,
      title: "Update Query SQL ke API",
      description: "Langsung praktik menghubungkan data dengan API, tanpa perlu membangun dari nol.",
    },
    {
      number: 2,
      title: "Sesuaikan Model Data",
      description: "Pelajari cara mapping dan adaptasi struktur data dari database lokal ke dalam model dashboard.",
    },
    {
      number: 3,
      title: "Display Data dengan Chart.js",
      description: "Implementasi visualisasi dinamis menggunakan library Chart.js yang powerful.",
    },
  ];

  return (
    <div className="min-h-screen rounded-4xl bg-linear-to-br from-white-0 to-blue-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-10 text-center">
          <Badge className="mb-4 border-blue-200 bg-blue-100 text-blue-800 hover:bg-blue-100">
            <TrendingUp className="mr-2 h-4 w-4" />
            Macto Dashboard
          </Badge>
          <h1 className="mb-4 font-bold text-3xl text-gray-900 md:text-4xl lg:text-5xl">
            🏆 Kuasai Pembuatan Dashboard Modern dengan Next.js
          </h1>
          <p className="mx-auto max-w-3xl text-gray-600 text-lg">
            Dashboard bukan sekadar tampilan data—ini adalah jantung pengambilan keputusan bisnis modern.
          </p>
        </header>

        {/* Demo Button Section - NEW */}
        <div className="mb-8 flex justify-center">
          <Card className="w-full max-w-2xl border-indigo-200 bg-linear-to-r from-indigo-50 to-purple-50 shadow-lg">
            <CardContent className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-indigo-100 p-3">
                  <Eye className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Lihat Demo Dashboard</h3>
                  <p className="text-gray-600 text-sm">
                    Jelajahi contoh dashboard nyata yang akan Anda buat di kursus ini
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="border-indigo-300 bg-white text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
                onClick={() => window.open("https://macto-dashboard.netlify.app", "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Kunjungi Demo
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content Card */}
          <div className="lg:col-span-2">
            <Card className="h-full border-blue-200 shadow-lg">
              <CardHeader className="rounded-t-lg">
                <CardTitle className="flex items-center text-2xl text-blue-800">
                  <CheckCircle className="mr-3 h-8 w-8" />
                  Kursus Intensif Dashboard Next.js
                </CardTitle>
                <CardDescription className="text-blue-600">
                  Dari nol pengalaman hingga deployment aplikasi dashboard profesional
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="mb-6">
                  <p className="text-gray-700 text-lg leading-relaxed">
                    Kursus intensif ini akan membawa Anda dari nol pengalaman hingga deployment aplikasi dashboard
                    profesional. Dibimbing mentor berpengalaman, Anda akan membangun dashboard fungsional dengan
                    pendekatan <span className="font-bold text-blue-700">"cepat implementasi"</span>.
                  </p>
                </div>

                <div className="mb-8">
                  <h3 className="mb-4 flex items-center font-bold text-gray-900 text-xl">
                    <Zap className="mr-2 h-5 w-5 text-yellow-500" />
                    Yang Membedakan Kursus Ini:
                  </h3>
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
                    <p className="mb-3 font-medium text-gray-800">
                      Kami menyediakan{" "}
                      <span className="font-bold text-blue-700">
                        template dashboard siap pakai (frontend + backend)
                      </span>
                      , sehingga Anda dapat fokus pada penguasaan inti pengembangan dashboard.
                    </p>
                    <p className="text-gray-700">
                      Anda cukup mengikuti tiga langkah utama yang telah kami rancang untuk memaksimalkan hasil belajar.
                    </p>
                  </div>
                </div>

                {/* Steps Section */}
                <div className="mb-8">
                  <h3 className="mb-6 text-center font-bold text-gray-900 text-xl">
                    Tiga Langkah Utama Menuju Dashboard Specialist
                  </h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {steps.map((step) => (
                      <div key={step.number} className="relative">
                        <Card className="h-full border-gray-200 transition-all hover:border-blue-300 hover:shadow-md">
                          <CardHeader className="pb-3">
                            <div className="mb-3 flex justify-center">
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 text-xl">
                                {step.number}
                              </div>
                            </div>
                            <CardTitle className="text-center text-lg">{step.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-center text-gray-600">{step.description}</p>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-green-200 bg-linear-to-r from-green-50 to-emerald-50 p-5">
                  <h4 className="mb-2 flex items-center font-bold text-gray-900">
                    <Rocket className="mr-2 h-5 w-5 text-green-600" />
                    Keunggulan Metode Kami:
                  </h4>
                  <p className="text-gray-700">
                    Dengan metode ini, Anda akan menghemat waktu development dan langsung menghasilkan portfolio nyata
                    yang siap digunakan di lingkungan kerja. Segera daftar dan mulai karir Anda sebagai{" "}
                    <span className="font-bold text-green-700">Dashboard Specialist</span>!
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col justify-between gap-4 border-t pt-6 sm:flex-row">
                <div className="flex items-center text-gray-700">
                  <Clock className="mr-2 h-5 w-5 text-blue-600" />
                  <span>Kursus intensif • Hasil maksimal dalam waktu singkat</span>
                </div>
                <Button
                  size="lg"
                  className="bg-linear-to-r from-blue-600 to-indigo-600 text-xl hover:from-blue-700 hover:to-indigo-700"
                  onClick={() => {
                    const phoneNumber = "+628114446953";
                    const message =
                      "Halo, Kak! Saya baru saja melihat kursus Web Dashboard-nya dan sangat tertarik untuk bergabung. Boleh saya tahu info pendaftarannya?";
                    const encodedMessage = encodeURIComponent(message);
                    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
                  }}
                >
                  Daftar Sekarang
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Highlights Card */}
            <Card className="border-purple-200 shadow-md">
              <CardHeader className="text-purple-800">
                <CardTitle className="text-xl">Highlight Kursus</CardTitle>
                <CardDescription className="text-purple-600">Semua yang akan Anda pelajari</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {highlights.map((item) => (
                    <li key={item.text} className="flex items-start">
                      <div className="mr-3 rounded-lg bg-purple-100 p-2">
                        <div className="text-purple-600">{item.icon}</div>
                      </div>
                      <span className="font-medium text-gray-800">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Harga Card */}
            <Card className="border-orange-200 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Tag className="mr-2 h-5 w-5 text-orange-600" />💰 Investasi & Penawaran
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Harga Normal:</span>
                    <span className="font-bold text-gray-900">Rp 6.000.000</span>
                  </div>
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-orange-800">🔥 Early Bird:</span>
                      <span className="font-bold text-lg text-orange-800">Rp 3.000.000</span>
                    </div>
                    <p className="mt-1 text-orange-700 text-xs">(10 peserta pertama)</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="mb-3 font-bold text-gray-900">✅ Termasuk:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="mt-0.5 mr-2 h-4 w-4 shrink-0 text-green-600" />
                      <span>All access materi & recording</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="mt-0.5 mr-2 h-4 w-4 shrink-0 text-green-600" />
                      <span>Code repository template</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="mt-0.5 mr-2 h-4 w-4 shrink-0 text-green-600" />
                      <span>Lifetime community access</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="mt-0.5 mr-2 h-4 w-4 shrink-0 text-green-600" />
                      <span>Job collaboration priority</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Target Audience Card */}
            <Card className="border-amber-200 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <TrendingUp className="mr-2 h-5 w-5 text-amber-600" />
                  Untuk Siapa Kursus Ini?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="mt-1 mr-3 rounded-full bg-green-100 p-1 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <span>Developer pemula yang ingin membuat dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mt-1 mr-3 rounded-full bg-green-100 p-1 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <span>Fullstack developer yang ingin menguasai visualisasi data</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mt-1 mr-3 rounded-full bg-green-100 p-1 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <span>Profesional yang ingin beralih menjadi Dashboard Specialist</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} Macto-Dashboard. All rights reserved.</p>
          <p className="mt-1">Template dashboard siap pakai dengan pendekatan "cepat implementasi" untuk karir Anda.</p>
        </footer>
      </div>
    </div>
  );
}
