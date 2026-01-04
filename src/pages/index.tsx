import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { type GetServerSidePropsContext } from "next";
import {
  Building2,
  Globe,
  Users,
  TrendingUp,
  Link2,
  Link2Off,
  TriangleAlert,
  Clock,
  DollarSign,
  CircleCheck,
  Handshake,
  Megaphone,
  Cog,
  ChartColumn,
  Zap,
  Heart,
  Feather,
  GraduationCap,
  Languages,
  FileText,
  FileCheck,
  Wallet,
  CreditCard,
  Building,
  Shield,
  Plane,
  House,
  Car,
  Smartphone,
  Bus,
  MapPin,
  Briefcase,
  ChevronDown,
  ArrowRight,
  MessageCircle,
  Mail,
  Phone,
  Server,
  RefreshCw,
  Earth,
  ShieldCheck,
  X,
} from "lucide-react";

// COMPONENTS
import { BlogCard } from "@app/components/BlogCard";
import { Form } from "@app/components/BlogTemplates/Template1/Form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@app/components/ui/dialog";

// TYPES
import type { ResponseType } from "@app/types/api-types";
import type { BlogsAPIResponse } from "@app/components/BlogTemplates/Template1/types";

// UTILS
import { fetchWithTimeout } from "@app/utils/fetch-utils";
import { apiEndPoint, apiPath } from "@app/config/api-config";

const url = `${apiEndPoint}${apiPath.getAllBlogs}?start=0?end=3`;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const response: ResponseType<ResponseType<BlogsAPIResponse>> =
    await fetchWithTimeout(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        cookie: context.req.headers.cookie ?? "",
      },
    });
  if (!response.success) {
    console.error("blogs API response not fetched. ", response.error);
    return {
      props: {
        blogs: null,
      },
    };
  }
  if (!response.data.success) {
    console.error("blogs API response not fetched. ", response.data.error);
    return {
      props: {
        blogs: null,
      },
    };
  }
  if (!response.data.data || !response.data.data.blogs) {
    console.error("blogs not found. ");
    return {
      props: {
        blogs: null,
      },
    };
  }
  return {
    props: {
      blogs: response.data.data.blogs,
    },
  };
};

const Home = ({ blogs }: { blogs: BlogsAPIResponse["blogs"] | null }) => {
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0px)",
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800"></div>
        <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-white/70 font-medium">
                Your Trusted Services Partner
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-[1.1] tracking-tight mb-8">
              End-to-End Student Services for{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                  Study Abroad Companies
                </span>
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-12">
              Offer every essential student service without building vendor
              partnerships or expanding your internal team. One partner.
              Complete delivery.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  const element = document.getElementById("contact");
                  if (element) {
                    const navbarHeight = 64; // Height of sticky navbar
                    const elementPosition =
                      element.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - navbarHeight;

                    window.scrollTo({
                      top: offsetPosition,
                      behavior: "smooth",
                    });
                  }
                }}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow py-2 h-14 px-8 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base rounded-full transition-all duration-300 hover:shadow-[0_0_40px_rgba(37,99,235,0.3)]"
              >
                Partner With Us
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  const element = document.getElementById("services");
                  if (element) {
                    const navbarHeight = 64; // Height of sticky navbar
                    const elementPosition =
                      element.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - navbarHeight;

                    window.scrollTo({
                      top: offsetPosition,
                      behavior: "smooth",
                    });
                  }
                }}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border shadow-sm py-2 h-14 px-8 bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white font-medium text-base rounded-full cursor-pointer"
              >
                See Services
              </button>
            </div>
            <div className="mt-20 pt-12 border-t border-white/10">
              <p className="text-sm text-gray-500 mb-6 uppercase tracking-widest">
                Trusted by leading consultancies across
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-gray-400">
                <span className="text-sm font-medium tracking-wide">India</span>
                <span className="text-sm font-medium tracking-wide">UAE</span>
                <span className="text-sm font-medium tracking-wide">Nepal</span>
                <span className="text-sm font-medium tracking-wide">
                  Bangladesh
                </span>
                <span className="text-sm font-medium tracking-wide">
                  Sri Lanka
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="text-white/30 cursor-pointer">
            <ChevronDown className="w-8 h-8" />
          </div>
        </div>
      </section>

      {/* Audience Section */}
      <section id="audience" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mb-16 md:mb-20">
            <span className="text-blue-600 font-medium text-sm tracking-wide uppercase mb-4 block">
              Who This Is For
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight mb-6">
              Built for Ambitious Study Abroad Companies
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              AbroadKart partners with consultancies that are ready to serve
              students better while focusing on what they do best—counseling and
              admissions.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            <div className="group p-8 md:p-10 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-500">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 transition-colors duration-300">
                  <Building2 className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Study Abroad Consultancies
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Independent consultancies seeking to expand service
                    offerings without operational complexity.
                  </p>
                </div>
              </div>
            </div>
            <div className="group p-8 md:p-10 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-500">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 transition-colors duration-300">
                  <Globe className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Overseas Education Companies
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Multi-country operations requiring standardized service
                    delivery across geographies.
                  </p>
                </div>
              </div>
            </div>
            <div className="group p-8 md:p-10 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-500">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 transition-colors duration-300">
                  <Users className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    High-Volume Businesses
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Companies handling 100+ to 10,000+ students annually who
                    need scalable service infrastructure.
                  </p>
                </div>
              </div>
            </div>
            <div className="group p-8 md:p-10 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-500">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 transition-colors duration-300">
                  <TrendingUp className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Growth-Focused Leaders
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Teams that want to increase revenue per student without
                    increasing headcount.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Problem Section */}
      <section className="py-24 md:py-32 bg-gray-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gray-800/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500/5 rounded-full blur-[100px]"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <div>
              <span className="text-blue-500 font-medium text-sm tracking-wide uppercase mb-4 block">
                The Industry Problem
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-tight mb-6">
                Vendor Management Is Broken
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed mb-8">
                Study abroad consultancies lose revenue and control because
                services are fragmented across dozens of vendors. The result?
                Frustrated students, overwhelmed teams, and missed
                opportunities.
              </p>
              <div className="flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-xl">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-500">73%</span>
                </div>
                <p className="text-gray-300 text-sm">
                  of consultancies report that vendor management is their
                  biggest operational challenge
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors duration-300">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Link2Off className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Fragmented Services
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Students navigate between multiple vendors, creating confusion
                  and delays at critical moments.
                </p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors duration-300">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                  <TriangleAlert className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Inconsistent Quality
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Different vendors mean different service levels. SLAs are
                  rarely met, and escalations are common.
                </p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors duration-300">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Operational Drain
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Your team spends more time coordinating vendors than advising
                  students.
                </p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors duration-300">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Hidden Costs
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Managing multiple partnerships comes with administrative
                  overhead that erodes margins.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What AbroadKart Does Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <span className="text-blue-600 font-medium text-sm tracking-wide uppercase mb-4 block">
              What AbroadKart Does
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight mb-6">
              Your Complete Service Backbone
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              AbroadKart acts as a single service infrastructure that
              consultancies plug into. We handle all student services so you can
              focus on what matters.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="relative">
              <div className="p-8 md:p-10 bg-gray-900 rounded-3xl h-full">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-xl font-bold text-white">A</span>
                  </div>
                  <div>
                    <p className="text-blue-500 text-sm font-medium">
                      AbroadKart
                    </p>
                    <h3 className="text-xl font-semibold text-white">
                      We Manage
                    </h3>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-300">
                    <CircleCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>Vendor selection & vetting</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <CircleCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>Quality control & SLAs</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <CircleCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>Service coordination</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <CircleCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>End-to-end execution</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <CircleCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>Escalation handling</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <CircleCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>Standardized processes</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="p-8 md:p-10 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 rounded-3xl h-full">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-900">You</span>
                  </div>
                  <div>
                    <p className="text-blue-700 text-sm font-medium">
                      Your Team
                    </p>
                    <h3 className="text-xl font-semibold text-gray-900">
                      You Focus On
                    </h3>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <CircleCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="font-medium">Student counseling</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <CircleCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="font-medium">University admissions</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <CircleCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="font-medium">Building student trust</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <CircleCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="font-medium">Growing your business</span>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-blue-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-800">Result:</span>{" "}
                    More revenue per student, zero operational overhead.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-100 rounded-full text-gray-600">
              <span className="text-sm font-medium">One Partnership</span>
              <ArrowRight className="w-4 h-4" />
              <span className="text-sm font-medium">Complete Services</span>
              <ArrowRight className="w-4 h-4" />
              <span className="text-sm font-medium">Happy Students</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <span className="text-blue-600 font-medium text-sm tracking-wide uppercase mb-4 block">
              Complete Service Suite
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight mb-6">
              Every Service Under One Roof
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              From test preparation to post-arrival settlement, AbroadKart
              delivers every service your students need—managed, coordinated,
              and executed seamlessly.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            <div className="p-8 md:p-10 bg-white rounded-2xl border border-blue-100 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-500">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-1 h-12 bg-blue-500 rounded-full"></div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Pre-Admission & Application Support
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Everything students need before they receive their offer
                    letter.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <GraduationCap className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Test Preparation
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <Languages className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Document Translation
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Notary Services
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <FileCheck className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Application Support
                  </span>
                </div>
              </div>
            </div>
            <div className="p-8 md:p-10 bg-white rounded-2xl border border-emerald-100 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-500">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-1 h-12 bg-emerald-500 rounded-full"></div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Financial & Travel Services
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Comprehensive financial solutions and travel arrangements.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                  <Wallet className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Student Loans
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Forex Services
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                  <Building className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Bank Account Opening
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Insurance
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                  <Plane className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Flight Booking
                  </span>
                </div>
              </div>
            </div>
            <div className="p-8 md:p-10 bg-white rounded-2xl border border-violet-100 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-500">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-1 h-12 bg-violet-500 rounded-full"></div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Accommodation & Arrival
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Seamless transition to the new country.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-xl">
                  <House className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Student Housing
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-xl">
                  <Car className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Airport Pickup
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-xl">
                  <Smartphone className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Local SIM Cards
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-xl">
                  <Bus className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Transport Passes
                  </span>
                </div>
              </div>
            </div>
            <div className="p-8 md:p-10 bg-white rounded-2xl border border-blue-100 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-500">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-1 h-12 bg-blue-500 rounded-full"></div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Post-Arrival & Settlement
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Helping students settle and succeed abroad.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Local Onboarding
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <FileCheck className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Compliance Assistance
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <Briefcase className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Essential Student Services
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">
              All services are delivered through vetted partners with
              standardized quality and SLAs.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="process" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <span className="text-blue-600 font-medium text-sm tracking-wide uppercase mb-4 block">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight mb-6">
              Simple Partnership, Complete Transformation
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Getting started with AbroadKart is straightforward. Here's how we
              work together to deliver exceptional student experiences.
            </p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-24 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              <div className="relative">
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center relative z-10">
                      <Handshake className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-xs font-bold text-white z-20">
                      01
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Partner With AbroadKart
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    A single agreement gives you access to our complete service
                    infrastructure. No vendor hunting, no multiple contracts.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center relative z-10">
                      <Megaphone className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-xs font-bold text-white z-20">
                      02
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Introduce Services to Students
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Present a comprehensive service catalog to your students.
                    Every essential service, from your trusted brand.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center relative z-10">
                      <Cog className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-xs font-bold text-white z-20">
                      03
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    We Execute Everything
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    AbroadKart manages all coordination, quality control, and
                    delivery. Your team stays focused on counseling.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center relative z-10">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-xs font-bold text-white z-20">
                      04
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Earn More Per Student
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Increase your revenue per student significantly without
                    adding headcount or operational complexity.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-16">
            <p className="text-gray-500 mb-6">
              Ready to simplify your operations?
            </p>
            <button
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById("contact");
                if (element) {
                  const navbarHeight = 64; // Height of sticky navbar
                  const elementPosition =
                    element.getBoundingClientRect().top + window.pageYOffset;
                  const offsetPosition = elementPosition - navbarHeight;

                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                  });
                }
              }}
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors cursor-pointer"
            >
              Start the conversation
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        id="benefits"
        className="py-24 md:py-32 bg-gray-900 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <span className="text-blue-500 font-medium text-sm tracking-wide uppercase mb-4 block">
              Why Choose AbroadKart
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-tight mb-6">
              The Competitive Advantage You Need
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed">
              Leading consultancies choose AbroadKart because we transform how
              they deliver services—making them more profitable, efficient, and
              student-focused.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="group p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-blue-500/30 transition-all duration-500">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/30 transition-colors duration-300">
                <Link2 className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                One Partner, Not Many Vendors
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Replace fragmented vendor relationships with a single, reliable
                partnership. One point of contact for everything.
              </p>
            </div>
            <div className="group p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-blue-500/30 transition-all duration-500">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/30 transition-colors duration-300">
                <ChartColumn className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Predictable Service Quality
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Standardized processes and SLAs ensure consistent delivery
                across all services and geographies.
              </p>
            </div>
            <div className="group p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-blue-500/30 transition-all duration-500">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/30 transition-colors duration-300">
                <Zap className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Faster Service Delivery
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Streamlined coordination means students get what they need
                faster, without delays or handoff issues.
              </p>
            </div>
            <div className="group p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-blue-500/30 transition-all duration-500">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/30 transition-colors duration-300">
                <Heart className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Better Student Satisfaction
              </h3>
              <p className="text-gray-400 leading-relaxed">
                When services work seamlessly, students trust your brand more.
                Higher satisfaction, stronger referrals.
              </p>
            </div>
            <div className="group p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-blue-500/30 transition-all duration-500">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/30 transition-colors duration-300">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Increased Revenue Per Student
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Offer more services without increasing costs. Capture value that
                previously went to external vendors.
              </p>
            </div>
            <div className="group p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-blue-500/30 transition-all duration-500">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/30 transition-colors duration-300">
                <Feather className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Zero Operational Burden
              </h3>
              <p className="text-gray-400 leading-relaxed">
                No vendor management, no coordination overhead. Your team
                focuses purely on student success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Student Experience Section */}
      <section className="py-24 md:py-32 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <span className="text-blue-700 font-medium text-sm tracking-wide uppercase mb-4 block">
                For Your Students
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight mb-6">
                A Better Experience at Every Step
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                When you partner with AbroadKart, your students benefit from a
                seamless, well-coordinated journey—from application to arrival
                and beyond.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CircleCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Clear service options at every stage of their journey
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CircleCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Trusted providers vetted for quality and reliability
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CircleCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Smooth coordination between different services
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CircleCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Single point of accountability for all needs
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CircleCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Reduced confusion and delays during critical moments
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CircleCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Consistent experience regardless of destination country
                  </span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-blue-100/50 border border-blue-100">
                <div className="mb-8">
                  <div className="w-10 h-10 bg-blue-400 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">"</span>
                  </div>
                  <p className="text-xl md:text-2xl text-gray-800 font-medium leading-relaxed mb-6">
                    The entire process was incredibly smooth. Everything was
                    coordinated perfectly, and I always knew who to contact. It
                    made going abroad so much less stressful.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      A
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Ananya Sharma
                      </p>
                      <p className="text-sm text-gray-500">Student, UK Bound</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">98%</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Satisfaction Rate
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">24h</p>
                    <p className="text-xs text-gray-500 mt-1">Response Time</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">50+</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Countries Served
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-400 rounded-2xl -z-10"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-300 rounded-xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Scale & Reliability Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <span className="text-blue-600 font-medium text-sm tracking-wide uppercase mb-4 block">
              Scale & Reliability
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight mb-6">
              Built to Grow With You
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Whether you serve 100 students or 10,000+, AbroadKart's
              infrastructure scales seamlessly to match your growth.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            <div className="flex gap-6 p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center">
                  <Server className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Built for High Volumes
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Infrastructure designed to handle hundreds to thousands of
                  students simultaneously without service degradation.
                </p>
              </div>
            </div>
            <div className="flex gap-6 p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Structured Processes
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Every service follows documented, repeatable processes
                  ensuring consistent outcomes every time.
                </p>
              </div>
            </div>
            <div className="flex gap-6 p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center">
                  <Earth className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Multi-Geography Delivery
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Standardized execution across all major study destinations—UK,
                  USA, Canada, Australia, Europe, and more.
                </p>
              </div>
            </div>
            <div className="flex gap-6 p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Quality Assurance
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Rigorous vendor vetting, ongoing performance monitoring, and
                  proactive issue resolution.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-16 p-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-3xl md:text-4xl font-bold text-white mb-2">
                  15+
                </p>
                <p className="text-sm text-gray-400">
                  Years Combined Experience
                </p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-white mb-2">
                  50K+
                </p>
                <p className="text-sm text-gray-400">Students Served</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-white mb-2">
                  200+
                </p>
                <p className="text-sm text-gray-400">Partner Consultancies</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-white mb-2">
                  30+
                </p>
                <p className="text-sm text-gray-400">Destination Countries</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-24 md:py-32 bg-gray-900 relative overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/20 rounded-full blur-[150px]"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div>
              <span className="text-blue-500 font-medium text-sm tracking-wide uppercase mb-4 block">
                Let's Partner
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-tight mb-6">
                Deliver a Complete Study Abroad Experience Without Operational
                Complexity
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
                Join the growing network of consultancies that have transformed
                their operations with AbroadKart. One conversation could change
                how you do business.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={() => setIsPartnerModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow py-2 h-14 px-8 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base rounded-full transition-all duration-300 hover:shadow-[0_0_40px_rgba(37,99,235,0.4)] cursor-pointer"
              >
                Become a Partner
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <a
                href="https://wa.me/918318899608"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border shadow-sm py-2 h-14 px-8 bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white font-medium text-base rounded-full cursor-pointer"
              >
                <MessageCircle className="mr-2 w-5 h-5" />
                Talk to Us
              </a>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-400">
              <a
                href="mailto:partners@abroadkart.com"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>partners@abroadkart.com</span>
              </a>
              <a
                href="tel:+918318899608"
                className="flex items-center gap-2 hover:text-blue-400 transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span className="font-medium">Call Now: +91-8318899608</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      {blogs ? (
        <section className="py-24 md:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
              <span className="text-blue-600 font-medium text-sm tracking-wide uppercase mb-4 block">
                Insights & Resources
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight mb-6">
                Latest from Our Blog
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Stay updated with the latest insights, tips, and resources for
                study abroad success.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {blogs.map((blog, index) => (
                <BlogCard
                  key={`blog_${index}_${blog.pageId}`}
                  data={{
                    date: blog.blogMetaData.publishedDate,
                    imgUrl: blog.featuredImg.src,
                    pageId: blog.pageId,
                    title: blog.title,
                  }}
                />
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                href="https://abroadkart.com"
                className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Explore More Blogs
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* Partner Form Modal */}
      <Dialog open={isPartnerModalOpen} onOpenChange={setIsPartnerModalOpen}>
        <DialogContent className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="sticky top-0 bg-white border-b border-gray-100 p-6 flex flex-row items-center justify-between rounded-t-3xl z-10 space-y-0">
            <div className="flex flex-col">
              <DialogTitle className="text-2xl font-semibold text-gray-900">
                Become a Partner
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                Fill out the form below and we'll get back to you within 24
                hours
              </DialogDescription>
            </div>
            <button
              onClick={() => setIsPartnerModalOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-120px)] w-full">
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSfgjIBhj9KJlSkkgemnYatYDxegPHNEN_Ca8jxh6y5-Dxwy5g/viewform?embedded=true"
              width="100%"
              height="2000"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              scrolling="yes"
              className="w-full"
              style={{ minHeight: "2000px" }}
            >
              Loading…
            </iframe>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
